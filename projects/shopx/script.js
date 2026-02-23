const products = [
  { id:1, title:'T‑shirt Essential', price:19, category:'Men', img:'assets/tshirt.svg' },
  { id:2, title:'Jean Classic', price:49, category:'Men', img:'assets/jean.svg' },
  { id:3, title:'Robe Fluide', price:39, category:'Women', img:'assets/robe.svg' },
  { id:4, title:'Veste Denim', price:59, category:'Women', img:'assets/veste.svg' },
  { id:5, title:'Casquette', price:15, category:'Accessories', img:'assets/casquette.svg' },
  { id:6, title:'Sac à dos', price:35, category:'Accessories', img:'assets/sac.svg' },
];

let cartItems = JSON.parse(localStorage.getItem('sx_cart')||'[]');
const grid = document.getElementById('grid');
const cartEl = document.getElementById('cartCount');
const drawer = document.getElementById('cartDrawer');
const itemsEl = document.getElementById('cartItems');
const totalEl = document.getElementById('cartTotal');

function makeImageData(name){
  const bg1 = '#6ee7ff', bg2 = '#a78bfa';
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${bg1}'/><stop offset='1' stop-color='${bg2}'/></linearGradient></defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <rect width='100%' height='100%' fill='rgba(0,0,0,0.15)'/>
    <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' font-family='Inter, Arial' font-size='42' font-weight='700' fill='white'>${name}</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function render(list){
  grid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'sx-card';
    card.innerHTML = `
      <div class="sx-media" aria-hidden="true"><img alt="${p.title}" src="${p.img || makeImageData(p.title)}"></div>
      <div class="sx-body">
        <strong>${p.title}</strong>
        <span class="sx-price">${p.price} € · ${p.category}</span>
        <button class="sx-btn" data-id="${p.id}">Ajouter au panier</button>
      </div>`;
    grid.appendChild(card);
  });
}

render(products);
updateCartUI();

document.addEventListener('click', (e)=>{
  const btn = e.target.closest('.sx-btn');
  if(btn){
    const id = Number(btn.dataset.id);
    const item = products.find(p=>p.id===id);
    const found = cartItems.find(i=>i.id===id);
    if(found) found.qty += 1; else cartItems.push({ id:item.id, title:item.title, price:item.price, img: item.img || makeImageData(item.title), qty:1 });
    persist();
    updateCartUI();
  }
  const chip = e.target.closest('.sx-chip');
  if(chip){
    document.querySelectorAll('.sx-chip').forEach(c=>c.classList.remove('active'));
    chip.classList.add('active');
    const f = chip.dataset.filter;
    render(f==='all' ? products : products.filter(p=>p.category===f));
  }
});

document.getElementById('openCart')?.addEventListener('click', ()=>drawer.classList.add('open'));
document.getElementById('closeCart')?.addEventListener('click', ()=>drawer.classList.remove('open'));
document.getElementById('checkout')?.addEventListener('click', ()=>{
  if(!cartItems.length){ alert('Votre panier est vide.'); return; }
  const lines = cartItems.map(i=>`- ${i.title} x${i.qty} = ${(i.price*i.qty).toFixed(2)} €`).join('\n');
  alert(`Commande vérifiée:\n\n${lines}\n\nTotal: ${computeTotal().toFixed(2)} €`);
});

itemsEl?.addEventListener('click', (e)=>{
  const inc = e.target.closest('[data-inc]');
  const dec = e.target.closest('[data-dec]');
  const del = e.target.closest('[data-del]');
  if(inc||dec||del){
    const id = Number((inc||dec||del).dataset.id);
    const item = cartItems.find(i=>i.id===id);
    if(!item) return;
    if(inc) item.qty += 1;
    if(dec) item.qty = Math.max(1, item.qty-1);
    if(del) cartItems = cartItems.filter(i=>i.id!==id);
    persist();
    updateCartUI();
  }
});

function computeTotal(){
  return cartItems.reduce((s,i)=>s+i.price*i.qty,0);
}
function persist(){
  localStorage.setItem('sx_cart', JSON.stringify(cartItems));
}
function updateCartUI(){
  const count = cartItems.reduce((s,i)=>s+i.qty,0);
  cartEl.textContent = String(count);
  itemsEl.innerHTML = cartItems.map(i=>`
    <div class='sx-row'>
      <img alt='${i.title}' src='${i.img}'>
      <div>
        <div><strong>${i.title}</strong></div>
        <div class='sx-price'>${i.price} €</div>
      </div>
      <div class='sx-q'>
        <button data-dec data-id='${i.id}'>-</button>
        <span>${i.qty}</span>
        <button data-inc data-id='${i.id}'>+</button>
        <button data-del data-id='${i.id}'>Supprimer</button>
      </div>
    </div>
  `).join('');
  totalEl.textContent = computeTotal().toFixed(2) + ' €';
}