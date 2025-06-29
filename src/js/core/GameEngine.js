import { GameState } from './GameState.js';
import { Employee } from './Employee.js';
import { Achievement } from './Achievement.js';
import { Research } from './Research.js';

export class GameEngine {
    constructor() {
        this.gameState = new GameState();
        this.achievements = new Achievement();
        this.research = new Research();
        this.analytics = {
            moneyHistory: [],
            productionHistory: [],
            employeeHistory: []
        };
        this.isPaused = false;
    }

    async initialize() {
        this.achievements.initialize();
        this.research.initialize();
        console.log('🎮 Game Engine initialized');
    }

    update() {
        if (this.isPaused) return;

        this.updateProduction();
        this.updateMarketing();
        this.updateSales();
        this.updateEmployees();
        this.updateFinances();
        this.achievements.checkAchievements(this.gameState);
        this.research.updateResearch(this.gameState);
    }

    updateProduction() {
        if (this.gameState.rawMaterials > 0 && this.gameState.workers.length > 0) {
            const efficiency = this.gameState.efficiency / 100;
            const baseProduction = this.gameState.productionRate * efficiency;
            const researchBonus = this.research.getProductionBonus();
            const production = (baseProduction * (1 + researchBonus)) / 60; // Per second

            const actualProduction = Math.min(
                production,
                this.gameState.rawMaterials,
                this.gameState.maxProducts - this.gameState.products
            );

            if (actualProduction > 0) {
                this.gameState.rawMaterials -= actualProduction;
                this.gameState.products += actualProduction;

                // Increase worker experience
                this.gameState.workers.forEach(worker => {
                    worker.gainExperience(0.1);
                });
            }
        }
    }

    updateMarketing() {
        this.gameState.marketers.forEach(marketer => {
            const baseIncrease = 0.1 * (1 + marketer.experience / 100);
            const researchBonus = this.research.getMarketingBonus();
            this.gameState.brand += baseIncrease * (1 + researchBonus) / 60;
            marketer.gainExperience(0.1);
        });
    }

    updateSales() {
        if (this.gameState.autoSell && this.gameState.salesmen.length > 0 && this.gameState.products > 0) {
            const price = this.gameState.baseProductPrice * (1 + (this.gameState.brand * 0.1));
            const salesBonus = this.research.getSalesBonus();
            const saleAmount = Math.min(
                this.gameState.products,
                this.gameState.salesmen.length * 2 * (1 + salesBonus) / 30
            );

            if (saleAmount > 0) {
                this.gameState.money += saleAmount * price;
                this.gameState.products -= saleAmount;

                this.gameState.salesmen.forEach(salesman => {
                    salesman.gainExperience(0.1);
                });
            }
        }
    }

    updateEmployees() {
        const allEmployees = [
            ...this.gameState.workers,
            ...this.gameState.marketers,
            ...this.gameState.salesmen
        ];

        // Calculate salary costs
        const totalSalary = 
            this.gameState.workers.length * 20 +
            this.gameState.marketers.length * 30 +
            this.gameState.salesmen.length * 40;

        // Pay salaries every 10 seconds (simplified)
        if (Date.now() % 10000 < 16) {
            if (this.gameState.money >= totalSalary) {
                this.gameState.money -= totalSalary;
                allEmployees.forEach(employee => {
                    employee.increaseMood(5);
                });
            } else {
                allEmployees.forEach(employee => {
                    employee.decreaseMood(20);
                });
                this.showNotification('Salaries not paid! Morale is dropping...', 'error');
            }
        }

        // Natural mood decay and resignations
        allEmployees.forEach(employee => {
            employee.decreaseMood(2 / 60); // Gradual mood decay
        });

        // Remove resigned employees
        this.gameState.workers = this.gameState.workers.filter(worker => {
            if (worker.mood <= 10) {
                this.gameState.productionRate -= 0.5;
                this.showNotification(`${worker.name} has resigned! (Worker)`, 'error');
                return false;
            }
            return true;
        });

        this.gameState.marketers = this.gameState.marketers.filter(marketer => {
            if (marketer.mood <= 10) {
                this.showNotification(`${marketer.name} has resigned! (Marketer)`, 'error');
                return false;
            }
            return true;
        });

        this.gameState.salesmen = this.gameState.salesmen.filter(salesman => {
            if (salesman.mood <= 10) {
                this.showNotification(`${salesman.name} has resigned! (Salesman)`, 'error');
                if (this.gameState.salesmen.length <= 1) {
                    this.gameState.autoSell = false;
                }
                return false;
            }
            return true;
        });

        // Update efficiency based on average mood
        const remainingEmployees = [
            ...this.gameState.workers,
            ...this.gameState.marketers,
            ...this.gameState.salesmen
        ];

        if (remainingEmployees.length > 0) {
            const avgMood = remainingEmployees.reduce((sum, emp) => sum + emp.mood, 0) / remainingEmployees.length;
            this.gameState.efficiency = avgMood;
        } else {
            this.gameState.efficiency = 100;
        }
    }

