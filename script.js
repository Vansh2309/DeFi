// Application State
let state = {
    balance: 0,
    interest: 0,
    transactionCount: 0,
    transactions: [],
    walletConnected: false,
    lastUpdateTime: 0,
};

// DOM Elements
const connectBtn = document.getElementById('connectBtn');
const depositBtn = document.getElementById('depositBtn');
const withdrawBtn = document.getElementById('withdrawBtn');
const balanceDisplay = document.getElementById('balanceDisplay');
const interestDisplay = document.getElementById('interestDisplay');
const totalDisplay = document.getElementById('totalDisplay');
const depositAmount = document.getElementById('depositAmount');
const withdrawAmount = document.getElementById('withdrawAmount');
const depositMessage = document.getElementById('depositMessage');
const withdrawMessage = document.getElementById('withdrawMessage');
const loadingScreen = document.getElementById('loadingScreen');
const toggleStats = document.getElementById('toggleStats');
const statsGrid = document.getElementById('statsGrid');
const transactionHistory = document.getElementById('transactionHistory');
const transactionCounter = document.getElementById('transactionCounter');
const totalTransactionsDisplay = document.getElementById('totalTransactions');

// Event Listeners
connectBtn.addEventListener('click', connectWallet);
depositBtn.addEventListener('click', deposit);
withdrawBtn.addEventListener('click', withdraw);
toggleStats.addEventListener('click', toggleStatsDisplay);

// Wallet Connection
function connectWallet() {
    showLoading();
    setTimeout(() => {
        state.walletConnected = true;
        hideLoading();
        connectBtn.textContent = '✅ Wallet Connected';
        connectBtn.disabled = true;
        connectBtn.style.opacity = '0.7';
        showMessage(depositMessage, 'success', '🎉 Wallet connected successfully!');
    }, 2000);
}

// Show Loading Screen
function showLoading() {
    loadingScreen.classList.remove('hidden');
}

// Hide Loading Screen
function hideLoading() {
    loadingScreen.classList.add('hidden');
}

// Deposit Function
function deposit() {
    if (!state.walletConnected) {
        showMessage(depositMessage, 'error', '❌ Please connect your wallet first!');
        return;
    }

    const amount = parseFloat(depositAmount.value);

    if (!amount || amount <= 0) {
        showMessage(depositMessage, 'error', '❌ Please enter a valid amount!');
        return;
    }

    if (amount > 10) {
        showMessage(depositMessage, 'error', '❌ Maximum deposit is 10 ETH!');
        return;
    }

    state.balance += amount;
    state.transactionCount++;

    const transaction = {
        type: 'Deposit',
        amount: amount,
        time: new Date().toLocaleTimeString(),
        icon: '📤'
    };

    state.transactions.unshift(transaction);

    depositAmount.value = '';
    showMessage(depositMessage, 'success', `✅ Successfully deposited ${amount} ETH!`);
    updateDisplay();
    updateTransactionHistory();
}

// Withdraw Function
function withdraw() {
    if (!state.walletConnected) {
        showMessage(withdrawMessage, 'error', '❌ Please connect your wallet first!');
        return;
    }

    const amount = parseFloat(withdrawAmount.value);
    const availableBalance = state.balance + state.interest;

    if (!amount || amount <= 0) {
        showMessage(withdrawMessage, 'error', '❌ Please enter a valid amount!');
        return;
    }

    if (amount > availableBalance) {
        showMessage(withdrawMessage, 'error', `❌ Insufficient balance! Available: ${availableBalance.toFixed(4)} ETH`);
        return;
    }

    // Withdraw from interest first, then balance
    if (amount <= state.interest) {
        state.interest -= amount;
    } else {
        const remaining = amount - state.interest;
        state.interest = 0;
        state.balance = Math.max(0, state.balance - remaining);
    }

    state.transactionCount++;

    const transaction = {
        type: 'Withdraw',
        amount: amount,
        time: new Date().toLocaleTimeString(),
        icon: '📥'
    };

    state.transactions.unshift(transaction);

    withdrawAmount.value = '';
    showMessage(withdrawMessage, 'success', `✅ Successfully withdrew ${amount} ETH!`);
    updateDisplay();
    updateTransactionHistory();
}

// Show Message
function showMessage(element, type, text) {
    element.textContent = text;
    element.className = `message ${type}`;

    setTimeout(() => {
        element.classList.add('hidden');
    }, 5000);
}

// Update Display (Every 100ms for smooth updates)
function updateDisplay() {
    if (state.walletConnected) {
        // Calculate interest (0.5% per second for demo purposes)
        const currentTime = Date.now();
        if (currentTime - state.lastUpdateTime >= 100) {
            const secondsElapsed = (currentTime - state.lastUpdateTime) / 1000;
            state.interest += state.balance * 0.005 * secondsElapsed / 60; // 0.5% every 60 seconds
            state.lastUpdateTime = currentTime;
        }
    }

    const totalValue = state.balance + state.interest;
    balanceDisplay.textContent = `${state.balance.toFixed(4)} ETH`;
    interestDisplay.textContent = `${state.interest.toFixed(4)} ETH`;
    totalDisplay.textContent = `${totalValue.toFixed(4)} ETH`;
    transactionCounter.textContent = state.transactionCount;
    totalTransactionsDisplay.textContent = state.transactionCount;
}

// Update Transaction History
function updateTransactionHistory() {
    transactionHistory.innerHTML = '';

    if (state.transactions.length === 0) {
        transactionHistory.innerHTML = '<p class="empty-state">No transactions yet. Start by depositing some ETH!</p>';
        return;
    }

    state.transactions.slice(0, 10).forEach((tx, index) => {
        const item = document.createElement('div');
        item.className = 'transaction-item';
        item.innerHTML = `
            <span>
                <span class="icon">${tx.icon}</span>
                <strong>${tx.type}</strong> - ${tx.amount.toFixed(4)} ETH
            </span>
            <span>${tx.time}</span>
        `;
        transactionHistory.appendChild(item);
    });
}

// Toggle Stats Display
function toggleStatsDisplay() {
    statsGrid.classList.toggle('hidden');
    toggleStats.textContent = statsGrid.classList.contains('hidden') ? 'View Stats' : 'Hide Stats';
}

// Smooth Interest Updates - 100ms interval for premium feel
setInterval(() => {
    updateDisplay();
}, 100);

// Initial Display
updateDisplay();