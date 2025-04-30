// restored app.js


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
      const today = new Date().toISOString().split('T')[0];
      const entry = {
        userId: 'user1',
        date: today,
        calories: p.calories,
        proteins: p.proteins,
        fats: p.fats,
        carbs: p.carbs
      };
      addKbzhvEntry(entry);
      updateTotals(entry);
      updateProgressBars();
    });
    list.appendChild(item);
  });

  container.appendChild(list);
}

document.getElementById('fromList').addEventListener('click', () => {
  const el = document.getElementById('productListView');
  el.classList.toggle('hidden');
  loadProductList();
});

document.addEventListener('DOMContentLoaded', () => {
  updateDate();          // оновлення дати
  loadUserData();        // підвантаження з localStorage
  setupEventListeners(); // ⬅️ ЦЕ ГОЛОВНЕ
  updateProgressBars();  // оновити індикатори
});
