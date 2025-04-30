
// Спрощена ініціалізація + продукти
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

function setupEventListeners() {
  document.getElementById('fromList').addEventListener('click', () => {
    const el = document.getElementById('productListView');
    el.classList.toggle('hidden');
    loadProductList();
  });
}

async function loadProductList(query = '') {
  const url = new URL('https://kbzhv-miniapp-backend.vercel.app/api/products');
  if (query) url.searchParams.append('search', query);

  const res = await fetch(url);
  const products = await res.json();
  renderProductList(products);
}

function renderProductList(products) {
  const container = document.getElementById('productListView');
  container.innerHTML = '';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Пошук продукту...';
  searchInput.addEventListener('input', (e) => {
    loadProductList(e.target.value);
  });

  container.appendChild(searchInput);

  const list = document.createElement('div');
  products.forEach(p => {
    const item = document.createElement('div');
    item.className = 'product-item';
    item.innerHTML = `
      <strong>${p.name}</strong><br>
      Калорії: ${p.calories}, Б: ${p.proteins}, Ж: ${p.fats}, В: ${p.carbs}
      <button class="addFromList">Додати</button>
    `;
    const btn = item.querySelector('.addFromList');
    btn.addEventListener('click', () => {
      console.log('Додано продукт до КБЖВ:', p.name);
    });
    list.appendChild(item);
  });

  container.appendChild(list);
}
