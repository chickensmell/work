// 부서운영비 사이트 자동 시험 (가짜 이름·가짜 계좌만 사용)
// 실행: npm i --prefix dept-budget/tests && node dept-budget/tests/smoke.test.js
const path = require('path'), fs = require('fs'), os = require('os');
const { chromium } = require('playwright');
const XLSX = require('xlsx');
const NM = path.join(__dirname, 'node_modules');
const PAGE = path.join(__dirname, '..', 'index.html');
const LIBS = {
  'xlsx/0.18.5/xlsx.full.min.js': path.join(NM, 'xlsx/dist/xlsx.full.min.js'),
  'jszip/3.10.1/jszip.min.js': path.join(NM, 'jszip/dist/jszip.min.js'),
  'pdf.js/3.11.174/pdf.min.js': path.join(NM, 'pdfjs-dist/build/pdf.min.js'),
  'pdf.js/3.11.174/pdf.worker.min.js': path.join(NM, 'pdfjs-dist/build/pdf.worker.min.js'),
};

// ---- 가짜 명단: 실제 명단과 같은 모양 (순번·부서·입금계좌 병합, 은행과 예금주를 한 칸에, 계좌번호 없음)
// [부서, 은행, 계좌, 예금주, [[이름, 11월, 12월], ...]]
const G = 30000, S = 15000;
const ppl = (prefix, n, a = [G, G]) => Array.from({length: n}, (_, i) => [`${prefix}${i + 1}`, ...a]);
const UNITS = [
  ['총무팀\n재무팀\n시설관리팀', '우리', '1002-000-000001', '김가상', [['김가상', G, G], ...ppl('총무', 11)]],
  ['학사지원팀', '신한', '110-000-000002', '이시험', [['이시험', G, G], ...ppl('학사', 5)]],
  ['연구지원팀', '우리', '1002-000-000003', '박예시', [['박예시', G, G], ...ppl('연구', 5)]],
  ['학생상담센터', 'KB국민', '000-00-0000-004', '최더미', [['최더미', G, G], ...ppl('상담', 3), ...ppl('상담반', 2, [S, S])]],
  ['입학팀', '하나', '000-000000-00005', '정샘플', [['정샘플', G, G], ...ppl('입학', 4)]],
  ['교무팀', '신한', '110-000-000006', '한가짜', [['한가짜', G, G], ...ppl('교무', 3)]],
  ['기획팀', '우리', '1002-000-000007', '오테스', [['오테스', G, G], ...ppl('기획', 4)]],
  ['홍보팀', 'IBK기업', '000-000000-00-008', '윤모의', [['윤모의', G, G], ...ppl('홍보', 2)]],
  ['도서관', '농협', '000-0000-0000-09', '장해외', ppl('도서', 4)],            // 예금주가 명단에 없음
  ['국제교류팀', '우리', '1002-000-000010', '강신입', [['강신입', G, G], ...ppl('국제', 2)]],
  ['산학협력팀', '부산', '000-0000-0000-11', '문두명', [['문두명', G, G], ...ppl('산학', 5), ['산학전보', G, 0]]],
  ['학생지원팀', '신한', '110-000-000012', '서누락', [['서누락', G, G], ...ppl('학생', 5), ['학생반1', S, S]]],
];
function fakeRoster(file) {
  const aoa = [[], ['     2026년 11-12월 부서운영비 지급 명단'], [], ['순번', '부서', '대상자', '11월', '12월', '입금계좌', '인원', '입금액', '', '차액'], ['', '', '', '', '', '예금주', '', '', '', '']];
  const merges = [];
  let r = 5;
  UNITS.forEach(([dept, bank, acct, holder, ps], k) => {
    const r0 = r;
    ps.forEach((p, i) => { aoa.push([i ? null : k + 1, i ? null : dept, p[0], p[1] || null, p[2] || null, i ? null : `${bank}\n${holder}`, i ? null : ps.length, i ? null : ps.reduce((s, x) => s + x[1] + x[2], 0)]); r++; });
    if (r - 1 > r0) [0, 1, 5, 6, 7].forEach(c => merges.push({s: {r: r0, c}, e: {r: r - 1, c}}));
  });
  aoa.push(['합계']);
  const ws = XLSX.utils.aoa_to_sheet(aoa); ws['!merges'] = merges;
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, '부서운영비 지급내역');
  XLSX.writeFile(wb, file);
}

