// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// Main application initialization
function initApp() {
    // Set current date as default for date inputs
    setDefaultDates();
    
    // Initialize the theme (dark/light mode)
    initTheme();
    
    // Initialize tabs for add expense/income
    initTabs();
    
    // Initialize chart tabs
    initChartTabs();
    
    // Set up form submissions
    setupForms();
    
    // Set up transaction filters
    setupFilters();
    
    // Set up download buttons
    setupDownloadButtons();
    
    // Set up modals
    setupModals();
    
    // Set up budget functionality
    setupBudgetFunctionality();
    
    // Load and display data
    loadData();
}

// Data storage and management
const DATA_KEY = 'financial_tracker_data';
let appData = {
    transactions: [],
    budgets: []
};

// Save data to localStorage
function saveData() {
    localStorage.setItem(DATA_KEY, JSON.stringify(appData));
}

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem(DATA_KEY);
    if (savedData) {
        appData = JSON.parse(savedData);
        updateUI();
    }
}

// Update all UI elements with current data
function updateUI() {
    updateSummary();
    updateTransactionsTable();
    updateCharts();
    updateBudgets();
    updateCategoryFilters();
}

// Set default dates for forms
function setDefaultDates() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('expense-date').value = today;
    document.getElementById('income-date').value = today;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    document.getElementById('month-filter').value = currentMonth;
    
    const currentMonthYear = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
    document.getElementById('current-month-year').textContent = currentMonthYear;
}

// Theme management (dark/light mode)
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
    }
    
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i><span>Light Mode</span>';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i><span>Dark Mode</span>';
        }
        
        // Update charts when theme changes
        updateCharts();
    });
}

// Tab management for add expense/income
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

// Chart tab management
function initChartTabs() {
    const chartTabs = document.querySelectorAll('.chart-tab');
    const chartWrappers = document.querySelectorAll('.chart-wrapper');
    
    chartTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const chartType = tab.getAttribute('data-chart');
            
            // Remove active class from all tabs and wrappers
            chartTabs.forEach(t => t.classList.remove('active'));
            chartWrappers.forEach(w => w.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding wrapper
            tab.classList.add('active');
            document.getElementById(`${chartType}-chart-container`).classList.add('active');
        });
    });
}

// Form setup and submission handling
function setupForms() {
    // Expense form submission
    const expenseForm = document.getElementById('expense-form');
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const transaction = {
            id: generateId(),
            type: 'expense',
            description: document.getElementById('expense-description').value,
            amount: parseFloat(document.getElementById('expense-amount').value),
            category: document.getElementById('expense-category').value,
            date: document.getElementById('expense-date').value,
            timestamp: new Date().getTime()
        };
        
        appData.transactions.push(transaction);
        saveData();
        updateUI();
        
        // Reset form
        expenseForm.reset();
        setDefaultDates();
    });
    
    // Income form submission
    const incomeForm = document.getElementById('income-form');
    incomeForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const transaction = {
            id: generateId(),
            type: 'income',
            description: document.getElementById('income-description').value,
            amount: parseFloat(document.getElementById('income-amount').value),
            category: document.getElementById('income-category').value,
            date: document.getElementById('income-date').value,
            timestamp: new Date().getTime()
        };
        
        appData.transactions.push(transaction);
        saveData();
        updateUI();
        
        // Reset form
        incomeForm.reset();
        setDefaultDates();
    });
}

// Generate a unique ID for transactions
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Update summary cards with totals
function updateSummary() {
    const incomeTotal = appData.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenseTotal = appData.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = incomeTotal - expenseTotal;
    
    document.querySelector('.income-amount').textContent = formatCurrency(incomeTotal);
    document.querySelector('.expense-amount').textContent = formatCurrency(expenseTotal);
    document.querySelector('.balance-amount').textContent = formatCurrency(balance);
}

