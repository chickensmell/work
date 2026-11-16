// 예시 파일(가짜 자료)로 가져오기·회신·급여계좌·금액·점검을 확인한다.
// 사용: python child-tuition/build.py && node child-tuition/tests/smoke.test.js   (playwright 필요)
const {chromium} = require('playwright'); const path = require('path'); const fs = require('fs');
const root = path.join(__dirname, '..'); const S = f => path.join(root, 'samples', f);
(async () => {
  const b = await chromium.launch(); const pg = await b.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('dialog', d => d.accept());
  await pg.goto('file://' + path.join(root, 'index.html'));
  await pg.click('#newq'); await pg.fill('#ny', '2026'); await pg.selectOption('#nq', '3'); await pg.fill('#nd', '2026-09-11'); await pg.click('#nok');
  await pg.setInputFiles('#impApps', S('sample_scan.xlsx')); await pg.waitForSelector('#dlg[open]'); await pg.evaluate(() => closeDlg());
  for (const t of ['confirm']) { await pg.click(`nav button[data-t=${t}]`); }
  await pg.setInputFiles('#impConf', S('sample_confirm_reply.xlsx')); await pg.waitForSelector('#cfok'); await pg.click('#cfok');
  await pg.click('nav button[data-t=staff]'); await pg.setInputFiles('#impPay', S('sample_payroll.xlsx')); await pg.waitForSelector('#dlg[open]'); await pg.evaluate(() => closeDlg());
  const got = await pg.evaluate(() => { const q = Q(); const r = evaluate(q); return q.apps.map(a => ({name: DB.staff[a.sab].name, child: a.child, pay: r.get(a.id).payable, bad: r.get(a.id).issues.filter(i => i.lv === 'bad').map(i => i.m)})); });
  const exp = JSON.parse(fs.readFileSync(S('expected.json'), 'utf8'));
  let fail = 0;
  for (const e of exp) { const g = got.find(x => x.name === e['성명'] && x.child === e['자녀']);
    const ok = g && g.pay === e['기대 실지급']; if (!ok) fail++;
    console.log(ok ? 'OK  ' : 'FAIL', e['시나리오'], '|', e['성명'], e['자녀'], '기대', e['기대 실지급'], '결과', g && g.pay, g && g.bad.length ? '| 오류: ' + g.bad.join(', ') : ''); }
  if (errs.length) { console.log('페이지 오류', errs); fail++; }
  await b.close(); process.exit(fail ? 1 : 0);
})();
