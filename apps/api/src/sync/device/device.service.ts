import { randomBytes, randomInt, randomUUID } from "node:crypto";
import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import type { Device, DevicePlatform } from "@bookdoongji/shared";

/** 페어링 코드 유효 시간: 10분 */
const PAIRING_CODE_TTL_MS = 10 * 60 * 1000;
/** 계정당 최대 활성 기기 수 (정책값) */
const MAX_ACTIVE_DEVICES = 5;

/** 메모리에 보관하는 페어링 코드 */
interface PairingCodeEntry {
  userId: string;
  expiresAt: number;
}

export interface PairingCodeResult {
  code: string;
  expiresAt: string;
}

export interface RegisterDeviceInput {
  pairingCode: string;
  platform: DevicePlatform;
  deviceName: string;
  publicKey?: string;
}

export interface RegisterDeviceResult {
  deviceId: string;
  /** 목업 기기 토큰 — 실제 구현에서는 기기 공개키에 바인딩된 JWT(30일) */
  deviceToken: string;
  device: Device;
}

/**
 * 기기 등록 서비스 (메모리 저장).
 * 흐름: 웹/기존 기기에서 6자리 코드 발급 → 새 앱에서 코드 제출 → 기기 등록 + 토큰 발급.
 * 서버 재시작 시 코드와 기기 목록은 사라진다.
 */
@Injectable()
export class DeviceService {
  private readonly pairingCodes = new Map<string, PairingCodeEntry>();
  private readonly devices: Device[] = [];

  /** 6자리 숫자 페어링 코드 발급 (10분 유효, 1회용) */
  issuePairingCode(userId: string): PairingCodeResult {
    this.purgeExpiredCodes();

    // 현재 유효한 코드와 겹치지 않을 때까지 다시 뽑는다
    let code: string;
    do {
      code = randomInt(0, 1_000_000).toString().padStart(6, "0");
    } while (this.pairingCodes.has(code));

    const expiresAt = Date.now() + PAIRING_CODE_TTL_MS;
    this.pairingCodes.set(code, { userId, expiresAt });
    return { code, expiresAt: new Date(expiresAt).toISOString() };
  }

  /**
   * 페어링 코드로 기기 등록.
   * 코드 주인 계정에 기기가 붙으므로, 앱 쪽은 아직 로그인하지 않은 상태여도 된다.
   */
  register(input: RegisterDeviceInput): RegisterDeviceResult {
    this.purgeExpiredCodes();

    const entry = this.pairingCodes.get(input.pairingCode);
    if (!entry) {
      throw new BadRequestException("페어링 코드가 올바르지 않거나 만료되었습니다");
    }
    // 1회용: 성공·실패와 무관하게 사용 시점에 바로 폐기
    this.pairingCodes.delete(input.pairingCode);

    if (this.list(entry.userId).length >= MAX_ACTIVE_DEVICES) {
      throw new ConflictException(`기기는 계정당 최대 ${MAX_ACTIVE_DEVICES}대까지 등록할 수 있습니다`);
    }

    const now = new Date().toISOString();
    const device: Device = {
      id: `dev-${randomUUID()}`,
      userId: entry.userId,
      platform: input.platform,
      name: input.deviceName,
      lastSeenAt: now,
      createdAt: now,
      revokedAt: null,
    };
    this.devices.push(device);

    return {
      deviceId: device.id,
      deviceToken: `mock-device-token.${randomBytes(24).toString("base64url")}`,
      device,
    };
  }

  /** 활성(해제되지 않은) 기기 목록 */
  list(userId: string): Device[] {
    return this.devices.filter((d) => d.userId === userId && d.revokedAt === null);
  }

  /** 만료된 페어링 코드 정리 */
  private purgeExpiredCodes(): void {
    const now = Date.now();
    for (const [code, entry] of this.pairingCodes) {
      if (entry.expiresAt <= now) this.pairingCodes.delete(code);
    }
  }
}
