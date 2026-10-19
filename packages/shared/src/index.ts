/**
 * @bookdoongji/shared
 * 웹 · 백엔드 · 모바일이 함께 쓰는 도메인 타입과 Zod 스키마.
 * - 날짜/시각은 모두 ISO 8601 문자열로 주고받는다.
 * - 필기 좌표는 페이지 크기에 독립적인 0~1 정규화 값이다.
 */
import { z } from "zod";

// ─────────────────────────────────────────────
// 공통 원시 스키마
// ─────────────────────────────────────────────

/** ISO 8601 시각 문자열 (예: 2026-10-18T09:00:00Z, 2026-10-18T18:00:00+09:00) */
export const isoDateTimeSchema = z.iso.datetime({ offset: true });

/** ISO 8601 날짜 문자열 (예: 2026-10-18) — 출간일처럼 시각이 필요 없는 값 */
export const isoDateSchema = z.iso.date();

/** #RRGGBB 형식 색상 */
export const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "색상은 #RRGGBB 형식이어야 합니다");

/** 0~1 사이로 정규화된 좌표/비율 값 */
export const normalizedSchema = z.number().min(0).max(1);

/** 투명도 (0 = 완전 투명, 1 = 불투명) */
export const opacitySchema = z.number().min(0).max(1);

/** 원화 금액 (0 이상 정수) */
export const priceSchema = z.number().int().nonnegative();

// ─────────────────────────────────────────────
// 판매 유형
// ─────────────────────────────────────────────

/** 판매 유형: 소장 / 대여 / 무료 */
export const saleTypeSchema = z.enum(["OWN", "RENTAL", "FREE"]);
export type SaleType = z.infer<typeof saleTypeSchema>;
/** 값 비교용 상수 (예: SaleType.RENTAL) */
export const SaleType = saleTypeSchema.enum;

// ─────────────────────────────────────────────
// 도서 · SKU
// ─────────────────────────────────────────────

/** 도서 메타데이터 */
export const bookSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  /** 저자 목록 (공저 포함, 최소 1명) */
  authors: z.array(z.string().min(1)).min(1),
  publisher: z.string().min(1),
  /** ISBN-13 (하이픈 없이 숫자 13자리) */
  isbn: z.string().regex(/^\d{13}$/, "ISBN은 숫자 13자리여야 합니다"),
  /** 출간일 (ISO 날짜) */
  publishedAt: isoDateSchema,
  description: z.string(),
  coverUrl: z.url(),
});
export type Book = z.infer<typeof bookSchema>;

/**
 * 판매 단위(SKU). 한 도서에 소장/대여/무료 SKU가 여러 개 붙을 수 있다.
 * 규칙
 * - RENTAL이면 rentalDays 필수, 그 외 유형에서는 rentalDays/rentalEndAt 사용 불가
 * - FREE면 salePrice는 0
 * - salePrice <= listPrice
 */
export const skuSchema = z
  .object({
    id: z.string().min(1),
    bookId: z.string().min(1),
    saleType: saleTypeSchema,
    /** 정가 */
    listPrice: priceSchema,
    /** 판매가 */
    salePrice: priceSchema,
    /** 대여 기간(일) — RENTAL 전용 */
    rentalDays: z.number().int().positive().optional(),
    /** 대여 판매 종료 시각 등 고정 만료 시각 — RENTAL 전용, 선택 */
    rentalEndAt: isoDateTimeSchema.optional(),
  })
  .superRefine((sku, ctx) => {
    if (sku.saleType === "RENTAL") {
      if (sku.rentalDays === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["rentalDays"],
          message: "대여(RENTAL) 상품은 rentalDays가 필수입니다",
        });
      }
    } else {
      if (sku.rentalDays !== undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["rentalDays"],
          message: "rentalDays는 대여(RENTAL) 상품에서만 사용할 수 있습니다",
        });
      }
      if (sku.rentalEndAt !== undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["rentalEndAt"],
          message: "rentalEndAt은 대여(RENTAL) 상품에서만 사용할 수 있습니다",
        });
      }
    }
    if (sku.saleType === "FREE" && sku.salePrice !== 0) {
      ctx.addIssue({
        code: "custom",
        path: ["salePrice"],
        message: "무료(FREE) 상품의 판매가는 0이어야 합니다",
      });
    }
    if (sku.salePrice > sku.listPrice) {
      ctx.addIssue({
        code: "custom",
        path: ["salePrice"],
        message: "판매가는 정가보다 클 수 없습니다",
      });
    }
  });
