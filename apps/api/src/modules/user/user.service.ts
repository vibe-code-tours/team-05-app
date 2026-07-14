import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../config/prisma.service";
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto } from "./dto/user.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // ─── Profile ──────────────────────────────────────────

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
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return { success: true, data: user };
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Check if phone is already taken by another user
    if (dto.phone) {
      const existing = await this.prisma.user.findFirst({
        where: { phone: dto.phone, id: { not: userId } },
      });
      if (existing) {
        throw new ForbiddenException("Phone number already in use");
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        role: true,
        status: true,
        avatar: true,
        updatedAt: true,
      },
    });

    return { success: true, data: updated };
  }

  // ─── Addresses ────────────────────────────────────────

  async getAddresses(userId: string) {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return { success: true, data: addresses };
  }

  async getAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException("Address not found");
    }

    return { success: true, data: address };
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    // If this is the default address, unset other defaults
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.address.create({
      data: { userId, ...dto },
    });

    return { success: true, data: address };
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException("Address not found");
    }

    // If setting as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: dto,
    });

    return { success: true, data: updated };
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException("Address not found");
    }

    await this.prisma.address.delete({ where: { id: addressId } });

    return { success: true, data: null, message: "Address deleted" };
  }

  async setDefaultAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException("Address not found");
    }

    // Unset all defaults
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });

    // Set this one as default
    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    return { success: true, data: updated };
  }
}