    updateFinances() {
        // Interest on credit
        if (this.gameState.credit > 0 && Date.now() % 30000 < 16) {
            const interest = (this.gameState.credit * this.gameState.interestRate) / 100 / 12;
            this.gameState.money -= interest;
        }
    }

    updateAnalytics() {
        const now = Date.now();
        
        // Keep only last 100 data points
        if (this.analytics.moneyHistory.length > 100) {
            this.analytics.moneyHistory.shift();
            this.analytics.productionHistory.shift();
            this.analytics.employeeHistory.shift();
        }

        this.analytics.moneyHistory.push({
            time: now,
            value: this.gameState.money
        });

        this.analytics.productionHistory.push({
            time: now,
            value: this.gameState.productionRate
        });

        this.analytics.employeeHistory.push({
            time: now,
            value: this.gameState.workers.length + this.gameState.marketers.length + this.gameState.salesmen.length
        });
    }

    // Game Actions
    buyRawMaterials(amount) {
        const cost = amount * 5;
        const discount = this.research.getPurchaseDiscount();
        const finalCost = cost * (1 - discount);
        
        if (this.gameState.money >= finalCost) {
            if (this.gameState.rawMaterials + amount <= this.gameState.maxStorage) {
                this.gameState.money -= finalCost;
                this.gameState.rawMaterials += amount;
                this.showNotification(`${amount} raw materials purchased for $${finalCost.toFixed(2)}!`, 'success');
                return true;
            } else {
                this.showNotification('Storage capacity is full!', 'error');
                return false;
            }
        } else {
            this.showNotification('Not enough money!', 'error');
            return false;
        }
    }

    sellProducts() {
        if (this.gameState.products >= 1) {
            const basePrice = this.gameState.baseProductPrice * (1 + (this.gameState.brand * 0.1));
            const priceBonus = this.research.getPriceBonus();
            const price = basePrice * (1 + priceBonus);
            const saleAmount = Math.floor(this.gameState.products);
            
            this.gameState.money += saleAmount * price;
            this.gameState.products -= saleAmount;
            this.showNotification(`${saleAmount} products sold for $${(saleAmount * price).toFixed(2)}!`, 'success');
            return true;
        }
        return false;
    }

    hireWorker() {
        const cost = 200 * (1 + this.gameState.workers.length * 0.1); // Increasing cost
        if (this.gameState.money >= cost) {
            this.gameState.money -= cost;
            const worker = new Employee('Worker');
            this.gameState.workers.push(worker);
            this.gameState.productionRate += 0.5;
            this.showNotification(`New worker ${worker.name} hired for $${cost.toFixed(2)}!`, 'success');
            return true;
        } else {
            this.showNotification('Not enough money!', 'error');
            return false;
        }
    }

    hireMarketer() {
        const cost = 300 * (1 + this.gameState.marketers.length * 0.1);
        if (this.gameState.money >= cost) {
            this.gameState.money -= cost;
            const marketer = new Employee('Marketer');
            this.gameState.marketers.push(marketer);
            this.showNotification(`New marketer ${marketer.name} hired for $${cost.toFixed(2)}!`, 'success');
            return true;
        } else {
            this.showNotification('Not enough money!', 'error');
            return false;
        }
    }

    hireSalesman() {
        const cost = 400 * (1 + this.gameState.salesmen.length * 0.1);
        if (this.gameState.money >= cost) {
            this.gameState.money -= cost;
            const salesman = new Employee('Salesman');
            this.gameState.salesmen.push(salesman);
            this.gameState.autoSell = true;
            this.showNotification(`New salesman ${salesman.name} hired for $${cost.toFixed(2)}!`, 'success');
            return true;
        } else {
            this.showNotification('Not enough money!', 'error');
            return false;
        }
    }

