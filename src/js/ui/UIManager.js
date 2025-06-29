export class UIManager {
    constructor() {
        this.lastUpdate = 0;
        this.updateInterval = 100; // Update UI every 100ms
        this.employeeFilter = 'all';
        this.revenueChart = null;
    }

    async initialize() {
        this.initializeChart();
        console.log('🎨 UI Manager initialized');
    }

    initializeChart() {
        const ctx = document.getElementById('revenue-chart');
        if (ctx && window.Chart) {
            this.revenueChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Revenue',
                        data: [],
                        borderColor: 'rgb(102, 126, 234)',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            display: false
                        },
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
    }

    update(gameState) {
        const now = Date.now();
        if (now - this.lastUpdate < this.updateInterval) return;
        
        this.updateMetrics(gameState);
        this.updateInventory(gameState);
        this.updateFinancial(gameState);
        this.updateEmployees(gameState);
        this.updateAchievements(gameState);
        this.updateResearch(gameState);
        this.updateChart(gameState);
        
        this.lastUpdate = now;
    }

    updateMetrics(gameState) {
        // Money
        document.getElementById('money').textContent = this.formatCurrency(gameState.money);
        
        // Brand
        document.getElementById('brand').textContent = this.formatNumber(gameState.brand);
        
        // Production
        document.getElementById('production-rate').textContent = this.formatNumber(gameState.productionRate) + '/s';
        document.getElementById('efficiency').textContent = Math.round(gameState.efficiency) + '% efficiency';
        
        // Employees
        const totalEmployees = gameState.getTotalEmployees();
        document.getElementById('total-employees').textContent = totalEmployees;
        document.getElementById('avg-morale').textContent = Math.round(gameState.getAverageMorale()) + '% morale';
        
        // Calculate and display changes (simplified)
        const moneyChange = this.calculateMoneyChange(gameState);
        const brandChange = this.calculateBrandChange(gameState);
        
        document.getElementById('money-change').textContent = 
            (moneyChange >= 0 ? '+' : '') + this.formatCurrency(moneyChange) + '/min';
        document.getElementById('brand-change').textContent = 
            (brandChange >= 0 ? '+' : '') + this.formatNumber(brandChange) + '/min';
    }

    updateInventory(gameState) {
        // Raw materials
        document.getElementById('raw-materials').textContent = this.formatNumber(gameState.rawMaterials);
        document.getElementById('max-storage').textContent = gameState.maxStorage;
        
        const materialsPercent = (gameState.rawMaterials / gameState.maxStorage) * 100;
        document.getElementById('raw-materials-bar').style.width = materialsPercent + '%';
        
        // Products
        document.getElementById('products').textContent = this.formatNumber(gameState.products);
        document.getElementById('max-products').textContent = gameState.maxProducts;
        
        const productsPercent = (gameState.products / gameState.maxProducts) * 100;
        document.getElementById('products-bar').style.width = productsPercent + '%';
    }

    updateFinancial(gameState) {
        const availableCredit = gameState.creditLimit - gameState.credit;
        document.getElementById('available-credit').textContent = this.formatNumber(availableCredit);
        document.getElementById('current-credit').textContent = this.formatNumber(gameState.credit);
        document.getElementById('interest-rate').textContent = gameState.interestRate;
    }

    updateEmployees(gameState) {
        // Update counts
        document.getElementById('workers-count').textContent = gameState.workers.length;
        document.getElementById('marketers-count').textContent = gameState.marketers.length;
        document.getElementById('salesmen-count').textContent = gameState.salesmen.length;
        
        // Update employee list
        const employeesList = document.getElementById('employees-list');
        const allEmployees = [
            ...gameState.workers,
            ...gameState.marketers,
            ...gameState.salesmen
        ];
        
        // Filter employees
        const filteredEmployees = this.employeeFilter === 'all' 
            ? allEmployees 
            : allEmployees.filter(emp => emp.type === this.employeeFilter);
        
        if (filteredEmployees.length === 0) {
            employeesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-plus"></i>
                    <p>No ${this.employeeFilter === 'all' ? 'employees' : this.employeeFilter.toLowerCase() + 's'} yet.</p>
                </div>
            `;
        } else {
            employeesList.innerHTML = filteredEmployees.map(employee => 
                this.createEmployeeCard(employee)
            ).join('');
        }
    }

    createEmployeeCard(employee) {
        const moodColor = this.getMoodColor(employee.mood);
        const experiencePercent = employee.experience;
        
        return `
            <div class="employee-card">
                <img src="${employee.avatar}" alt="${employee.name}" class="employee-avatar">
                <div class="employee-info">
                    <div class="employee-name">${employee.name}</div>
                    <div class="employee-role">${employee.type} • ${employee.getExperienceLevel()}</div>
                    <div class="employee-stats">
                        <div class="stat">
                            <span>Mood: ${Math.round(employee.mood)}%</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${employee.mood}%; background-color: ${moodColor}"></div>
                            </div>
                        </div>
                        <div class="stat">
                            <span>Experience: ${Math.round(employee.experience)}%</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${experiencePercent}%; background-color: var(--info-color)"></div>
                            </div>
                        </div>
                    </div>
                    ${employee.traits.length > 0 ? `
                        <div class="employee-traits">
                            ${employee.traits.map(trait => `<span class="trait-badge">${trait.name}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="mood-indicator">${employee.getMoodEmoji()}</div>
            </div>
        `;
    }

    updateAchievements(gameState) {
        const achievementsList = document.getElementById('achievements-list');
        const achievements = window.game?.gameEngine?.achievements?.getAchievements() || [];
        
        document.getElementById('achievement-count').textContent = gameState.achievements.size;
        document.getElementById('total-achievements').textContent = achievements.length;
        
        achievementsList.innerHTML = achievements.map(achievement => `
            <div class="achievement ${achievement.unlocked ? 'unlocked' : ''}">
                <div class="achievement-icon">
                    <i class="fas ${achievement.icon}"></i>
                </div>
                <div class="achievement-content">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
            </div>
        `).join('');
    }

    updateResearch(gameState) {
        const researchGrid = document.getElementById('research-grid');
        const research = window.game?.gameEngine?.research;
        
        if (!research) return;
        
        const availableResearch = research.getAvailableResearch();
        const completedResearch = research.getCompletedResearch();
        const activeResearch = research.getActiveResearch();
        
        let html = '';
        
        // Active research
        if (activeResearch) {
            html += `
                <div class="research-item active">
                    <div class="research-header">
                        <span class="research-name">${activeResearch.name}</span>
                        <span class="research-cost">Researching...</span>
                    </div>
                    <div class="research-description">${activeResearch.description}</div>
                    <div class="research-progress">
                        <div class="research-progress-fill" style="width: ${activeResearch.progressPercent}%"></div>
                    </div>
                    <small>${Math.round(activeResearch.progressPercent)}% complete</small>
                </div>
            `;
        }
        
        // Available research
        availableResearch.forEach(item => {
            html += `
                <div class="research-item" onclick="startResearch('${item.id}')">
                    <div class="research-header">
                        <span class="research-name">${item.name}</span>
                        <span class="research-cost">${item.cost} RP</span>
                    </div>
                    <div class="research-description">${item.description}</div>
                    <button class="btn primary" style="margin-top: 10px;">Start Research</button>
                </div>
            `;
        });
        
        // Completed research
        completedResearch.forEach(item => {
            html += `
                <div class="research-item completed">
                    <div class="research-header">
                        <span class="research-name">${item.name}</span>
                        <span class="research-cost">✓ Complete</span>
                    </div>
                    <div class="research-description">${item.description}</div>
                </div>
            `;
        });
        
        if (html === '') {
            html = '<div class="empty-state"><i class="fas fa-flask"></i><p>No research available</p></div>';
        }
        
        researchGrid.innerHTML = html;
    }

    updateChart(gameState) {
        if (!this.revenueChart) return;
        
        const analytics = window.game?.gameEngine?.getAnalytics();
        if (!analytics || !analytics.moneyHistory.length) return;
        
        const data = analytics.moneyHistory.slice(-20); // Last 20 data points
        const labels = data.map((_, index) => index.toString());
        const values = data.map(point => point.value);
        
        this.revenueChart.data.labels = labels;
        this.revenueChart.data.datasets[0].data = values;
        this.revenueChart.update('none');
    }

    filterEmployees(filter) {
        this.employeeFilter = filter;
    }

    // Utility methods
    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
        return Math.round(num * 10) / 10;
    }

    formatCurrency(num) {
        return '$' + this.formatNumber(num);
    }

    getMoodColor(mood) {
        if (mood > 90) return 'var(--success-color)';
        if (mood > 70) return 'var(--info-color)';
        if (mood > 50) return 'var(--warning-color)';
        return 'var(--error-color)';
    }

    calculateMoneyChange(gameState) {
        // Simplified calculation - in a real implementation, 
        // you'd track actual changes over time
        const revenue = gameState.products * gameState.baseProductPrice * 0.1;
        const costs = gameState.getTotalEmployees() * 25;
        return revenue - costs;
    }

    calculateBrandChange(gameState) {
        return gameState.marketers.length * 0.1 * 60; // Per minute
    }
}

// Global function for research
window.startResearch = (researchId) => {
    if (window.game?.gameEngine?.research) {
        window.game.gameEngine.research.startResearch(researchId, window.game.gameEngine.getGameState());
    }
};