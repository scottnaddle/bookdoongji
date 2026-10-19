import { Injectable } from "@nestjs/common";
import type { Annotation, AnnotationPayload, AnnotationType } from "@bookdoongji/shared";

/** 델타 조회 1회당 최대 반환 건수 */
const DELTA_PAGE_LIMIT = 500;

/** 클라이언트가 업로드하는 필기 1건 (userId·bookId·revision은 서버가 채운다) */
export interface AnnotationUpload {
  id: string;
  assetVersion: string;
  pageRef: string;
  type: AnnotationType;
  payload: AnnotationPayload;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface DeltaQuery {
  bookId: string;
  sinceRevision: number;
}

export interface DeltaResult {
  annotations: Annotation[];
  latestRevision: number;
  hasMore: boolean;
}

export interface BatchInput {
  bookId: string;
  baseRevision: number;
  annotations: AnnotationUpload[];
}

export interface BatchResult {
  accepted: Array<{ id: string; revision: number }>;
  conflicts: Array<{ id: string; serverRevision: number; reason: string }>;
  latestRevision: number;
}

/**
 * 필기 동기화 서비스 — 스텁 (메모리 저장).
 * - (사용자, 도서)별로 revision 카운터를 두고, 업로드된 필기마다 새 revision을 매긴다.
 * - TODO: baseRevision 기반 충돌 감지 (양쪽 버전 보존 + conflicts 응답). 현재는 모두 수락한다.
 * - TODO: Prisma Annotation 테이블로 교체.
 */
@Injectable()
export class AnnotationService {
  /** key: `${userId}:${bookId}` → 필기 ID별 최신본 */
  private readonly store = new Map<string, Map<string, Annotation>>();
  /** key: `${userId}:${bookId}` → 마지막으로 발급한 revision */
  private readonly revisions = new Map<string, number>();

  /** sinceRevision 이후 변경된 필기 (revision 오름차순) */
  delta(userId: string, query: DeltaQuery): DeltaResult {
    const key = storeKey(userId, query.bookId);
    const changed = [...(this.store.get(key)?.values() ?? [])]
      .filter((a) => a.revision > query.sinceRevision)
      .sort((a, b) => a.revision - b.revision);

    const page = changed.slice(0, DELTA_PAGE_LIMIT);
    const last = page[page.length - 1];
    return {
      annotations: page,
      // 더 받을 게 남아 있으면 이번 페이지의 마지막 revision을 다음 기준점으로 쓰게 한다
      latestRevision: last ? last.revision : (this.revisions.get(key) ?? 0),
      hasMore: changed.length > page.length,
    };
  }

  /** 필기 일괄 업로드 (스텁: 충돌 검사 없이 전부 수락) */
  batch(userId: string, input: BatchInput): BatchResult {
    const key = storeKey(userId, input.bookId);
    let bucket = this.store.get(key);
    if (!bucket) {
      bucket = new Map();
      this.store.set(key, bucket);
    }
    let revision = this.revisions.get(key) ?? 0;

    const accepted: BatchResult["accepted"] = [];
    for (const upload of input.annotations) {
      revision += 1;
      const annotation: Annotation = {
        ...upload,
        userId,
        bookId: input.bookId,
        revision,
      };
      bucket.set(upload.id, annotation);
      accepted.push({ id: upload.id, revision });
    }
    this.revisions.set(key, revision);

    return { accepted, conflicts: [], latestRevision: revision };
  }
}

function storeKey(userId: string, bookId: string): string {
  return `${userId}:${bookId}`;
}
