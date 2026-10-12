// Quản lý Trạng thái State Máy tính
const state = {
    currentVal: '0',       // Giá trị hiện tại đang hiển thị
    prevVal: null,         // Giá trị trước đó đã lưu
    operator: null,        // Toán tử đang đợi xử lý (+, -, *, /)
    formula: '',           // Chuỗi biểu thức công thức hiển thị
    isResetOnNextKey: false // Có reset màn hình khi gõ phím tiếp theo không (sau khi nhấn bằng)
};

// Cấu hình DOM Elements
const formulaDisplay = document.getElementById('formulaDisplay');
const resultDisplay = document.getElementById('resultDisplay');
const historySidebar = document.getElementById('historySidebar');
const historyList = document.getElementById('historyList');
const toggleHistoryBtn = document.getElementById('toggleHistoryBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Đăng ký sự kiện
document.addEventListener('DOMContentLoaded', () => {
    initHistory();
    setupKeypadListeners();
    setupKeyboardListeners();
    setupSidebarListeners();
});

// 1. CHỨC NĂNG CORE ENGINE & GIẢI QUYẾT SAI SỐ PHÉP TÍNH FLOATING POINT
function calculate(a, b, op) {
    const num1 = parseFloat(a);
    const num2 = parseFloat(b);
    if (isNaN(num1) || isNaN(num2)) return '0';

    let result = 0;
    switch (op) {
        case '+':
            result = num1 + num2;
            break;
        case '-':
            result = num1 - num2;
            break;
        case '*':
            result = num1 * num2;
            break;
        case '/':
            if (num2 === 0) {
                return 'Error: Division by zero';
            }
            result = num1 / num2;
            break;
        default:
            return num2.toString();
    }

    // Xử lý làm tròn để triệt tiêu sai số Javascript Floating Point (ví dụ: 0.1 + 0.2)
    return parseFloat(result.toFixed(12)).toString();
}

// Cập nhật giao diện màn hình hiển thị
function updateScreen() {
    resultDisplay.innerText = formatDisplayValue(state.currentVal);
    formulaDisplay.innerText = state.formula;
    
    // Tự động thu nhỏ font chữ nếu số quá dài để tránh tràn màn hình
    const len = resultDisplay.innerText.length;
    if (len > 12) {
        resultDisplay.style.fontSize = '24px';
    } else if (len > 8) {
        resultDisplay.style.fontSize = '30px';
    } else {
        resultDisplay.style.fontSize = '38px';
    }
}

// Định dạng hiển thị dấu phẩy phân tách hàng nghìn (đối với phần nguyên)
function formatDisplayValue(val) {
    if (val === 'Error: Division by zero') return val;
    if (val === 'Error') return val;

    const parts = val.split('.');
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 ? '.' + parts[1] : '';

    // Thêm dấu phẩy phân tách
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return integerPart + decimalPart;
}

// Xử lý sự kiện nhấn nút số và dấu chấm
function handleNumber(num) {
    if (state.currentVal === 'Error: Division by zero' || state.currentVal === 'Error') {
        allClear();
    }

    if (state.isResetOnNextKey) {
        state.currentVal = '';
        state.isResetOnNextKey = false;
    }

    // Xử lý dấu chấm thập phân
    if (num === '.') {
        if (state.currentVal.includes('.')) return; // Chặn nhập > 1 dấu chấm thập phân
        if (state.currentVal === '') state.currentVal = '0';
    }

    // Tránh việc hiển thị nhiều số 0 vô nghĩa ở đầu
    if (state.currentVal === '0' && num !== '.') {
        state.currentVal = num;
    } else {
        state.currentVal += num;
    }

    updateScreen();
}

// Xử lý sự kiện chọn Toán tử
function handleOperator(nextOp) {
    if (state.currentVal === 'Error: Division by zero' || state.currentVal === 'Error') return;

    const formattedOp = getOperatorSymbol(nextOp);

    if (state.operator && !state.isResetOnNextKey && state.currentVal !== '') {
        // Thực hiện tính trung gian trước khi gán toán tử mới
        const res = calculate(state.prevVal, state.currentVal, state.operator);
        if (res === 'Error: Division by zero') {
            triggerError(res);
            return;
        }
        state.prevVal = res;
        state.currentVal = '';
        state.formula = `${formatDisplayValue(res)} ${formattedOp} `;
    } else {
        // Lần đầu gõ toán tử
        state.prevVal = state.currentVal;
        state.formula = `${formatDisplayValue(state.currentVal)} ${formattedOp} `;
        state.currentVal = '';
    }

    state.operator = nextOp;
    state.isResetOnNextKey = false;
    updateScreen();
}

// Xử lý kết quả bằng '='
function handleEquals() {
    if (!state.operator || state.currentVal === '') return;

    const val1 = state.prevVal;
    const val2 = state.currentVal;
    const op = state.operator;

    const result = calculate(val1, val2, op);

    if (result === 'Error: Division by zero') {
        triggerError(result);
        return;
    }

    const currentFormula = `${formatDisplayValue(val1)} ${getOperatorSymbol(op)} ${formatDisplayValue(val2)} =`;
    state.formula = currentFormula;
    state.currentVal = result;
    state.prevVal = null;
    state.operator = null;
    state.isResetOnNextKey = true;

    updateScreen();
    saveToHistory(currentFormula, result);
}

// Các chức năng tiện ích khác
function allClear() {
    state.currentVal = '0';
    state.prevVal = null;
    state.operator = null;
    state.formula = '';
    state.isResetOnNextKey = false;
    updateScreen();
}

function deleteChar() {
    if (state.currentVal === 'Error: Division by zero' || state.currentVal === 'Error') {
        allClear();
        return;
    }
    if (state.isResetOnNextKey) {
        state.formula = '';
        return;
    }
    if (state.currentVal.length > 1) {
        state.currentVal = state.currentVal.slice(0, -1);
    } else {
        state.currentVal = '0';
    }
    updateScreen();
}

function handlePercent() {
    if (state.currentVal === 'Error: Division by zero' || state.currentVal === 'Error') return;
    const val = parseFloat(state.currentVal);
    state.currentVal = (val / 100).toString();
    updateScreen();
}

function handleNegate() {
    if (state.currentVal === 'Error: Division by zero' || state.currentVal === 'Error') return;
    const val = parseFloat(state.currentVal);
    state.currentVal = (val * -1).toString();
    updateScreen();
}

function triggerError(errMsg) {
    state.currentVal = errMsg;
    state.formula = '';
    state.prevVal = null;
    state.operator = null;
    state.isResetOnNextKey = true;
    updateScreen();
}

function getOperatorSymbol(op) {
    if (op === '*') return '×';
    if (op === '/') return '÷';
    return op;
}

// 2. KẾT NỐI BÀN PHÍM VẬT LÝ (KEYBOARD LISTENERS)
function setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => {
        let key = e.key;

        // Map phím tắt
        if (key === 'Enter') key = '=';
        if (key === 'Escape') key = 'Escape'; // AC
        if (key === 'Backspace') key = 'Backspace'; // DEL
        if (key === ',') key = '.';

        // Tìm nút bấm tương ứng trên giao diện để kích hoạt hiệu ứng active
        let btnToHighlight = null;

        if (/[0-9.]/.test(key)) {
            handleNumber(key);
            btnToHighlight = document.querySelector(`button[data-val="${key}"]`);
        } else if (['+', '-', '*', '/'].includes(key)) {
            handleOperator(key);
            btnToHighlight = document.querySelector(`button[data-action="operator"][data-val="${key}"]`);
        } else if (key === '=') {
            handleEquals();
            btnToHighlight = document.getElementById('equalsBtn');
        } else if (key === 'Backspace') {
            deleteChar();
            btnToHighlight = document.querySelector('button[data-action="delete"]');
        } else if (key === 'Escape') {
            allClear();
            btnToHighlight = document.querySelector('button[data-action="all-clear"]');
        } else if (key === '%') {
            handlePercent();
            btnToHighlight = document.querySelector('button[data-action="percent"]');
        }

        // Tạo hiệu ứng click nhấp nháy trực quan khi nhấn phím cứng
        if (btnToHighlight) {
            btnToHighlight.classList.add('keyboard-active');
            setTimeout(() => {
                btnToHighlight.classList.remove('keyboard-active');
            }, 100);
        }
    });
}

