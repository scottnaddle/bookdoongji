import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import type { LoginDto, SignupDto } from "./dto";

const SALT_ROUNDS = 10;

/** 응답에 내보내는 사용자 필드 — passwordHash는 절대 포함하지 않는다 */
const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  nickname: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * 로컬(이메일/비밀번호) 회원가입·로그인과 JWT 발급을 담당한다.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException("이미 가입된 이메일입니다.");
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    return this.prisma.user.create({
      data: { email: dto.email, nickname: dto.nickname, passwordHash },
      select: PUBLIC_USER_SELECT,
    });
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // 소셜 로그인 사용자는 passwordHash가 null이므로 비밀번호 로그인 불가
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email });
    return {
      accessToken,
      user: { id: user.id, email: user.email, nickname: user.nickname },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: PUBLIC_USER_SELECT,
    });
  }
}
