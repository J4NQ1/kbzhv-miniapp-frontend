// Твій майбутній JavaScript код буде тут

const API_URL = 'https://kbzhv-miniapp-backend.vercel.app'; // заміни на свій бекенд

document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    updateDate();
    setupEventListeners();
});

// === ДАТА І ВОДА ===
function updateDate() {
    const date = new Date().toLocaleDateString('uk-UA');
    document.getElementById('date').textContent = `Сьогодні: ${date}`;
}

function updateWaterRecommendation() {
    const weight = +document.getElementById('weight').value;
    if (weight) {
        const waterMl = weight * 40;
        document.getElementById('water-recommendation').textContent = `Рекомендація: ${waterMl} мл води/день`;
    }
}

// === ЛОКАЛЬНЕ ЗБЕРІГАННЯ ===
function saveUserData() {
    const user = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        height: document.getElementById('height').value,
        weight: document.getElementById('weight').value,
        calorieGoal: document.getElementById('calorieGoal').value,
        stepGoal: document.getElementById('stepGoal').value
    };
    localStorage.setItem('userData', JSON.stringify(user));
    updateWaterRecommendation();
}

function loadUserData() {
    const data = JSON.parse(localStorage.getItem('userData'));
    if (data) {
        document.getElementById('firstName').value = data.firstName;
        document.getElementById('lastName').value = data.lastName;
        document.getElementById('height').value = data.height;
        document.getElementById('weight').value = data.weight;
        document.getElementById('calorieGoal').value = data.calorieGoal;
        document.getElementById('stepGoal').value = data.stepGoal;
        updateWaterRecommendation();
    }
}

// === ПРОДУКТИ ===
async function addProductToBackend(product) {
    await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
    });
}

async function fetchProducts(search = '') {
    const res = await fetch(`${API_URL}/api/products?search=${search}`);
    return await res.json();
}

// === КБЖВ ===
async function addKbzhvEntry(data) {
    await fetch(`${API_URL}/api/kbzhv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

// === ПОДІЇ ===
function setupEventListeners() {
    document.querySelectorAll('#user-info input').forEach(input =>
        input.addEventListener('change', saveUserData)
    );

    document.getElementById('addButton').addEventListener('click', () => {
        document.getElementById('addMenu').classList.toggle('hidden');
    });

    // Приклад: натискання на \"додати вручну\"
    document.getElementById('manual').addEventListener('click', () => {
        const name = prompt('Назва продукту:');
        const calories = parseFloat(prompt('Калорії на 100г:'));
        const proteins = parseFloat(prompt('Білки на 100г:'));
        const fats = parseFloat(prompt('Жири на 100г:'));
        const carbs = parseFloat(prompt('Вуглеводи на 100г:'));
        const grams = parseFloat(prompt('Грами:'));

        const k = grams / 100;
        const entry = {
            name,
            calories: calories * k,
            proteins: proteins * k,
            fats: fats * k,
            carbs: carbs * k
        };

        // додаємо у КБЖВ
        const userId = 'user1'; // тимчасово
        const today = new Date().toISOString().split('T')[0];
        addKbzhvEntry({ ...entry, userId, date: today });

        // додаємо в базу продуктів
        addProductToBackend({ name, calories, proteins, fats, carbs });
        alert('Продукт додано!');
    });
}
