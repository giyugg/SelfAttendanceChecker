const COLORS = {
  present: getComputedStyle(document.documentElement).getPropertyValue('--chalk-mint').trim(),
  late: getComputedStyle(document.documentElement).getPropertyValue('--chalk-yellow').trim(),
  absent: getComputedStyle(document.documentElement).getPropertyValue('--chalk-coral').trim(),
};

const schedule = [
  { time:'7:30', subject:'Homeroom', room:'Rm 204', status:'done' },
  { time:'8:00', subject:'Algebra II', room:'Rm 118', status:'done' },
  { time:'9:15', subject:'World History', room:'Rm 210', status:'now' },
  { time:'10:30', subject:'Chemistry Lab', room:'Lab 3', status:'upcoming' },
  { time:'12:45', subject:'English Lit', room:'Rm 112', status:'upcoming' },
  { time:'2:00', subject:'Study Hall', room:'Library', status:'upcoming' },
];

const listEl = document.getElementById('scheduleList');
schedule.forEach((s) => {
  const li = document.createElement('li');
  li.className = 'schedule-item';
  const label = s.status === 'now' ? 'In progress' : s.status === 'done' ? 'Completed' : 'Upcoming';
  li.innerHTML = `
    <div class="schedule-time">${s.time}</div>
    <div class="schedule-info">
      <div class="subject">${s.subject}</div>
      <div class="room">${s.room}</div>
    </div>
    <div class="status-pill ${s.status}">${label}</div>
  `;
  listEl.appendChild(li);
});

const stats = [
  { label:'Present', value:87, color:COLORS.present },
  { label:'Late', value:8, color:COLORS.late },
  { label:'Absent', value:5, color:COLORS.absent },
];

const ringsRow = document.getElementById('ringsRow');
stats.forEach((st) => {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (st.value / 100) * circumference;
  const card = document.createElement('div');
  card.className = 'ring-card';
  card.innerHTML = `
    <svg viewBox="0 0 96 96">
      <circle cx="48" cy="48" r="${radius}" fill="none" stroke="rgba(238,234,219,0.12)" stroke-width="8"/>
      <circle class="ring-progress" cx="48" cy="48" r="${radius}" fill="none" stroke="${st.color}"
        stroke-width="8" stroke-linecap="round"
        stroke-dasharray="${circumference}" stroke-dashoffset="${circumference}"
        transform="rotate(-90 48 48)"/>
      <text x="48" y="54" text-anchor="middle" font-family="JetBrains Mono, monospace"
        font-size="20" fill="${st.color}" font-weight="600">${st.value}%</text>
    </svg>
    <div class="ring-label">${st.label}</div>
  `;
  ringsRow.appendChild(card);
  requestAnimationFrame(() => {
    const circle = card.querySelector('.ring-progress');
    setTimeout(() => {
      circle.setAttribute('stroke-dashoffset', offset);
    }, 80);
  });
});

const stackBar = document.getElementById('stackBar');
stats.forEach((st) => {
  const seg = document.createElement('div');
  seg.className = 'stack-seg';
  seg.style.width = `${st.value}%`;
  seg.style.background = st.color;
  stackBar.appendChild(seg);
});

const legend = document.getElementById('legend');
stats.forEach((st) => {
  const item = document.createElement('span');
  item.innerHTML = `<i style="background:${st.color}"></i>${st.label} &middot; ${st.value}%`;
  legend.appendChild(item);
});