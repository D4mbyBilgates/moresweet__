const PRICE = 270;

const FLAVORS = [
  { id: 'red-pulp',         name: 'Red Pulp',         note: 'Juicy watermelon',        c1: '#ff6b6b', c2: '#d6203a' },
  { id: 'very-more',        name: 'Very More',        note: 'Mixed berry blend',       c1: '#e8446f', c2: '#a3123f' },
  { id: 'bacteria-monster', name: 'Bacteria Monster', note: 'Creamy yogurt drink',     c1: '#f7c76b', c2: '#d9902a' },
  { id: 'very-baguio',      name: 'Very Baguio',      note: 'Fresh strawberry',        c1: '#ff5a5f', c2: '#c4162a' },
  { id: 'trouble-purple',   name: 'Trouble Purple',   note: 'Ripe grape',              c1: '#9b59d6', c2: '#5b1b9b' },
  { id: 'blue-freeze',      name: 'Blue Freeze',      note: 'Icy blueberry',           c1: '#3d8bff', c2: '#0b4fc2' },
  { id: 'red-cannon',       name: 'Red Cannon',       note: 'Bubble gum',              c1: '#ff7eb6', c2: '#d4308a' },
  { id: 'pink-sunset',      name: 'Pink Sunset',      note: 'Strawberry banana',       c1: '#ff8aa0', c2: '#d6336c' },
  { id: 'yellow-summer',    name: 'Yellow Summer',    note: 'Sweet ripe mango',        c1: '#ffc83d', c2: '#e8860c' },
  { id: 'black-wave',       name: 'Black Wave',       note: 'Dark blackcurrant',       c1: '#6a4fb5', c2: '#2c1b66' }
];

const $ = (s) => document.querySelector(s);
const peso = (n) => '₱' + n.toLocaleString('en-PH');

let cart = {};
try { cart = JSON.parse(localStorage.getItem('mimsCart')) || {}; } catch (e) { cart = {}; }

/* ---------- Age gate ---------- */
const gate = $('#ageGate');
try { if (sessionStorage.getItem('ageOk') === '1') gate.classList.add('hide'); } catch (e) {}
$('#gateYes').addEventListener('click', () => {
  gate.classList.add('hide');
  try { sessionStorage.setItem('ageOk', '1'); } catch (e) {}
});

/* ---------- Render flavors ---------- */
const grid = $('#grid');
grid.innerHTML = FLAVORS.map(f => `
  <article class="card" style="--c1:${f.c1};--c2:${f.c2}">
    <div class="card-img">
      <img src="images/${f.id}.jpg" alt="${f.name} flavor" loading="lazy">
    </div>
    <div class="card-body">
      <h3>${f.name}</h3>
      <p class="meta">${f.note} &middot; 50K puffs</p>
      <div class="card-foot">
        <span class="price">${peso(PRICE)}</span>
        <button class="add" data-id="${f.id}">Add to cart</button>
      </div>
    </div>
  </article>`).join('');

grid.addEventListener('click', (e) => {
  const btn = e.target.closest('.add');
  if (!btn) return;
  const id = btn.dataset.id;
  cart[id] = (cart[id] || 0) + 1;
  save(); renderCart();
  const f = FLAVORS.find(x => x.id === id);
  toast(`${f.name} added to cart`);
  const c = $('#cartCount'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
});

/* ---------- Cart ---------- */
const drawer = $('#drawer'), overlay = $('#overlay');
function openCart(){ drawer.classList.add('open'); overlay.classList.add('show'); drawer.setAttribute('aria-hidden','false'); }
function closeCart(){ drawer.classList.remove('open'); overlay.classList.remove('show'); drawer.setAttribute('aria-hidden','true'); }
$('#cartOpen').addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeCart(); });

function save(){ try { localStorage.setItem('mimsCart', JSON.stringify(cart)); } catch (e) {} }

function renderCart(){
  const ids = Object.keys(cart).filter(id => cart[id] > 0);
  const count = ids.reduce((s, id) => s + cart[id], 0);
  $('#cartCount').textContent = count;
  $('#cartTotal').textContent = peso(count * PRICE);
  $('#cartEmpty').classList.toggle('hide', ids.length > 0);
  $('#checkout').disabled = count === 0;

  $('#cartList').innerHTML = ids.map(id => {
    const f = FLAVORS.find(x => x.id === id);
    return `<li>
      <img src="images/${id}.jpg" alt="">
      <div><div class="name">${f.name}</div><div class="sub">${peso(PRICE)} each</div></div>
      <div class="qty">
        <button data-act="dec" data-id="${id}" aria-label="Remove one ${f.name}">&minus;</button>
        <span>${cart[id]}</span>
        <button data-act="inc" data-id="${id}" aria-label="Add one ${f.name}">+</button>
      </div></li>`;
  }).join('');
}

$('#cartList').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const id = b.dataset.id;
  cart[id] += b.dataset.act === 'inc' ? 1 : -1;
  if (cart[id] <= 0) delete cart[id];
  save(); renderCart();
});

$('#clearCart').addEventListener('click', () => { cart = {}; save(); renderCart(); });

$('#checkout').addEventListener('click', async () => {
  const lines = Object.keys(cart).map(id => {
    const f = FLAVORS.find(x => x.id === id);
    return `${cart[id]} x ${f.name} - ${peso(cart[id] * PRICE)}`;
  });
  const total = Object.values(cart).reduce((s, n) => s + n, 0) * PRICE;
  const text = `Order - More Ice, More Sweet | Elite 50K Puffs\n${lines.join('\n')}\nTotal: ${peso(total)}`;
  try { await navigator.clipboard.writeText(text); toast('Order summary copied. Send it to the seller.'); }
  catch (e) { prompt('Copy your order:', text); }
});

/* ---------- Toast ---------- */
let t;
function toast(msg){
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(t); t = setTimeout(() => el.classList.remove('show'), 2200);
}

renderCart();