let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  통과 ' : '  실패 ') + msg); if (!cond) fails++; };

(async () => {
  const tmp = path.join(__dirname, '.tmp'); fs.mkdirSync(tmp, {recursive: true});   // 브라우저가 /tmp 파일을 못 고르는 환경이 있어 시험 폴더 안에 둠
  const rosterFile = path.join(tmp, 'fake-roster.xlsx'); fakeRoster(rosterFile);
  const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 1366, height: 900}});
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route('https://cdnjs.cloudflare.com/**', r => { const k = Object.keys(LIBS).find(k => r.request().url().endsWith(k)); return k ? r.fulfill({path: LIBS[k], contentType: 'application/javascript'}) : r.abort(); });
  await p.goto('file://' + PAGE);
  await p.waitForSelector('[data-act="createCycle"]');

  console.log('1. 회차 만들기·명단 읽기');
  await p.fill('#ncY', '2026'); await p.selectOption('#ncM', '11'); await p.click('[data-act="createCycle"]'); await p.waitForSelector('#rosterFile', {state: 'attached'});
  await p.setInputFiles('#rosterFile', rosterFile);
  await p.waitForFunction(() => cyc()?.people.length > 0, null, {timeout: 15000}).catch(async e => { console.log(await p.textContent('#main'), errs, await p.evaluate(() => [ST.meta.cur, Object.keys(ST.cycles)])); throw e; });
  const c = () => p.evaluate(() => JSON.parse(JSON.stringify(cyc())));
  let C = await c();
  ok(C.units.length === 12, `순번 12건 (${C.units.length})`);
  ok(C.people.length === 68, `대상자 68명 (${C.people.length})`);
  ok(C.units[0].dept === '총무팀·재무팀·시설관리팀', `묶음 부서명 (${C.units[0].dept})`);
  ok(C.units[3].bank === 'KB국민' && C.units[3].holder === '최더미', `입금계좌 칸 나누기 (${C.units[3].bank}/${C.units[3].holder})`);
  const body = await p.textContent('#c-body');
  ok(body.includes('1. 11월: 68명(65명*30,000원 + 3명*15,000원)') && body.includes('2. 12월: 67명(64명*30,000원 + 3명*15,000원)'), '지급 결의내역 달별 인원');
  ok((await p.textContent('#c-title')) === '[총무팀] 2026학년도 부서운영비 지급 건(11-12월)', '지급 결의명(학년도)');
  const total = await p.evaluate(() => totalOf(cyc().people));
  ok(total === 65 * G + 3 * S + 64 * G + 3 * S, `명단 합계 ${total}`);
  const chk = await p.evaluate(() => rosterChecks(cyc()).map(x => x[2]));
  ok(chk.some(t => t.startsWith('도서관: 예금주 장해외')), '예금주가 명단에 없는 순번 표시');

  console.log('2. 출납명세서 대조');
  await p.evaluate(() => { const c = cyc(); c.cash = c.units.map((u, i) => `${i + 1}\t출금\t교직원\t${u.holder}\t${u.bank}\t${u.holder}\t${(u.no === 4 ? 330000 : unitSum(c, u.no)).toLocaleString('ko-KR')}`).join('\n'); render(); });
  const chk2 = await p.evaluate(() => rosterChecks(cyc()).map(x => x[2]));
  ok(chk2.some(t => t.startsWith('학생상담센터: 출납명세서 금액(330,000)')), '출납명세서 금액 다름 표시');
  ok(!chk2.some(t => t.startsWith('학사지원팀: 출납')), '맞는 순번은 표시 안 함');

  console.log('3. 지급 확정 뒤 변동 → 환수·추가 지급');
  await p.evaluate(() => { const c = cyc(); c.paid = {at: '2026-11-04', units: clone(c.units), people: clone(c.people)}; saveCycle(c); });
  const apply = (form) => p.evaluate(f => { UI.form = f; applyChange(cyc()); }, form);
  const pid = name => p.evaluate(n => cyc().people.find(x => x.name === n).id, name);
  await apply({kind: '퇴사', pid: await pid('입학1'), date: '2026-11-03'});
  await apply({kind: '입사', no: 6, name: '정입사', rate: G, date: '2026-12-02'});
  await apply({kind: '퇴사', pid: await pid('국제1'), date: '2026-12-10'});
  await apply({kind: '입사', no: 7, name: '노보름', rate: G, date: '2026-11-15'});
  await apply({kind: '퇴사', pid: await pid('기획1'), date: '2026-12-15'});      // 15일 당일 퇴사 → 환수 안 함
  await apply({kind: '부서 담당자(예금주) 변경', no: 8, holder: '홍보1', bank: '신한', date: '2026-11-20'});
  const df = await p.evaluate(() => diffs(cyc()).map(d => [d.name, d.refSum, d.addSum]));
  const get = n => df.find(d => d[0] === n) || [n, 0, 0];
  ok(get('입학1')[1] === 60000, `홀수달 초 퇴사 → 60,000원 환수 (${get('입학1')[1]})`);
  ok(get('국제1')[1] === 30000, `짝수달 10일 퇴사 → 30,000원 환수 (${get('국제1')[1]})`);
  ok(get('정입사')[2] === 30000, `12월 2일 입사 → 30,000원 추가 (${get('정입사')[2]})`);
  ok(get('노보름')[2] === 60000, `11월 15일 입사 → 11·12월 추가 (${get('노보름')[2]})`);
  ok(get('기획1')[1] === 0, `15일 당일 퇴사 → 환수 없음 (${get('기획1')[1]})`);
  C = await c();
  ok(C.units[7].holder === '홍보1' && C.units[7].bank === '신한', '예금주 변경 반영');
  await p.evaluate(() => { UI.open.change = true; render(); });
  ok((await p.textContent('#main')).includes('면직자 발생에 따른 11-12월 부서운영비 6만원을 환수 요청'), '환수 메일 문구 (두 달)');
  ok((await p.textContent('#main')).includes('면직자 발생에 따른 12월 부서운영비 3만원을 환수 요청'), '환수 메일 문구 (한 달)');
  await p.evaluate(() => { const c = cyc(); const last = c.changes.filter(x => !x.undone).pop(); c.people = last.before.people; c.units = last.before.units; c.changes = c.changes.filter(x => x !== last); render(); });
  ok((await c()).units[7].holder === '윤모의', '마지막 변동 되돌리기');

  console.log('4. 정산 결의서 (최종 인원)');
  await p.click('[data-tab="settle"]');
  const sb = await p.textContent('#c-sbody');
  // 최종: 11월 65-1(입학1)+1(노보름)=65, 12월 64-1(입학1)-1(국제1)+1(정입사)+1(노보름)=64
  ok(sb.includes('1. 11월 지급 내역(1,995,000원)') && sb.includes('가. 전일제: 65명*30,000원= 1,950,000원') && sb.includes('나. 반일제 근무 직원: 3명*15,000원= 45,000원'), '정산 결의내역 11월');
  ok(sb.includes('2. 12월 지급 내역(1,965,000원)') && sb.includes('가. 전일제: 64명*30,000원= 1,920,000원'), '정산 결의내역 12월');
  ok((await p.textContent('#c-stitle')) === '[총무팀] 2026년 11-12월 부서운영비 정산', '정산 결의명(연도)');

  console.log('5. 판독 결과 점검 (가짜 판독 결과를 넣어 시험)');
  await p.evaluate(() => {
    ST.meta.biz = '0000';
    const R = (no, key, data) => { ST.reads[`${cyc().id}_${key}`] = {name: key + '.pdf', key, no, pages: 3, at: '2026-12-20', data}; };
    const rc = (page, o) => ({page, kind: '현금영수증', date: '2026-11-20', amount: 50000, biz_id: '12****0000', proof: '지출증빙', approval: 'A' + page + Math.random().toString(36).slice(2, 6), merchant: '○○식당', items: '식사', readable: 'ok', ...o});
    R(2, 'k2', {sheet: {dept: '학사지원팀', paid: 360000, settled: 372000, items: [{no: 1, date: '2026-11-20', desc: '회식', amount: 372000}]}, receipts: [rc(2, {amount: 372000, proof: '표시없음'})]});
    R(3, 'k3', {sheet: {dept: '연구지원팀', paid: 360000, settled: 363360, items: [{no: 1, date: '2026-11-20', desc: '다과', amount: 200000}, {no: 2, date: '2026-12-01', desc: '회식', amount: 180360}]}, receipts: [rc(2, {amount: 380360})]});
    R(4, 'k4', {sheet: {dept: '학생상담센터', paid: 300000, settled: 318500, items: [{no: 1, date: '2026-11-20', desc: '회식', amount: 318500}]}, receipts: [rc(2, {amount: 318500, biz_id: '01****5521'})]});
    R(5, 'k5', {sheet: {dept: '입학팀', paid: 300000, settled: 310000, items: [{no: 1, date: '2026-12-10', desc: '꽃다발', amount: 45000}, {no: 2, date: '2026-12-11', desc: '회식', amount: 265000}]}, receipts: [rc(2, {approval: 'DUP1'}), rc(3, {date: '2026-10-28'})]});
    R(7, 'k7', {sheet: {dept: '기획팀', paid: 300000, settled: 290000, items: [{no: 1, date: '2026-11-20', desc: '회식', amount: 290000}]}, receipts: [rc(2, {approval: 'DUP1'})]});
    R(1, 'k1', {sheet: {dept: '총무팀', note: '총무팀', paid: 720000, settled: 745300, items: [{no: 1, date: '2026-11-20', desc: '회식', amount: 745300}]}, receipts: [rc(2, {readable: 'partial', biz_id: null})]});
    render();
  });
  const iss = await p.evaluate(() => settleIssues(cyc()).map(i => [i.no, i.lv, i.t]));
  const has = (no, t, lv) => iss.some(i => i[0] === no && i[2].startsWith(t) && (!lv || i[1] === lv));
  ok(has(2, '지출증빙 표시 없음', 'bad'), '지출증빙 표시 없음 → 보완');
  ok(has(3, '사용액과 총합 다름', 'warn'), '상단 정산금액 ≠ 항목 합 → 확인');
  ok(has(4, '식별번호가 학교 번호 아님', 'bad'), '식별번호 다름 → 보완');
  ok(has(5, '내역 확인: 꽃', 'warn'), '용도 단어(꽃) → 확인');
  ok(has(5, '정산 기간 밖 영수증', 'bad'), '기간 밖 영수증 → 보완');
  ok(has(5, '승인번호 중복') && has(7, '승인번호 중복'), '부서 간 승인번호 중복 → 양쪽 확인');
  ok(has(7, '사용액이 지급액보다 적음', 'bad'), '사용액 미달 → 보완');
  ok(has(1, '영수증이 잘 안 보임') && has(1, '지출증빙 번호 안 보임', 'bad'), '판독 불완전·번호 안 보임');
  ok(has(1, '묶음 제출 비고란 부서명 확인'), '묶음 제출 비고란 부서명 누락');
  ok(!has(6, '사용액이 지급액보다 적음'), '미제출 부서는 미달로 안 셈');
  const tiles = await p.textContent('.tiles');
  ok(tiles.includes('6 / 12'), `제출 6/12 (${tiles.replace(/\s+/g, ' ').slice(0, 40)})`);

  console.log('6. 명단 엑셀 내보내기 → 다시 읽기');
  const back = await p.evaluate(() => { const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, rosterSheet(cyc(), cyc().people, true), 'x'); const out = XLSX.write(wb, {bookType: 'xlsx', type: 'array'}); const r = readRoster(new Uint8Array(out)); return {u: r.units.length, p: r.people.length, sum: totalOf(r.people), cur: totalOf(cyc().people.filter(x => amt(x) > 0)), holder: r.units[3].holder, bank: r.units[3].bank}; });
  ok(back.sum === back.cur, `내보낸 명단 합계 = 현재 명단 (${back.sum} / ${back.cur})`);
  ok(back.holder === '최더미' && back.bank === 'KB국민', '내보낸 명단의 은행·예금주 다시 읽힘');

  console.log('7. 화면');
  await p.click('[data-tab="pay"]'); await p.screenshot({path: path.join(tmp, 'pay.png'), fullPage: true});
  await p.click('[data-tab="settle"]'); await p.screenshot({path: path.join(tmp, 'settle.png'), fullPage: true});
  ok(!errs.length, '페이지 오류 없음' + (errs.length ? ': ' + errs.join(' | ') : ''));
  console.log(`\n화면 저장: ${tmp}`);
  await b.close();
  console.log(fails ? `\n실패 ${fails}건` : '\n모두 통과');
  process.exit(fails ? 1 : 0);
})();
