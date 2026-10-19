import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

/**
 * 전역 Prisma 모듈 — AppModule에서 한 번만 import하면 어디서든 PrismaService를 주입받을 수 있다.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
