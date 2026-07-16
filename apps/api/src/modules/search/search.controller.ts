import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { SearchService } from "./search.service";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { Public } from "../../common/decorators/public.decorator";
import {
  SearchQueryDto,
  AutocompleteQueryDto,
  ReindexAllDto,
} from "./dto/search.dto";

@ApiTags("Search")
@Controller("search")
export class SearchController {
  constructor(private searchService: SearchService) {}

  // ── Public Endpoints ────────────────────────────────────────────────────

  @Public()
  @Get()
  @ApiOperation({ summary: "Search products" })
  search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query);
  }

  @Public()
  @Get("autocomplete")
  @ApiOperation({ summary: "Autocomplete product names" })
  autocomplete(@Query() query: AutocompleteQueryDto) {
    return this.searchService.autocomplete(query);
  }

  @Public()
  @Get("stats")
  @ApiOperation({ summary: "Get search index stats" })
  getIndexStats() {
    return this.searchService.getIndexStats();
  }

  // ── Admin Endpoints ─────────────────────────────────────────────────────

  @Post("index/product/:productId")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin: Index a single product" })
  indexProduct(@Param("productId") productId: string) {
    return this.searchService.indexProduct(productId);
  }

  @Delete("index/product/:productId")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin: Remove a product from index" })
  removeProduct(@Param("productId") productId: string) {
    return this.searchService.removeProduct(productId);
  }

  @Post("reindex")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Admin: Reindex all data" })
  reindexAll(@Body() dto: ReindexAllDto) {
    return this.searchService.reindexAll(dto.index);
  }
}