// Format number as currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Update transactions table with filtered data
function updateTransactionsTable() {
    const tbody = document.getElementById('transactions-body');
    const typeFilter = document.getElementById('type-filter').value;
    const categoryFilter = document.getElementById('category-filter').value;
    const monthFilter = document.getElementById('month-filter').value;
    
    // Filter transactions
    let filteredTransactions = [...appData.transactions];
    
    if (typeFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.type === typeFilter);
    }
    
    if (categoryFilter !== 'all') {
        filteredTransactions = filteredTransactions.filter(t => t.category === categoryFilter);
    }
    
    if (monthFilter) {
        filteredTransactions = filteredTransactions.filter(t => t.date.startsWith(monthFilter));
    }
    
    // Sort transactions by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Clear table
    tbody.innerHTML = '';
    
    // Add transactions to table or show empty state
    if (filteredTransactions.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="6">No transactions found</td>
            </tr>
        `;
    } else {
        filteredTransactions.forEach(transaction => {
            const tr = document.createElement('tr');
            
            // Format date for display
            const date = new Date(transaction.date);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            // Set row class based on transaction type
            tr.classList.add(transaction.type === 'income' ? 'income-row' : 'expense-row');
            
            tr.innerHTML = `
                <td>${formattedDate}</td>
                <td>${transaction.description}</td>
                <td>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</td>
                <td>${transaction.category}</td>
                <td style="color: ${transaction.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)'}">
                    ${transaction.type === 'income' ? '+' : '-'} ${formatCurrency(transaction.amount).slice(1)}
                </td>
                <td class="transaction-actions">
                    <button class="edit-btn" data-id="${transaction.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete-transaction-btn" data-id="${transaction.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                openEditModal(id);
            });
        });
        
        document.querySelectorAll('.delete-transaction-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                deleteTransaction(id);
            });
        });
    }
}

// Update category filters with available categories
function updateCategoryFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const editCategorySelect = document.getElementById('edit-category');
    const budgetCategorySelect = document.getElementById('budget-category');
    
    // Get unique categories from transactions
    const incomeCategories = [...new Set(appData.transactions
        .filter(t => t.type === 'income')
        .map(t => t.category))];
    
    const expenseCategories = [...new Set(appData.transactions
        .filter(t => t.type === 'expense')
        .map(t => t.category))];
    
    // Default expense categories
    const defaultExpenseCategories = [
        'Food', 'Housing', 'Transportation', 'Entertainment', 
        'Utilities', 'Healthcare', 'Personal', 'Education', 'Other'
    ];
    
    // Default income categories
    const defaultIncomeCategories = [
        'Salary', 'Freelance', 'Investments', 'Gifts', 'Other'
    ];
    
    // Combine default and user categories
    const allExpenseCategories = [...new Set([...defaultExpenseCategories, ...expenseCategories])];
    const allIncomeCategories = [...new Set([...defaultIncomeCategories, ...incomeCategories])];
    
    // Update category filter
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    allIncomeCategories.forEach(category => {
        categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
    });
    
    allExpenseCategories.forEach(category => {
        if (!allIncomeCategories.includes(category)) {
            categoryFilter.innerHTML += `<option value="${category}">${category}</option>`;
        }
    });
    
    // Update edit category select
    if (editCategorySelect) {
        editCategorySelect.innerHTML = '';
        
        // Add appropriate categories based on transaction type
        const editingTransactionId = document.getElementById('edit-id').value;
        const editingTransaction = appData.transactions.find(t => t.id === editingTransactionId);
        
        if (editingTransaction) {
            const categories = editingTransaction.type === 'income' 
                ? allIncomeCategories 
                : allExpenseCategories;
            
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                editCategorySelect.appendChild(option);
            });
        }
    }
    
    // Update budget category select
    if (budgetCategorySelect) {
        budgetCategorySelect.innerHTML = '';
        
        allExpenseCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            budgetCategorySelect.appendChild(option);
        });
    }
}

// Set up transaction filters
function setupFilters() {
    const typeFilter = document.getElementById('type-filter');
    const categoryFilter = document.getElementById('category-filter');
    const monthFilter = document.getElementById('month-filter');
    
    typeFilter.addEventListener('change', updateTransactionsTable);
    categoryFilter.addEventListener('change', updateTransactionsTable);
    monthFilter.addEventListener('change', updateTransactionsTable);
}

// Set up download buttons
function setupDownloadButtons() {
    const downloadJsonBtn = document.getElementById('download-json');
    const downloadTxtBtn = document.getElementById('download-txt');
    
    downloadJsonBtn.addEventListener('click', () => {
        downloadData('json');
    });
    
    downloadTxtBtn.addEventListener('click', () => {
        downloadData('txt');
    });
}

