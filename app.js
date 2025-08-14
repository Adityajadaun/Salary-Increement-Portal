// Salary Increment Portal Application
class SalaryPortal {
    constructor() {
        this.employees = [];
        this.increments = [];
        this.departments = ["Engineering", "Marketing", "HR", "Finance", "Sales", "Operations"];
        this.incrementReasons = [
            "Annual Performance Review", "Promotion", "Market Adjustment", 
            "Merit Increase", "Cost of Living Adjustment", "Retention", "Special Recognition"
        ];
        
        this.currentEditingEmployee = null;
        this.currentDeleteItem = null;
        this.deleteCallback = null;
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.populateDropdowns();
        this.showSection('dashboard');
        this.updateDashboard();
        this.renderEmployees();
        this.renderIncrements();
        this.initializeCharts();
    }

    // Data Management
    loadData() {
        const storedEmployees = localStorage.getItem('salaryPortal_employees');
        const storedIncrements = localStorage.getItem('salaryPortal_increments');

        if (storedEmployees) {
            this.employees = JSON.parse(storedEmployees);
        } else {
            // Initialize with sample data
            this.employees = [
                {
                    id: "EMP001",
                    name: "John Smith",
                    email: "john.smith@company.com",
                    phone: "555-0101",
                    department: "Engineering",
                    position: "Software Engineer",
                    hireDate: "2022-03-15",
                    currentSalary: 85000,
                    address: "123 Tech Street, Silicon Valley, CA",
                    createdDate: "2022-03-15"
                },
                {
                    id: "EMP002",
                    name: "Sarah Johnson",
                    email: "sarah.johnson@company.com",
                    phone: "555-0102",
                    department: "Marketing",
                    position: "Marketing Manager",
                    hireDate: "2021-07-20",
                    currentSalary: 75000,
                    address: "456 Business Ave, Downtown, NY",
                    createdDate: "2021-07-20"
                },
                {
                    id: "EMP003",
                    name: "Michael Brown",
                    email: "michael.brown@company.com",
                    phone: "555-0103",
                    department: "HR",
                    position: "HR Specialist",
                    hireDate: "2023-01-10",
                    currentSalary: 60000,
                    address: "789 Corporate Blvd, Business District, TX",
                    createdDate: "2023-01-10"
                }
            ];
        }

        if (storedIncrements) {
            this.increments = JSON.parse(storedIncrements);
        } else {
            // Initialize with sample data
            this.increments = [
                {
                    id: "INC001",
                    employeeId: "EMP001",
                    oldSalary: 80000,
                    newSalary: 85000,
                    incrementPercentage: 6.25,
                    reason: "Annual Performance Review",
                    effectiveDate: "2024-01-01",
                    approvedBy: "Jane Doe - Engineering Manager",
                    notes: "Excellent performance and leadership skills demonstrated"
                },
                {
                    id: "INC002",
                    employeeId: "EMP002",
                    oldSalary: 70000,
                    newSalary: 75000,
                    incrementPercentage: 7.14,
                    reason: "Promotion",
                    effectiveDate: "2023-12-01",
                    approvedBy: "Bob Wilson - Marketing Director",
                    notes: "Promoted to Marketing Manager role"
                }
            ];
        }
        
        this.saveData();
    }

    saveData() {
        localStorage.setItem('salaryPortal_employees', JSON.stringify(this.employees));
        localStorage.setItem('salaryPortal_increments', JSON.stringify(this.increments));
    }

