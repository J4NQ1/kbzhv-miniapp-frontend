
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadUserData();
  updateDate();
  updateProgressBars();
});

function setupEventListeners() {
  setupToggle('toggleSettings', 'settings');
  setupToggle('addButton', 'addMenu');
  setupToggle('toggleStats', 'history-buttons');

  document.getElementById('fromList').addEventListener('click', () => {
    const el = document.getElementById('productListView');
    el.classList.toggle('hidden');
    loadProductList();
  });
}

// Тогл функція
function setupToggle(buttonId, targetId) {
  const btn = document.getElementById(buttonId);
  const block = document.getElementById(targetId);
  if (btn && block) {
    btn.addEventListener('click', () => {
      block.classList.toggle('hidden');
    });
  }
}

// Продукти
async function loadProductList(query = '') {
  const container = document.getElementById('productListView');
  container.innerHTML = '';

  const search = document.createElement('input');
  search.type = 'text';
  search.placeholder = 'Пошук продукту...';
  search.addEventListener('input', (e) => {
    loadProductList(e.target.value);
  });

  container.appendChild(search);

  const url = new URL('https://kbzhv-miniapp-backend.vercel.app/api/products');
  if (query) url.searchParams.set('search', query);
  const res = await fetch(url);
  const products = await res.json();

  products.forEach(p => {
    const item = document.createElement('div');
    item.className = 'product-item';
    item.innerHTML = `
      <strong>${p.name}</strong><br>
      Калорії: ${p.calories}, Б: ${p.proteins}, Ж: ${p.fats}, В: ${p.carbs}
      <button class="addFromList">Додати</button>
    `;
    item.querySelector('button').addEventListener('click', () => {
      updateTotals(p);
      updateProgressBars();
    });
    container.appendChild(item);
  });
}

// Короткі обов'язкові функції
function loadUserData() {
  const data = JSON.parse(localStorage.getItem('userData') || '{}');
  if (data.firstName) document.getElementById('firstName').value = data.firstName;
  if (data.lastName) document.getElementById('lastName').value = data.lastName;
}
function updateDate() {
  const now = new Date();
  document.getElementById('date').textContent = `Сьогодні: ${now.toLocaleDateString('uk-UA')}`;
  document.getElementById('userShortInfo').textContent =
    (document.getElementById('firstName').value || '') + ' ' +
    (document.getElementById('lastName').value || '');
}
function updateProgressBars() {
  // Порожня заглушка для безпомилкової роботи
}
function updateTotals(entry) {
  const t = id => document.getElementById(id);
  t('totalCalories').textContent = (+t('totalCalories').textContent + entry.calories).toFixed(0);
  t('totalProteins').textContent = (+t('totalProteins').textContent + entry.proteins).toFixed(1);
  t('totalFats').textContent = (+t('totalFats').textContent + entry.fats).toFixed(1);
  t('totalCarbs').textContent = (+t('totalCarbs').textContent + entry.carbs).toFixed(1);
}
