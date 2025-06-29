import { GameEngine } from './core/GameEngine.js';
import { UIManager } from './ui/UIManager.js';
import { NotificationManager } from './ui/NotificationManager.js';
import { AudioManager } from './audio/AudioManager.js';
import { SaveManager } from './utils/SaveManager.js';

class MyDreamFactory {
    constructor() {
        this.gameEngine = new GameEngine();
        this.uiManager = new UIManager();
        this.notificationManager = new NotificationManager();
        this.audioManager = new AudioManager();
        this.saveManager = new SaveManager();
        
        this.init();
    }

    async init() {
        // Show loading screen
        await this.showLoadingScreen();
        
        // Initialize all systems
        await this.initializeSystems();
        
        // Load saved game if exists
        this.loadGame();
        
        // Start game loops
        this.startGameLoops();
        
        // Hide loading screen and show game
        this.hideLoadingScreen();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('🏭 My Dream Factory Enhanced - Game Initialized!');
    }

    async showLoadingScreen() {
        return new Promise(resolve => {
            setTimeout(resolve, 3000); // 3 second loading screen
        });
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const gameContainer = document.getElementById('game-container');
        
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            gameContainer.style.display = 'block';
            gameContainer.classList.add('animate__animated', 'animate__fadeIn');
        }, 500);
    }

    async initializeSystems() {
        await this.gameEngine.initialize();
        await this.uiManager.initialize();
        await this.notificationManager.initialize();
        await this.audioManager.initialize();
        await this.saveManager.initialize();
    }

    setupEventListeners() {
        // Header buttons
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openModal('settings-modal');
        });

        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        document.getElementById('save-btn').addEventListener('click', () => {
            this.saveGame();
        });

        // Expand/collapse buttons
        document.querySelectorAll('.expand-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.target.closest('.expand-btn').dataset.target;
                this.toggleSection(target);
            });
        });

        // Employee filter
        document.getElementById('employee-filter').addEventListener('change', (e) => {
            this.uiManager.filterEmployees(e.target.value);
        });

        // Settings toggles
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.audioManager.setEnabled(e.target.checked);
        });

        document.getElementById('autosave-toggle').addEventListener('change', (e) => {
            this.saveManager.setAutoSave(e.target.checked);
        });

        document.getElementById('notifications-toggle').addEventListener('change', (e) => {
            this.notificationManager.setEnabled(e.target.checked);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window events
        window.addEventListener('beforeunload', () => {
            this.saveGame();
        });

        window.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.gameEngine.pause();
            } else {
                this.gameEngine.resume();
            }
        });
    }

    startGameLoops() {
        // Main game loop (60 FPS)
        setInterval(() => {
            this.gameEngine.update();
            this.uiManager.update(this.gameEngine.getGameState());
        }, 16);

        // Auto-save loop (every 30 seconds)
        setInterval(() => {
            if (this.saveManager.isAutoSaveEnabled()) {
                this.saveGame();
            }
        }, 30000);

        // Analytics loop (every 5 seconds)
        setInterval(() => {
            this.gameEngine.updateAnalytics();
        }, 5000);
    }

    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.saveGame();
                    break;
                case 'f':
                    e.preventDefault();
                    this.toggleFullscreen();
                    break;
            }
        }

        // Quick actions
        switch (e.key) {
            case '1':
                this.gameEngine.buyRawMaterials(10);
                break;
            case '2':
                this.gameEngine.sellProducts();
                break;
            case '3':
                this.gameEngine.hireWorker();
                break;
            case 'Escape':
                this.closeAllModals();
                break;
        }
    }

    toggleSection(targetId) {
        const content = document.getElementById(targetId);
        const btn = document.querySelector(`[data-target="${targetId}"]`);
        const icon = btn.querySelector('i');
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            content.classList.add('animate__animated', 'animate__fadeIn');
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
        } else {
            content.style.display = 'none';
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
        }
    }

    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            document.getElementById('fullscreen-btn').innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            document.getElementById('fullscreen-btn').innerHTML = '<i class="fas fa-expand"></i>';
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.style.display = 'block';
        modal.classList.add('animate__animated', 'animate__fadeIn');
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        modal.classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('animate__animated', 'animate__fadeOut');
        }, 300);
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'block') {
                this.closeModal(modal.id);
            }
        });
    }

    saveGame() {
        const gameState = this.gameEngine.getGameState();
        this.saveManager.saveGame(gameState);
        this.notificationManager.show('Game saved successfully!', 'success');
        this.audioManager.playSound('save');
    }

    loadGame() {
        const savedState = this.saveManager.loadGame();
        if (savedState) {
            this.gameEngine.loadGameState(savedState);
            this.notificationManager.show('Game loaded successfully!', 'info');
        }
    }

    resetGame() {
        if (confirm('Are you sure you want to reset your game? This action cannot be undone.')) {
            this.gameEngine.resetGame();
            this.saveManager.clearSave();
            this.notificationManager.show('Game reset successfully!', 'info');
            this.closeAllModals();
        }
    }
}

// Global functions for HTML onclick handlers
window.buyRawMaterials = (amount) => window.game.gameEngine.buyRawMaterials(amount);
window.sellProducts = () => window.game.gameEngine.sellProducts();
window.hireWorker = () => window.game.gameEngine.hireWorker();
window.hireMarketer = () => window.game.gameEngine.hireMarketer();
window.hireSalesman = () => window.game.gameEngine.hireSalesman();
window.motivateEmployees = () => window.game.gameEngine.motivateEmployees();
window.upgradeStorage = () => window.game.gameEngine.upgradeStorage();
window.upgradeFactory = () => window.game.gameEngine.upgradeFactory();
window.runAdvertising = () => window.game.gameEngine.runAdvertising();
window.takeCredit = () => window.game.gameEngine.takeCredit();
window.payCredit = () => window.game.gameEngine.payCredit();
window.githubLink = () => window.game.gameEngine.githubLink();
window.closeModal = (modalId) => window.game.closeModal(modalId);
window.resetGame = () => window.game.resetGame();

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.game = new MyDreamFactory();
});