    // Event Listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.dataset.section;
                this.showSection(section);
            });
        });

        // Employee Management
        document.getElementById('add-employee-btn').addEventListener('click', () => this.openEmployeeModal());
        document.getElementById('employee-form').addEventListener('submit', (e) => this.saveEmployee(e));
        document.getElementById('cancel-employee').addEventListener('click', () => this.closeEmployeeModal());
        document.getElementById('close-employee-modal').addEventListener('click', () => this.closeEmployeeModal());

        // Increment Management
        document.getElementById('add-increment-btn').addEventListener('click', () => this.openIncrementModal());
        document.getElementById('increment-form').addEventListener('submit', (e) => this.saveIncrement(e));
        document.getElementById('cancel-increment').addEventListener('click', () => this.closeIncrementModal());
        document.getElementById('close-increment-modal').addEventListener('click', () => this.closeIncrementModal());

        // Delete Modal
        document.getElementById('close-delete-modal').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('cancel-delete').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('confirm-delete').addEventListener('click', () => this.confirmDelete());

        // Search and Filter
        document.getElementById('employee-search').addEventListener('input', (e) => this.searchEmployees(e.target.value));
        document.getElementById('department-filter').addEventListener('change', (e) => this.filterEmployees(e.target.value));
        document.getElementById('increment-search').addEventListener('input', (e) => this.searchIncrements(e.target.value));
        document.getElementById('employee-filter').addEventListener('change', (e) => this.filterIncrements(e.target.value));

        // Export Functions
        document.getElementById('export-employees').addEventListener('click', () => this.exportEmployees());
        document.getElementById('export-all-data').addEventListener('click', () => this.exportAllData());
        document.getElementById('export-increments').addEventListener('click', () => this.exportIncrements());
        document.getElementById('export-salary-report').addEventListener('click', () => this.exportSalaryReport());

        // Form calculations
        document.getElementById('inc-employee').addEventListener('change', (e) => this.updateCurrentSalary(e.target.value));
        document.getElementById('inc-new-salary').addEventListener('input', () => this.calculateIncrement());

        // Modal close on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });
    }

    // Navigation
    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        document.getElementById(sectionName).classList.add('active');

        // Update specific sections
        if (sectionName === 'dashboard') {
            this.updateDashboard();
        } else if (sectionName === 'reports') {
            this.updateReports();
        }
    }

    // Dashboard Functions
    updateDashboard() {
        const totalEmployees = this.employees.length;
        const avgSalary = totalEmployees > 0 ? 
            this.employees.reduce((sum, emp) => sum + emp.currentSalary, 0) / totalEmployees : 0;
        const totalIncrements = this.increments.length;
        const avgIncrement = totalIncrements > 0 ?
            this.increments.reduce((sum, inc) => sum + inc.incrementPercentage, 0) / totalIncrements : 0;

        document.getElementById('total-employees').textContent = totalEmployees;
        document.getElementById('avg-salary').textContent = `$${avgSalary.toLocaleString()}`;
        document.getElementById('total-increments').textContent = totalIncrements;
        document.getElementById('avg-increment').textContent = `${avgIncrement.toFixed(1)}%`;

        this.renderRecentIncrements();
        this.updateSalaryChart();
    }

    renderRecentIncrements() {
        const container = document.getElementById('recent-increments');
        const recentIncrements = this.increments
            .sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate))
            .slice(0, 5);

        if (recentIncrements.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>No recent increments</p></div>';
            return;
        }

        container.innerHTML = recentIncrements.map(inc => {
            const employee = this.employees.find(emp => emp.id === inc.employeeId);
            const amount = inc.newSalary - inc.oldSalary;
            return `
                <div class="recent-item">
                    <div class="recent-info">
                        <h4>${employee ? employee.name : 'Unknown Employee'}</h4>
                        <p>${new Date(inc.effectiveDate).toLocaleDateString()} - ${inc.reason}</p>
                    </div>
                    <div class="recent-amount">+$${amount.toLocaleString()}</div>
                </div>
            `;
        }).join('');
    }

    // Employee Functions
    openEmployeeModal(employee = null) {
        this.currentEditingEmployee = employee;
        const modal = document.getElementById('employee-modal');
        const title = document.getElementById('employee-modal-title');
        const form = document.getElementById('employee-form');

        title.textContent = employee ? 'Edit Employee' : 'Add Employee';
        form.reset();

        if (employee) {
            document.getElementById('emp-id').value = employee.id;
            document.getElementById('emp-name').value = employee.name;
            document.getElementById('emp-email').value = employee.email;
            document.getElementById('emp-phone').value = employee.phone;
            document.getElementById('emp-department').value = employee.department;
            document.getElementById('emp-position').value = employee.position;
            document.getElementById('emp-hire-date').value = employee.hireDate;
            document.getElementById('emp-salary').value = employee.currentSalary;
            document.getElementById('emp-address').value = employee.address;
        }

        modal.classList.remove('hidden');
    }

    closeEmployeeModal() {
        document.getElementById('employee-modal').classList.add('hidden');
        this.currentEditingEmployee = null;
    }

    saveEmployee(e) {
        e.preventDefault();
        
        const formData = {
            id: document.getElementById('emp-id').value.trim(),
            name: document.getElementById('emp-name').value.trim(),
            email: document.getElementById('emp-email').value.trim(),
            phone: document.getElementById('emp-phone').value.trim(),
            department: document.getElementById('emp-department').value,
            position: document.getElementById('emp-position').value.trim(),
            hireDate: document.getElementById('emp-hire-date').value,
            currentSalary: parseFloat(document.getElementById('emp-salary').value),
            address: document.getElementById('emp-address').value.trim()
        };

        // Validation
        if (!this.validateEmployee(formData)) return;

        if (this.currentEditingEmployee) {
            // Update existing employee
            const index = this.employees.findIndex(emp => emp.id === this.currentEditingEmployee.id);
            this.employees[index] = { ...this.employees[index], ...formData };
            this.showToast('Employee updated successfully!');
        } else {
            // Add new employee
            if (this.employees.find(emp => emp.id === formData.id)) {
                this.showToast('Employee ID already exists!', 'error');
                return;
            }
            formData.createdDate = new Date().toISOString().split('T')[0];
            this.employees.push(formData);
            this.showToast('Employee added successfully!');
        }

        this.saveData();
        this.closeEmployeeModal();
        this.renderEmployees();
        this.updateDashboard();
        this.populateDropdowns();
    }

    validateEmployee(formData) {
        if (!formData.id || !formData.name || !formData.email || !formData.phone || 
            !formData.department || !formData.position || !formData.hireDate || !formData.currentSalary) {
            this.showToast('Please fill in all required fields!', 'error');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            this.showToast('Please enter a valid email address!', 'error');
            return false;
        }

        if (formData.currentSalary <= 0) {
            this.showToast('Salary must be greater than 0!', 'error');
            return false;
        }

        return true;
    }

    renderEmployees() {
        const tbody = document.getElementById('employees-tbody');
        
        if (this.employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No employees found</td></tr>';
            return;
        }

        tbody.innerHTML = this.employees.map(employee => `
            <tr>
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.department}</td>
                <td>${employee.position}</td>
                <td>$${employee.currentSalary.toLocaleString()}</td>
                <td>${new Date(employee.hireDate).toLocaleDateString()}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-view" onclick="window.portal.viewEmployee('${employee.id}')">View</button>
                        <button class="btn btn-edit" onclick="window.portal.editEmployee('${employee.id}')">Edit</button>
                        <button class="btn btn-delete" onclick="window.portal.deleteEmployee('${employee.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    searchEmployees(query) {
        const filtered = this.employees.filter(emp => 
            emp.name.toLowerCase().includes(query.toLowerCase()) ||
            emp.id.toLowerCase().includes(query.toLowerCase()) ||
            emp.department.toLowerCase().includes(query.toLowerCase()) ||
            emp.position.toLowerCase().includes(query.toLowerCase())
        );
        this.renderFilteredEmployees(filtered);
    }

    filterEmployees(department) {
        const filtered = department ? 
            this.employees.filter(emp => emp.department === department) : 
            this.employees;
        this.renderFilteredEmployees(filtered);
    }

    renderFilteredEmployees(employees) {
        const tbody = document.getElementById('employees-tbody');
        
        if (employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No employees found</td></tr>';
            return;
        }

        tbody.innerHTML = employees.map(employee => `
            <tr>
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.department}</td>
                <td>${employee.position}</td>
                <td>$${employee.currentSalary.toLocaleString()}</td>
                <td>${new Date(employee.hireDate).toLocaleDateString()}</td>
                <td>
                    <div class="actions">
                        <button class="btn btn-view" onclick="window.portal.viewEmployee('${employee.id}')">View</button>
                        <button class="btn btn-edit" onclick="window.portal.editEmployee('${employee.id}')">Edit</button>
                        <button class="btn btn-delete" onclick="window.portal.deleteEmployee('${employee.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    viewEmployee(id) {
        const employee = this.employees.find(emp => emp.id === id);
        if (employee) {
            const increments = this.increments.filter(inc => inc.employeeId === id);
            const totalIncrements = increments.reduce((sum, inc) => sum + (inc.newSalary - inc.oldSalary), 0);
            
            const details = `Employee Details:
            
ID: ${employee.id}
Name: ${employee.name}
Email: ${employee.email}
Phone: ${employee.phone}
Department: ${employee.department}
Position: ${employee.position}
Hire Date: ${new Date(employee.hireDate).toLocaleDateString()}
Current Salary: $${employee.currentSalary.toLocaleString()}
Address: ${employee.address}

Increment History:
Total Increments: ${increments.length}
Total Increment Amount: $${totalIncrements.toLocaleString()}`;

            alert(details);
        }
    }

    editEmployee(id) {
        const employee = this.employees.find(emp => emp.id === id);
        if (employee) {
            this.openEmployeeModal(employee);
        }
    }

    deleteEmployee(id) {
        const employee = this.employees.find(emp => emp.id === id);
        if (employee) {
            this.openDeleteModal(
                `Are you sure you want to delete employee "${employee.name}"? This will also delete all related increments.`,
                () => this.confirmDeleteEmployee(id)
            );
        }
    }

    confirmDeleteEmployee(id) {
        this.employees = this.employees.filter(emp => emp.id !== id);
        this.increments = this.increments.filter(inc => inc.employeeId !== id);
        this.saveData();
        this.renderEmployees();
        this.renderIncrements();
        this.updateDashboard();
        this.populateDropdowns();
        this.showToast('Employee deleted successfully!');
    }

    // Increment Functions
    openIncrementModal() {
        const modal = document.getElementById('increment-modal');
        const form = document.getElementById('increment-form');
        
        form.reset();
        document.getElementById('inc-current-salary').value = '';
        document.getElementById('inc-percentage').value = '';
        
        modal.classList.remove('hidden');
    }

    closeIncrementModal() {
        document.getElementById('increment-modal').classList.add('hidden');
    }

    updateCurrentSalary(employeeId) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (employee) {
            document.getElementById('inc-current-salary').value = employee.currentSalary;
            this.calculateIncrement();
        }
    }

    calculateIncrement() {
        const currentSalary = parseFloat(document.getElementById('inc-current-salary').value);
        const newSalary = parseFloat(document.getElementById('inc-new-salary').value);
        
        if (currentSalary && newSalary && currentSalary > 0) {
            const percentage = ((newSalary - currentSalary) / currentSalary * 100).toFixed(2);
            document.getElementById('inc-percentage').value = `${percentage}%`;
        } else {
            document.getElementById('inc-percentage').value = '';
        }
    }

    saveIncrement(e) {
        e.preventDefault();
        
        const formData = {
            id: `INC${Date.now()}`,
            employeeId: document.getElementById('inc-employee').value,
            oldSalary: parseFloat(document.getElementById('inc-current-salary').value),
            newSalary: parseFloat(document.getElementById('inc-new-salary').value),
            reason: document.getElementById('inc-reason').value,
            effectiveDate: document.getElementById('inc-date').value,
            approvedBy: document.getElementById('inc-approved-by').value.trim(),
            notes: document.getElementById('inc-notes').value.trim()
        };

        // Validation
        if (!this.validateIncrement(formData)) return;

        formData.incrementPercentage = parseFloat(((formData.newSalary - formData.oldSalary) / formData.oldSalary * 100).toFixed(2));

        // Update employee's current salary
        const employeeIndex = this.employees.findIndex(emp => emp.id === formData.employeeId);
        this.employees[employeeIndex].currentSalary = formData.newSalary;

        this.increments.push(formData);
        this.saveData();
        this.closeIncrementModal();
        this.renderIncrements();
        this.renderEmployees();
        this.updateDashboard();
        this.showToast('Increment added successfully!');
    }

    validateIncrement(formData) {
        if (!formData.employeeId || !formData.newSalary || !formData.reason || 
            !formData.effectiveDate || !formData.approvedBy) {
            this.showToast('Please fill in all required fields!', 'error');
            return false;
        }

        if (formData.newSalary <= formData.oldSalary) {
            this.showToast('New salary must be greater than current salary!', 'error');
            return false;
        }

        return true;
    }

    renderIncrements() {
        const tbody = document.getElementById('increments-tbody');
        
        if (this.increments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No increments found</td></tr>';
            return;
        }

        tbody.innerHTML = this.increments.map(increment => {
            const employee = this.employees.find(emp => emp.id === increment.employeeId);
            return `
                <tr>
                    <td>${employee ? employee.name : 'Unknown Employee'}</td>
                    <td>$${increment.oldSalary.toLocaleString()}</td>
                    <td>$${increment.newSalary.toLocaleString()}</td>
                    <td>${increment.incrementPercentage.toFixed(2)}%</td>
                    <td>${increment.reason}</td>
                    <td>${new Date(increment.effectiveDate).toLocaleDateString()}</td>
                    <td>
                        <div class="actions">
                            <button class="btn btn-view" onclick="window.portal.viewIncrement('${increment.id}')">View</button>
                            <button class="btn btn-delete" onclick="window.portal.deleteIncrement('${increment.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    searchIncrements(query) {
        const filtered = this.increments.filter(inc => {
            const employee = this.employees.find(emp => emp.id === inc.employeeId);
            return employee && (
                employee.name.toLowerCase().includes(query.toLowerCase()) ||
                inc.reason.toLowerCase().includes(query.toLowerCase()) ||
                inc.approvedBy.toLowerCase().includes(query.toLowerCase())
            );
        });
        this.renderFilteredIncrements(filtered);
    }

    filterIncrements(employeeId) {
        const filtered = employeeId ? 
            this.increments.filter(inc => inc.employeeId === employeeId) : 
            this.increments;
        this.renderFilteredIncrements(filtered);
    }

    renderFilteredIncrements(increments) {
        const tbody = document.getElementById('increments-tbody');
        
        if (increments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No increments found</td></tr>';
            return;
        }

        tbody.innerHTML = increments.map(increment => {
            const employee = this.employees.find(emp => emp.id === increment.employeeId);
            return `
                <tr>
                    <td>${employee ? employee.name : 'Unknown Employee'}</td>
                    <td>$${increment.oldSalary.toLocaleString()}</td>
                    <td>$${increment.newSalary.toLocaleString()}</td>
                    <td>${increment.incrementPercentage.toFixed(2)}%</td>
                    <td>${increment.reason}</td>
                    <td>${new Date(increment.effectiveDate).toLocaleDateString()}</td>
                    <td>
                        <div class="actions">
                            <button class="btn btn-view" onclick="window.portal.viewIncrement('${increment.id}')">View</button>
                            <button class="btn btn-delete" onclick="window.portal.deleteIncrement('${increment.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    viewIncrement(id) {
        const increment = this.increments.find(inc => inc.id === id);
        if (increment) {
            const employee = this.employees.find(emp => emp.id === increment.employeeId);
            const amount = increment.newSalary - increment.oldSalary;
            
            const details = `Increment Details:

Employee: ${employee ? employee.name : 'Unknown'}
Old Salary: $${increment.oldSalary.toLocaleString()}
New Salary: $${increment.newSalary.toLocaleString()}
Increase: $${amount.toLocaleString()} (${increment.incrementPercentage}%)
Reason: ${increment.reason}
Effective Date: ${new Date(increment.effectiveDate).toLocaleDateString()}
Approved By: ${increment.approvedBy}
Notes: ${increment.notes || 'None'}`;

            alert(details);
        }
    }

    deleteIncrement(id) {
        const increment = this.increments.find(inc => inc.id === id);
        if (increment) {
            const employee = this.employees.find(emp => emp.id === increment.employeeId);
            this.openDeleteModal(
                `Are you sure you want to delete this increment for ${employee ? employee.name : 'Unknown Employee'}?`,
                () => this.confirmDeleteIncrement(id)
            );
        }
    }

    confirmDeleteIncrement(id) {
        this.increments = this.increments.filter(inc => inc.id !== id);
        this.saveData();
        this.renderIncrements();
        this.updateDashboard();
        this.showToast('Increment deleted successfully!');
    }

    // Dropdown population
    populateDropdowns() {
        // Department dropdown
        const deptSelect = document.getElementById('emp-department');
        const deptFilter = document.getElementById('department-filter');
        
        deptSelect.innerHTML = '<option value="">Select Department</option>' +
            this.departments.map(dept => `<option value="${dept}">${dept}</option>`).join('');
        
        deptFilter.innerHTML = '<option value="">All Departments</option>' +
            this.departments.map(dept => `<option value="${dept}">${dept}</option>`).join('');

        // Increment reason dropdown
        const reasonSelect = document.getElementById('inc-reason');
        reasonSelect.innerHTML = '<option value="">Select Reason</option>' +
            this.incrementReasons.map(reason => `<option value="${reason}">${reason}</option>`).join('');

        // Employee dropdowns
        const empSelect = document.getElementById('inc-employee');
        const empFilter = document.getElementById('employee-filter');
        
        empSelect.innerHTML = '<option value="">Select Employee</option>' +
            this.employees.map(emp => `<option value="${emp.id}">${emp.name} (${emp.id})</option>`).join('');
        
        empFilter.innerHTML = '<option value="">All Employees</option>' +
            this.employees.map(emp => `<option value="${emp.id}">${emp.name}</option>`).join('');
    }

    // Charts
    initializeCharts() {
        this.salaryChart = null;
        this.departmentChart = null;
        this.incrementTrendChart = null;
        setTimeout(() => this.updateSalaryChart(), 100);
    }

    updateSalaryChart() {
        const ctx = document.getElementById('salaryChart');
        if (!ctx) return;

        if (this.salaryChart) {
            this.salaryChart.destroy();
        }

        const salaryRanges = {
            '< $50k': 0,
            '$50k - $70k': 0,
            '$70k - $90k': 0,
            '$90k - $120k': 0,
            '> $120k': 0
        };

        this.employees.forEach(emp => {
            if (emp.currentSalary < 50000) salaryRanges['< $50k']++;
            else if (emp.currentSalary < 70000) salaryRanges['$50k - $70k']++;
            else if (emp.currentSalary < 90000) salaryRanges['$70k - $90k']++;
            else if (emp.currentSalary < 120000) salaryRanges['$90k - $120k']++;
            else salaryRanges['> $120k']++;
        });

        this.salaryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(salaryRanges),
                datasets: [{
                    data: Object.values(salaryRanges),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F'],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    updateReports() {
        setTimeout(() => {
            this.updateDepartmentChart();
            this.updateIncrementTrendChart();
        }, 100);
    }

    updateDepartmentChart() {
        const ctx = document.getElementById('departmentChart');
        if (!ctx) return;

        if (this.departmentChart) {
            this.departmentChart.destroy();
        }

        const deptData = {};
        this.employees.forEach(emp => {
            if (deptData[emp.department]) {
                deptData[emp.department].count++;
                deptData[emp.department].totalSalary += emp.currentSalary;
            } else {
                deptData[emp.department] = { count: 1, totalSalary: emp.currentSalary };
            }
        });

        const avgSalaries = Object.keys(deptData).map(dept => 
            Math.round(deptData[dept].totalSalary / deptData[dept].count)
        );

        this.departmentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(deptData),
                datasets: [{
                    label: 'Average Salary',
                    data: avgSalaries,
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545'],
                    borderColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    updateIncrementTrendChart() {
        const ctx = document.getElementById('incrementTrendChart');
        if (!ctx) return;

        if (this.incrementTrendChart) {
            this.incrementTrendChart.destroy();
        }

        const monthlyData = {};
        this.increments.forEach(inc => {
            const date = new Date(inc.effectiveDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (monthlyData[monthKey]) {
                monthlyData[monthKey].count++;
                monthlyData[monthKey].totalAmount += (inc.newSalary - inc.oldSalary);
            } else {
                monthlyData[monthKey] = { count: 1, totalAmount: (inc.newSalary - inc.oldSalary) };
            }
        });

        const sortedKeys = Object.keys(monthlyData).sort();
        const amounts = sortedKeys.map(key => monthlyData[key].totalAmount);

        this.incrementTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedKeys,
                datasets: [{
                    label: 'Total Increment Amount',
                    data: amounts,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    // Export Functions
    exportEmployees() {
        const csv = this.convertToCSV(this.employees, [
            'id', 'name', 'email', 'phone', 'department', 'position', 
            'hireDate', 'currentSalary', 'address', 'createdDate'
        ]);
        this.downloadCSV(csv, 'employees.csv');
    }

    exportIncrements() {
        const incrementsWithNames = this.increments.map(inc => {
            const employee = this.employees.find(emp => emp.id === inc.employeeId);
            return {
                ...inc,
                employeeName: employee ? employee.name : 'Unknown'
            };
        });
        
        const csv = this.convertToCSV(incrementsWithNames, [
            'id', 'employeeId', 'employeeName', 'oldSalary', 'newSalary', 
            'incrementPercentage', 'reason', 'effectiveDate', 'approvedBy', 'notes'
        ]);
        this.downloadCSV(csv, 'increments.csv');
    }

    exportAllData() {
        const allData = {
            employees: this.employees,
            increments: this.increments
        };
        
        const dataStr = JSON.stringify(allData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'salary_portal_data.json';
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast('All data exported successfully!');
    }

    exportSalaryReport() {
        const report = this.employees.map(emp => {
            const empIncrements = this.increments.filter(inc => inc.employeeId === emp.id);
            const totalIncrement = empIncrements.reduce((sum, inc) => sum + (inc.newSalary - inc.oldSalary), 0);
            const incrementCount = empIncrements.length;
            
            return {
                id: emp.id,
                name: emp.name,
                department: emp.department,
                position: emp.position,
                hireDate: emp.hireDate,
                currentSalary: emp.currentSalary,
                totalIncrements: totalIncrement,
                incrementCount: incrementCount,
                avgIncrementPercentage: incrementCount > 0 ? 
                    empIncrements.reduce((sum, inc) => sum + inc.incrementPercentage, 0) / incrementCount : 0
            };
        });
        
        const csv = this.convertToCSV(report, [
            'id', 'name', 'department', 'position', 'hireDate', 'currentSalary',
            'totalIncrements', 'incrementCount', 'avgIncrementPercentage'
        ]);
        this.downloadCSV(csv, 'salary_report.csv');
    }

    convertToCSV(data, headers) {
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    let value = row[header];
                    if (typeof value === 'string' && value.includes(',')) {
                        value = `"${value}"`;
                    }
                    return value || '';
                }).join(',')
            )
        ].join('\n');
        
        return csvContent;
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showToast(`${filename} downloaded successfully!`);
    }

    // Modal Functions
    openDeleteModal(message, callback) {
        document.getElementById('delete-message').textContent = message;
        this.deleteCallback = callback;
        document.getElementById('delete-modal').classList.remove('hidden');
    }

    closeDeleteModal() {
        document.getElementById('delete-modal').classList.add('hidden');
        this.deleteCallback = null;
    }

    confirmDelete() {
        if (this.deleteCallback) {
            this.deleteCallback();
        }
        this.closeDeleteModal();
    }

    // Utility Functions
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');
        
        toastMessage.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.remove('hidden');
        
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }
}

// Initialize the application and expose globally
window.portal = new SalaryPortal();