import { Body, Controller, Get, NotFoundException, Post, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AuthService } from "./auth.service";
import { type LoginDto, loginSchema, type SignupDto, signupSchema } from "./dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import type { AuthUser } from "./jwt.strategy";

/**
 * 인증 API — 회원가입, 로그인, 내 정보 조회.
 */
@Controller("v1/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  signup(@Body(new ZodValidationPipe(signupSchema)) dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post("login")
  login(@Body(new ZodValidationPipe(loginSchema)) dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request & { user: AuthUser }) {
    const { userId } = req.user;
    const user = await this.authService.validateUser(userId);
    // 토큰은 유효하지만 사용자가 삭제된 경우
    if (!user) {
      throw new NotFoundException("사용자를 찾을 수 없습니다.");
    }
    return user;
  }
}
