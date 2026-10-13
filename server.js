const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const menu = [
  { id: 1, name: 'Gongura Mutton', cat: 'Mains', price: 420, icon: '🍖', hot: 3, desc: 'Slow-cooked mutton in tangy sorrel leaves, finished with red chilli tempering.' },
  { id: 2, name: 'Natu Kodi Pulusu', cat: 'Mains', price: 360, icon: '🍗', hot: 3, desc: 'Country chicken simmered in tamarind gravy, served the village way.' },
  { id: 3, name: 'Royyala Iguru', cat: 'Mains', price: 380, icon: '🦐', hot: 2, desc: 'Godavari prawns dry-fried with curry leaf, garlic and black pepper.' },
  { id: 4, name: 'Pesarattu Upma', cat: 'Starters', price: 140, icon: '🥞', hot: 1, desc: 'Green gram crepe stuffed with upma, with ginger chutney.' },
  { id: 5, name: 'Chepala Vepudu', cat: 'Starters', price: 320, icon: '🐟', hot: 2, desc: 'Crisp fried river fish rubbed with a house masala.' },
  { id: 6, name: 'Gutti Vankaya Curry', cat: 'Mains', price: 220, icon: '🍆', hot: 2, desc: 'Baby aubergines stuffed with peanut, sesame and coconut masala.' },
  { id: 7, name: 'Pappu Charu Meals', cat: 'Meals', price: 260, icon: '🍛', hot: 1, desc: 'Rice with dal, rasam, two curries, pickle, papad and curd.' },
  { id: 8, name: 'Hyderabadi Dum Biryani', cat: 'Meals', price: 340, icon: '🍚', hot: 2, desc: 'Sealed-pot basmati biryani with raita and mirchi ka salan.' },
  { id: 9, name: 'Bobbatlu', cat: 'Sweets', price: 120, icon: '🫓', hot: 0, desc: 'Soft flatbread filled with jaggery and chana dal, brushed with ghee.' },
  { id: 10, name: 'Pootharekulu', cat: 'Sweets', price: 150, icon: '🍬', hot: 0, desc: 'Paper-thin rice sheets layered with ghee and powdered sugar.' }
];

app.get('/', (req, res) => {
  const cats = ['All', ...new Set(menu.map(m => m.cat))];
  res.render('index', { menu, cats, name: 'Godavari Kitchen' });
});

app.post('/api/order', (req, res) => {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  const lines = items
    .map(i => ({ dish: menu.find(m => m.id === i.id), qty: Math.max(1, parseInt(i.qty) || 1) }))
    .filter(l => l.dish);
  if (!lines.length) return res.status(400).json({ error: 'Add at least one dish to place an order.' });
  const total = lines.reduce((s, l) => s + l.dish.price * l.qty, 0);
  res.json({ orderId: 'GK' + Date.now().toString().slice(-6), total, eta: '35 minutes' });
});

app.post('/api/reserve', (req, res) => {
  const { name, date, time, guests } = req.body;
  if (!name || !date || !time) return res.status(400).json({ error: 'Enter your name, date and time to reserve.' });
  res.json({ message: `Table for ${guests || 2} booked for ${name} on ${date} at ${time}.` });
});

app.listen(PORT, () => console.log(`Godavari Kitchen running at http://localhost:${PORT}`));
