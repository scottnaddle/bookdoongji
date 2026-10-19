import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

/** 인증 미구현 단계에서 쓰는 데모 사용자 ID */
export const DEMO_USER_ID = "user-demo";

/**
 * 현재 사용자 ID.
 * JWT 인증 도입 전까지는 `x-user-id` 헤더로 사용자를 흉내 내고, 없으면 데모 사용자로 본다.
 */
export const CurrentUserId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
  const req = ctx.switchToHttp().getRequest<Request>();
  const header = req.headers["x-user-id"];
  const value = Array.isArray(header) ? header[0] : header;
  return value && value.trim() !== "" ? value.trim() : DEMO_USER_ID;
});
