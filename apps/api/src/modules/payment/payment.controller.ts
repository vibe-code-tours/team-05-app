import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PaymentService } from "./payment.service";
import { CreatePaymentDto, VerifyPaymentDto } from "./dto/payment.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@ApiTags("Payments")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("payments")
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Submit payment slip (buyer)" })
  submitPayment(
    @CurrentUser() user: { id: string },
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentService.submitPayment(user.id, dto);
  }

  @Get("order/:orderId")
  @ApiOperation({ summary: "Get payment for an order" })
  getPayment(
    @CurrentUser() user: { id: string },
    @Param("orderId") orderId: string,
  ) {
    return this.paymentService.getPayment(user.id, orderId);
  }

  @Put("order/:orderId/verify")
  @UseGuards(RolesGuard)
  @Roles("SELLER")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify payment (seller only)" })
  verifyPayment(
    @CurrentUser() user: { id: string },
    @Param("orderId") orderId: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    return this.paymentService.verifyPayment(user.id, orderId, dto);
  }

  @Get("pending")
  @UseGuards(RolesGuard)
  @Roles("SELLER")
  @ApiOperation({ summary: "Get pending payments (seller only)" })
  getPendingPayments(@CurrentUser() user: { id: string }) {
    return this.paymentService.getPendingPayments(user.id);
  }
}
