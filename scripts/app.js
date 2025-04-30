
const API_URL = 'https://kbzhv-miniapp-backend.vercel.app';
const userId = 'user1';

document.addEventListener('DOMContentLoaded', () => {
  updateDate();
  loadUserData();
  setupEventListeners();
  updateProgressBars();
});

// ⏱ Дата
function updateDate() {
  const date = new Date().toLocaleDateString('uk-UA');
  document.getElementById('date').textContent = `Сьогодні: ${date}`;
  updateUserShortInfo();
  updateWaterRecommendation();
}

// 👤 Коротке імʼя
function updateUserShortInfo() {
  const f = document.getElementById('firstName').value;
  const l = document.getElementById('lastName').value;
  document.getElementById('userShortInfo').textContent = `${f} ${l}`.trim();
}

// 💾 LocalStorage
function saveUserData() {
  const data = {
    firstName: document.getElementById('firstName').value,
    lastName: document.getElementById('lastName').value,
    height: document.getElementById('height').value,
    weight: document.getElementById('weight').value,
    calorieGoal: document.getElementById('calorieGoal').value,
    stepGoal: document.getElementById('stepGoal').value
  };
  localStorage.setItem('userData', JSON.stringify(data));
  updateUserShortInfo();
  updateWaterRecommendation();
  updateProgressBars();
}

function loadUserData() {
  const data = JSON.parse(localStorage.getItem('userData'));
  if (data) {
    document.getElementById('firstName').value = data.firstName || '';
    document.getElementById('lastName').value = data.lastName || '';
    document.getElementById('height').value = data.height || '';
    document.getElementById('weight').value = data.weight || '';
    document.getElementById('calorieGoal').value = data.calorieGoal || '';
    document.getElementById('stepGoal').value = data.stepGoal || '';
  }
  document.getElementById('waterDrankInput').value = localStorage.getItem('waterDrank') || '';
  document.getElementById('stepsDoneInput').value = localStorage.getItem('stepsDone') || '';
  updateUserShortInfo();
  updateWaterRecommendation();
}

// 💧 Вода
function updateWaterRecommendation() {
  const weight = +document.getElementById('weight').value;
  const el = document.getElementById('water-recommendation');
  if (weight) {
    el.textContent = `Рекомендація: ${weight * 40} мл води/день`;
  } else {
    el.textContent = '';
  }
}

// 🎯 Прогрес-бари
function updateProgressBars() {
  const cGoal = +document.getElementById('calorieGoal').value;
  const tCals = +document.getElementById('totalCalories').textContent;
  updateBar('calorieProgress', tCals / cGoal * 100, 'calories');

  const weight = +document.getElementById('weight').value;
  const waterDrank = +localStorage.getItem('waterDrank') || 0;
  updateBar('waterProgress', waterDrank / (weight * 40) * 100, 'water');

  const sGoal = +document.getElementById('stepGoal').value;
  const stepsDone = +localStorage.getItem('stepsDone') || 0;
  updateBar('stepsProgress', stepsDone / sGoal * 100, 'steps');
}

function updateBar(id, percent, type) {
  const el = document.querySelector(`#${id} div`);
  el.style.width = Math.min(percent, 100) + '%';

  if (type === 'calories') {
    el.style.background = percent < 40 ? 'red' : percent < 80 ? 'orange' : 'green';
  } else if (type === 'water') {
    el.style.background = '#007bff';
  } else if (type === 'steps') {
    el.style.background = 'limegreen';
  }
}

// ⚙️ Події
function setupEventListeners() {
  document.querySelectorAll('#settings input').forEach(input =>
    input.addEventListener('change', saveUserData)
  );

  setupToggle('toggleSettings', 'settings');
  setupToggle('addButton', 'addMenu');
  setupToggle('toggleStats', 'history-buttons');
  setupToggle('manual', 'manualForm');

  document.getElementById('waterDrankInput').addEventListener('input', () => {
    localStorage.setItem('waterDrank', +event.target.value);
    updateProgressBars();
  });

  document.getElementById('stepsDoneInput').addEventListener('input', () => {
    localStorage.setItem('stepsDone', +event.target.value);
    updateProgressBars();
  });

  document.getElementById('submitManual').addEventListener('click', () => {
    const g = +document.getElementById('manualGrams').value / 100;
    const entry = {
      calories: +document.getElementById('manualCalories').value * g,
      proteins: +document.getElementById('manualProteins').value * g,
      fats: +document.getElementById('manualFats').value * g,
      carbs: +document.getElementById('manualCarbs').value * g
    };
    updateTotals(entry);
    updateProgressBars();
    clearManualForm();
  });

  // 🔍 Продукти — зі списку
  document.getElementById('fromList').addEventListener('click', () => {
    const el = document.getElementById('productListView');
    el.classList.toggle('hidden');
    loadProductList();
  });
}

// 📦 Продукти
async function loadProductList(query = '') {
  const url = new URL(`${API_URL}/api/products`);
  if (query) url.searchParams.set('search', query);

  const res = await fetch(url);
  const products = await res.json();
  renderProductList(products);
}

function renderProductList(products) {
  const container = document.getElementById('productListView');
  container.innerHTML = '';

  const search = document.createElement('input');
  search.type = 'text';
  search.placeholder = 'Пошук продукту...';
  search.addEventListener('input', e => loadProductList(e.target.value));
  container.appendChild(search);

  products.forEach(p => {
    const item = document.createElement('div');
    item.className = 'product-item';
    item.innerHTML = `
      <strong>${p.name}</strong><br>
      Калорії: ${p.calories}, Б: ${p.proteins}, Ж: ${p.fats}, В: ${p.carbs}
      <button class="addFromList">Додати</button>
    `;
    item.querySelector('button').addEventListener('click', () => {
      const entry = {
        calories: p.calories,
        proteins: p.proteins,
        fats: p.fats,
        carbs: p.carbs
      };
      updateTotals(entry);
      updateProgressBars();
    });
    container.appendChild(item);
  });
}

// ➕ Додавання КБЖВ
function updateTotals(entry) {
  const t = id => document.getElementById(id);
  t('totalCalories').textContent = (+t('totalCalories').textContent + entry.calories).toFixed(0);
  t('totalProteins').textContent = (+t('totalProteins').textContent + entry.proteins).toFixed(1);
  t('totalFats').textContent = (+t('totalFats').textContent + entry.fats).toFixed(1);
  t('totalCarbs').textContent = (+t('totalCarbs').textContent + entry.carbs).toFixed(1);
}

// 📦 Очистка
function clearManualForm() {
  ['manualCalories', 'manualProteins', 'manualFats', 'manualCarbs', 'manualGrams']
    .forEach(id => document.getElementById(id).value = '');
}

// 🧩 Тогли
function setupToggle(buttonId, blockId) {
  const btn = document.getElementById(buttonId);
  const block = document.getElementById(blockId);
  if (btn && block) {
    btn.addEventListener('click', () => {
      block.classList.toggle('hidden');
    });
  }
}
