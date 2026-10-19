import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { CatalogModule } from "./commerce/catalog/catalog.module";
import { DeviceModule } from "./sync/device/device.module";
import { AnnotationModule } from "./sync/annotation/annotation.module";

/**
 * 루트 모듈.
 * commerce와 sync는 서로를 import하지 않는다 (나중에 물리 분리할 수 있도록).
 */
@Module({
  imports: [
    // 공통
    PrismaModule,
    AuthModule,
    UsersModule,
    // Commerce API
    CatalogModule,
    // Sync API
    DeviceModule,
    AnnotationModule,
  ],
})
export class AppModule {}