// Download data in specified format
function downloadData(format) {
    let content, filename, mimeType;
    
    if (format === 'json') {
        content = JSON.stringify(appData, null, 2);
        filename = 'financial_data.json';
        mimeType = 'application/json';
    } else {
        // Create text format
        const incomeTotal = appData.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenseTotal = appData.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const balance = incomeTotal - expenseTotal;
        
        content = 'FINANCIAL TRACKER SUMMARY\n';
        content += '=======================\n\n';
        content += `Total Income: ${formatCurrency(incomeTotal)}\n`;
        content += `Total Expenses: ${formatCurrency(expenseTotal)}\n`;
        content += `Balance: ${formatCurrency(balance)}\n\n`;
        content += 'TRANSACTIONS\n';
        content += '===========\n\n';
        
        appData.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        appData.transactions.forEach(t => {
            content += `Date: ${t.date}\n`;
            content += `Type: ${t.type.charAt(0).toUpperCase() + t.type.slice(1)}\n`;
            content += `Description: ${t.description}\n`;
            content += `Category: ${t.category}\n`;
            content += `Amount: ${formatCurrency(t.amount)}\n\n`;
        });
        
        if (appData.budgets.length > 0) {
            content += 'BUDGETS\n';
            content += '=======\n\n';
            
            appData.budgets.forEach(b => {
                content += `Category: ${b.category}\n`;
                content += `Monthly Limit: ${formatCurrency(b.amount)}\n\n`;
            });
        }
        
        filename = 'financial_data.txt';
        mimeType = 'text/plain';
    }
    
    // Create download link
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Set up modals
function setupModals() {
    const editModal = document.getElementById('edit-modal');
    const budgetModal = document.getElementById('budget-modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Close modal when clicking close button
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            editModal.style.display = 'none';
            budgetModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
        if (e.target === budgetModal) {
            budgetModal.style.display = 'none';
        }
    });
    
    // Set up edit form submission
    const editForm = document.getElementById('edit-form');
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const id = document.getElementById('edit-id').value;
        const transaction = appData.transactions.find(t => t.id === id);
        
        if (transaction) {
            transaction.description = document.getElementById('edit-description').value;
            transaction.amount = parseFloat(document.getElementById('edit-amount').value);
            transaction.category = document.getElementById('edit-category').value;
            transaction.date = document.getElementById('edit-date').value;
            
            saveData();
            updateUI();
            editModal.style.display = 'none';
        }
    });
    
    // Set up delete button in edit modal
    const deleteBtn = document.getElementById('delete-transaction');
    deleteBtn.addEventListener('click', () => {
        const id = document.getElementById('edit-id').value;
        deleteTransaction(id);
        editModal.style.display = 'none';
    });
}

// Open edit modal for a transaction
function openEditModal(id) {
    const transaction = appData.transactions.find(t => t.id === id);
    
    if (transaction) {
        document.getElementById('edit-id').value = id;
        document.getElementById('edit-description').value = transaction.description;
        document.getElementById('edit-amount').value = transaction.amount;
        document.getElementById('edit-date').value = transaction.date;
        
        // Update category options based on transaction type
        updateCategoryFilters();
        
        // Set selected category
        document.getElementById('edit-category').value = transaction.category;
        
        // Show modal
        document.getElementById('edit-modal').style.display = 'flex';
    }
}

// Delete a transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        appData.transactions = appData.transactions.filter(t => t.id !== id);
        saveData();
        updateUI();
    }
}

// Set up budget functionality
function setupBudgetFunctionality() {
    const addBudgetBtn = document.getElementById('add-budget');
    const budgetModal = document.getElementById('budget-modal');
    const budgetForm = document.getElementById('budget-form');
    
    addBudgetBtn.addEventListener('click', () => {
        updateCategoryFilters();
        budgetModal.style.display = 'flex';
    });
    
    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const category = document.getElementById('budget-category').value;
        const amount = parseFloat(document.getElementById('budget-amount').value);
        
        // Check if budget for this category already exists
        const existingBudgetIndex = appData.budgets.findIndex(b => b.category === category);
        
        if (existingBudgetIndex !== -1) {
            // Update existing budget
            appData.budgets[existingBudgetIndex].amount = amount;
        } else {
            // Add new budget
            appData.budgets.push({
                category,
                amount
            });
        }
        
        saveData();
        updateBudgets();
        budgetModal.style.display = 'none';
        budgetForm.reset();
    });
}

