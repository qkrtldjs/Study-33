'use strict';
const subjects=['미적분Ⅰ','화법과 언어','화학 반응의 세계','역학과 에너지','생물의 유전','행성우주과학'];
const short=['미적분','화법·언어','화학','역학','유전','행성우주'];
const pattern=[0,3,2,4,0,1,5,2,3,0,4,1,5,0,2,3,4,5,1,0,3,2,4,5,1,0,2,3,4,5,1,0,2];
const phases=['개념·기본 유형','응용 유형','실전 문제·오답','최종 점검'];
const days=Array.from({length:33},(_,i)=>{const date=new Date(2026,10,4+i);return {i,date,month:date.getMonth()+1,day:date.getDate(),dow:date.getDay(),weekend:[0,6].includes(date.getDay()),subject:pattern[i],phase:i<14?0:i<21?1:i<28?2:3};});
const weekInfo=[['1주차 · 학습 진단','6과목 핵심 개념 및 취약점 파악',0,4],['2주차 · 개념 완성','각 과목 시험 범위 개념 정리',5,11],['3주차 · 응용 정복','응용 유형을 해설 없이 풀기',12,18],['4주차 · 실전 훈련','실전 문제와 누적 오답 정리',19,25],['5주차 · 최종 점검','암기·오답 최종 확인',26,32]];
const defaults=days.map(d=>{const count=pattern.slice(0,d.i+1).filter(s=>s===d.subject).length;return d.i>=28?`${short[d.subject]} 최종 오답·암기 끝내기`:d.i>=21?`${short[d.subject]} 실전 문제·오답 끝내기`:d.i>=14?`${short[d.subject]} 응용 유형 끝내기`:`${short[d.subject]} 시험 범위 ${count}구간 끝내기`;});
const baseTasks=['오늘 끝낼 범위의 핵심 개념 정리','교과서 예제와 필수 유형 마무리','틀린 문제를 해설 없이 다시 풀기','백지 테스트로 핵심 개념 설명하기'];
const extraTasks=['응용·심화 문제까지 해결하기','다른 과목 누적 오답 1시간 복습하기'];
const tasksFor=d=>d.weekend?[baseTasks[0],baseTasks[1],extraTasks[0],baseTasks[2],extraTasks[1],baseTasks[3]]:baseTasks;
const weekendPractice = [
  "오늘 범위 교과서 1회독",
  "교과서 문제 3개 풀기",
  "문제집 기본 문제 5개 풀기",
  "응용 문제 3개 풀기",
  "고난도 문제 2개 풀기",
  "지난 오답 2개 다시 풀기"
];

// Split the six subjects across Saturday and Sunday, retaining both original assignments.
for (const day of days) {
  day.sessions = [{subject: day.subject, key: day.i, goal: defaults[day.i], tasks: tasksFor(day)}];
}
for (const saturday of days.filter(day => day.dow === 6)) {
  const sunday = days[saturday.i + 1];
  const remaining = subjects.map((_, i) => i).filter(i => i !== saturday.subject && i !== sunday.subject);
  for (const day of [saturday, sunday]) {
    for (const subject of remaining.splice(0, 2)) {
      day.sessions.push({
        subject, key: day.i + ':' + subject,
        goal: short[subject] + ' ' + phases[day.phase] + ' 복습',
        tasks: weekendPractice
      });
    }
  }
}
const sessionFor = day => day.sessions.find(s => s.subject === state.subjectByDay?.[day.i]) || day.sessions[0];
function chooseSubject(day, subject) {
  state.subjectByDay ||= {};
  state.subjectByDay[day.i] = subject;
}
function dailyProgress(day) {
  let total = 0, checked = 0;
  for (const session of day.sessions) {
    total += session.tasks.length;
    checked += session.tasks.filter((_, i) => state.checks[session.key + '-' + i]).length;
  }
  return {total, checked};
}
const KEY='study33-v1';let state;try{state=JSON.parse(localStorage.getItem(KEY))||{}}catch{state={}};
state={checks:{},custom:{},notes:{},ranges:{},master:{},selected:0,...state};
const $=id=>document.getElementById(id);const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){alert('저장에 실패했습니다. 저장 공간을 확인하세요.')}};
const make=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
const isComplete = day => { const {total, checked} = dailyProgress(day); return total === checked; };
function updateStats(){const done=days.filter(isComplete).length;const all=days.reduce((n,d)=>n+dailyProgress(d).total,0);const checked=days.reduce((n,d)=>n+dailyProgress(d).checked,0);$('doneDays').textContent=`${done} / 33`;$('doneTasks').textContent=checked;$('percent').textContent=`${Math.round(checked/all*100)}%`;const today=new Date();today.setHours(0,0,0,0);const exam=new Date(2026,11,7);const remaining=Math.ceil((exam-today)/86400000);$('countdown').textContent=remaining>=0?`시험 D-${remaining}`:'시험일 경과';}
function calendar(){const c=$('calendar');c.replaceChildren();['일','월','화','수','목','금','토'].forEach(x=>c.append(make('div','weekday',x)));for(let i=0;i<3;i++)c.append(make('div'));days.forEach(d=>{const b=make('button',`date ${state.selected===d.i?'active':''} ${isComplete(d)?'complete':''}`,String(d.day));b.title=`${d.month}월 ${d.day}일 · ${d.sessions.map(s=>subjects[s.subject]).join(" · ")}`;b.onclick=()=>{state.selected=d.i;save();renderDaily()};c.append(b)});}
let editingSession = null;

