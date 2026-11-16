"""src/index.html 에 SheetJS를 넣어 단일 HTML(child-tuition/dist/자녀학비보조 관리 프로그램.html)을 만든다.
사용: python child-tuition/build.py
만들어진 파일을 Claude 앱(Artifact)으로 게시한다. 파일로 직접 열면 이 브라우저에만 저장하는 모드로 동작한다.
dist/ 는 저장소에 올리지 않는다(.gitignore)."""
from pathlib import Path
root = Path(__file__).parent
src = (root / 'src/index.html').read_text(encoding='utf-8')
lib = (root / 'vendor/xlsx-0.18.5.full.min.js').read_text(encoding='utf-8').replace('</script', '<\\/script')
# 코드표 문자열 안의 U+FFFD를 같은 뜻의 \ufffd 이스케이프로 바꿈(게시 검사 통과용, 동작 동일)
lib = lib.replace('\ufffd', '\\ufffd')
marker = '<script>/*XLSX_LIB*/</script>'
assert marker in src, 'src/index.html 에 라이브러리 자리표시가 없습니다'
out = root / 'dist' / '자녀학비보조 관리 프로그램.html'
out.parent.mkdir(exist_ok=True)
out.write_text(src.replace(marker, '<script>' + lib + '</script>'), encoding='utf-8')
print('만듦:', out)
