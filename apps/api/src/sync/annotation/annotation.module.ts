import { Module } from "@nestjs/common";
import { AnnotationController } from "./annotation.controller";
import { AnnotationService } from "./annotation.service";

/** 필기 동기화 모듈 (Sync) */
@Module({
  controllers: [AnnotationController],
  providers: [AnnotationService],
})
export class AnnotationModule {}
