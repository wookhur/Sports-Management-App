# 🏅 sideline365 — 스포츠 통합 관리 앱

기록을 측정하고 코치와 공유해 **더 나은 운동 성과**를 만드는 스포츠 통합 관리 웹앱입니다.
선수는 종목별로 훈련하고 기록을 남기며, 코치는 공유된 기록을 확인하고 피드백을 남깁니다.

## 지원 종목

| 종목 | 기능 |
| --- | --- |
| 🥍 라크로스 | 단계별 **훈련 방식** 가이드 (크레들링·패스·그라운드볼·슈팅·1대1) |
| ⚽ 축구 | 단계별 **연습 방식** 가이드 (퍼스트 터치·패스·드리블·마무리·수비) |
| 🏊 수영 | **시간·거리 측정** 스톱워치 + 기록 저장 / 최고 기록 / 페이스 계산 |

> 종목은 계속 추가됩니다. 새 종목은 `src/lib/sports.ts`의 `SPORTS`에 항목 하나만 추가하면
> 홈 화면·라우팅·기능이 자동으로 연결됩니다. (앱의 유일한 확장 지점)

## 핵심 기능

- **역할 기반 계정** — 선수(ATHLETE) / 코치(COACH), JWT 쿠키 세션 인증(bcrypt 해시)
- **기록 측정** — 수영 스톱워치로 영법·거리별 랩타임 측정 후 저장, 100m 페이스 자동 계산
- **훈련/연습 가이드** — 라크로스·축구의 난이도별 단계 훈련 + 코칭 포인트
- **코치 공유** — 기록별 공유 토글, 이메일로 코치·선수 연결
- **피드백** — 코치가 공유된 기록에 코멘트, 선수는 답글

## 기술 스택

- **Next.js 15** (App Router, React 19, TypeScript)
- **Prisma + PostgreSQL** (로컬·운영 동일) — 배포는 Neon/Supabase 등 호스팅 Postgres
- **Tailwind CSS**
- 인증: `jose`(JWT) + `bcryptjs`, 유효성 검증: `zod`

## 로컬 실행

```bash
createdb sideline      # 로컬 Postgres 준비
npm install            # 의존성 설치 (+ prisma generate)
cp .env.example .env   # DATABASE_URL(Postgres), AUTH_SECRET 설정
npm run db:push        # 스키마를 DB에 반영
npm run db:seed        # 데모 계정 + 샘플 기록 생성
npm run dev            # http://localhost:3000
```

> ☁️ **Netlify 배포는 [`DEPLOY.md`](./DEPLOY.md) 참고** — 호스팅 Postgres(Neon 등) 연결 + 환경변수 2개.

### 데모 계정

| 역할 | 이메일 | 비밀번호 |
| --- | --- | --- |
| 선수 | `athlete@example.com` | `password123` |
| 코치 | `coach@example.com` | `password123` |

## 프로젝트 구조

```
prisma/
  schema.prisma        # User / Record / Comment / CoachAthlete 모델
  seed.ts              # 데모 데이터
src/
  lib/
    sports.ts          # 종목 레지스트리 (확장 지점) — 가이드/측정 항목 정의
    auth.ts            # 세션/JWT/비밀번호 헬퍼
    db.ts              # Prisma 클라이언트 싱글턴
    format.ts          # 시간/페이스/날짜 포맷
  app/
    api/               # 인증·기록·코멘트·연결 라우트 핸들러
    login, signup/     # 인증 화면
    page.tsx           # 홈 대시보드
    sports/[sportId]/  # 종목 허브 (+ guides/[guideId] 상세)
    records/           # 선수 기록 관리
    coach/             # 코치 대시보드
  components/          # NavBar, Stopwatch, RecordList, ConnectionManager ...
```

## API 요약

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| POST | `/api/auth/signup` · `/login` · `/logout` | 인증 |
| GET/POST | `/api/records` | 내 기록 조회 / 생성 |
| PATCH/DELETE | `/api/records/[id]` | 공유 토글·메모 수정 / 삭제 |
| POST | `/api/records/[id]/comments` | 코멘트(코치·본인) |
| POST/DELETE | `/api/connections` | 코치↔선수 연결/해제 |

## 다음 단계 (로드맵)

- 종목 추가(농구, 육상 등) — 레지스트리 항목 추가만으로 확장
- 기록 추세 그래프 / 개인 기록(PR) 알림
- 팀 단위 관리, 훈련 일정(캘린더 연동)
- 운영 배포 시 Postgres + 관리형 인증으로 전환
