import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