// A unit without numbered pages or problems counts as one study item.
function readLegacyUnit(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(.*?)(\d+)\s*[~–—-]\s*(\d+)\s*(쪽|페이지|번)\s*$/);
  if (match) return {name: match[1].trim() || '시험 범위', start: match[2], end: match[3], type: match[4] === '번' ? '번' : '쪽'};
  return {name: text, start: '', end: '', type: '쪽'};
}
function unitBounds(unit) {
  if (!unit.name.trim()) return null;
  if (!unit.start && !unit.end) return [1, 1];
  const first = Number(unit.start), last = Number(unit.end);
  return Number.isSafeInteger(first) && Number.isSafeInteger(last) && first >= 1 && last >= first && last <= 999999 ? [first, last] : null;
}
function rangeText(part) {
  if (!part.numbered) return part.name;
  const span = part.first === part.last ? part.first : part.first + '–' + part.last;
  return part.name + ' ' + span + part.type;
}
function allocateSubject(subject) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const slots = [];
  const locked = [];
  for (const day of days) {
    const s = day.sessions.find(s => s.subject === subject);
    if (!s) continue;
    if (day.date < today || s.tasks.some((_, i) => state.checks[s.key + '-' + i])) {
      locked.push(...(state.allocations[s.key] || []));
    } else {
      slots.push(s.key);
      delete state.allocations[s.key];
    }
  }
  const pieces = [];
  for (const unit of state.units[subject]) {
    const bounds = unitBounds(unit);
    if (!bounds) continue;
    let first = bounds[0];
    const last = bounds[1];
    const part = {id:unit.id, name:unit.name.trim(), type:unit.type, numbered:!!unit.start};
    const used = locked.filter(p => p.id === unit.id && p.type === part.type && p.numbered === part.numbered).sort((a,b) => a.first-b.first);
    for (const p of used) {
      if (p.last < first || p.first > last) continue;
      if (p.first > first) pieces.push({...part, first, last:p.first-1});
      first = Math.max(first,p.last+1);
    }
    if (first <= last) pieces.push({...part, first, last});
  }
  const total = pieces.reduce((n,p) => n+p.last-p.first+1,0);
  let cursor = 0;
  slots.forEach((key,i) => {
    let count = Math.floor(total/slots.length) + Number(i < total%slots.length);
    const assigned = [];
    while (count > 0) {
      const p = pieces[cursor];
      const take = Math.min(count,p.last-p.first+1);
      assigned.push({...p,last:p.first+take-1});
      p.first += take;
      if (p.first > p.last) cursor++;
      count -= take;
    }
    if (assigned.length) state.allocations[key] = assigned;
  });
}
function initializeUnits() {
  state.units ||= {};
  state.allocations ||= {};
  subjects.forEach((_, i) => {
    if (Array.isArray(state.units[i])) return;
    state.units[i] = String(state.ranges[i] || '').split(/\n/).filter(s=>s.trim()).map((s,n)=>({...readLegacyUnit(s),id:'old-'+i+'-'+n}));
    allocateSubject(i);
  });
}
function renderUnitFields() {
  initializeUnits();
  const container = $('ranges');
  container.replaceChildren();
  subjects.forEach((name,subject) => {
    const card = make('div','unit-card');
    card.append(make('h3','',name));
    const preview = make('details','unit-preview');
    const showPreview = () => {
      preview.replaceChildren(make('summary','','날짜별 배정 보기'));
      let found = false;
      for (const day of days) {
        const session = day.sessions.find(s=>s.subject===subject);
        const parts = session && state.allocations[session.key];
        if (!parts?.length) continue;
        found = true;
        preview.append(make('p','',day.month+'/'+day.day+' · '+parts.map(rangeText).join(' / ')));
      }
      if (!found) preview.append(make('p','','배정된 범위가 없습니다.'));
    };
    const update = () => { allocateSubject(subject); save(); showPreview(); };
    for (const unit of state.units[subject]) {
      const row = make('div','unit-row');
      const title = make('input');
      title.type='text'; title.placeholder='단원명'; title.value=unit.name;
      title.setAttribute('aria-label',name+' 단원명');
      const type = make('select');
      for (const label of ['쪽','번']) type.add(new Option(label==='쪽'?'교과서 쪽수':'문제 번호',label));
      type.value=unit.type; type.setAttribute('aria-label','범위 단위');
      const inputs = ['start','end'].map((field,i)=>{
        const input=make('input');input.type='number';input.min=1;input.max=999999;
        input.placeholder=i?'끝':'시작';input.value=unit[field];
        input.setAttribute('aria-label',i?'끝 번호':'시작 번호');
        return input;
      });
      const hint = make('small','unit-error');
      const edit = () => {
        Object.assign(unit,{name:title.value,start:inputs[0].value,end:inputs[1].value,type:type.value});
        hint.textContent = unitBounds(unit) ? '' : !unit.name.trim() ? '단원명을 입력하세요.' : '시작과 끝 번호를 순서대로 입력하세요.';
        update();
      };
      title.oninput=edit;type.onchange=edit;inputs.forEach(el=>el.oninput=edit);
      const remove=make('button','chip','삭제'); remove.onclick=()=>{
        state.units[subject]=state.units[subject].filter(u=>u.id!==unit.id); update();renderUnitFields();
      };
      row.append(title,type,...inputs,remove,hint);card.append(row);
    }
    const add=make('button','chip','+ 단원 추가');add.onclick=()=>{
      state.units[subject].push({...readLegacyUnit(''),id:crypto.randomUUID()});save();renderUnitFields();
      const fields=container.children[subject].querySelectorAll('input[type=text]');fields[fields.length-1].focus();
    };
    showPreview();card.append(add,preview);container.append(card);
  });
}

