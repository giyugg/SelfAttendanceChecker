// ---------- weekly bars ----------
const week = [
  { day:'M', status:'present', pct:100 },
  { day:'T', status:'present', pct:100 },
  { day:'W', status:'late', pct:70 },
  { day:'T', status:'present', pct:100 },
  { day:'F', status:'absent', pct:20 },
  { day:'S', status:'none', pct:0 },
  { day:'S', status:'none', pct:0 },
];
const statusColor = { present:'var(--mint)', late:'var(--amber)', absent:'var(--coral)', none:'transparent' };
const barsEl = document.getElementById('bars');
week.forEach(d=>{
  const col = document.createElement('div');
  col.className = 'bar-col';
  col.innerHTML = `
    <div class="bar-track">
      <div class="bar-fill" style="height:${d.pct}%; background:${statusColor[d.status]}"></div>
    </div>
    <div class="bar-day">${d.day}</div>
  `;
  barsEl.appendChild(col);
});

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

// ---------- calendar ----------
const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();
const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
document.getElementById('calMonthLabel').textContent = monthNames[month] + ' ' + year;

const firstDay = new Date(year, month, 1).getDay();
const daysInMonth = new Date(year, month + 1, 0).getDate();
const calGrid = document.getElementById('calGrid');

['S','M','T','W','T','F','S'].forEach(d=>{
  const el = document.createElement('div');
  el.className = 'dow';
  el.textContent = d;
  calGrid.appendChild(el);
});

// sample statuses for a few past days (deterministic pseudo-pattern)
const sampleStatus = (d)=>{
  if(d > today.getDate()) return null;
  const m = d % 9;
  if(m === 0) return 'absent';
  if(m === 4) return 'late';
  return 'present';
};
const statusDot = { present:'var(--mint)', late:'var(--amber)', absent:'var(--coral)' };

for(let i=0;i<firstDay;i++){
  const el = document.createElement('div');
  calGrid.appendChild(el);
}
for(let d=1; d<=daysInMonth; d++){
  const el = document.createElement('div');
  const isToday = d === today.getDate();
  el.className = 'cal-day' + (isToday ? ' today' : (d>today.getDate() ? ' muted' : ''));
  const st = sampleStatus(d);
  el.innerHTML = `${d}${st ? `<span class="dot" style="background:${statusDot[st]}"></span>` : ''}`;
  calGrid.appendChild(el);
}