// Update budgets display
function updateBudgets() {
    const budgetList = document.getElementById('budget-list');
    
    if (appData.budgets.length === 0) {
        budgetList.innerHTML = '<div class="empty-state">No budgets set. Add a budget to get started.</div>';
        return;
    }
    
    budgetList.innerHTML = '';
    
    appData.budgets.forEach(budget => {
        // Calculate spent amount for this category in current month
        const currentMonth = new Date().toISOString().slice(0, 7);
        const spent = appData.transactions
            .filter(t => t.type === 'expense' && t.category === budget.category && t.date.startsWith(currentMonth))
            .reduce((sum, t) => sum + t.amount, 0);
        
        // Calculate percentage
        const percentage = Math.min(Math.round((spent / budget.amount) * 100), 100);
        
        // Determine color based on percentage
        let color = 'var(--primary-color)';
        if (percentage >= 80) {
            color = 'var(--expense-color)';
        } else if (percentage >= 60) {
            color = 'orange';
        }
        
        const budgetItem = document.createElement('div');
        budgetItem.className = 'budget-item';
        budgetItem.innerHTML = `
            <div class="budget-header">
                <div class="budget-category">${budget.category}</div>
                <div>${formatCurrency(spent)} / ${formatCurrency(budget.amount)}</div>
            </div>
            <div class="budget-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%; background-color: ${color}"></div>
                </div>
            </div>
            <div class="budget-stats">
                <div>${percentage}% used</div>
                <div>${formatCurrency(budget.amount - spent)} remaining</div>
            </div>
        `;
        
        budgetList.appendChild(budgetItem);
    });
}

// Update all charts
function updateCharts() {
    updateBarChart();
    updatePieCharts();
    updateLineChart();
}

// Update bar chart
function updateBarChart() {
    const ctx = document.getElementById('bar-chart').getContext('2d');
    
    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    
    // Filter transactions for current month
    const monthTransactions = appData.transactions.filter(t => t.date.startsWith(currentMonth));
    
    // Get categories
    const incomeCategories = [...new Set(monthTransactions
        .filter(t => t.type === 'income')
        .map(t => t.category))];
    
    const expenseCategories = [...new Set(monthTransactions
        .filter(t => t.type === 'expense')
        .map(t => t.category))];
    
    // Calculate totals by category
    const incomeData = incomeCategories.map(category => {
        return monthTransactions
            .filter(t => t.type === 'income' && t.category === category)
            .reduce((sum, t) => sum + t.amount, 0);
    });
    
    const expenseData = expenseCategories.map(category => {
        return monthTransactions
            .filter(t => t.type === 'expense' && t.category === category)
            .reduce((sum, t) => sum + t.amount, 0);
    });
    
    // Get theme colors
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#f1f5f9' : '#1e293b';
    const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
    
    // Destroy previous chart if it exists
    if (window.barChart) {
        window.barChart.destroy();
    }
    
    // Create new chart
    window.barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [...incomeCategories, ...expenseCategories],
            datasets: [
                {
                    label: 'Income',
                    data: [...incomeData, ...Array(expenseCategories.length).fill(0)],
                    backgroundColor: 'rgba(34, 197, 94, 0.7)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Expenses',
                    data: [...Array(incomeCategories.length).fill(0), ...expenseData],
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: 'rgba(239, 68, 68, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                },
                x: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            }
        }
    });
}

