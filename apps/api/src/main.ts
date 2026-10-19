import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

/** API 서버 포트 (웹 Next.js 3000과 겹치지 않도록 3001 기본값) */
const DEFAULT_PORT = 3001;

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // 로컬 개발 중 웹(3000)에서 직접 호출할 수 있도록 CORS 허용
  app.enableCors();
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? DEFAULT_PORT);
  await app.listen(port);
  console.log(`[책둥지 API] http://localhost:${port}/v1 에서 대기 중 (목업 데이터 모드)`);
}

void bootstrap();
