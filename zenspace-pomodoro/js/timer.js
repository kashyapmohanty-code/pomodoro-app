/**
 * UI Graphics & Audio Notification Pipeline Class Engine
 */
class VisualTimerEngine {
    constructor(displayElement, canvasElement, alertCallback) {
        this.display = displayElement;
        this.canvas = canvasElement;
        this.alertCallback = alertCallback;
        
        this.durations = { pomo: 25 * 60, break: 5 * 60 };
        this.currentMode = 'pomo';
        this.timeLeft = this.durations[this.currentMode];
        this.totalDuration = this.durations[this.currentMode];
        this.intervalId = null;
        this.activeTheme = 'candle'; 
    }

    updateDurations(pomoMins, breakMins) {
        this.durations.pomo = pomoMins * 60;
        this.durations.break = breakMins * 60;
        
        if (!this.intervalId) {
            this.timeLeft = this.durations[this.currentMode];
            this.totalDuration = this.durations[this.currentMode];
            this.updateUI();
        }
    }

    setMode(mode) {
        this.currentMode = mode;
        this.timeLeft = this.durations[mode];
        this.totalDuration = this.durations[mode];
        this.updateUI();
    }

    setTheme(themeName) {
        this.activeTheme = themeName;
        this.renderGraphic();
    }