function renderDaily(){const d=days[state.selected]||days[0];
  const session = sessionFor(d);
  const assigned = (state.allocations[session.key] || []).map(rangeText);
  $('assignedRange').hidden = !assigned.length;
  $('assignedRange').textContent = '배정 범위 · '+assigned.join(' / ');
  const picker = $('subjectPicker');
  picker.replaceChildren();
  picker.hidden = !d.weekend;
  if (d.weekend) {
    for (const item of d.sessions) {
      const button = make('button', 'chip', subjects[item.subject]);
      button.setAttribute('aria-pressed', String(item === session));
      button.onclick = () => { chooseSubject(d, item.subject); save(); renderDaily(); };
      picker.append(button);
    }
  }
$('dayLabel').textContent=`${d.month}월 ${d.day}일 · ${['일','월','화','수','목','금','토'][d.dow]}요일`;$('dayType').textContent=d.weekend?'주말 3과목 · 09:00–23:30':'평일 야간 학습 · 22:00 이후';$('subject').textContent=subjects[session.subject];$('goalTitle').textContent=state.custom[session.key]||session.goal;$('customGoal').value=state.custom[session.key]||session.goal;$('notes').value=state.notes[session.key]||'';const ts=session.tasks;
  const {checked,total}=dailyProgress(d);
  $('dailyCount').textContent=checked+'/'+total+' 완료';
  $('dailyProgress').style.width=(100*checked/total)+'%';
  if (editingSession !== session.key) editingSession = null;
  const editing = editingSession === session.key;
  const toggle = $('editTasks');
  toggle.textContent = editing ? '편집 완료' : '항목 편집';
  toggle.setAttribute('aria-pressed', String(editing));
  toggle.onclick = () => {
    editingSession = editing ? null : session.key;
    renderDaily();
    if (!editing) $('tasks').querySelector('input')?.focus();
    else toggle.focus();
  };
  const list = $('tasks');
  list.replaceChildren();
  ts.forEach((defaultText, index) => {
    const key = session.key + '-' + index;
    const text = state.taskText?.[key] || defaultText;
    if (editing) {
      const input = make('input', 'task-text');
      input.type = 'text';
      input.value = text;
      input.placeholder = defaultText;
      input.setAttribute('aria-label', (index + 1) + '번째 체크리스트 항목');
      input.oninput = () => {
        state.taskText ||= {};
        const value = input.value.trim();
        if (value && value !== defaultText) state.taskText[key] = value;
        else delete state.taskText[key];
        save();
      };
      input.onblur = () => { input.value = state.taskText?.[key] || defaultText; };
      list.append(input);
      return;
    }
    const label = make('label', 'checkrow');
    const box = make('input');
    box.type = 'checkbox';
    box.checked = !!state.checks[key];
    box.onchange = () => {
      state.checks[key] = box.checked;
      save();
      renderDaily();
    };
    label.append(box, make('span', '', text));
    list.append(label);
  });
  $('prev').disabled=d.i===0;$('next').disabled=d.i===32;calendar();updateStats();}
