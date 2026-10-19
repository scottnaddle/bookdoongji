import { Body, Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { z } from "zod";
import { CurrentUserId } from "../../common/current-user.decorator";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import { DeviceService, type RegisterDeviceInput } from "./device.service";

/** 기기 등록 요청 body */
const registerDeviceSchema = z.object({
  pairingCode: z.string().regex(/^\d{6}$/, "페어링 코드는 숫자 6자리입니다"),
  platform: z.enum(["android", "ios"]),
  deviceName: z.string().trim().min(1).max(50),
  publicKey: z.string().min(1).optional(),
});

/** Sync API — 기기 등록 · 페어링 */
@Controller("v1/sync/devices")
export class DeviceController {
  constructor(private readonly devices: DeviceService) {}

  /** 페어링 코드 발급 (웹/기존 기기에서 호출) */
  @Post("pairing-code")
  @HttpCode(HttpStatus.CREATED)
  issuePairingCode(@CurrentUserId() userId: string) {
    return this.devices.issuePairingCode(userId);
  }

  /** 페어링 코드로 새 기기 등록 (앱에서 호출) */
  @Post()
  register(@Body(new ZodValidationPipe(registerDeviceSchema)) body: RegisterDeviceInput) {
    return this.devices.register(body);
  }

  /** 등록된 활성 기기 목록 */
  @Get()
  list(@CurrentUserId() userId: string) {
    return { items: this.devices.list(userId) };
  }
}
