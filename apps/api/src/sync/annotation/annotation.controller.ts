import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from "@nestjs/common";
import { annotationPayloadSchema, annotationTypeSchema, isoDateTimeSchema } from "@bookdoongji/shared";
import { z } from "zod";
import { CurrentUserId } from "../../common/current-user.decorator";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { AnnotationService, type BatchInput, type DeltaQuery } from "./annotation.service";

/** 한 번에 업로드할 수 있는 최대 필기 수 */
const MAX_BATCH_SIZE = 200;

const deltaQuerySchema = z.object({
  bookId: z.string().min(1),
  sinceRevision: z.coerce.number().int().min(0).default(0),
});

/** 업로드 필기 1건 — 공유 payload 스키마로 검증하고, type과 payload.tool 일치 여부를 확인한다 */
const annotationUploadSchema = z
  .object({
    id: z.string().min(1),
    assetVersion: z.string().min(1),
    pageRef: z.string().min(1),
    type: annotationTypeSchema,
    payload: annotationPayloadSchema,
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
    deletedAt: isoDateTimeSchema.nullable().optional(),
  })
  .refine((a) => a.type === a.payload.tool, {
    path: ["payload", "tool"],
    message: "type과 payload.tool이 일치해야 합니다",
  });

const batchSchema = z.object({
  bookId: z.string().min(1),
  baseRevision: z.number().int().min(0),
  annotations: z.array(annotationUploadSchema).max(MAX_BATCH_SIZE),
});

/** Sync API — 필기 델타 동기화 (스텁) */
@Controller("v1/sync/annotations")
export class AnnotationController {
  constructor(private readonly annotations: AnnotationService) {}

  /** 변경분 조회 — ?bookId=&sinceRevision= */
  @Get("delta")
  delta(@CurrentUserId() userId: string, @Query(new ZodValidationPipe(deltaQuerySchema)) query: DeltaQuery) {
    return this.annotations.delta(userId, query);
  }

  /** 필기 일괄 업로드 */
  @Post("batch")
  @HttpCode(HttpStatus.OK)
  batch(@CurrentUserId() userId: string, @Body(new ZodValidationPipe(batchSchema)) body: BatchInput) {
    return this.annotations.batch(userId, body);
  }
}
