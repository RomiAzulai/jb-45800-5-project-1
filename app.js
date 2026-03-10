function drawMenu() {
    document.getElementById('menu').innerHTML = `
        <a href="home.html">Home</a>
        <a href="filters.html">Filters</a>
        <a href="graphs.html">Graphs</a>
        <a href="about.html">About</a>
    `
}

drawMenu()
//----------------------------

// Storage key for localStorage
const STORAGE_KEY = 'expenses';

// Keep track of which expense is being edited
let editingExpenseId = null;

// ===== VALIDATION FUNCTIONS =====

// Validate all form inputs
function validateForm() {
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const date = document.getElementById('date').value;
    
    // Check if category is selected
    if (!category) {
        showError('Please select a category');
        return false;
    }
    
    // Check if category is "other" and description is required
    if (category === 'other' && !description.trim()) {
        showError('Description is required when selecting "Other" category');
        return false;
    }
    
    // Check if amount is provided
    if (!amount) {
        showError('Please enter an amount');
        return false;
    }
    
    // Check if amount is positive
    if (parseFloat(amount) <= 0) {
        showError('Amount must be greater than 0');
        return false;
    }
    
    // Check if amount is not over 100,000
    if (parseFloat(amount) > 100000) {
        showError('Amount cannot exceed 100,000');
        return false;
    }
    
    // Check if date is provided
    if (!date) {
        showError('Please select a date');
        return false;
    }
    
    // Check if date is not in the future
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set time to midnight for comparison
    
    if (selectedDate > today) {
        showError('The date cannot be in the future. Please select today or a past date');
        return false;
    }
    
    return true;
}

// ===== MESSAGE FUNCTIONS =====

// Show success message
function showMessage(text) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = 'success';
    
    // Hide the message after 3 seconds
    setTimeout(function() {
        messageDiv.textContent = '';
        messageDiv.className = '';
    }, 3000);
}

// Show error message
function showError(text) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = text;
    errorDiv.className = 'error';
    
    // Hide the message after 4 seconds
    setTimeout(function() {
        errorDiv.textContent = '';
        errorDiv.className = '';
    }, 4000);
}

// ===== STORAGE FUNCTIONS =====

// Get all expenses from localStorage
function getAllExpenses() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

// Save all expenses to localStorage
function saveAllExpenses(expenses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
}

// Add or update an expense
function saveExpense(expense) {
    let expenses = getAllExpenses();
    
    if (editingExpenseId) {
        // Update existing expense
        const index = expenses.findIndex(e => e.id === editingExpenseId);
        if (index !== -1) {
            expenses[index] = expense;
        }
        editingExpenseId = null;
    } else {
        // Add new expense
        expenses.push(expense);
    }
    
    saveAllExpenses(expenses);
}

// Delete an expense by ID
function deleteExpense(id) {
    let expenses = getAllExpenses();
    expenses = expenses.filter(e => e.id !== id);
    saveAllExpenses(expenses);
}

// ===== FORM HANDLING =====

// Handle form submission
function handleExpenseForm() {
    const form = document.getElementById('expenseForm');
    if (!form) return; // Form not on this page
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return; // Stop if validation fails
        }
        
        // Get form values
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const amount = document.getElementById('amount').value;
        const date = document.getElementById('date').value;
        
        // Create expense object
        const expense = {
            id: editingExpenseId || Date.now(), // Use existing ID if updating
            category: category,
            description: description,
            amount: parseFloat(amount),
            date: date
        };
        
        // Save the expense
        saveExpense(expense);
        
        // Show success message
        if (editingExpenseId) {
            showMessage('Expense updated successfully!');
        } else {
            showMessage('Expense added successfully!');
        }
        
        // Reset form and variables
        form.reset();
        editingExpenseId = null;
        document.getElementById('submitBtn').textContent = 'Add Expense';
        
        // Refresh the table
        displayExpenses();
    });
}

// ===== TABLE FUNCTIONS =====

