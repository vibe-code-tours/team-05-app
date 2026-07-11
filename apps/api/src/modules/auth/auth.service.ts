import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../config/prisma.service";
import { RegisterDto, LoginDto } from "./dto/auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
    });

    if (existing) {
      throw new ConflictException(
        existing.email === dto.email
          ? "Email already in use"
          : "Phone number already in use"
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        role: "CLIENT",
      },
    });

    return this.generateTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException("Invalid email or password");
    }

    return this.generateTokens(user.id, user.email, user.role);
  }

  private generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwt.sign(payload, { expiresIn: "15m" });
    const refreshToken = this.jwt.sign(payload, { expiresIn: "7d" });

    return {
      success: true,
      data: {
        user: { id: userId, email, role },
        accessToken,
        refreshToken,
      },
    };
  }
}
