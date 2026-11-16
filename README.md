# 나의 업무 보드

혼자 쓰는 업무 대시보드입니다. 업무 목록, 체크박스, 진행률, 처리 절차, 진행 기록, 반복 업무를 관리하고 PC와 휴대폰에서 같은 데이터를 봅니다.

- 화면: GitHub Pages (이 저장소의 `index.html`)
- 데이터: Supabase (로그인한 본인만 읽고 쓰기)
- 기능 명세: [docs/spec.md](docs/spec.md)

> 이 저장소에는 업무 내용을 넣지 않습니다. 업무 데이터와 백업 파일(.json)은 커밋하지 마세요.

## 처음 한 번만 하는 설정

### 1. Supabase 프로젝트 만들기
1) https://supabase.com 에 로그인 → **New project**
2) 이름은 자유(예: work-board), 지역은 **Northeast Asia (Seoul)**, 데이터베이스 비밀번호는 따로 적어 두기

### 2. 테이블 만들기
1) 왼쪽 메뉴 **SQL Editor** → 새 쿼리
2) `supabase/schema.sql` 내용을 전부 붙여 넣고 **Run**

### 3. 내 계정 만들고, 다른 사람 가입 막기
1) **Authentication → Users → Add user → Create new user**
2) 내 이메일과 비밀번호 입력, **Auto Confirm User** 체크 후 생성
3) **Authentication → Sign In / Providers**(또는 Settings)에서 **Allow new users to sign up** 끄기

### 4. 연결 정보 넣기
1) **Project Settings → API Keys**(또는 Data API)에서 **Project URL**과 **Publishable key**(예전 이름: anon public key) 복사
2) 이 저장소의 `config.js`에 붙여 넣기
3) `service_role` / `secret` 키는 절대 넣지 않기

### 5. GitHub Pages 켜기
1) 저장소 **Settings → General → Danger Zone → Change visibility → Public**
   (무료 요금제는 공개 저장소에서만 Pages 사용 가능. 코드만 공개되고 업무 데이터는 Supabase에 있음)
2) **Settings → Pages → Source: Deploy from a branch → Branch: main / (root) → Save**
3) 1~2분 뒤 `https://<아이디>.github.io/work/` 에서 열림

### 6. 업무 데이터 넣기
1) 사이트에서 로그인
2) 왼쪽 **데이터 → 백업 가져오기**에서 JSON 파일 선택 (저장소 밖에 따로 보관한 파일)

### 7. 휴대폰 홈 화면에 추가
- 아이폰 Safari: 공유 → 홈 화면에 추가
- 안드로이드 Chrome: 메뉴(⋮) → 홈 화면에 추가

## 주의
- Supabase 무료 요금제는 1주일 동안 접속이 없으면 프로젝트가 일시정지됩니다. 데이터는 남아 있고 Supabase 화면에서 다시 켜면 됩니다.
- 무료 요금제는 자동 백업이 없으니 가끔 **백업 내려받기**로 JSON을 저장해 두세요.
