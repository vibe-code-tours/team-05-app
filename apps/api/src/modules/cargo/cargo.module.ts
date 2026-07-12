import { Module } from "@nestjs/common";
import { CargoController } from "./cargo.controller";
import { CargoService } from "./cargo.service";

@Module({
  controllers: [CargoController],
  providers: [CargoService],
  exports: [CargoService],
})
export class CargoModule {}