// 3. ĐĂNG KÝ SỰ KIỆN CLICK BÀN PHÍM ẢO
function setupKeypadListeners() {
    const buttons = document.querySelectorAll('.btn, #equalsBtn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const val = button.getAttribute('data-val');
            const action = button.getAttribute('data-action');

            if (val && !action) {
                handleNumber(val);
            } else if (action === 'operator') {
                handleOperator(val);
            } else if (button.id === 'equalsBtn') {
                handleEquals();
            } else if (action === 'all-clear') {
                allClear();
            } else if (action === 'delete') {
                deleteChar();
            } else if (action === 'percent') {
                handlePercent();
            } else if (action === 'negate') {
                handleNegate();
            }
        });
    });
}

// 4. LƯU TRỮ & QUẢN LÝ LỊCH SỬ TÍNH TOÁN (LOCAL STORAGE)
function initHistory() {
    renderHistory();
}

function setupSidebarListeners() {
    toggleHistoryBtn.addEventListener('click', () => {
        historySidebar.classList.toggle('collapsed');
    });

    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem('calc_history');
        renderHistory();
    });
}

function saveToHistory(formula, result) {
    let history = JSON.parse(localStorage.getItem('calc_history')) || [];
    // Chỉ lưu tối đa 10 dòng gần nhất
    history.unshift({ formula, result });
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    localStorage.setItem('calc_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('calc_history')) || [];
    historyList.innerHTML = '';

    if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-history">Chưa có dữ liệu tính toán</div>';
        return;
    }

    history.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
            <div class="history-item-formula">${item.formula}</div>
            <div class="history-item-result">${formatDisplayValue(item.result)}</div>
        `;

        // Click vào một dòng lịch sử cũ để tái sử dụng kết quả đó
        div.addEventListener('click', () => {
            state.currentVal = item.result;
            state.formula = '';
            state.isResetOnNextKey = false;
            updateScreen();
        });

        historyList.appendChild(div);
    });
}
```

---