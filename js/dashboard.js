import config from './config.js';

// --- Constants & Data ---
const unitData = {
    length: ['Feet', 'Inch', 'Yard', 'Centimeter'],
    weight: ['Kilogram', 'Gram', 'Pound'],
    temperature: ['Celsius', 'Fahrenheit', 'Kelvin'],
    volume: ['Litre', 'Millilitre', 'Gallon'],
    angle: ['Degree', 'Radian'],
    area: ['SqFeet', 'SqInch', 'SqCentimeter'],
    energy: ['Joule', 'Calorie', 'Kilocalorie'],
    power: ['Watt', 'Kilowatt', 'Horsepower'],
    pressure: ['Pascal', 'Bar', 'Psi'],
    speed: ['Kmph', 'Mph', 'Mps'],
    time: ['Second', 'Minute', 'Hour']
};

// --- DOM Elements ---
const typeCards = document.querySelectorAll('.type-card');
const actionTabs = document.querySelectorAll('.action-tab');
const fromUnitSelect = document.getElementById('from-unit');
const toUnitSelect = document.getElementById('to-unit');
const fromValueInput = document.getElementById('from-value');
const toValueInput = document.getElementById('to-value');
const executeBtn = document.getElementById('execute-btn');
const standardActionContainer = document.getElementById('standard-action-container');
const arithmeticActionContainer = document.getElementById('arithmetic-action-container');
const addBtn = document.getElementById('add-btn');
const subBtn = document.getElementById('sub-btn');
const mulBtn = document.getElementById('mul-btn');
const divBtn = document.getElementById('div-btn');
const arithmeticTab = document.querySelector('[data-action="arithmetic"]');
const operationIcon = document.getElementById('operation-icon');
const resultMessage = document.getElementById('result-message');
const logoutBtn = document.getElementById('logout-btn');
const historyBtn = document.getElementById('history-btn');

const unsupportedArithmeticTypes = ['temperature'];

// --- State ---
let currentType = 'length';
let currentAction = 'comparison'; // comparison, conversion, arithmetic

// --- Authentication Check ---
function checkAuth() {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
        window.location.href = 'login.html';
    }
    return token;
}

// --- Initialization ---
function init() {
    checkAuth();
    populateUnits();
    setupEventListeners();
}

// --- Event Setup ---
function setupEventListeners() {
    // Type selection
    typeCards.forEach(card => {
        card.addEventListener('click', () => {
            typeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentType = card.dataset.type;
            
            if (unsupportedArithmeticTypes.includes(currentType)) {
                if(arithmeticTab) {
                    arithmeticTab.classList.add('hidden');
                    arithmeticTab.style.display = 'none';
                }
                if (currentAction === 'arithmetic') {
                    document.querySelector('[data-action="comparison"]').click();
                }
            } else {
                if(arithmeticTab) {
                    arithmeticTab.classList.remove('hidden');
                    arithmeticTab.style.display = 'inline-block';
                }
            }
            
            populateUnits();
            hideResult();
        });
    });

    // Action selection
    actionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            actionTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentAction = tab.dataset.action;
            updateUIForAction();
            hideResult();
        });
    });

    // Execute button
    executeBtn.addEventListener('click', () => handleExecution(currentAction));
    if(addBtn) addBtn.addEventListener('click', () => handleExecution('add'));
    if(subBtn) subBtn.addEventListener('click', () => handleExecution('subtract'));
    if(mulBtn) mulBtn.addEventListener('click', () => handleExecution('multiply'));
    if(divBtn) divBtn.addEventListener('click', () => handleExecution('divide'));

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('jwt_token');
        window.location.href = 'login.html';
    });

    // History
    historyBtn.addEventListener('click', () => {
        window.location.href = 'history.html';
    });
}

// --- UI Updates ---
function populateUnits() {
    const units = unitData[currentType];
    fromUnitSelect.innerHTML = '';
    toUnitSelect.innerHTML = '';

    units.forEach(unit => {
        fromUnitSelect.innerHTML += `<option value="${unit}">${unit}</option>`;
        toUnitSelect.innerHTML += `<option value="${unit}">${unit}</option>`;
    });

    // Pick different defaults if available
    if (units.length > 1) {
        toUnitSelect.selectedIndex = 1;
    }
}

