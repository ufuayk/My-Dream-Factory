export class AudioManager {
    constructor() {
        this.isEnabled = true;
        this.volume = 0.5;
        this.sounds = {};
        this.audioContext = null;
    }

    async initialize() {
        // Initialize Web Audio API
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            await this.loadSounds();
            console.log('🔊 Audio Manager initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }

    async loadSounds() {
        // For now, we'll use simple beep sounds generated programmatically
        // In a full implementation, you'd load actual audio files
        this.sounds = {
            click: this.createBeep(800, 0.1),
            success: this.createBeep(600, 0.2),
            error: this.createBeep(300, 0.3),
            achievement: this.createChime(),
            save: this.createBeep(1000, 0.1),
            purchase: this.createBeep(700, 0.15),
            hire: this.createBeep(900, 0.2)
        };
    }

    createBeep(frequency, duration) {
        return () => {
            if (!this.isEnabled || !this.audioContext) return;

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        };
    }

    createChime() {
        return () => {
            if (!this.isEnabled || !this.audioContext) return;

            const frequencies = [523.25, 659.25, 783.99]; // C, E, G
            frequencies.forEach((freq, index) => {
                setTimeout(() => {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);

                    oscillator.frequency.value = freq;
                    oscillator.type = 'sine';

                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, this.audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + 0.3);
                }, index * 100);
            });
        };
    }

    playSound(soundName) {
        if (!this.isEnabled || !this.sounds[soundName]) return;

        try {
            // Resume audio context if suspended (required by some browsers)
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            
            this.sounds[soundName]();
        } catch (error) {
            console.warn('Failed to play sound:', error);
        }
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }

    // Convenience methods
    playClick() { this.playSound('click'); }
    playSuccess() { this.playSound('success'); }
    playError() { this.playSound('error'); }
    playAchievement() { this.playSound('achievement'); }
    playSave() { this.playSound('save'); }
    playPurchase() { this.playSound('purchase'); }
    playHire() { this.playSound('hire'); }
}