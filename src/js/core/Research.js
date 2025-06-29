const RESEARCH_ITEMS = [
    {
        id: 'efficient-production',
        name: 'Efficient Production',
        description: 'Increase production efficiency by 25%',
        cost: 1000,
        type: 'production',
        bonus: 0.25,
        requirements: []
    },
    {
        id: 'bulk-purchasing',
        name: 'Bulk Purchasing',
        description: 'Get 10% discount on raw materials',
        cost: 1500,
        type: 'purchase',
        bonus: 0.10,
        requirements: []
    },
    {
        id: 'advanced-marketing',
        name: 'Advanced Marketing',
        description: 'Marketing campaigns are 50% more effective',
        cost: 2000,
        type: 'marketing',
        bonus: 0.50,
        requirements: []
    },
    {
        id: 'premium-products',
        name: 'Premium Products',
        description: 'Increase product selling price by 30%',
        cost: 2500,
        type: 'sales',
        bonus: 0.30,
        requirements: ['efficient-production']
    },
    {
        id: 'automation',
        name: 'Factory Automation',
        description: 'Double production speed',
        cost: 5000,
        type: 'production',
        bonus: 1.0,
        requirements: ['efficient-production', 'bulk-purchasing']
    },
    {
        id: 'global-expansion',
        name: 'Global Expansion',
        description: 'Triple sales effectiveness',
        cost: 10000,
        type: 'sales',
        bonus: 2.0,
        requirements: ['advanced-marketing', 'premium-products']
    }
];

export class Research {
    constructor() {
        this.researchItems = RESEARCH_ITEMS;
        this.completedResearch = new Set();
        this.activeResearch = null;
        this.researchProgress = 0;
    }

    initialize() {
        console.log('🔬 Research system initialized');
    }

    updateResearch(gameState) {
        // Generate research points based on employees and brand
        const pointsPerSecond = (
            gameState.workers.length * 0.1 +
            gameState.marketers.length * 0.2 +
            gameState.salesmen.length * 0.15 +
            gameState.brand * 0.05
        ) / 60;

        gameState.researchPoints += pointsPerSecond;

        // Update active research progress
        if (this.activeResearch) {
            const research = this.researchItems.find(r => r.id === this.activeResearch);
            if (research) {
                this.researchProgress += pointsPerSecond;
                
                if (this.researchProgress >= research.cost) {
                    this.completeResearch(research.id);
                    this.activeResearch = null;
                    this.researchProgress = 0;
                    
                    if (window.game) {
                        window.game.notificationManager.show(
                            `🔬 Research Complete: ${research.name}!`,
                            'success'
                        );
                    }
                }
            }
        }

        gameState.completedResearch = this.completedResearch;
    }

    startResearch(researchId, gameState) {
        const research = this.researchItems.find(r => r.id === researchId);
        if (!research) return false;

        // Check requirements
        if (!this.canResearch(researchId)) {
            if (window.game) {
                window.game.notificationManager.show(
                    'Research requirements not met!',
                    'error'
                );
            }
            return false;
        }

        // Check if already completed
        if (this.completedResearch.has(researchId)) {
            if (window.game) {
                window.game.notificationManager.show(
                    'Research already completed!',
                    'error'
                );
            }
            return false;
        }

        // Check if enough research points
        if (gameState.researchPoints < research.cost) {
            if (window.game) {
                window.game.notificationManager.show(
                    'Not enough research points!',
                    'error'
                );
            }
            return false;
        }

        this.activeResearch = researchId;
        this.researchProgress = 0;
        
        if (window.game) {
            window.game.notificationManager.show(
                `🔬 Started researching: ${research.name}`,
                'info'
            );
        }

        return true;
    }

    canResearch(researchId) {
        const research = this.researchItems.find(r => r.id === researchId);
        if (!research) return false;

        return research.requirements.every(req => this.completedResearch.has(req));
    }

    completeResearch(researchId) {
        this.completedResearch.add(researchId);
    }

    getProductionBonus() {
        let bonus = 0;
        this.completedResearch.forEach(researchId => {
            const research = this.researchItems.find(r => r.id === researchId);
            if (research && research.type === 'production') {
                bonus += research.bonus;
            }
        });
        return bonus;
    }

    getMarketingBonus() {
        let bonus = 0;
        this.completedResearch.forEach(researchId => {
            const research = this.researchItems.find(r => r.id === researchId);
            if (research && research.type === 'marketing') {
                bonus += research.bonus;
            }
        });
        return bonus;
    }

    getSalesBonus() {
        let bonus = 0;
        this.completedResearch.forEach(researchId => {
            const research = this.researchItems.find(r => r.id === researchId);
            if (research && research.type === 'sales') {
                bonus += research.bonus;
            }
        });
        return bonus;
    }

    getPurchaseDiscount() {
        let discount = 0;
        this.completedResearch.forEach(researchId => {
            const research = this.researchItems.find(r => r.id === researchId);
            if (research && research.type === 'purchase') {
                discount += research.bonus;
            }
        });
        return discount;
    }

    getPriceBonus() {
        return this.getSalesBonus(); // Same as sales bonus for now
    }

    getAvailableResearch() {
        return this.researchItems.filter(research => 
            !this.completedResearch.has(research.id) && 
            this.canResearch(research.id)
        );
    }

    getCompletedResearch() {
        return this.researchItems.filter(research => 
            this.completedResearch.has(research.id)
        );
    }

    getActiveResearch() {
        if (!this.activeResearch) return null;
        
        const research = this.researchItems.find(r => r.id === this.activeResearch);
        return {
            ...research,
            progress: this.researchProgress,
            progressPercent: (this.researchProgress / research.cost) * 100
        };
    }

    reset() {
        this.completedResearch.clear();
        this.activeResearch = null;
        this.researchProgress = 0;
    }
}