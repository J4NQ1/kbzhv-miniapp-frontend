// Твій майбутній JavaScript код буде тут

const API_URL = 'https://kbzhv-miniapp-backend.vercel.app'; // заміни на свій бекенд

document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    updateDate();
    setupEventListeners();
    setupTestInputs();        // <== кнопки тесту води/кроків
    updateProgressBars();     // <== оновлення прогрес-барів
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

function updateProgressBars() {
    const calorieGoal = +document.getElementById('calorieGoal').value;
    const totalCalories = +document.getElementById('totalCalories').textContent;
    const caloriePercent = Math.min((totalCalories / calorieGoal) * 100, 100);
    updateBar('calorieProgress', caloriePercent, 'calories');

    const weight = +document.getElementById('weight').value;
    const waterGoal = weight * 40;
    const waterDrank = +localStorage.getItem('waterDrank') || 0;
    const waterPercent = Math.min((waterDrank / waterGoal) * 100, 100);
    updateBar('waterProgress', waterPercent, 'water');

    const stepGoal = +document.getElementById('stepGoal').value;
    const stepsDone = +localStorage.getItem('stepsDone') || 0;
    const stepsPercent = Math.min((stepsDone / stepGoal) * 100, 100);
    updateBar('stepsProgress', stepsPercent, 'steps');
}

function updateBar(id, percent, type) {
    const bar = document.querySelector(`#${id} div`);
    bar.style.width = percent + '%';

    if (type === 'calories') {
        if (percent < 40) bar.style.background = 'red';
        else if (percent < 80) bar.style.background = 'orange';
        else bar.style.background = 'green';
    }

    if (type === 'water') {
        bar.style.background = '#007bff';
    }

    if (type === 'steps') {
        bar.style.background = 'limegreen';
    }
}

function setupTestInputs() {
    const waterBtn = document.createElement('button');
    waterBtn.textContent = 'Додати 250мл води';
    waterBtn.onclick = () => {
        let water = +localStorage.getItem('waterDrank') || 0;
        water += 250;
        localStorage.setItem('waterDrank', water);
        updateProgressBars();
    };

    const stepsBtn = document.createElement('button');
    stepsBtn.textContent = 'Додати 500 кроків';
    stepsBtn.onclick = () => {
        let steps = +localStorage.getItem('stepsDone') || 0;
        steps += 500;
        localStorage.setItem('stepsDone', steps);
        updateProgressBars();
    };

    document.body.appendChild(waterBtn);
    document.body.appendChild(stepsBtn);
}


function setupEventListeners() {
    document.querySelectorAll('#user-info input').forEach(input =>
        input.addEventListener('change', saveUserData)
    );

    document.getElementById('waterDrankInput').addEventListener('input', () => {
        const val = +document.getElementById('waterDrankInput').value;
        localStorage.setItem('waterDrank', val);
        updateProgressBars();
    });

    document.getElementById('addButton').addEventListener('click', () => {
        document.getElementById('addMenu').classList.toggle('hidden');
    });
