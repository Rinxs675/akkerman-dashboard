import Chart from 'chart.js/auto';

let chartClinkerInstance = null;
let chartCementInstance = null;
let chartShipmentInstance = null;

// Number formatting utility
export function fmt(val, decimals = 0) {
  if (val === null || val === undefined || isNaN(val)) return '0';
  const num = Number(val);
  if (num === 0) return '0';
  
  return num.toLocaleString('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

export function fmtPct(val) {
  if (val === null || val === undefined || isNaN(val)) return '0%';
  const num = Number(val);
  const pct = num > 2 ? num : num * 100;
  return `${pct.toFixed(1)}%`;
}

function getPctBadge(val) {
  if (val === null || val === undefined || isNaN(val)) return '-';
  const num = Number(val);
  const pct = num > 2 ? num : num * 100;
  let cls = 'pct-mid';
  if (pct >= 95) cls = 'pct-high';
  else if (pct < 80) cls = 'pct-low';

  return `<span class="badge-pct ${cls}">${pct.toFixed(1)}%</span>`;
}

// ----------------------------------------------------
// SLIDE 1: RENDER CLINKER
// ----------------------------------------------------
export function renderSlideClinker(dayData) {
  if (!dayData || !dayData.clinker) return;

  const clinkerRows = dayData.clinker;
  const mainClinker = clinkerRows.find(r => r.name.includes('Клинкер всего')) || clinkerRows[0] || {};

  // KPI Bar
  const kpiBar = document.getElementById('kpiBarClinker');
  if (kpiBar) {
    const planDay = mainClinker.plan_day || 0;
    const factDay = mainClinker.fact_day || 0;
    const diffDay = factDay - planDay;
    const pctCumul = mainClinker.pct_cumul || 0;

    kpiBar.innerHTML = `
      <div class="kpi-card">
        <span class="kpi-label">План Сутки</span>
        <span class="kpi-value">${fmt(planDay)} т</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Факт Сутки</span>
        <span class="kpi-value">${fmt(factDay)} т</span>
        <span class="kpi-sub ${diffDay >= 0 ? 'sub-positive' : 'sub-negative'}">${diffDay >= 0 ? '+' : ''}${fmt(diffDay)} т</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Выполнение месяца</span>
        <span class="kpi-value">${fmtPct(pctCumul)}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Остаток на складе</span>
        <span class="kpi-value">${fmt(mainClinker.end_stock)} т</span>
      </div>
    `;
  }

  // Table
  const tbody = document.querySelector('#tableClinker tbody');
  if (tbody) {
    tbody.innerHTML = clinkerRows.map(row => `
      <tr>
        <td style="font-weight:${row.name.includes('всего') || row.name.includes('в т.ч.') ? '700' : '400'}">${row.name}</td>
        <td class="num">${fmt(row.start_stock)}</td>
        <td class="num">${fmt(row.plan_day)}</td>
        <td class="num" style="color:var(--accent-cyan); font-weight:700;">${fmt(row.fact_day)}</td>
        <td class="num">${fmt(row.plan_cumul)}</td>
        <td class="num">${fmt(row.fact_cumul)}</td>
        <td>${getPctBadge(row.pct_cumul)}</td>
        <td class="num" style="font-weight:700;">${fmt(row.end_stock)}</td>
      </tr>
    `).join('');
  }

  // Equipment
  const eqGrid = document.getElementById('eqGridClinker');
  if (eqGrid && dayData.equipment) {
    const clinkerEq = dayData.equipment.filter(e => e.name.includes('печь') || e.name.includes('мук') || e.name.includes('Уголь'));
    eqGrid.innerHTML = clinkerEq.map(eq => {
      const hours = Number(eq.hours_fact_day || 0);
      const isActive = hours > 0;
      return `
        <div class="eq-item">
          <span class="eq-name">${eq.name}</span>
          <div class="eq-status">
            <span class="eq-hours">${hours > 0 ? hours.toFixed(1) + ' ч' : '0 ч'}</span>
            <span class="eq-indicator ${isActive ? 'ind-active' : 'ind-idle'}">${isActive ? 'В РАБОТЕ' : 'ПРОСТОЙ'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Chart: Clinker Trend
  renderClinkerChart(clinkerRows);
}

function renderClinkerChart(clinkerRows) {
  const ctx = document.getElementById('chartClinkerTrend');
  if (!ctx) return;

  if (chartClinkerInstance) {
    chartClinkerInstance.destroy();
  }

  const items = clinkerRows.filter(r => r.fact_day > 0 || r.plan_day > 0).slice(0, 5);
  const labels = items.map(i => i.name.length > 18 ? i.name.substring(0, 18) + '...' : i.name);
  const planData = items.map(i => i.plan_day || 0);
  const factData = items.map(i => i.fact_day || 0);

  chartClinkerInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.length ? labels : ['Клинкер всего', 'Клинкер силосы'],
      datasets: [
        { label: 'План (сут)', data: planData.length ? planData : [6700, 6700], backgroundColor: 'rgba(0, 180, 216, 0.4)', borderColor: '#00b4d8', borderWidth: 1 },
        { label: 'Факт (сут)', data: factData.length ? factData : [6656, 6656], backgroundColor: 'rgba(16, 185, 129, 0.7)', borderColor: '#10b981', borderWidth: 1 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
      }
    }
  });
}

// ----------------------------------------------------
// SLIDE 2: RENDER CEMENT
// ----------------------------------------------------
export function renderSlideCement(dayData) {
  if (!dayData || !dayData.cement) return;

  const cementRows = dayData.cement;
  const totalCement = cementRows.find(r => r.name.includes('всего')) || cementRows[0] || {};

  // KPI Bar
  const kpiBar = document.getElementById('kpiBarCement');
  if (kpiBar) {
    const planDay = totalCement.plan_day || 0;
    const factDay = totalCement.fact_day || 0;
    const pctCumul = totalCement.pct_cumul || 0;

    kpiBar.innerHTML = `
      <div class="kpi-card">
        <span class="kpi-label">План Цемента (сут)</span>
        <span class="kpi-value">${fmt(planDay)} т</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Факт Цемента (сут)</span>
        <span class="kpi-value">${fmt(factDay)} т</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Выполнение месяца</span>
        <span class="kpi-value">${fmtPct(pctCumul)}</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Запас в силосах</span>
        <span class="kpi-value">${fmt(totalCement.end_stock)} т</span>
      </div>
    `;
  }

  // Table
  const tbody = document.querySelector('#tableCement tbody');
  if (tbody) {
    tbody.innerHTML = cementRows.map(row => `
      <tr>
        <td style="font-weight:${row.name.includes('всего') ? '700' : '400'}">${row.name}</td>
        <td class="num">${fmt(row.start_stock)}</td>
        <td class="num">${fmt(row.plan_day)}</td>
        <td class="num" style="color:var(--accent-cyan); font-weight:700;">${fmt(row.fact_day)}</td>
        <td class="num">${fmt(row.plan_cumul)}</td>
        <td class="num">${fmt(row.fact_cumul)}</td>
        <td>${getPctBadge(row.pct_cumul)}</td>
        <td class="num" style="font-weight:700;">${fmt(row.end_stock)}</td>
      </tr>
    `).join('');
  }

  // Equipment (Cement Mills)
  const eqGrid = document.getElementById('eqGridCement');
  if (eqGrid && dayData.equipment) {
    const cementEq = dayData.equipment.filter(e => e.name.includes('мельница') || e.name.includes('ШЦМ') || e.name.includes('ВВЦМ'));
    eqGrid.innerHTML = cementEq.map(eq => {
      const hours = Number(eq.hours_fact_day || 0);
      const isActive = hours > 0;
      return `
        <div class="eq-item">
          <span class="eq-name">${eq.name}</span>
          <div class="eq-status">
            <span class="eq-hours">${hours > 0 ? hours.toFixed(1) + ' ч' : '0 ч'}</span>
            <span class="eq-indicator ${isActive ? 'ind-active' : 'ind-idle'}">${isActive ? 'В РАБОТЕ' : 'ПРОСТОЙ'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Chart: Cement Mix
  renderCementMixChart(cementRows);
}

function renderCementMixChart(cementRows) {
  const ctx = document.getElementById('chartCementMix');
  if (!ctx) return;

  if (chartCementInstance) {
    chartCementInstance.destroy();
  }

  const grades = cementRows.filter(r => !r.name.includes('всего') && (r.fact_cumul > 0 || r.plan_month > 0));
  const labels = grades.map(g => g.name);
  const dataVals = grades.map(g => g.fact_cumul || g.plan_month || 100);

  chartCementInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels.length ? labels : ['ЦЕМ I 52.5Н', 'ЦЕМ II/В-К 42.5Н', 'AMD-1000'],
      datasets: [{
        data: dataVals.length ? dataVals : [158000, 26000, 8000],
        backgroundColor: ['#00b4d8', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } } } }
    }
  });
}

// ----------------------------------------------------
// SLIDE 3: RENDER SHIPMENT
// ----------------------------------------------------
export function renderSlideShipment(dayData) {
  if (!dayData || !dayData.shipment) return;

  const shipRows = dayData.shipment;
  const totalShip = shipRows.find(r => r.name.includes('ВСЕГО')) || shipRows[0] || {};
  const bulkShip = shipRows.find(r => r.name.includes('Навалом')) || {};
  const packShip = shipRows.find(r => r.name.includes('В таре')) || {};

  // KPI Bar
  const kpiBar = document.getElementById('kpiBarShipment');
  if (kpiBar) {
    kpiBar.innerHTML = `
      <div class="kpi-card">
        <span class="kpi-label">Отгрузка Всего (сут)</span>
        <span class="kpi-value">${fmt(totalShip.fact_day)} т</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Навалом (сут)</span>
        <span class="kpi-value" style="color:var(--accent-cyan);">${fmt(bulkShip.fact_day)} т</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">В таре (сут)</span>
        <span class="kpi-value" style="color:var(--accent-gold);">${fmt(packShip.fact_day)} т</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Выполнение месяца</span>
        <span class="kpi-value">${fmtPct(totalShip.pct_cumul)}</span>
      </div>
    `;
  }

  // Table
  const tbody = document.querySelector('#tableShipment tbody');
  if (tbody) {
    tbody.innerHTML = shipRows.map(row => `
      <tr>
        <td style="font-weight:${row.name.includes('ВСЕГО') || row.name.includes('т.ч.') ? '700' : '400'}">${row.name}</td>
        <td class="num">${fmt(row.plan_month)}</td>
        <td class="num">${fmt(row.plan_day)}</td>
        <td class="num" style="color:var(--accent-cyan); font-weight:700;">${fmt(row.fact_day)}</td>
        <td>${getPctBadge(row.pct_day)}</td>
        <td class="num">${fmt(row.plan_cumul)}</td>
        <td class="num">${fmt(row.fact_cumul)}</td>
        <td>${getPctBadge(row.pct_cumul)}</td>
      </tr>
    `).join('');
  }

  // Equipment (Roto Packaging)
  const eqGrid = document.getElementById('eqGridShipment');
  if (eqGrid && dayData.equipment) {
    const packEq = dayData.equipment.filter(e => e.name.includes('Рото') || e.name.includes('упаков'));
    eqGrid.innerHTML = packEq.map(eq => {
      const hours = Number(eq.hours_fact_day || 0);
      const isActive = hours > 0;
      return `
        <div class="eq-item">
          <span class="eq-name">${eq.name}</span>
          <div class="eq-status">
            <span class="eq-hours">${hours > 0 ? hours.toFixed(1) + ' ч' : '0 ч'}</span>
            <span class="eq-indicator ${isActive ? 'ind-active' : 'ind-idle'}">${isActive ? 'В РАБОТЕ' : 'ПРОСТОЙ'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Chart: Shipment Mix
  renderShipmentMixChart(bulkShip.fact_cumul || 170000, packShip.fact_cumul || 38000);
}

function renderShipmentMixChart(bulkVal, packVal) {
  const ctx = document.getElementById('chartShipmentMix');
  if (!ctx) return;

  if (chartShipmentInstance) {
    chartShipmentInstance.destroy();
  }

  chartShipmentInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Навалом (авто/ж/д)', 'В таре (мешки/МКР)'],
      datasets: [{
        data: [bulkVal || 174804, packVal || 38838],
        backgroundColor: ['#06b6d4', '#f59e0b'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { family: 'Inter', size: 12 } } } }
    }
  });
}

// ----------------------------------------------------
// SLIDE 4: RENDER SAFETY & ENERGY
// ----------------------------------------------------
export function renderSlideSafety(dayData) {
  // KPI Bar
  const kpiBar = document.getElementById('kpiBarSafety');
  if (kpiBar) {
    kpiBar.innerHTML = `
      <div class="kpi-card">
        <span class="kpi-label">Статус ОТ и ПБ</span>
        <span class="kpi-value" style="color:var(--accent-green);">ШТА ТНЫЙ</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Дней без Травм</span>
        <span class="kpi-value" style="color:var(--accent-cyan);">365+ ДНЕЙ</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Электроэнергия общий</span>
        <span class="kpi-value">97.16 кВт*ч/т</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-label">Расход тепла</span>
        <span class="kpi-value">2.53 ГДж/т</span>
      </div>
    `;
  }

  // Energy Table
  const tbody = document.querySelector('#tableEnergy tbody');
  if (tbody && dayData && dayData.energy) {
    tbody.innerHTML = dayData.energy.map(row => `
      <tr>
        <td style="font-weight:600;">${row.name}</td>
        <td>${row.unit}</td>
        <td style="color:var(--text-muted); font-size:0.8rem;">${row.equipment || '-'}</td>
        <td class="num">${fmt(row.plan_day, 1)}</td>
        <td class="num" style="color:var(--accent-cyan); font-weight:700;">${fmt(row.fact_day, 1)}</td>
        <td>${getPctBadge(row.pct_day)}</td>
        <td class="num">${fmt(row.fact_cumul, 1)}</td>
      </tr>
    `).join('');
  }
}
