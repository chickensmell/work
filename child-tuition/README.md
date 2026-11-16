# 교직원 자녀학비보조 관리 프로그램

교직원 자녀학비 보조금(고등학생·대학생) 신청을 접수하고, 규정에 따라 점검·금액 계산·판정한 뒤
기안문과 출납·개인지급 업로드 파일을 만드는 **오프라인** 프로그램입니다.

- 근거: 교직원 자녀 학비보조에 관한 규정(2024.12.26. 개정)
- 실행: 웹 주소 https://chickensmell.github.io/work/child-tuition/ 또는 `index.html`을 학교 PC에 내려받아 브라우저로 엽니다. 자료는 그 PC 브라우저에만 저장됩니다.
- 기준과 구조: [docs/자녀학비보조-요구사항.md](../docs/자녀학비보조-요구사항.md)

## 만들기
저장소 맨 위 폴더에서:
```
python child-tuition/build.py
```
`child-tuition/index.html`(배포본)이 다시 만들어집니다. `index.html`은 직접 고치지 않습니다.

## 시험
```
python child-tuition/build.py
node child-tuition/tests/smoke.test.js
```
`samples/`의 가짜 자료(가짜 이름·계좌)로 가져오기, 회신 반영, 금액, 오류 점검을 확인합니다(playwright 필요).

## 폴더
| 경로 | 내용 |
|---|---|
| src/index.html | 프로그램 소스 |
| vendor/ | SheetJS 0.18.5 (엑셀 읽기·쓰기) |
| samples/ | 시험용 가짜 자료와 기대값 |
| tests/ | 자동 시험 |
| index.html | 빌드 결과(배포본) |

## 주의
실제 신청서, 지원내역, 회신, 계좌 등 개인정보가 든 파일은 이 저장소에 올리지 않습니다(.gitignore로 막혀 있음). 이 저장소는 공개 저장소입니다.
