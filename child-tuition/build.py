"""src/index.html 에 SheetJS를 넣어 오프라인 단일 HTML(child-tuition/index.html)을 만든다.
사용: python child-tuition/build.py
만들어진 index.html 이 웹 주소(GitHub Pages) 배포본이자, 학교 PC에 내려받아 쓰는 파일이다."""
from pathlib import Path
root = Path(__file__).parent
src = (root / 'src/index.html').read_text(encoding='utf-8')
lib = (root / 'vendor/xlsx-0.18.5.full.min.js').read_text(encoding='utf-8').replace('</script', '<\\/script')
marker = '<script>/*XLSX_LIB*/</script>'
assert marker in src, 'src/index.html 에 라이브러리 자리표시가 없습니다'
out = root / 'index.html'
out.write_text(src.replace(marker, '<script>' + lib + '</script>'), encoding='utf-8')
print('만듦:', out)
