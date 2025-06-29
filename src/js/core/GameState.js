export class GameState {
    constructor() {
        this.money = 500;
        this.rawMaterials = 0;
        this.products = 0;
        this.workers = [];
        this.marketers = [];
        this.salesmen = [];
        this.brand = 0;
        this.productionRate = 1;
        this.baseProductPrice = 10;
        this.maxStorage = 100;
        this.maxProducts = 100;
        this.efficiency = 100;
        this.credit = 0;
        this.creditLimit = 5000;
        this.interestRate = 10;
        this.achievements = new Set();
        this.autoSell = false;
        this.factoryLevel = 0;
        this.researchPoints = 0;
        this.completedResearch = new Set();
        
        // Analytics
        this.totalMoneyEarned = 0;
        this.totalProductsSold = 0;
        this.totalEmployeesHired = 0;
        this.gameStartTime = Date.now();
    }

    // Utility methods
    getTotalEmployees() {
        return this.workers.length + this.marketers.length + this.salesmen.length;
    }

    getAverageMorale() {
        const allEmployees = [...this.workers, ...this.marketers, ...this.salesmen];
        if (allEmployees.length === 0) return 100;
        
        const totalMorale = allEmployees.reduce((sum, emp) => sum + emp.mood, 0);
        return totalMorale / allEmployees.length;
    }

    getNetWorth() {
        const inventoryValue = (this.rawMaterials * 5) + (this.products * this.baseProductPrice);
        return this.money + inventoryValue - this.credit;
    }

    getPlayTime() {
        return Date.now() - this.gameStartTime;
    }

    // Serialization
    toJSON() {
        return {
            ...this,
            achievements: Array.from(this.achievements),
            completedResearch: Array.from(this.completedResearch)
        };
    }

    static fromJSON(data) {
        const state = new GameState();
        Object.assign(state, data);
        state.achievements = new Set(data.achievements || []);
        state.completedResearch = new Set(data.completedResearch || []);
        return state;
    }
}