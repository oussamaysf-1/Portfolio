const ctxLine = document.getElementById('line');
const ctxDoughnut = document.getElementById('doughnut');
const OFFLINE = typeof navigator !== 'undefined' && navigator.onLine === false;

async function fetchBTC(){
  try{
    if(OFFLINE){ throw new Error('offline'); }
    const end = new Date();
    const start = new Date(); start.setDate(end.getDate()-30);
    const fmt = d=>d.toISOString().slice(0,10);
    const url = `https://api.coindesk.com/v1/bpi/historical/close.json?start=${fmt(start)}&end=${fmt(end)}`;
    const r = await fetch(url, { cache: 'no-store' }); const j = await r.json();
    return j.bpi; // { '2024-01-01': 42000, ... }
  }catch(e){
    // Fallback synthétique
    const days=[...Array(31).keys()].map(i=>i+1);
    const today = new Date(); const ym = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}`;
    const obj={}; days.forEach((d,i)=>obj[`${ym}-${String(d).padStart(2,'0')}`]=30000+Math.sin(i/3)*1500+i*40);
    return obj;
  }
}

async function fetchFX(){
  try{
    if(OFFLINE){ throw new Error('offline'); }
    const r = await fetch('https://api.exchangerate.host/latest?base=EUR&symbols=USD,GBP,JPY', { cache: 'no-store' });
    const j = await r.json();
    const rates = j.rates; // { USD: x, GBP: y, JPY: z }
    const keys = Object.keys(rates);
    const sum = keys.reduce((s,k)=>s+rates[k],0);
    return keys.map(k=>({ label:k, value: Math.round((rates[k]/sum)*100) }));
  }catch(e){
    return [ {label:'USD', value:50}, {label:'GBP', value:30}, {label:'JPY', value:20} ];
  }
}

(async function init(){
  const btc = await fetchBTC();
  const labels = Object.keys(btc);
  const values = Object.values(btc);
  new Chart(ctxLine, {
    type: 'line',
    data: { labels, datasets: [{ label: 'BTC (USD) – 30j', data: values, tension:.35, borderColor:'#6ee7ff', backgroundColor:'rgba(110,231,255,.2)', fill:true }] },
    options: { plugins: { legend: { labels: { color: '#e6edf3' } } }, scales: { x: { ticks:{ color:'#9fb0c0' } }, y: { ticks:{ color:'#9fb0c0' } } } }
  });

  const fx = await fetchFX();
  new Chart(ctxDoughnut, {
    type: 'doughnut',
    data: { labels: fx.map(x=>x.label), datasets: [{ data: fx.map(x=>x.value), backgroundColor: ['#6ee7ff','#a78bfa','#1c2430'], borderWidth:0 }] },
    options: { plugins: { legend: { labels: { color: '#e6edf3' } } } }
  });
})();