// Update pie charts
function updatePieCharts() {
    const incomeCtx = document.getElementById('income-pie-chart').getContext('2d');
    const expenseCtx = document.getElementById('expense-pie-chart').getContext('2d');
    
    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().slice(0, 7);
    
    // Filter transactions for current month
    const monthTransactions = appData.transactions.filter(t => t.date.startsWith(currentMonth));
    
    // Get income data
    const incomeByCategory = {};
    monthTransactions
        .filter(t => t.type === 'income')
        .forEach(t => {
            if (!incomeByCategory[t.category]) {
                incomeByCategory[t.category] = 0;
            }
            incomeByCategory[t.category] += t.amount;
        });
    
    // Get expense data
    const expenseByCategory = {};
    monthTransactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (!expenseByCategory[t.category]) {
                expenseByCategory[t.category] = 0;
            }
            expenseByCategory[t.category] += t.amount;
        });
    
    // Get theme colors
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#f1f5f9' : '#1e293b';
    
    // Generate colors for pie charts
    function generateColors(count) {
        const colors = [];
        const hueStep = 360 / count;
        
        for (let i = 0; i < count; i++) {
            const hue = i * hueStep;
            colors.push(`hsla(${hue}, 70%, 60%, 0.8)`);
        }
        
        return colors;
    }
    
    // Destroy previous charts if they exist
    if (window.incomePieChart) {
        window.incomePieChart.destroy();
    }
    
    if (window.expensePieChart) {
        window.expensePieChart.destroy();
    }
    
    // Create income pie chart
    const incomeCategories = Object.keys(incomeByCategory);
    const incomeValues = Object.values(incomeByCategory);
    
    if (incomeCategories.length > 0) {
        window.incomePieChart = new Chart(incomeCtx, {
            type: 'pie',
            data: {
                labels: incomeCategories,
                datasets: [{
                    data: incomeValues,
                    backgroundColor: generateColors(incomeCategories.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: textColor
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } else {
        // No income data
        incomeCtx.font = '14px Arial';
        incomeCtx.fillStyle = textColor;
        incomeCtx.textAlign = 'center';
        incomeCtx.fillText('No income data for this month', incomeCtx.canvas.width / 2, incomeCtx.canvas.height / 2);
    }
    
    // Create expense pie chart
    const expenseCategories = Object.keys(expenseByCategory);
    const expenseValues = Object.values(expenseByCategory);
    
    if (expenseCategories.length > 0) {
        window.expensePieChart = new Chart(expenseCtx, {
            type: 'pie',
            data: {
                labels: expenseCategories,
                datasets: [{
                    data: expenseValues,
                    backgroundColor: generateColors(expenseCategories.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: textColor
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } else {
        // No expense data
        expenseCtx.font = '14px Arial';
        expenseCtx.fillStyle = textColor;
        expenseCtx.textAlign = 'center';
        expenseCtx.fillText('No expense data for this month', expenseCtx.canvas.width / 2, expenseCtx.canvas.height / 2);
    }
}

// Update line chart
function updateLineChart() {
    const ctx = document.getElementById('line-chart').getContext('2d');
    
    // Get current year
    const currentYear = new Date().getFullYear();
        // Filter transactions for current year
    const yearTransactions = appData.transactions.filter(t => t.date.startsWith(currentYear));
    
    // Initialize monthly totals
    const monthlyIncome = Array(12).fill(0);
    const monthlyExpenses = Array(12).fill(0);
    
    // Calculate monthly totals
    yearTransactions.forEach(t => {
        const month = parseInt(t.date.split('-')[1]) - 1; // Convert to 0-based index
        if (t.type === 'income') {
            monthlyIncome[month] += t.amount;
        } else {
            monthlyExpenses[month] += t.amount;
        }
    });
    
    // Get theme colors
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#f1f5f9' : '#1e293b';
    const gridColor = isDarkMode ? '#334155' : '#e2e8f0';
    
    // Month labels
    const monthLabels = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    // Destroy previous chart if it exists
    if (window.lineChart) {
        window.lineChart.destroy();
    }
    
    // Create new chart
    window.lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: monthLabels,
            datasets: [
                {
                    label: 'Income',
                    data: monthlyIncome,
                    borderColor: 'rgba(34, 197, 94, 1)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Expenses',
                    data: monthlyExpenses,
                    borderColor: 'rgba(239, 68, 68, 1)',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                },
                x: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                        }
                    }
                }
            }
        }
    });
}

// Export functions for testing or external use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initApp,
        saveData,
        loadData,
        updateUI,
        formatCurrency,
        generateId,
        // Add other functions as needed
    };
}