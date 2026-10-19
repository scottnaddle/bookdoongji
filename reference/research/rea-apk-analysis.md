# sconn.io Android APK 리버스 엔지니어링 결과 (REA 활용)

> 분석일: 2026-10-18
> 대상: com.flexcil.sconnapp (APK 96MB, 3,832 파일, sha256: b37298a9...)
> 방법: REA identify-flutter-build + dex strings 직접 분석
> 주의: 구조·API 패턴 파악용. 코드/에셋 복제 금지.

## 앱 기본 정보
- 네이티브 Android 앱 (Kotlin/Java, classes.dex 9.8MB + classes2.dex 8.1MB)
- Flutter 아님 (REA identify-flutter-build: flutter_detected false)
- React Native 아님 (Hermes/JS 번들 없음)

## 발견된 API 엔드포인트
| 용도 | URL |
|---|---|
| 메인 API | https://api.sconn.io/ , https://api.sconn.io/v2/ |
| 프론트 API (운영) | https://front-api.sconn.io/ |
| 클라우드 동기화 API | https://syncapi.sconn.io/ |
| 동기화 관리 | https://syncadmin.sconn.io/ |
| 학습 페이지 | https://mystudying.sconn.io/my-page |

## 발견된 API 경로
- `/v2/connect`, `/v2/connect/migrate` — 기기/계정 연결, 마이그레이션
- `/v2/fsc/u/smb/studying` — 학습(스터디) 관련
- `/v2/platforms/android/gmp/` — Android 플랫폼 설정

## 앱 내장 에셋 (번들)
- `assets/Defaults/WritingView/DefaultPens.json` — Flexcil 펜 프리셋 설정
- `assets/Quiz/QuizIncorrectionNote.pdf`, `QuizIncorrectionNoteV2.pdf` — 오답노트 템플릿
- `assets/Quiz/quizCoverTemplate.pdf` — 퀴즈 커버 템플릿
- `assets/Sample PDF/` — 샘플 교재 PDF (megaland, megalaws 등)

## 아키텍처 추론
1. **API 분리**: 커머스/콘텐츠(api.sconn.io) vs 필기 동기화(syncapi.sconn.io) 분리
2. **필기 엔진**: Flexcil WritingView 네이티브 모듈 (펜 프리셋 JSON 번들)
3. **오답노트**: PDF 템플릿 기반 생성 (QuizIncorrectionNote)
4. **기기 연결**: /v2/connect 로 기기 등록/마이그레이션 (멀티 디바이스 지원)

## 클론 개발 시사점
- API를 커머스 API + 동기화 API로 분리 설계 고려
- 필기 데이터는 기기 로컬 + 클라우드 동기화 구조
- 오답노트는 템플릿 기반 PDF 생성 방식 참고
- 소셜/지원: Channel.io(채팅), Zendesk(헬프센터) 연동