export type Sku = z.infer<typeof skuSchema>;

// ─────────────────────────────────────────────
// 펜 프리셋
// ─────────────────────────────────────────────

/** 필기 도구 종류 */
export const penToolSchema = z.enum(["pen", "brush", "highlighter", "eraser"]);
export type PenTool = z.infer<typeof penToolSchema>;

/** 펜 프리셋 (기본 번들 + 사용자 커스텀) */
export const penPresetSchema = z.object({
  id: z.string().min(1),
  /** 한국어 표시명 (예: "기본 볼펜") */
  name: z.string().min(1),
  tool: penToolSchema,
  color: hexColorSchema,
  /** 굵기(pt) */
  thickness: z.number().positive(),
  opacity: opacitySchema,
});
export type PenPreset = z.infer<typeof penPresetSchema>;

// ─────────────────────────────────────────────
// 필기(Annotation)
// ─────────────────────────────────────────────

/** 정규화 좌표 한 점 */
export const normalizedPointSchema = z.object({
  x: normalizedSchema,
  y: normalizedSchema,
});
export type NormalizedPoint = z.infer<typeof normalizedPointSchema>;

/** 필압 정보가 포함될 수 있는 획의 점 */
export const strokePointSchema = normalizedPointSchema.extend({
  /** 필압 (0~1, 스타일러스 미지원 기기는 생략) */
  pressure: normalizedSchema.optional(),
});
export type StrokePoint = z.infer<typeof strokePointSchema>;

/** 정규화 사각형 — 페이지 밖으로 벗어나면 안 된다 */
export const normalizedRectSchema = z
  .object({
    x: normalizedSchema,
    y: normalizedSchema,
    width: normalizedSchema,
    height: normalizedSchema,
  })
  .refine((r) => r.x + r.width <= 1 && r.y + r.height <= 1, {
    message: "사각형이 페이지 범위(0~1)를 벗어났습니다",
  });
export type NormalizedRect = z.infer<typeof normalizedRectSchema>;

/** 필기 종류 */
export const annotationTypeSchema = z.enum([
  "stroke",
  "highlight",
  "text",
  "shape",
  "mask",
]);
export type AnnotationType = z.infer<typeof annotationTypeSchema>;

/** 자유 획 (펜/붓) */
export const strokePayloadSchema = z.object({
  tool: z.literal("stroke"),
  /** 획을 그린 펜 종류 */
  pen: z.enum(["pen", "brush"]),
  points: z.array(strokePointSchema).min(1),
  color: hexColorSchema,
  thickness: z.number().positive(),
  opacity: opacitySchema,
});

/** 형광펜 — 자유 획 또는 텍스트 영역 사각형 목록 */
export const highlightPayloadSchema = z
  .object({
    tool: z.literal("highlight"),
    /** 자유 형광펜 획 */
    points: z.array(strokePointSchema).min(1).optional(),
    /** 텍스트 선택 기반 형광펜 영역 */
    rects: z.array(normalizedRectSchema).min(1).optional(),
    color: hexColorSchema,
    thickness: z.number().positive(),
    opacity: opacitySchema,
  })
  .refine((p) => p.points !== undefined || p.rects !== undefined, {
    message: "형광펜은 points 또는 rects 중 하나 이상이 필요합니다",
  });

/** 텍스트 메모 */
export const textPayloadSchema = z.object({
  tool: z.literal("text"),
  /** 텍스트 박스 좌상단 위치 */
  position: normalizedPointSchema,
  /** 줄바꿈 기준 너비 (페이지 너비 대비 비율, 생략 시 자동) */
  width: normalizedSchema.optional(),
  text: z.string().min(1),
  color: hexColorSchema,
  /** 글자 크기(pt) */
  fontSize: z.number().positive(),
});