function renderWeekly(){const container=$('weekcards');container.replaceChildren();weekInfo.forEach(([title,goal,a,b])=>{const card=make('div','weekcard');card.append(make('h3','',title),make('p','muted',goal));const row=make('div','weekdays');days.slice(a,b+1).forEach(d=>{const button=make('button',`chip ${isComplete(d)?'done':''}`,`${d.month}/${d.day} ${d.sessions.map(s=>short[s.subject]).join(" · ")} ${isComplete(d)?'✓':''}`);button.onclick=()=>{state.selected=d.i;save();showTab('daily')};row.append(button)});card.append(row);container.append(card)})}
function renderGoals(){renderUnitFields();const master=$('masterGoals');master.replaceChildren();['6과목 시험 범위 개념 1회독','각 과목의 응용 유형 끝내기','틀린 문제 해설 없이 다시 풀기','시험 3일 전 최종 암기 완료'].forEach((t,i)=>{const label=make('label','checkrow');const check=make('input');check.type='checkbox';check.checked=!!state.master[i];check.onchange=()=>{state.master[i]=check.checked;save()};label.append(check,make('span','',t));master.append(label)})}
function showTab(tab){const titles={daily:'홈',weekly:'주간 계획',goals:'목표'};document.querySelector('.workspace-heading h1').textContent=titles[tab];document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));['daily','weekly','goals'].forEach(id=>$(id).classList.toggle('hidden',id!==tab));if(tab==='daily')renderDaily();if(tab==='weekly')renderWeekly();if(tab==='goals')renderGoals()}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));$('customGoal').oninput=e=>{state.custom[sessionFor(days[state.selected]).key]=e.target.value;save();$('goalTitle').textContent=e.target.value||sessionFor(days[state.selected]).goal};$('notes').oninput=e=>{state.notes[sessionFor(days[state.selected]).key]=e.target.value;save()};$('prev').onclick=()=>{state.selected=Math.max(0,state.selected-1);save();renderDaily()};$('next').onclick=()=>{state.selected=Math.min(32,state.selected+1);save();renderDaily()};$('resetDay').onclick=()=>{if(!confirm('이 날짜의 체크만 초기화하시겠습니까?'))return;days[state.selected].sessions.forEach(s=>s.tasks.forEach((_,i)=>delete state.checks[s.key+"-"+i]));save();renderDaily()};$('export').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='study33-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};$('importBtn').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(data.version!==1||!data.state||typeof data.state!=='object'||!data.state.checks)throw Error('잘못된 백업 파일');if(!confirm('현재 데이터를 백업 내용으로 교체하시겠습니까?'))return;state={checks:{},custom:{},notes:{},ranges:{},master:{},selected:0,...data.state};initializeUnits();save();showTab('daily')}catch(err){alert('복원 실패: '+err.message)}e.target.value=''};
initializeUnits();save();
if(!Number.isInteger(state.selected)||state.selected<0||state.selected>=33)state.selected=0;renderDaily();if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));

// Refresh an already controlled page once a new offline app shell is active.
if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    location.reload();
  });
}

// Use subject covers to open the next matching study day.
document.querySelectorAll('.subject-card').forEach(button => {
  button.onclick = () => {
    const subject = Number(button.dataset.subject);
    const day = days.find(day => day.sessions.some(s => s.subject === subject) && day.i >= state.selected)
      || days.find(day => day.sessions.some(s => s.subject === subject));
    state.selected = day.i;
    chooseSubject(day, subject);
    save();
    showTab('daily');
    $('session').scrollIntoView({block: 'start'});
  };
});
