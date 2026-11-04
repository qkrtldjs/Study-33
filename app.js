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
        tasks: ['핵심 개념과 취약한 부분 정리', '대표 문제를 풀고 오답 확인']
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
function renderDaily(){const d=days[state.selected]||days[0];
  const session = sessionFor(d);
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
  const list=$('tasks');list.replaceChildren();ts.forEach((t,i)=>{const label=make('label','checkrow');const box=make('input');box.type='checkbox';box.checked=!!state.checks[`${session.key}-${i}`];box.onchange=()=>{state.checks[`${session.key}-${i}`]=box.checked;save();renderDaily();updateStats()};label.append(box,make('span','',t));list.append(label)});$('prev').disabled=d.i===0;$('next').disabled=d.i===32;calendar();updateStats();}
function renderWeekly(){const container=$('weekcards');container.replaceChildren();weekInfo.forEach(([title,goal,a,b])=>{const card=make('div','weekcard');card.append(make('h3','',title),make('p','muted',goal));const row=make('div','weekdays');days.slice(a,b+1).forEach(d=>{const button=make('button',`chip ${isComplete(d)?'done':''}`,`${d.month}/${d.day} ${d.sessions.map(s=>short[s.subject]).join(" · ")} ${isComplete(d)?'✓':''}`);button.onclick=()=>{state.selected=d.i;save();showTab('daily')};row.append(button)});card.append(row);container.append(card)})}
function renderGoals(){const container=$('ranges');container.replaceChildren();subjects.forEach((name,i)=>{const wrap=make('div','field');const label=make('label','',name);const input=make('textarea');input.placeholder='예: 교과서 45~90쪽 / 2단원 전체';input.value=state.ranges[i]||'';input.oninput=()=>{state.ranges[i]=input.value;save()};wrap.append(label,input);container.append(wrap)});const master=$('masterGoals');master.replaceChildren();['6과목 시험 범위 개념 1회독','각 과목의 응용 유형 끝내기','틀린 문제 해설 없이 다시 풀기','시험 3일 전 최종 암기 완료'].forEach((t,i)=>{const label=make('label','checkrow');const check=make('input');check.type='checkbox';check.checked=!!state.master[i];check.onchange=()=>{state.master[i]=check.checked;save()};label.append(check,make('span','',t));master.append(label)})}
function showTab(tab){const titles={daily:'홈',weekly:'주간 계획',goals:'목표'};document.querySelector('.workspace-heading h1').textContent=titles[tab];document.querySelectorAll('.tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));['daily','weekly','goals'].forEach(id=>$(id).classList.toggle('hidden',id!==tab));if(tab==='daily')renderDaily();if(tab==='weekly')renderWeekly();if(tab==='goals')renderGoals()}
document.querySelectorAll('.tabs button').forEach(b=>b.onclick=()=>showTab(b.dataset.tab));$('customGoal').oninput=e=>{state.custom[sessionFor(days[state.selected]).key]=e.target.value;save();$('goalTitle').textContent=e.target.value||sessionFor(days[state.selected]).goal};$('notes').oninput=e=>{state.notes[sessionFor(days[state.selected]).key]=e.target.value;save()};$('prev').onclick=()=>{state.selected=Math.max(0,state.selected-1);save();renderDaily()};$('next').onclick=()=>{state.selected=Math.min(32,state.selected+1);save();renderDaily()};$('resetDay').onclick=()=>{if(!confirm('이 날짜의 체크만 초기화하시겠습니까?'))return;days[state.selected].sessions.forEach(s=>s.tasks.forEach((_,i)=>delete state.checks[s.key+"-"+i]));save();renderDaily()};$('export').onclick=()=>{const blob=new Blob([JSON.stringify({version:1,exportedAt:new Date().toISOString(),state},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='study33-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};$('importBtn').onclick=()=>$('importFile').click();$('importFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(data.version!==1||!data.state||typeof data.state!=='object'||!data.state.checks)throw Error('잘못된 백업 파일');if(!confirm('현재 데이터를 백업 내용으로 교체하시겠습니까?'))return;state={checks:{},custom:{},notes:{},ranges:{},master:{},selected:0,...data.state};save();showTab('daily')}catch(err){alert('복원 실패: '+err.message)}e.target.value=''};
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