/** 도형 */
export const shapePayloadSchema = z.object({
  tool: z.literal("shape"),
  shape: z.enum(["line", "arrow", "rect", "ellipse"]),
  /** 시작점 (사각형/타원은 바운딩 박스의 한 꼭짓점) */
  start: normalizedPointSchema,
  /** 끝점 (사각형/타원은 대각선 반대편 꼭짓점) */
  end: normalizedPointSchema,
  color: hexColorSchema,
  thickness: z.number().positive(),
  opacity: opacitySchema,
  /** 채우기 색 (선 · 화살표는 무시) */
  fillColor: hexColorSchema.optional(),
});

/** 가림막 — 정답 가리기 등 암기용 */
export const maskPayloadSchema = z.object({
  tool: z.literal("mask"),
  rect: normalizedRectSchema,
  color: hexColorSchema,
  /** 현재 가림 상태 (false면 펼쳐서 내용이 보임) */
  hidden: z.boolean(),
});

/** 필기 payload — tool 필드로 구분되는 판별 유니온 */
export const annotationPayloadSchema = z.discriminatedUnion("tool", [
  strokePayloadSchema,
  highlightPayloadSchema,
  textPayloadSchema,
  shapePayloadSchema,
  maskPayloadSchema,
]);
export type AnnotationPayload = z.infer<typeof annotationPayloadSchema>;
export type StrokePayload = z.infer<typeof strokePayloadSchema>;
export type HighlightPayload = z.infer<typeof highlightPayloadSchema>;
export type TextPayload = z.infer<typeof textPayloadSchema>;
export type ShapePayload = z.infer<typeof shapePayloadSchema>;
export type MaskPayload = z.infer<typeof maskPayloadSchema>;

/**
 * 필기 1건. 수정 시 revision이 증가한다.
 * type과 payload.tool이 반드시 일치해야 한다.
 */
export const annotationSchema = z
  .object({
    id: z.string().min(1),
    userId: z.string().min(1),
    bookId: z.string().min(1),
    /** 콘텐츠(판본) 버전 */
    assetVersion: z.string().min(1),
    /** 안정 페이지 식별자 (페이지 번호가 아님) */
    pageRef: z.string().min(1),
    type: annotationTypeSchema,
    payload: annotationPayloadSchema,
    /** 단조 증가 리비전 */
    revision: z.number().int().nonnegative(),
    createdAt: isoDateTimeSchema,
    updatedAt: isoDateTimeSchema,
    /** 삭제(소프트 삭제) 시각 */
    deletedAt: isoDateTimeSchema.nullable().optional(),
  })
  .refine((a) => a.type === a.payload.tool, {
    path: ["payload", "tool"],
    message: "annotation.type과 payload.tool이 일치해야 합니다",
  });
export type Annotation = z.infer<typeof annotationSchema>;

// ─────────────────────────────────────────────
// 카탈로그 · 공통 응답 인터페이스
// ─────────────────────────────────────────────

/** 카테고리 (최상위는 parentId = null) */
export interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

/** 상품 상세 등에서 쓰는 도서 + 판매 SKU 묶음 */
export interface BookWithSkus extends Book {
  skus: Sku[];
}

/** 페이지 기반 목록 응답 */
export interface Paginated<T> {
  items: T[];
  /** 1부터 시작하는 현재 페이지 */
  page: number;
  pageSize: number;
  /** 전체 항목 수 */
  total: number;
  hasNext: boolean;
}

// ─────────────────────────────────────────────
// 동기화 (기기 · 읽기 위치)
// ─────────────────────────────────────────────

/** 기기 플랫폼 */
export type DevicePlatform = "android" | "ios";

/** 필기 동기화 · 다운로드 라이선스 대상 기기 */
export interface Device {
  id: string;
  userId: string;
  platform: DevicePlatform;
  /** 사용자가 지정한 기기 이름 (예: "내 갤럭시 탭") */
  name: string;
  /** 마지막 접속 시각 (ISO) */
  lastSeenAt: string;
  /** 등록 시각 (ISO) */
  createdAt: string;
  /** 해제 시각 (ISO), 활성 기기는 null */
  revokedAt: string | null;
}

/** 마지막 읽은 위치 — updatedAt 기준 last-write-wins */
export interface ReadingPosition {
  bookId: string;
  assetVersion: string;
  pageRef: string;
  /** 마지막 갱신 시각 (ISO) */
  updatedAt: string;
}
