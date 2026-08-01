import {
  Injectable,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { JwtService } from "@nestjs/jwt";
import { randomBytes } from "crypto";
import { createHash } from "crypto";
import { ConfigService } from "@nestjs/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaService } from "../../config/prisma.service";

@Injectable()
export class SupabaseAuthService {
  private readonly logger = new Logger(SupabaseAuthService.name);
  private supabaseAdmin;

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {
    const supabaseUrl = this.config.get<string>("SUPABASE_URL");
    const serviceRoleKey = this.config.get<string>("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      this.logger.warn(
        "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — Supabase auth disabled",
      );
      return;
    }

    this.supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }

  /**
   * Verify a Supabase-issued access token and return the user info
   */
  async verifySupabaseToken(accessToken: string) {
    if (!this.supabaseAdmin) {
      throw new UnauthorizedException("Supabase auth is not configured");
    }

    const { data, error } = await this.supabaseAdmin.auth.getUser(accessToken);

    if (error || !data?.user) {
      this.logger.warn(`Supabase token verification failed: ${error?.message}`);
      throw new UnauthorizedException("Invalid Supabase session");
    }

    return data.user;
  }

  /**
   * Find a local user by email, or create one from Google profile data.
   * Phone gets a unique placeholder — users can set it later from profile settings.
   */
  async findOrCreateUser(supabaseUser: {
    id: string;
    email?: string;
    user_metadata?: { name?: string; avatar_url?: string; full_name?: string };
  }) {
    const email = supabaseUser.email;
    if (!email) {
      throw new UnauthorizedException("Google account has no email address");
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // User exists — activate if pending, update avatar if needed
      if (existingUser.status === "PENDING_VERIFICATION") {
        await this.prisma.user.update({
          where: { id: existingUser.id },
          data: { status: "ACTIVE" },
        });
      }

      return existingUser;
    }

    // Generate a unique placeholder for phone (user can set it later)
    const phonePlaceholder = `google_${randomBytes(8).toString("hex")}`;

    const name =
      supabaseUser.user_metadata?.name ||
      supabaseUser.user_metadata?.full_name ||
      email.split("@")[0];

    const avatar = supabaseUser.user_metadata?.avatar_url;

    // Create new user as ACTIVE (no verification needed for Google auth)
    let user;
    try {
      user = await this.prisma.user.create({
        data: {
          email,
          phone: phonePlaceholder,
          name,
          password: randomBytes(32).toString("hex"), // unreachable password — Google auth only
          role: "CLIENT",
          status: "ACTIVE",
          avatar: avatar || null,
        },
      });
    } catch (err) {
      // Handle race condition: another request just created this user
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) return existing;
      }
      throw err;
    }

    this.logger.log(`New user created from Google auth: ${email}`);
    return user;
  }

  /**
   * Full flow: verify Supabase token → find-or-create user → issue JWT pair
   */
  async authenticate(supabaseToken: string) {
    const supabaseUser = await this.verifySupabaseToken(supabaseToken);

    const user = await this.findOrCreateUser(supabaseUser);

    return this.generateTokens(user.id, user.email, user.role, user.name, user.avatar);
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
    name?: string | null,
    avatar?: string | null,
  ) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwt.sign(payload, { expiresIn: "15m" });

    const jti = randomBytes(16).toString("hex");
    const refreshToken = this.jwt.sign(
      { ...payload, type: "refresh", jti },
      { expiresIn: "30d" },
    );

    const tokenHash = createHash("sha256").update(refreshToken).digest("hex");
    await this.prisma.session.create({
      data: {
        userId,
        refreshToken: tokenHash,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      success: true,
      data: {
        user: { id: userId, email, role, name: name || null, avatar: avatar || null },
        accessToken,
        refreshToken,
      },
    };
  }
}
