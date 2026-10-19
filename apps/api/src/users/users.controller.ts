import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import type { AuthUser } from "../auth/jwt.strategy";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { type UpdateProfileDto, updateProfileSchema } from "./dto";
import { UsersService } from "./users.service";

/** JwtAuthGuard를 통과한 요청 — req.user에 AuthUser가 실려 있다 */
type AuthedRequest = Request & { user: AuthUser };

/** 내 프로필 조회·수정 */
@Controller("v1/users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /** 현재 사용자 프로필 */
  @Get("me")
  getMe(@Req() req: AuthedRequest) {
    return this.users.getProfile(req.user.userId);
  }

  /** 닉네임 수정 */
  @Patch("me")
  updateMe(
    @Req() req: AuthedRequest,
    @Body(new ZodValidationPipe(updateProfileSchema)) dto: UpdateProfileDto,
  ) {
    return this.users.updateProfile(req.user.userId, dto);
  }
}