function updateUIForAction() {
    if(standardActionContainer) standardActionContainer.classList.add('hidden');
    if(arithmeticActionContainer) arithmeticActionContainer.classList.add('hidden');

    if (currentAction === 'comparison') {
        if(standardActionContainer) {
            standardActionContainer.classList.remove('hidden');
            standardActionContainer.style.display = 'block';
        }
        operationIcon.textContent = '=?';
        executeBtn.textContent = 'Compare';
        toValueInput.readOnly = false; // Both inputs active
        toValueInput.parentElement.querySelector('label').textContent = 'WITH';
        fromValueInput.parentElement.querySelector('label').textContent = 'COMPARE';
    } else if (currentAction === 'conversion') {
        if(standardActionContainer) {
            standardActionContainer.classList.remove('hidden');
            standardActionContainer.style.display = 'block';
        }
        operationIcon.textContent = '➔';
        executeBtn.textContent = 'Convert';
        toValueInput.readOnly = true; // Output is read-only
        toValueInput.value = ''; // Clear destination value
        toValueInput.parentElement.querySelector('label').textContent = 'TO';
        fromValueInput.parentElement.querySelector('label').textContent = 'FROM';
    } else if (currentAction === 'arithmetic') {
        if(arithmeticActionContainer) {
            arithmeticActionContainer.classList.remove('hidden');
            arithmeticActionContainer.style.display = 'flex';
        }
        operationIcon.textContent = '...';
        toValueInput.readOnly = false; // Both inputs active for arithmetic logic
        toValueInput.parentElement.querySelector('label').textContent = 'OPERAND 2';
        fromValueInput.parentElement.querySelector('label').textContent = 'OPERAND 1';
    }
}

function showResult(message, isSuccess = true) {
    resultMessage.textContent = message;
    resultMessage.className = `result-message ${isSuccess ? 'success' : 'error'} fadeIn`;
    resultMessage.classList.remove('hidden');
}

function hideResult() {
    resultMessage.classList.add('hidden');
}

// --- API Calls ---
async function handleExecution(actionType = currentAction) {
    const token = checkAuth();
    hideResult();
    
    const value1 = parseFloat(fromValueInput.value);
    const unit1 = fromUnitSelect.value;
    
    let value2 = parseFloat(toValueInput.value);
    const unit2 = toUnitSelect.value;
    
    if (isNaN(value1)) {
        showResult("Invalid value for the first operand.", false);
        return;
    }

    try {
        let endpoint = '';
        let body = {};

        if (actionType === 'conversion') {
            endpoint = '/api/measurement/convert';
            body = {
                Source: { Value: value1, Unit: unit1, MeasurementType: currentType },
                TargetUnit: unit2
            };
        } else if (actionType === 'comparison') {
            if (isNaN(value2)) { showResult("Invalid value for second operand.", false); return; }
            endpoint = '/api/measurement/compare';
            body = {
                Quantity1: { Value: value1, Unit: unit1, MeasurementType: currentType },
                Quantity2: { Value: value2, Unit: unit2, MeasurementType: currentType }
            };
        } else if (['add', 'subtract', 'multiply', 'divide'].includes(actionType)) {
            if (isNaN(value2)) { showResult("Invalid value for second operand.", false); return; }
            endpoint = `/api/measurement/${actionType}`;
            body = {
                Quantity1: { Value: value1, Unit: unit1, MeasurementType: currentType },
                Quantity2: { Value: value2, Unit: unit2, MeasurementType: currentType },
                TargetUnit: unit1 // Result in same unit as operand 1
            };
        }

        const response = await fetch(`${config.API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem('jwt_token');
                window.location.href = 'login.html';
                return;
            }
            const error = await response.text();
            throw new Error(error || 'Action failed.');
        }

        const data = await response.json();
        
        if (actionType === 'conversion') {
            toValueInput.value = data.value;
            showResult('Conversion successful!');
        } else if (actionType === 'comparison') {
            if (data.areEqual) {
                showResult('The quantities are Equal.', true);
            } else {
                showResult('The quantities are Not Equal.', false);
            }
        } else if (['add', 'subtract', 'multiply', 'divide'].includes(actionType)) {
            showResult(`Result: ${data.value} ${data.unit}`);
        }

    } catch (err) {
        showResult(err.message, false);
    }
}

// Boot up
document.addEventListener('DOMContentLoaded', init);