// Display all expenses in the table
function displayExpenses() {
    const expenses = getAllExpenses();
    const table = document.getElementById('expensesTable');
    const tbody = document.getElementById('expensesBody');
    const noExpenses = document.getElementById('noExpenses');
    
    // If elements don't exist on this page, return early
    if (!table || !tbody || !noExpenses) {
        return;
    }
    
    // Clear the table body
    tbody.innerHTML = '';
    
    if (expenses.length === 0) {
        // Show "no expenses" message
        table.classList.add('hidden');
        noExpenses.classList.remove('hidden');
    } else {
        // Hide "no expenses" message and show table
        table.classList.remove('hidden');
        noExpenses.classList.add('hidden');
        
        // Add each expense as a row
        expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.date}</td>
                <td>${capitalizeFirstLetter(expense.category)}</td>
                <td>${expense.description || '-'}</td>
                <td>$${parseFloat(expense.amount).toFixed(2)}</td>
                <td class="actions">
                    <button class="update-btn" onclick="editExpense(${expense.id})">Update</button>
                    <button class="delete-btn" onclick="confirmDelete(${expense.id})">Delete</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Load an expense into the form for editing
function editExpense(id) {
    const expenses = getAllExpenses();
    const expense = expenses.find(e => e.id === id);
    
    if (!expense) return;
    
    // Fill the form with expense data
    document.getElementById('category').value = expense.category;
    document.getElementById('description').value = expense.description;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('date').value = expense.date;
    
    // Update editing state
    editingExpenseId = id;
    document.getElementById('submitBtn').textContent = 'Update Expense';
    
    // Scroll to form
    document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
}

// Confirm deletion
function confirmDelete(id) {
    if (confirm('Are you sure you want to delete this expense?')) {
        deleteExpense(id);
        showMessage('Expense deleted successfully!');
        displayExpenses();
    }
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// ===== FILTER FUNCTIONS =====

// Get unique years from expenses
function getUniqueYears() {
    const expenses = getAllExpenses();
    const years = new Set();
    
    for (const expense of expenses) {
        const year = expense.date.split('-')[0]; // Extract year from YYYY-MM-DD
        years.add(year);
    }
    
    return Array.from(years).sort().reverse(); // Sort in descending order
}

// Get unique months for a specific year
function getMonthsForYear(year) {
    const expenses = getAllExpenses();
    const months = new Set();
    
    for (const expense of expenses) {
        if (expense.date.startsWith(year)) {
            const month = expense.date.split('-')[1]; // Extract month from YYYY-MM-DD
            months.add(month);
        }
    }
    
    return Array.from(months).sort();
}

// Get unique days for a specific year and month
function getDaysForYearMonth(year, month) {
    const expenses = getAllExpenses();
    const days = new Set();
    const prefix = year + '-' + month; // e.g., "2025-03"
    
    for (const expense of expenses) {
        if (expense.date.startsWith(prefix)) {
            const day = expense.date.split('-')[2]; // Extract day from YYYY-MM-DD
            days.add(day);
        }
    }
    
    return Array.from(days).sort();
}

// Filter expenses by year only
function filterByYear() {
    const year = document.getElementById('yearFilter').value;
    
    if (!year) {
        alert('Please select a year');
        return;
    }
    
    const expenses = getAllExpenses();
    const filtered = [];
    
    for (const expense of expenses) {
        if (expense.date.startsWith(year)) {
            filtered.push(expense);
        }
    }
    
    displayFilteredExpenses(filtered);
}

// Filter expenses by year and month
function filterByYearMonth() {
    const year = document.getElementById('yearFilterMonth').value;
    const month = document.getElementById('monthFilter').value;
    
    if (!year || !month) {
        alert('Please select both year and month');
        return;
    }
    
    const expenses = getAllExpenses();
    const filtered = [];
    const prefix = year + '-' + month; // e.g., "2025-03"
    
    for (const expense of expenses) {
        if (expense.date.startsWith(prefix)) {
            filtered.push(expense);
        }
    }
    
    displayFilteredExpenses(filtered);
}

// Filter expenses by specific date
function filterByDate() {
    const year = document.getElementById('yearFilterDay').value;
    const month = document.getElementById('monthFilterDay').value;
    const day = document.getElementById('dayFilter').value;
    
    if (!year || !month || !day) {
        alert('Please select year, month, and day');
        return;
    }
    
    const expenses = getAllExpenses();
    const filtered = [];
    const targetDate = year + '-' + month + '-' + day; // e.g., "2025-03-15"
    
    for (const expense of expenses) {
        if (expense.date === targetDate) {
            filtered.push(expense);
        }
    }
    
    displayFilteredExpenses(filtered);
}

// Display filtered expenses in table
function displayFilteredExpenses(expenses) {
    const table = document.getElementById('filteredTable');
    const tbody = document.getElementById('filteredBody');
    const noResults = document.getElementById('noResults');

    // Clear the table body
    tbody.innerHTML = '';

    if (expenses.length === 0) {
        // Show "no results" message
        table.classList.add('hidden');
        noResults.classList.remove('hidden');
    } else {
        // Hide "no results" message and show table
        table.classList.remove('hidden');
        noResults.classList.add('hidden');

        // Add each expense as a row
        expenses.forEach(expense => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${expense.date}</td>
                <td>${capitalizeFirstLetter(expense.category)}</td>
                <td>${expense.description || '-'}</td>
                <td>$${parseFloat(expense.amount).toFixed(2)}</td>
            `;
            tbody.appendChild(row);
        });
    }
}

// Populate year dropdowns on page load
function populateYearDropdowns() {
    const years = getUniqueYears();
    
    const yearSelects = [
        document.getElementById('yearFilter'),
        document.getElementById('yearFilterMonth'),
        document.getElementById('yearFilterDay')
    ];
    
    for (const select of yearSelects) {
        if (!select) continue; // Skip if element doesn't exist
        
        for (const year of years) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        }
    }
}

// Populate months when year is selected for year+month filter
function onYearMonthChange() {
    const yearSelect = document.getElementById('yearFilterMonth');
    const monthSelect = document.getElementById('monthFilter');
    const year = yearSelect.value;
    
    // Clear and reset month dropdown
    monthSelect.innerHTML = '<option value="">-- Select Month --</option>';
    
    if (!year) return;
    
    const months = getMonthsForYear(year);
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    for (const month of months) {
        const monthIndex = parseInt(month) - 1;
        const option = document.createElement('option');
        option.value = month;
        option.textContent = monthNames[monthIndex];
        monthSelect.appendChild(option);
    }
}

// Populate months when year is selected for year+month+day filter
function onYearDayChange() {
    const yearSelect = document.getElementById('yearFilterDay');
    const monthSelect = document.getElementById('monthFilterDay');
    const daySelect = document.getElementById('dayFilter');
    const year = yearSelect.value;
    
    // Clear and reset month and day dropdowns
    monthSelect.innerHTML = '<option value="">-- Select Month --</option>';
    daySelect.innerHTML = '<option value="">-- Select Day --</option>';
    
    if (!year) return;
    
    const months = getMonthsForYear(year);
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    for (const month of months) {
        const monthIndex = parseInt(month) - 1;
        const option = document.createElement('option');
        option.value = month;
        option.textContent = monthNames[monthIndex];
        monthSelect.appendChild(option);
    }
}

// Populate days when year+month is selected
function onMonthDayChange() {
    const yearSelect = document.getElementById('yearFilterDay');
    const monthSelect = document.getElementById('monthFilterDay');
    const daySelect = document.getElementById('dayFilter');
    const year = yearSelect.value;
    const month = monthSelect.value;
    
    // Clear and reset day dropdown
    daySelect.innerHTML = '<option value="">-- Select Day --</option>';
    
    if (!year || !month) return;
    
    const days = getDaysForYearMonth(year, month);
    
    for (const day of days) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day;
        daySelect.appendChild(option);
    }
}

// Filter expenses by maximum amount
function filterByMaxAmount() {
    const maxAmount = +document.getElementById('maxAmount').value;
    
    if (!maxAmount || maxAmount <= 0) {
        alert('Please enter a valid maximum amount');
        return;
    }
    
    const expenses = getAllExpenses();
    const filtered = [];
    
    for (const expense of expenses) {
        if (expense.amount <= maxAmount) {
            filtered.push(expense);
        }
    }
    
    displayFilteredExpenses(filtered);
}

// Handle filter form
function handleFilterForm() {
    const yearMonthSelect = document.getElementById('yearFilterMonth');
    const monthDaySelect = document.getElementById('monthFilterDay');
    
    if (yearMonthSelect) {
        yearMonthSelect.addEventListener('change', onYearMonthChange);
    }
    
    if (document.getElementById('yearFilterDay')) {
        document.getElementById('yearFilterDay').addEventListener('change', onYearDayChange);
        document.getElementById('monthFilterDay').addEventListener('change', onMonthDayChange);
    }
}

// ===== GRAPH FUNCTIONS =====

// Get expenses grouped by category
function getExpensesByCategory() {
    const expenses = getAllExpenses();
    const categories = {};
    
    for (const expense of expenses) {
        const category = expense.category;
        if (!categories[category]) {
            categories[category] = 0;
        }
        categories[category] = categories[category] + expense.amount;
    }
    
    return categories;
}

// Get expenses grouped by month
function getExpensesByMonth() {
    const expenses = getAllExpenses();
    const months = {};
    
    for (const expense of expenses) {
        const date = expense.date; // Format: YYYY-MM-DD
        const yearMonth = date.substring(0, 7); // Extract YYYY-MM
        
        if (!months[yearMonth]) {
            months[yearMonth] = 0;
        }
        months[yearMonth] = months[yearMonth] + expense.amount;
    }
    
    return months;
}

// Create and display pie chart by category
function displayCategoryChart() {
    const categoryData = getExpensesByCategory();
    const categories = Object.keys(categoryData);
    const amounts = Object.values(categoryData);
    
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return; // Chart not on this page
    
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
    ];
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categories,
            datasets: [{
                data: amounts,
                backgroundColor: colors,
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Create and display histogram by month
function displayMonthChart() {
    const monthData = getExpensesByMonth();
    const months = Object.keys(monthData).sort();
    const amounts = months.map(month => monthData[month]);
    
    const ctx = document.getElementById('monthChart');
    if (!ctx) return; // Chart not on this page
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Total Amount ($)',
                data: amounts,
                backgroundColor: '#36A2EB',
                borderColor: '#36A2EB',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            }
        }
    });
}

// Export expenses to CSV file
function exportToCSV() {
    const expenses = getAllExpenses();
    
    if (expenses.length === 0) {
        alert('No expenses to export');
        return;
    }
    
    // Create CSV header
    let csv = 'Date,Category,Description,Amount\n';
    
    // Add each expense as a row
    for (const expense of expenses) {
        const date = expense.date;
        const category = expense.category;
        const description = expense.description || '';
        const amount = expense.amount.toFixed(2);
        
        csv = csv + date + ',' + category + ',' + '"' + description + '"' + ',' + amount + '\n';
    }
    
    // Create and download file
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', 'expenses.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Export expenses to PDF file
function exportToPDF() {
    const expenses = getAllExpenses();
    
    if (expenses.length === 0) {
        alert('No expenses to export');
        return;
    }
    
    // Start creating PDF content
    let pdfContent = 'EXPENSE REPORT\n';
    pdfContent = pdfContent + '==================\n';
    pdfContent = pdfContent + 'Date: ' + new Date().toLocaleDateString() + '\n';
    pdfContent = pdfContent + '\n';
    
    // Calculate total
    let total = 0;
    for (const expense of expenses) {
        total = total + expense.amount;
    }
    
    pdfContent = pdfContent + 'Total Expenses: $' + total.toFixed(2) + '\n';
    pdfContent = pdfContent + '\n==================\n';
    pdfContent = pdfContent + '\nEXPENSES:\n\n';
    
    // Add each expense
    for (const expense of expenses) {
        pdfContent = pdfContent + 'Date: ' + expense.date + '\n';
        pdfContent = pdfContent + 'Category: ' + capitalizeFirstLetter(expense.category) + '\n';
        
        if (expense.description) {
            pdfContent = pdfContent + 'Description: ' + expense.description + '\n';
        }
        
        pdfContent = pdfContent + 'Amount: $' + expense.amount.toFixed(2) + '\n';
        pdfContent = pdfContent + '\n';
    }
    
    // Create and download file
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(pdfContent));
    element.setAttribute('download', 'expense-report.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

// Initialize graphs on page load
function initializeGraphs() {
    displayCategoryChart();
    displayMonthChart();
}

// ===== INITIALIZATION =====

// Run when page loads
window.addEventListener('load', function() {
    handleExpenseForm();
    handleFilterForm();
    populateYearDropdowns();
    displayExpenses();
    initializeGraphs();
});



