import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

/** JWT 서명 비밀키 — 운영에서는 반드시 JWT_SECRET 환경변수로 지정한다 */
export const JWT_SECRET = process.env.JWT_SECRET || "bookdoongji-dev-secret";

/** 토큰에 담는 payload */
export interface JwtPayload {
  sub: string;
  email: string;
}

/** 검증 후 req.user에 실리는 값 */
export interface AuthUser {
  userId: string;
  email: string;
}

/**
 * Authorization: Bearer 토큰을 검증하는 Passport 전략.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return { userId: payload.sub, email: payload.email };
  }
}
