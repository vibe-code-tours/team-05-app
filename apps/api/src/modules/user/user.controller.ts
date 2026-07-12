import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { UpdateProfileDto, CreateAddressDto, UpdateAddressDto } from "./dto/user.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("users")
export class UserController {
  constructor(private userService: UserService) {}

  // ─── Profile ──────────────────────────────────────────

  @Get("me")
  @ApiOperation({ summary: "Get current user profile" })
  @ApiResponse({ status: 200, description: "User profile" })
  getProfile(@CurrentUser() user: { id: string }) {
    return this.userService.findById(user.id);
  }

  @Put("me")
  @ApiOperation({ summary: "Update current user profile" })
  @ApiResponse({ status: 200, description: "Profile updated" })
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body() dto: UpdateProfileDto
  ) {
    return this.userService.updateProfile(user.id, dto);
  }

  // ─── Addresses ────────────────────────────────────────

  @Get("me/addresses")
  @ApiOperation({ summary: "Get all addresses" })
  @ApiResponse({ status: 200, description: "List of addresses" })
  getAddresses(@CurrentUser() user: { id: string }) {
    return this.userService.getAddresses(user.id);
  }

  @Get("me/addresses/:id")
  @ApiOperation({ summary: "Get address by ID" })
  @ApiResponse({ status: 200, description: "Address details" })
  @ApiResponse({ status: 404, description: "Address not found" })
  getAddress(
    @CurrentUser() user: { id: string },
    @Param("id") addressId: string
  ) {
    return this.userService.getAddress(user.id, addressId);
  }

  @Post("me/addresses")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new address" })
  @ApiResponse({ status: 201, description: "Address created" })
  createAddress(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateAddressDto
  ) {
    return this.userService.createAddress(user.id, dto);
  }

  @Put("me/addresses/:id")
  @ApiOperation({ summary: "Update an address" })
  @ApiResponse({ status: 200, description: "Address updated" })
  @ApiResponse({ status: 404, description: "Address not found" })
  updateAddress(
    @CurrentUser() user: { id: string },
    @Param("id") addressId: string,
    @Body() dto: UpdateAddressDto
  ) {
    return this.userService.updateAddress(user.id, addressId, dto);
  }

  @Delete("me/addresses/:id")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete an address" })
  @ApiResponse({ status: 200, description: "Address deleted" })
  @ApiResponse({ status: 404, description: "Address not found" })
  deleteAddress(
    @CurrentUser() user: { id: string },
    @Param("id") addressId: string
  ) {
    return this.userService.deleteAddress(user.id, addressId);
  }

  @Put("me/addresses/:id/default")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Set address as default" })
  @ApiResponse({ status: 200, description: "Default address set" })
  setDefaultAddress(
    @CurrentUser() user: { id: string },
    @Param("id") addressId: string
  ) {
    return this.userService.setDefaultAddress(user.id, addressId);
  }
}
