import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ReviewService } from "./review.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import {
  CreateReviewDto,
  UpdateReviewDto,
  ReviewQueryDto,
} from "./dto/review.dto";

@ApiTags("Reviews")
@Controller("reviews")
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  // ── Public Endpoints ────────────────────────────────────────────────────

  @Get("product/:productId")
  @ApiOperation({ summary: "Get reviews for a product" })
  getProductReviews(
    @Param("productId") productId: string,
    @Query() query: ReviewQueryDto,
  ) {
    return this.reviewService.getProductReviews(
      productId,
      query.page ?? 1,
      query.limit ?? 20,
      query.rating,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single review by ID" })
  getReviewById(@Param("id") reviewId: string) {
    return this.reviewService.getReviewById(reviewId);
  }

  // ── Authenticated Endpoints ─────────────────────────────────────────────

  @Post()
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a review" })
  createReview(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewService.createReview(user.id, dto);
  }

  @Put(":id")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Update your review" })
  updateReview(
    @CurrentUser() user: { id: string },
    @Param("id") reviewId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewService.updateReview(user.id, reviewId, dto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Delete your review" })
  deleteReview(
    @CurrentUser() user: { id: string },
    @Param("id") reviewId: string,
  ) {
    return this.reviewService.deleteReview(user.id, reviewId);
  }

  @Get("user/me")
  @UseGuards(AuthGuard("jwt"))
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get your reviews" })
  getUserReviews(
    @CurrentUser() user: { id: string },
    @Query() query: ReviewQueryDto,
  ) {
    return this.reviewService.getUserReviews(
      user.id,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }
}
