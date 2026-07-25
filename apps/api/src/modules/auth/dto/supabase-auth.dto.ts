import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SupabaseAuthDto {
  @ApiProperty({
    description: "Access token from Supabase Auth session",
    example: "eyJhbGciOiJIUzI1NiIs...",
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
