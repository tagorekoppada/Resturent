const $ = (s, el = document) => el.querySelector(s);
const cart = {}; // id -> qty
const rupee = n => '₹' + n.toLocaleString('en-IN');

// Category filter
document.querySelectorAll('.chip').forEach(chip => chip.addEventListener('click', () => {
  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  const cat = chip.dataset.cat;
  document.querySelectorAll('.dish').forEach(d => { d.hidden = cat !== 'All' && d.dataset.cat !== cat; });
}));

// Cart
const drawer = $('#drawer'), scrim = $('#scrim');
const toggle = open => {
  drawer.classList.toggle('open', open);
  scrim.classList.toggle('show', open);
  drawer.setAttribute('aria-hidden', String(!open));
};
$('#cartBtn').onclick = () => toggle(true);
$('#closeCart').onclick = scrim.onclick = () => toggle(false);

document.querySelectorAll('.add').forEach(b => b.addEventListener('click', () => {
  const id = +b.dataset.id;
  cart[id] = (cart[id] || 0) + 1;
  render();
  b.textContent = 'Added';
  setTimeout(() => (b.textContent = 'Add'), 900);
}));

function render() {
  const list = $('#cartList'); list.innerHTML = '';
  let total = 0, count = 0;
  Object.entries(cart).forEach(([id, qty]) => {
    const d = MENU.find(m => m.id == id);
    total += d.price * qty; count += qty;
    const li = document.createElement('li');
    li.innerHTML = `<span class="nm">${d.name}</span>
      <span class="qty"><button data-id="${id}" data-d="-1" aria-label="Remove one">−</button>${qty}<button data-id="${id}" data-d="1" aria-label="Add one">+</button></span>
      <strong>${rupee(d.price * qty)}</strong>`;
    list.appendChild(li);
  });
  $('#cartCount').textContent = count;
  $('#cartTotal').textContent = rupee(total);
  $('#cartEmpty').hidden = count > 0;
  $('#placeOrder').disabled = count === 0;
}
$('#cartList').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const id = b.dataset.id;
  cart[id] += +b.dataset.d;
  if (cart[id] <= 0) delete cart[id];
  render();
});

const msg = (el, text, err) => { el.textContent = text; el.classList.toggle('err', !!err); };

$('#placeOrder').onclick = async () => {
  const items = Object.entries(cart).map(([id, qty]) => ({ id: +id, qty }));
  const res = await fetch('/api/order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) });
  const data = await res.json();
  if (!res.ok) return msg($('#orderMsg'), data.error, true);
  msg($('#orderMsg'), `Order ${data.orderId} placed. ${rupee(data.total)}, ready in ${data.eta}.`);
  Object.keys(cart).forEach(k => delete cart[k]);
  render();
};

// Reservation
$('#reserveForm').addEventListener('submit', async e => {
  e.preventDefault();
  const body = Object.fromEntries(new FormData(e.target));
  const res = await fetch('/api/reserve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json();
  msg($('#reserveMsg'), data.message || data.error, !res.ok);
  if (res.ok) e.target.reset();
});

render();
