// ================= STORAGE-BACKED ATTENDANCE DATA =================
const STORAGE_KEY = 'attendance-records';
const STATUS_CYCLE = [null, 'present', 'late', 'absent'];
const statusColor = { present:'var(--mint)', late:'var(--amber)', absent:'var(--coral)', none:'transparent' };

const hasStorage = (typeof window !== 'undefined' && !!window.storage);
let records = {}; // { "YYYY-MM-DD": "present" | "late" | "absent" }

function pad(n){ return String(n).padStart(2,'0'); }
function dateKey(y,m,d){ return `${y}-${pad(m+1)}-${pad(d)}`; }

async function loadRecords(){
  if(!hasStorage) return {};
  try{
    const res = await window.storage.get(STORAGE_KEY, false);
    return res && res.value ? JSON.parse(res.value) : {};
  }catch(e){
    return {}; // key not found yet, or read error — start fresh
  }
}

async function saveRecords(){
  if(!hasStorage) return;
  try{
    await window.storage.set(STORAGE_KEY, JSON.stringify(records), false);
  }catch(e){
    console.error('Could not save attendance data', e);
  }
}

// ================= CALENDAR STATE =================
const realToday = new Date();
let viewYear = realToday.getFullYear();
let viewMonth = realToday.getMonth();
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function renderCalendar(){
  document.getElementById('calMonthLabel').textContent = monthNames[viewMonth] + ' ' + viewYear;
  const calGrid = document.getElementById('calGrid');
  calGrid.innerHTML = '';
  ['S','M','T','W','T','F','S'].forEach(d=>{
    const el = document.createElement('div');
    el.className = 'dow';
    el.textContent = d;
    calGrid.appendChild(el);
  });

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  for(let i=0;i<firstDay;i++){
    const el = document.createElement('div');
    el.className = 'cal-day empty';
    calGrid.appendChild(el);
  }

  for(let d=1; d<=daysInMonth; d++){
    const key = dateKey(viewYear, viewMonth, d);
    const isToday = viewYear === realToday.getFullYear() && viewMonth === realToday.getMonth() && d === realToday.getDate();
    const status = records[key];
    const el = document.createElement('div');
    el.className = 'cal-day' + (isToday ? ' today' : '') + (status ? ` st-${status}` : '');
    el.innerHTML = `${d}${status ? `<span class="dot" style="background:${statusColor[status]}"></span>` : ''}`;
    el.addEventListener('click', ()=> cycleStatus(key));
    calGrid.appendChild(el);
  }
}

async function cycleStatus(key){
  const current = records[key] || null;
  const idx = STATUS_CYCLE.indexOf(current);
  const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
  if(next === null){ delete records[key]; } else { records[key] = next; }
  await saveRecords();
  renderAll();
}

// ================= STATS =================
function computeStats(){
  let present=0, late=0, absent=0;
  Object.values(records).forEach(s=>{
    if(s==='present') present++;
    else if(s==='late') late++;
    else if(s==='absent') absent++;
  });
  const total = present + late + absent;
  const rate = total > 0 ? Math.round((present/total)*100) : 0;
  return { present, late, absent, total, rate };
}

function renderStats(){
  const { present, late, absent, rate } = computeStats();
  document.getElementById('statPresent').textContent = present;
  document.getElementById('statLate').textContent = late;
  document.getElementById('statAbsent').textContent = absent;
  document.getElementById('statRate').textContent = rate + '%';

  const circle = document.getElementById('donutProgress');
  const circumference = 2 * Math.PI * 56;
  const offset = circumference - (rate/100) * circumference;
  circle.style.strokeDashoffset = offset;
  document.getElementById('donutPct').textContent = rate + '%';
}

// ================= WEEKLY BARS (Sun–Sat containing real today) =================
function renderWeekBars(){
  const barsEl = document.getElementById('bars');
  barsEl.innerHTML = '';
  const dayLabels = ['S','M','T','W','T','F','S'];
  const startOfWeek = new Date(realToday);
  startOfWeek.setDate(realToday.getDate() - realToday.getDay());

  for(let i=0;i<7;i++){
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
    const status = records[key];
    const pct = status ? (status === 'present' ? 100 : status === 'late' ? 65 : 25) : 0;
    const col = document.createElement('div');
    col.className = 'bar-col';
    col.innerHTML = `
      <div class="bar-track">
        <div class="bar-fill" style="height:${pct}%; background:${status ? statusColor[status] : 'transparent'}"></div>
      </div>
      <div class="bar-day">${dayLabels[i]}</div>
    `;
    barsEl.appendChild(col);
  }
}

function renderAll(){
  renderCalendar();
  renderStats();
  renderWeekBars();
}

document.getElementById('calPrev').addEventListener('click', ()=>{
  viewMonth--;
  if(viewMonth < 0){ viewMonth = 11; viewYear--; }
  renderCalendar();
});
document.getElementById('calNext').addEventListener('click', ()=>{
  viewMonth++;
  if(viewMonth > 11){ viewMonth = 0; viewYear++; }
  renderCalendar();
});
document.getElementById('calClear').addEventListener('click', async ()=>{
  records = {};
  await saveRecords();
  renderAll();
});

(async function init(){
  records = await loadRecords();
  renderAll();
})();

// ---------- schedule ----------
const schedule = [
  { time:'7:30', subject:'Homeroom', room:'Rm 204', status:'done' },
  { time:'8:00', subject:'Algebra II', room:'Rm 118', status:'done' },
  { time:'9:15', subject:'World History', room:'Rm 210', status:'now' },
  { time:'10:30', subject:'Chemistry Lab', room:'Lab 3', status:'upcoming' },
  { time:'12:45', subject:'English Lit', room:'Rm 112', status:'upcoming' },
  { time:'2:00', subject:'Study Hall', room:'Library', status:'upcoming' },
];
const dotColor = { done:'var(--mint)', now:'var(--green)', upcoming:'var(--border)' };
const statusLabel = { done:'Done', now:'Now', upcoming:'Upcoming' };
const listEl = document.getElementById('schedList');
schedule.forEach(s=>{
  const row = document.createElement('div');
  row.className = 'sched-item';
  row.innerHTML = `
    <div class="sched-time">${s.time}</div>
    <span class="sched-dot" style="background:${dotColor[s.status]}"></span>
    <div class="sched-info">
      <div class="subj">${s.subject}</div>
      <div class="room">${s.room}</div>
    </div>
    <div class="sched-status ${s.status}">${statusLabel[s.status]}</div>
  `;
  listEl.appendChild(row);
});