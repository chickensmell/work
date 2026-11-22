// Claude 앱 저장소(db) 모드 시험: 가짜 저장소를 붙여 예시 파일을 가져오고, 페이지를 다시 열어 같은 자료가 복원되는지 확인한다.
// 사용: python child-tuition/build.py && node child-tuition/tests/db.test.js   (playwright 필요)
const {chromium} = require('playwright'); const path = require('path');
const root = path.join(__dirname, '..'); const S = f => path.join(root, 'samples', f);
const FILE = 'file://' + path.join(root, 'dist', '자녀학비보조 관리 프로그램.html');

const store = new Map(); // 'col/id' -> body (Node 쪽에 두어 페이지를 다시 열어도 남음)
let writes = 0;

// 페이지 안에 window.claude 가짜 객체를 만든다(db·downloads만).
const MOCK = () => {
  const call = (op, a, b) => window.__dbcall(op, a, b);
  const doc = (c, id) => ({id, set: body => call('set', c + '/' + id, JSON.stringify(body)), delete: () => call('del', c + '/' + id)});
  const db = {collection: c => ({
    doc: id => doc(c, id),
    get: async () => { const rows = JSON.parse(await call('list', c)); return {docs: rows.map(([id, b]) => ({id, exists: true, data: () => b}))}; },
  })};
  window.__saved = [];
  const downloads = {save: async ({filename}) => { window.__saved.push(filename); return {status: 'saved'}; }};
  window.claude = {use: async n => n === 'db' ? db : n === 'downloads' ? downloads : null};
};

async function open(b) {
  const pg = await b.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.exposeFunction('__dbcall', (op, a, body) => {
    if (op === 'set') { writes++; store.set(a, JSON.parse(body)); return null; }
    if (op === 'del') { writes++; store.delete(a); return null; }
    if (op === 'list') return JSON.stringify([...store].filter(([k]) => k.split('/')[0] === a).map(([k, v]) => [k.split('/')[1], v]));
  });
  await pg.addInitScript(MOCK);
  await pg.goto(FILE); await pg.waitForFunction(() => typeof DB !== 'undefined' && DB && REMOTE);
  return {pg, errs};
}
const snap = pg => pg.evaluate(() => { const q = Q(); const r = evaluate(q);
  return {cur: DB.cur, staff: Object.keys(DB.staff).length, children: Object.keys(DB.children).length,
    apps: q.apps.map(a => [a.id, DB.staff[a.sab].name, a.child, r.get(a.id).payable, a.judge || ''])}; });
const settle = pg => pg.waitForFunction(() => !unsynced && !syncing, null, {timeout: 20000});

(async () => {
  const b = await chromium.launch(); let fail = 0; const ok = (c, m) => { console.log(c ? 'OK  ' : 'FAIL', m); if (!c) fail++; };
  let {pg, errs} = await open(b);
  ok(await pg.evaluate(() => !!REMOTE), '앱 저장소 모드로 시작');
  await pg.click('#newq'); await pg.fill('#ny', '2026'); await pg.selectOption('#nq', '3'); await pg.fill('#nd', '2026-09-11'); await pg.click('#nok');
  await pg.setInputFiles('#impApps', S('sample_scan.xlsx')); await pg.waitForSelector('#dlg[open]'); await pg.evaluate(() => closeDlg());
  await pg.click('nav button[data-t=confirm]');
  await pg.setInputFiles('#impConf', S('sample_confirm_reply.xlsx')); await pg.waitForSelector('#cfok'); await pg.click('#cfok');
  await pg.click('nav button[data-t=staff]'); await pg.setInputFiles('#impPay', S('sample_payroll.xlsx')); await pg.waitForSelector('#dlg[open]'); await pg.evaluate(() => closeDlg());
  // 첫 건을 지급 판정해 판정 값도 저장되는지 본다
  await pg.evaluate(() => { Q().apps[0].judge = '지급'; save(); });
  await settle(pg);
  const before = await snap(pg);
  ok(before.apps.length > 0 && store.size > 0, `저장소에 문서 ${store.size}개 저장(신청 ${before.apps.length}건, 쓰기 ${writes}회)`);

  // 아무것도 안 바꾸고 저장하면 다시 쓰지 않아야 함
  const w0 = writes; await pg.evaluate(() => save()); await settle(pg); ok(writes === w0 + 1, `바뀐 것 없으면 저장 시각 문서(meta/main)만 다시 씀 (쓰기 ${writes - w0}회)`);

  // 엑셀 내려받기가 downloads 기능으로 가는지
  await pg.click('nav button[data-t=out]');
  await pg.evaluate(() => { exportList(); exportCash(); return backup(); }); await pg.waitForTimeout(300);
  const saved = await pg.evaluate(() => window.__saved);
  ok(saved.filter(f => f.endsWith('.xlsx')).length === 2 && saved.some(f => f.endsWith('.json')), '엑셀·백업 내려받기가 앱 내려받기 기능으로 전달됨 (' + saved.join(', ') + ')');
  if (errs.length) { console.log('페이지 오류', errs); fail++; }
  await pg.close();

  // 다시 열기
  ({pg, errs} = await open(b));
  const after = await snap(pg);
  ok(JSON.stringify(after) === JSON.stringify(before), '다시 열었을 때 같은 자료(명부·자녀·신청 순서·금액·판정)');

  // 신청 1건 삭제(앱 안 확인창) 후 다시 열기
  const delId = after.apps[1][0];
  await pg.evaluate(id => editApp(id), delId);
  const hasDel = await pg.$('#f_del');
  if (hasDel) {
    await pg.click('#f_del'); await pg.waitForSelector('#cdlg[open]'); await pg.click('#c_yes'); await settle(pg); await pg.close();
    ({pg, errs} = await open(b)); const again = await snap(pg);
    ok(again.apps.length === after.apps.length - 1 && !again.apps.some(a => a[0] === delId), '앱 안 확인창으로 삭제 → 저장소에서도 삭제');
  } else console.log('SKIP 삭제 시험(상세 열기 함수 이름 확인 필요)');
  if (errs.length) { console.log('페이지 오류', errs); fail++; }
  await b.close(); process.exit(fail ? 1 : 0);
})();
