import { z } from "zod";

/** 회원가입 요청 본문 */
export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  nickname: z.string().min(1).max(30),
});

/** 로그인 요청 본문 */
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type SignupDto = z.infer<typeof signupSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
