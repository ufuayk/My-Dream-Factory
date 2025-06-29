const ACHIEVEMENTS = [
    {
        id: 'first-worker',
        name: 'First Worker',
        description: 'You hired your first worker.',
        icon: 'fa-user',
        condition: (state) => state.workers.length > 0
    },
    {
        id: 'happy-workers',
        name: 'Happy Workers',
        description: 'All employees have morale above 90%.',
        icon: 'fa-smile',
        condition: (state) => {
            const allEmployees = [...state.workers, ...state.marketers, ...state.salesmen];
            return allEmployees.length > 0 && allEmployees.every(emp => emp.mood > 90);
        }
    },
    {
        id: 'factory-empire',
        name: 'Factory Empire',
        description: 'You reached 10 workers.',
        icon: 'fa-industry',
        condition: (state) => state.workers.length >= 10
    },
    {
        id: 'master-seller',
        name: 'Master Seller',
        description: 'You reached 10 salespeople.',
        icon: 'fa-user-tie',
        condition: (state) => state.salesmen.length >= 10
    },
    {
        id: 'production-master',
        name: 'Production Master',
        description: 'You reached a production speed of 10 products per second.',
        icon: 'fa-cogs',
        condition: (state) => state.productionRate >= 10
    },
    {
        id: 'marketing-master',
        name: 'Marketing Master',
        description: 'Your brand value exceeded 10.',
        icon: 'fa-chart-line',
        condition: (state) => state.brand >= 10
    },
    {
        id: 'storage-king',
        name: 'Storage King',
        description: 'You increased your storage capacity to 1000.',
        icon: 'fa-warehouse',
        condition: (state) => state.maxStorage >= 1000
    },
    {
        id: 'millionaire',
        name: 'Millionaire',
        description: 'You reached a capital of $1,000,000.',
        icon: 'fa-dollar-sign',
        condition: (state) => state.money >= 1000000
    },
    {
        id: 'billionaire',
        name: 'Billionaire',
        description: 'You reached a capital of $1,000,000,000.',
        icon: 'fa-dollar-sign',
        condition: (state) => state.money >= 1000000000
    },
    {
        id: 'supporter',
        name: 'Supporter',
        description: 'You viewed the developer on GitHub.',
        icon: 'fa-heart',
        condition: () => false // Manually unlocked
    },
    {
        id: 'efficiency-expert',
        name: 'Efficiency Expert',
        description: 'Maintain 95% efficiency for 5 minutes.',
        icon: 'fa-tachometer-alt',
        condition: (state) => state.efficiency >= 95,
        timeRequired: 300000 // 5 minutes
    },
    {
        id: 'debt-free',
        name: 'Debt Free',
        description: 'Pay off all your debts.',
        icon: 'fa-piggy-bank',
        condition: (state) => state.credit === 0 && state.totalMoneyEarned > 10000
    }
];

export class Achievement {
    constructor() {
        this.achievements = ACHIEVEMENTS;
        this.unlockedAchievements = new Set();
        this.timeTracking = new Map();
    }

    initialize() {
        console.log('🏆 Achievement system initialized');
    }

    checkAchievements(gameState) {
        this.achievements.forEach(achievement => {
            if (this.unlockedAchievements.has(achievement.id)) return;

            if (achievement.condition(gameState)) {
                if (achievement.timeRequired) {
                    // Handle time-based achievements
                    if (!this.timeTracking.has(achievement.id)) {
                        this.timeTracking.set(achievement.id, Date.now());
                    } else {
                        const startTime = this.timeTracking.get(achievement.id);
                        if (Date.now() - startTime >= achievement.timeRequired) {
                            this.unlock(achievement.id);
                            this.timeTracking.delete(achievement.id);
                        }
                    }
                } else {
                    this.unlock(achievement.id);
                }
            } else if (achievement.timeRequired && this.timeTracking.has(achievement.id)) {
                // Reset time tracking if condition is no longer met
                this.timeTracking.delete(achievement.id);
            }
        });

        // Update game state achievements
        gameState.achievements = this.unlockedAchievements;
    }

    unlock(achievementId) {
        if (this.unlockedAchievements.has(achievementId)) return;

        this.unlockedAchievements.add(achievementId);
        const achievement = this.achievements.find(a => a.id === achievementId);
        
        if (achievement && window.game) {
            window.game.notificationManager.show(
                `🏆 Achievement Unlocked: ${achievement.name}!`,
                'success'
            );
            window.game.audioManager.playSound('achievement');
        }
    }

    getUnlockedCount() {
        return this.unlockedAchievements.size;
    }

    getTotalCount() {
        return this.achievements.length;
    }

    getAchievements() {
        return this.achievements.map(achievement => ({
            ...achievement,
            unlocked: this.unlockedAchievements.has(achievement.id)
        }));
    }

    reset() {
        this.unlockedAchievements.clear();
        this.timeTracking.clear();
    }
}