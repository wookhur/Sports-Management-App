# 🚀 Netlify 배포 가이드 (sideline365)

> **왜 로그인이 "처리 중"에서 멈췄나?**
> 앱은 서버(로그인·기록 API)가 **데이터베이스**를 읽어야 동작합니다. 기존 코드는
> 로컬 파일 DB(SQLite)를 썼는데, **Netlify의 서버리스 환경에는 그 파일이 없고 쓰기도
> 불가능**해서 로그인 API가 실패했습니다. 그래서 화면이 넘어가지 않았습니다.
> 이제 **Postgres(호스팅 DB)** 로 전환했으니, 아래 3단계로 실제 DB만 연결하면 됩니다.

---

## 1) Postgres 데이터베이스 만들기 (무료, 약 1분)

**Neon**(추천, Netlify 공식 연동) 기준:
1. https://neon.tech 가입 → **New Project** 생성
2. 대시보드의 **Connection string** 복사
   (형식: `postgresql://USER:PASSWORD@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require`)

> Supabase를 써도 됩니다 — Project Settings → Database → **Connection string (URI)** 복사.

---

## 2) Netlify에 환경변수 설정

Netlify 사이트 → **Site configuration → Environment variables** 에서 두 개 추가:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | 1번에서 복사한 Postgres 연결 문자열 |
| `AUTH_SECRET` | 아무 긴 랜덤 문자열 (예: `openssl rand -base64 32` 결과) |

> Netlify의 **원클릭 Neon 연동**을 쓰면 `NETLIFY_DATABASE_URL`이 자동 생성됩니다.
> 그 경우, 같은 값을 **`DATABASE_URL`** 이라는 이름으로 하나 더 추가해 주세요.

---

## 3) 재배포

- 이 저장소가 Netlify에 연결돼 있으면, 브랜치에 **push하면 자동 배포**됩니다.
- 또는 Netlify 대시보드에서 **Deploys → Trigger deploy → Deploy site**.

배포 시 `netlify.toml`의 빌드 명령이 자동으로:
1. `prisma db push` — 테이블 생성/동기화
2. `prisma/seed.ts` — **데모 계정 시드**(멱등, 여러 번 실행해도 안전)
3. `next build` — 앱 빌드

를 수행합니다. 빌드 로그에 `Seed complete`가 보이면 데모 계정이 준비된 것입니다.

---

## 데모 계정
| 역할 | 이메일 | 비밀번호 |
| --- | --- | --- |
| 선수 | `athlete@example.com` | `password123` |
| 코치 | `coach@example.com` | `password123` |

---

## 문제 해결
- **여전히 로그인이 안 됨** → Netlify **Deploys → 최신 배포 로그**에서 `db push`/`Seed complete`
  성공 여부 확인. DB 연결 문자열이 틀리면 여기서 실패합니다.
- **`AUTH_SECRET` 미설정** → 세션 서명이 불안정합니다. 반드시 설정하세요.
- **연결 수 초과(고트래픽)** → Neon의 **pooled** 연결 문자열(`-pooler` 호스트)을 `DATABASE_URL`로 사용하세요.
- 로그인 실패 시, 이제 화면이 멈추지 않고 **오류 메시지**가 표시됩니다(“서버 오류…”). 메시지를 알려주시면 원인 파악이 빠릅니다.

## 로컬 개발
```bash
# 로컬 Postgres 예시
createdb sideline
echo 'DATABASE_URL="postgresql://postgres@127.0.0.1:5432/sideline"' >> .env
echo 'AUTH_SECRET="dev-secret"' >> .env
npm install
npm run db:push && npm run db:seed
npm run dev
```
