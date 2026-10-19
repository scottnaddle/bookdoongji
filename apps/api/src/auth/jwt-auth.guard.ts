import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/** JwtStrategy로 요청을 인증하는 가드 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
