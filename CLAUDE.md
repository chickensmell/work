# 작업 규칙

## 사이트별 브랜치
사이트마다 브랜치를 따로 두고, 사이트마다 별도의 Claude Code 채팅방에서 관리한다. 다른 사이트의 폴더는 건드리지 않는다.

| 사이트 | 브랜치 | 폴더 | 요구사항 문서 |
| --- | --- | --- | --- |
| 나의 업무 보드 | `work-board` | `board/` | `docs/업무보드-요구사항.md` |
| 자녀학비보조 관리 | `child-tuition` | `child-tuition/` | `docs/자녀학비보조-요구사항.md` |

## 나의 업무 보드 수정 순서
1. `board/index.html`을 고친다.
2. Artifact 도구로 같은 주소에 다시 게시한다: `url` = https://claude.ai/artifact/GuS4JDJZhQw2VzSLAK9aMu, `file_path` = `board/index.html`. `capabilities`는 생략해서 기존 db 설정(본인만 읽기·쓰기)을 유지한다.
   - 게시 전에 그 주소를 `read`로 먼저 읽고, 앱 쪽에서 바뀐 내용이 있으면 `board/index.html`에 합친다.
3. `docs/업무보드-요구사항.md`의 **6. 변경 이력** 표 맨 아래에 날짜·구분·내용을 한 줄 추가한다. 요구사항이 바뀌면 2~4장의 해당 항목도 고친다.
4. 커밋하고 작업 브랜치에 푸시한다.

## 자녀학비보조 관리 수정 순서
원본은 이 저장소 하나로 통일했다(2026-11-16). 비공개 저장소 `child-tuition`은 더 이상 고치지 않는다.
1. `child-tuition/src/index.html`을 고친다. `child-tuition/index.html`은 빌드 결과이므로 직접 고치지 않는다.
2. `python child-tuition/build.py`로 배포본을 만들고 `node child-tuition/tests/smoke.test.js`를 돌린다.
   - 새 규칙은 `child-tuition/samples/sample_scan.xlsx`와 `expected.json`에 시나리오를 추가한다.
3. 기능·규정·화면·파일 양식은 `docs/자녀학비보조-요구사항.md`를 따른다. 다르게 바꾸면 명세도 고치고 **15. 변경 이력**에 한 줄 추가한다.
4. 커밋하고 `child-tuition` 브랜치에 푸시한다.

### 자녀학비보조 지킬 것
- 오프라인 단일 HTML이다. 외부 서버·CDN·데이터베이스로 자료를 보내는 코드를 넣지 않는다(교직원 개인정보·계좌). 자료는 PC 브라우저(localStorage `child-tuition-v1`)와 JSON 백업 파일에만 둔다.
- 시험 자료는 가짜 이름·가짜 계좌만 쓴다. 실제 신청서·지원내역·회신·계좌 파일은 커밋하지 않는다(이 저장소는 공개).
- 판단 원칙: 재직기간은 학교 전임·정규직 임용일 기준(병원 최초 임용일 아님), 누적 학기는 신청인 기준, 대학 한도는 신청인 총 학기(1명 8, 3명 24).

## 지킬 것 (나의 업무 보드)
- 데이터는 Claude 앱 저장소(db)에만 둔다. Supabase 등 외부 서비스·별도 서버를 쓰지 않는다.
- 업무 데이터, 직원 이름, 내보내기 JSON은 저장소에 커밋하지 않는다.
- 데이터 필드 이름(4장)을 바꾸면 기존 업무가 깨지므로, 바꿀 때는 기존 데이터 변환 방법을 함께 정한다.

## 공통
- 사용자 문서 번호 체계: `1.` > `가.` > `1)` > `가)`
