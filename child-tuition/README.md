# 교직원 자녀학비보조 관리 프로그램

교직원 자녀학비 보조금(고등학생·대학생) 신청을 접수하고, 규정에 따라 점검·금액 계산·판정한 뒤
기안문과 출납·개인지급 업로드 파일을 만드는 **오프라인** 프로그램입니다.

- 근거: 교직원 자녀 학비보조에 관한 규정(2024.12.26. 개정)
- 실행: Claude 앱 https://claude.ai/artifact/CtYsPVEAFMizuiEnLcYQHm (본인만 열 수 있음). 자료는 Claude 앱 저장소에 저장되어 PC·휴대폰에서 같은 자료를 봅니다.
- 빌드한 HTML 파일을 직접 열면 예전처럼 그 PC 브라우저에만 저장하는 모드로 동작합니다.
- 기준과 구조: [docs/자녀학비보조-요구사항.md](../docs/자녀학비보조-요구사항.md)

## 만들기
저장소 맨 위 폴더에서:
```
python child-tuition/build.py
```
`child-tuition/dist/자녀학비보조 관리 프로그램.html`이 만들어집니다(저장소에는 올리지 않음). 이 파일을 Claude 앱 주소에 다시 게시합니다.

## 시험
```
python child-tuition/build.py
node child-tuition/tests/smoke.test.js
node child-tuition/tests/db.test.js
```
`samples/`의 가짜 자료(가짜 이름·계좌)로 가져오기, 회신 반영, 금액, 오류 점검을 확인합니다(playwright 필요). `db.test.js`는 가짜 앱 저장소를 붙여 저장·다시 열기·삭제·내려받기를 확인합니다.

## 폴더
| 경로 | 내용 |
|---|---|
| src/index.html | 프로그램 소스 |
| vendor/ | SheetJS 0.18.5 (엑셀 읽기·쓰기) |
| samples/ | 시험용 가짜 자료와 기대값 |
| tests/ | 자동 시험 |
| dist/ | 빌드 결과(올리지 않음) |

## 기존 자료 옮기기
예전 웹 주소나 HTML 파일에서 쓰던 자료는 그 브라우저에 남아 있습니다. 예전 화면의 **설정·백업 → 백업 파일 내려받기**로 JSON을 받은 뒤, Claude 앱 화면의 **설정·백업 → 백업 파일 불러오기**로 넣습니다.

## 주의
실제 신청서, 지원내역, 회신, 계좌 등 개인정보가 든 파일은 이 저장소에 올리지 않습니다(.gitignore로 막혀 있음). 이 저장소는 공개 저장소입니다.
