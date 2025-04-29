
const API_URL = 'https://kbzhv-miniapp-backend.vercel.app';
const userId = 'user1';  // тимчасово фіксовано

function updateWaterRecommendation() {
    const weight = +document.getElementById('weight').value;
    const el = document.getElementById('water-recommendation');
    if (weight) {
        const ml = weight * 40;
        el.textContent = `Рекомендація: ${ml} мл води/день`;
    } else {
        el.textContent = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    updateDate();
    setupEventListeners();
    updateProgressBars();
});

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

function setupEventListeners() {
    document.querySelectorAll('#settings input').forEach(input =>
        input.addEventListener('change', saveUserData)
    );

    setupToggle('toggleSettings', 'settings');
    setupToggle('toggleStats', 'history-buttons');
    setupToggle('addButton', 'addMenu');
    setupToggle('manual', 'manualForm');

    document.getElementById('byDay').addEventListener('click', () => {
        const today = new Date().toISOString().split('T')[0];
        loadHistoryView(today, today);
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

        const today = new Date().toISOString().split('T')[0];
        addKbzhvEntry({ ...entry, userId, date: today });
        updateTotals(entry);
        updateProgressBars();
        clearManualForm();
    });
}

function setupToggle(buttonId, targetId) {
    const btn = document.getElementById(buttonId);
    const target = document.getElementById(targetId);
    if (btn && target) {
        btn.addEventListener('click', () => {
            target.classList.toggle('revealed');
            target.classList.toggle('hidden');
        });
    }
}

function clearManualForm() {
    ['manualCalories', 'manualProteins', 'manualFats', 'manualCarbs', 'manualGrams']
        .forEach(id => document.getElementById(id).value = '');
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

async function addKbzhvEntry(data) {
    await fetch(`${API_URL}/api/kbzhv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
}

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

async function fetchKbzhvEntries(fromDate, toDate) {
    const url = `${API_URL}/api/kbzhv?userId=${userId}&fromDate=${fromDate}&toDate=${toDate}`;
    const res = await fetch(url);
    return res.json();
}

async function loadHistoryView(fromDate, toDate) {
    const data = await fetchKbzhvEntries(fromDate, toDate);
    renderHistory(data);
}

function renderHistory(entries) {
    const container = document.getElementById('history-view');
    container.innerHTML = '<h3>Історія КБЖВ</h3>';
    if (entries.length === 0) {
        container.innerHTML += '<p>Немає записів за вибраний день.</p>';
        return;
    }
    entries.forEach(entry => {
        container.innerHTML += `
            <div class="summary-item">
                <strong>${entry.date}</strong>: 
                Калорії: ${entry.calories}, 
                Б: ${entry.proteins}, 
                Ж: ${entry.fats}, 
                В: ${entry.carbs}
            </div>
        `;
    });
}