    motivateEmployees() {
        const cost = 100;
        if (this.gameState.money >= cost) {
            this.gameState.money -= cost;
            const allEmployees = [
                ...this.gameState.workers,
                ...this.gameState.marketers,
                ...this.gameState.salesmen
            ];
            
            allEmployees.forEach(employee => {
                employee.increaseMood(20);
            });
            
            this.gameState.efficiency = Math.min(100, this.gameState.efficiency + 10);
            this.showNotification('Employee morale boosted!', 'success');
            return true;
        } else {
            this.showNotification('Not enough money!', 'error');
            return false;
        }
    }

    upgradeStorage() {
        const cost = 500 * Math.pow(1.2, Math.floor(this.gameState.maxStorage / 100) - 1);
        if (this.gameState.money >= cost) {
            this.gameState.money -= cost;
            this.gameState.maxStorage += 100;
            this.gameState.maxProducts += 100;
            this.showNotification(`Storage capacity increased to ${this.gameState.maxStorage}!`, 'success');
            return true;
        } else {
            this.showNotification('Not enough money!', 'error');
            return false;
        }
    }

    upgradeFactory() {
        const cost = 1000 * Math.pow(1.5, this.gameState.factoryLevel || 0);
        if (this.gameState.money >= cost) {
            this.gameState.money -= cost;
            this.gameState.productionRate *= 1.5;
            this.gameState.factoryLevel = (this.gameState.factoryLevel || 0) + 1;
            this.showNotification(`Factory upgraded! Production increased by 50%!`, 'success');
            return true;
        } else {
            this.showNotification('Not enough money!', 'error');
            return false;
        }
    }

    runAdvertising() {
        const cost = 100;
        if (this.gameState.money >= cost) {
            this.gameState.money -= cost;
            const brandIncrease = 1 * (1 + this.research.getMarketingBonus());
            this.gameState.brand += brandIncrease;
            this.showNotification(`Advertising campaign launched! Brand value increased by ${brandIncrease.toFixed(1)}!`, 'success');
            return true;
        } else {
            this.showNotification('Not enough money!', 'error');
            return false;
        }
    }

    takeCredit() {
        const maxCredit = this.gameState.creditLimit - this.gameState.credit;
        if (maxCredit > 0) {
            const amount = Math.min(1000, maxCredit);
            this.gameState.credit += amount;
            this.gameState.money += amount;
            this.showNotification(`$${amount} credit taken!`, 'info');
            return true;
        } else {
            this.showNotification('Credit limit reached!', 'error');
            return false;
        }
    }

    payCredit() {
        if (this.gameState.credit > 0 && this.gameState.money >= 100) {
            const amount = Math.min(100, Math.min(this.gameState.credit, this.gameState.money));
            this.gameState.credit -= amount;
            this.gameState.money -= amount;
            this.showNotification(`$${amount} credit paid!`, 'success');
            return true;
        } else {
            this.showNotification('Not enough money or no outstanding credit!', 'error');
            return false;
        }
    }

    githubLink() {
        window.open('https://github.com/ufuayk', '_blank');
        this.achievements.unlock('supporter');
        this.showNotification('Thank you for supporting the developer!', 'success');
    }

    // Utility methods
    showNotification(message, type = 'info') {
        if (window.game && window.game.notificationManager) {
            window.game.notificationManager.show(message, type);
        }
    }

    getGameState() {
        return this.gameState;
    }

    loadGameState(savedState) {
        Object.assign(this.gameState, savedState);
        // Reconstruct employee objects
        this.gameState.workers = this.gameState.workers.map(data => Employee.fromData(data));
        this.gameState.marketers = this.gameState.marketers.map(data => Employee.fromData(data));
        this.gameState.salesmen = this.gameState.salesmen.map(data => Employee.fromData(data));
    }

    resetGame() {
        this.gameState = new GameState();
        this.analytics = {
            moneyHistory: [],
            productionHistory: [],
            employeeHistory: []
        };
        this.achievements.reset();
        this.research.reset();
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    getAnalytics() {
        return this.analytics;
    }
}