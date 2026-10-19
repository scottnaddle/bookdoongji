import { z } from "zod";

/** 프로필 수정 요청 본문 */
export const updateProfileSchema = z.object({
  nickname: z.string().min(1).max(30),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
