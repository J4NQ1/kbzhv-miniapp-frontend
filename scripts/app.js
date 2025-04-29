
const API_URL = 'https://kbzhv-miniapp-backend.vercel.app';

document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    updateDate();
    setupEventListeners();
    updateProgressBars();
});

// === Дата та ім'я ===
function updateDate() {
    const date = new Date().toLocaleDateString('uk-UA');
    document.getElementById('date').textContent = `Сьогодні: ${date}`;
    updateWaterRecommendation();
    updateUserShortInfo();
}

function updateUserShortInfo() {
    const firstName = document.getElementById('firstName').value || '';
    const lastName = document.getElementById('lastName').value || '';
    document.getElementById('userShortInfo').textContent = firstName || lastName ? `${firstName} ${lastName}` : '';
}

// === Збереження даних ===
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
    updateUserShortInfo();
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
        updateUserShortInfo();
        updateWaterRecommendation();
    }
    document.getElementById('waterDrankInput').value = localStorage.getItem('waterDrank') || '';
    document.getElementById('stepsDoneInput').value = localStorage.getItem('stepsDone') || '';
}

// === Події ===
function setupEventListeners() {
    document.querySelectorAll('#settings input').forEach(input =>
        input.addEventListener('change', saveUserData)
    );

    document.getElementById('toggleSettings').addEventListener('click', () => {
        document.getElementById('settings').classList.toggle('hidden');
    });

    document.getElementById('toggleStats').addEventListener('click', () => {
        document.getElementById('history-buttons').classList.toggle('hidden');
    });

    document.getElementById('addButton').addEventListener('click', () => {
        document.getElementById('addMenu').classList.toggle('hidden');
    });

    document.getElementById('manual').addEventListener('click', () => {
        document.getElementById('manualForm').classList.toggle('hidden');
    });

    document.getElementById('waterDrankInput').addEventListener('input', () => {
        const val = +document.getElementById('waterDrankInput').value;
        localStorage.setItem('waterDrank', val);
        updateProgressBars();
    });

    document.getElementById('stepsDoneInput').addEventListener('input', () => {
        const val = +document.getElementById('stepsDoneInput').value;
        localStorage.setItem('stepsDone', val);
        updateProgressBars();
    });

    document.getElementById('submitManual').addEventListener('click', () => {
        const cal = +document.getElementById('manualCalories').value;
        const prot = +document.getElementById('manualProteins').value;
        const fats = +document.getElementById('manualFats').value;
        const carbs = +document.getElementById('manualCarbs').value;
        const grams = +document.getElementById('manualGrams').value;

        const k = grams / 100;
        const entry = {
            calories: cal * k,
            proteins: prot * k,
            fats: fats * k,
            carbs: carbs * k
        };

        const userId = 'user1';
        const today = new Date().toISOString().split('T')[0];

        addKbzhvEntry({ ...entry, userId, date: today });
        updateTotals(entry);
        updateProgressBars();
        clearManualForm();
    });
}

function clearManualForm() {
    ['manualCalories', 'manualProteins', 'manualFats', 'manualCarbs', 'manualGrams']
        .forEach(id => document.getElementById(id).value = '');
}

// === Прогрес-бари ===
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

// === КБЖВ додавання ===
async function addKbzhvEntry(data) {
    await fetch(`${API_URL}/api/kbzhv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

// === КБЖВ підсумок ===
function updateTotals(entry) {
    const cals = document.getElementById('totalCalories');
    const prots = document.getElementById('totalProteins');
    const fats = document.getElementById('totalFats');
    const carbs = document.getElementById('totalCarbs');

    cals.textContent = (+cals.textContent + entry.calories).toFixed(0);
    prots.textContent = (+prots.textContent + entry.proteins).toFixed(1);
    fats.textContent = (+fats.textContent + entry.fats).toFixed(1);
    carbs.textContent = (+carbs.textContent + entry.carbs).toFixed(1);
}
