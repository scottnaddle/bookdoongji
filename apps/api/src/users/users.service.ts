import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { UpdateProfileDto } from "./dto";

/** 응답에 내보내는 사용자 필드 — passwordHash는 절대 포함하지 않는다 */
const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  nickname: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * 로그인한 사용자의 프로필 조회·수정을 담당한다.
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PUBLIC_USER_SELECT,
    });
    if (!user) {
      throw new NotFoundException("사용자를 찾을 수 없습니다.");
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // 토큰은 유효하지만 계정이 삭제된 경우 Prisma P2025 대신 404를 돌려준다
    await this.getProfile(userId);
    return this.prisma.user.update({
      where: { id: userId },
      data: { nickname: dto.nickname },
      select: PUBLIC_USER_SELECT,
    });
  }
}