    start(onTick) {
        if (this.intervalId) return;
        
        this.intervalId = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateUI();
                if (onTick) onTick();
            } else {
                this.stop();
                this.triggerAlarmChime(); // Play synthesized electronic chime sound instantly
                if (this.alertCallback) this.alertCallback();
            }
        }, 1000);
    }

    stop() {
        clearInterval(this.intervalId);
        this.intervalId = null;
    }

    reset() {
        this.stop();
        this.timeLeft = this.durations[this.currentMode];
        this.updateUI();
    }

    getCompletionRatio() {
        return this.timeLeft / this.totalDuration;
    }

    /**
     * Synthesizes a beautiful, zero-dependency electronic notification alert chime 
     * directly inside the browser using clean mathematical audio waveforms.
     */
    triggerAlarmChime() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            
            // Sequential harmonic frequencies array (Crisp progressive chime)
            const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 -> E5 -> G5 -> C6
            const noteDuration = 0.15;
            
            notes.forEach((freq, index) => {
                const startTime = ctx.currentTime + (index * noteDuration);
                
                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);
                
                // Smooth envelope fade-out to prevent popping
                gainNode.gain.setValueAtTime(0.25, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration - 0.02);
                
                osc.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                osc.start(startTime);
                osc.stop(startTime + noteDuration);
            });
        } catch (e) {
            console.error("Audio Context notification chime initialization block:", e);
        }
    }

    updateUI() {
        const mins = Math.floor(this.timeLeft / 60).toString().padStart(2, '0');
        const secs = (this.timeLeft % 60).toString().padStart(2, '0');
        this.display.textContent = `${mins}:${secs}`;
        this.renderGraphic();
    }

    renderGraphic() {
        const ratio = this.getCompletionRatio(); 
        const isRunning = this.intervalId !== null;

        if (this.activeTheme === 'candle') {
            const candleHeight = 100 * ratio;
            const candleY = 140 - candleHeight;
            const wickY = candleY - 12;
            const flameY = wickY - 5;

            this.canvas.innerHTML = `
                <svg viewBox="0 0 200 200" class="w-full h-full select-none">
                    <ellipse cx="100" cy="145" rx="45" ry="12" fill="none" stroke="#34d399" stroke-width="3" opacity="0.4"/>
                    <path d="M 50,145 L 50,155 A 50,10 0 0,0 150,155 L 150,145" fill="#1f2937" opacity="0.8"/>
                    ${ratio > 0.001 ? `
                        <rect x="80" y="${candleY}" width="40" height="${candleHeight}" rx="4" fill="url(#candleGrad)"/>
                        <line x1="100" y1="${candleY}" x2="100" y2="${wickY}" stroke="#78350f" stroke-width="3" />
                        <g class="${isRunning ? 'animate-flame' : ''}">
                            <path d="M 100,${flameY} C 92,${flameY+12} 92,${flameY+22} 100,${flameY+25} C 108,${flameY+22} 108,${flameY+12} 100,${flameY}" fill="url(#flameGrad)" filter="drop-shadow(0 0 6px #f97316)"/>
                        </g>
                    ` : ''}
                    <defs>
                        <linearGradient id="candleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#f59e0b" /><stop offset="50%" stop-color="#fbbf24" /><stop offset="100%" stop-color="#d97706" />
                        </linearGradient>
                        <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stop-color="#ef4444" /><stop offset="40%" stop-color="#f97316" /><stop offset="80%" stop-color="#facc15" /><stop offset="100%" stop-color="#ffffff" />
                        </linearGradient>
                    </defs>
                </svg>
            `;
        } 
        else if (this.activeTheme === 'ice') {
            const scale = 0.2 + (0.8 * ratio);
            const opacity = 0.3 + (0.7 * ratio);
            const puddleRx = 60 * (1 - ratio);
            const puddleRy = 15 * (1 - ratio);

            this.canvas.innerHTML = `
                <svg viewBox="0 0 200 200" class="w-full h-full select-none">
                    <ellipse cx="100" cy="145" rx="${puddleRx}" ry="${puddleRy}" fill="#38bdf8" opacity="0.5" />
                    ${ratio > 0.001 ? `
                        <g transform="translate(100,110) scale(${scale})" transform-origin="center" opacity="${opacity}">
                            <polygon points="-40,-10 0,-30 40,-10 40,30 0,50 -40,30" fill="url(#iceFront)" stroke="#e0f2fe" stroke-width="1.5"/>
                            <polygon points="-40,-10 0,-30 40,-10 0,10" fill="#f0f9ff" opacity="0.6"/>
                            <line x1="0" y1="10" x2="0" y2="50" stroke="#e0f2fe" stroke-width="1" opacity="0.7"/>
                        </g>
                        ${isRunning ? `<circle cx="98" cy="115" r="3" fill="#67e8f9" class="animate-drip" />` : ''}
                    ` : ''}
                    <defs>
                        <linearGradient id="iceFront" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#bae6fd" stop-opacity="0.7"/><stop offset="100%" stop-color="#38bdf8" stop-opacity="0.4"/>
                        </linearGradient>
                    </defs>
                </svg>
            `;
        }
        else if (this.activeTheme === 'hourglass') {
            const topSandHeight = 35 * ratio;
            const bottomSandHeight = 35 * (1 - ratio);
            const bottomSandY = 155 - bottomSandHeight;

            this.canvas.innerHTML = `
                <svg viewBox="0 0 200 200" class="w-full h-full select-none">
                    <path d="M 60,45 L 140,45 L 115,100 L 140,155 L 60,155 L 85,100 Z" fill="none" stroke="#e2e8f0" stroke-width="3" opacity="0.4"/>
                    <rect x="55" y="38" width="90" height="7" rx="2" fill="#1e293b"/>
                    <rect x="55" y="155" width="90" height="7" rx="2" fill="#1e293b"/>
                    <path d="M ${85 + (15 * (1 - ratio))},${100 - topSandHeight} L ${115 - (15 * (1 - ratio))},${100 - topSandHeight} L 107,100 L 93,100 Z" fill="#fb7185"/>
                    <path d="M ${100 - (20 * (1 - ratio))},155 L ${100 + (20 * (1 - ratio))},155 L ${100 + (10 * (1 - ratio))},${bottomSandY} L ${100 - (10 * (1 - ratio))},${bottomSandY} Z" fill="#fb7185"/>
                    ${isRunning && ratio > 0.001 ? `
                        <line x1="100" y1="100" x2="100" y2="150" stroke="#fb7185" stroke-width="2" stroke-dasharray="4 4" />
                    ` : ''}
                </svg>
            `;
        }
        else if (this.activeTheme === 'plant') {
            const invertedRatio = 1 - ratio; 
            const stemLength = 40 * invertedRatio;
            const leafScale = invertedRatio;
            const flowerScale = invertedRatio > 0.8 ? (invertedRatio - 0.8) * 5 : 0; 

            this.canvas.innerHTML = `
                <svg viewBox="0 0 200 200" class="w-full h-full select-none">
                    <polygon points="75,140 125,140 115,175 85,175" fill="#e06a3b"/>
                    <rect x="70" y="132" width="60" height="8" rx="2" fill="#c2592e"/>
                    <ellipse cx="100" cy="134" rx="25" ry="3" fill="#78350f"/>
                    ${invertedRatio > 0.05 ? `
                        <path d="M 100,134 Q 95,${134 - (stemLength/2)} 100,${134 - stemLength}" fill="none" stroke="#4ade80" stroke-width="4" stroke-linecap="round"/>
                    ` : ''}
                    ${invertedRatio > 0.4 ? `
                        <g transform="translate(97, 110) scale(${leafScale})" transform-origin="center">
                            <path d="M 100,110 Q 80,100 85,115 Q 100,115 100,110" fill="#22c55e"/>
                        </g>
                    ` : ''}
                    ${invertedRatio > 0.8 ? `
                        <g transform="translate(100, ${134 - stemLength}) scale(${flowerScale})" transform-origin="center">
                            <circle cx="100" cy="100" r="8" fill="#facc15"/>
                            <circle cx="100" cy="86" r="7" fill="#f43f5e"/>
                            <circle cx="114" cy="100" r="7" fill="#f43f5e"/>
                            <circle cx="100" cy="114" r="7" fill="#f43f5e"/>
                            <circle cx="86" cy="100" r="7" fill="#f43f5e"/>
                        </g>
                    ` : ''}
                </svg>
            `;
        }
    }
}