(() => {
  const panel = document.querySelector('#school-hub');
  const form = panel.querySelector('form');
  const {grade, room, date} = form.elements;
  const status = panel.querySelector('[role=status]');
  const list = panel.querySelector('ol');
  const today = new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Seoul'}).format(new Date());
  date.value = today;
  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
  const preference = read('study33-school-class');
  if (preference) {
    grade.value = preference.grade;
    room.value = preference.room;
  }
  function display(rows) {
    list.replaceChildren(...rows.map(([period, subjects]) => {
      const item = document.createElement('li');
      const number = document.createElement('strong');
      number.textContent = period + '교시';
      item.append(number, document.createTextNode(subjects));
      return item;
    }));
  }
  let active;
  async function lookup() {
    active?.abort();
    const controller = new AbortController();
    active = controller;
    display([]);
    if (!form.checkValidity()) {
      status.textContent = '학년과 반, 조회할 날짜를 선택하세요.';
      return;
    }
    const g = grade.value, c = String(Number(room.value)), day = date.value.replaceAll('-', '');
    save('study33-school-class', {grade:g, room:c});
    const key = ['study33-school',g,c,day].join(':');
    const cached = read(key);
    if (Array.isArray(cached)) display(cached);
    status.textContent = '시간표를 확인하고 있습니다…';
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const subjects = new Map();
      let received = 0;
      for (let page = 1; page <= 20; page++) {
        const params = new URLSearchParams({Type:'json', ATPT_OFCDC_SC_CODE:'J10', SD_SCHUL_CODE:'7530122', GRADE:g, CLASS_NM:c, ALL_TI_YMD:day, pIndex:String(page), pSize:'100'});
        const response = await fetch('https://open.neis.go.kr/hub/hisTimetable?' + params, {signal:controller.signal});
        if (!response.ok) throw Error();
        const data = await response.json();
        if (data.RESULT?.CODE === 'INFO-200' && page === 1) break;
        const rows = data.hisTimetable?.find(part => part.row)?.row;
        if (!rows?.length) throw Error();
        const before = [...subjects.values()].reduce((sum, s) => sum+s.size,0);
        for (const row of rows) {
          if (row.SD_SCHUL_CODE !== '7530122' || row.ALL_TI_YMD !== day || String(row.GRADE) !== g || String(row.CLASS_NM) !== c) throw Error();
          const period = Number(row.PERIO);
          if (!(period > 0) || !row.ITRT_CNTNT) throw Error();
          if (!subjects.has(period)) subjects.set(period, new Set());
          subjects.get(period).add(row.ITRT_CNTNT);
        }
        received += rows.length;
        const count = data.hisTimetable[0].head.find(h => 'list_total_count' in h).list_total_count;
        if (received >= count) break;
        if (page === 20 || before === [...subjects.values()].reduce((sum,s) => sum+s.size,0)) throw Error();
      }
      if (active !== controller) return;
      const result = [...subjects].sort(([a],[b]) => a-b).map(([period,names]) => [period,[...names].join(' / ')]);
      display(result);
      save(key,result);
      status.textContent = result.length ? g+'학년 '+c+'반 · '+date.value : '나이스에 이 날짜의 수업이 등록되어 있지 않습니다.';
    } catch {
      if (active === controller) status.textContent = Array.isArray(cached) ? '마지막 조회 결과입니다. 최신 시간표를 확인할 수 없습니다.' : '나이스에 연결하지 못했습니다. 아래 학급 시간표에서도 확인할 수 있습니다.';
    } finally { clearTimeout(timer); }
  }
  form.addEventListener('submit', event => {event.preventDefault(); lookup();});
  form.addEventListener('change', lookup);
  if (preference) lookup();
})();