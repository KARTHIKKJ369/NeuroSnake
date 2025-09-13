class ThemeSystem {
    constructor() {
        this.currentTheme = 'night';
        this.themes = {
            dawn: {
                name: 'Dawn',
                icon: '🌅',
                colors: {
                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
                    snake: '#ff6b9d',
                    food: '#ff0080',
                    border: '#ff6b9d',
                    text: '#333'
                },
                timeRange: [5, 7]
            },
            morning: {
                name: 'Morning',
                icon: '🌤️',
                colors: {
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    snake: '#00d4aa',
                    food: '#ff8a80',
                    border: '#00d4aa',
                    text: '#333'
                },
                timeRange: [7, 11]
            },
            day: {
                name: 'Bright Day',
                icon: '☀️',
                colors: {
                    background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
                    snake: '#fdcb6e',
                    food: '#e17055',
                    border: '#fdcb6e',
                    text: '#fff'
                },
                timeRange: [11, 16]
            },
            afternoon: {
                name: 'Afternoon',
                icon: '🌆',
                colors: {
                    background: 'linear-gradient(135deg, #fab1a0 0%, #e17055 100%)',
                    snake: '#6c5ce7',
                    food: '#a29bfe',
                    border: '#6c5ce7',
                    text: '#fff'
                },
                timeRange: [16, 18]
            },
            dusk: {
                name: 'Dusk',
                icon: '🌇',
                colors: {
                    background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
                    snake: '#e84393',
                    food: '#fd79a8',
                    border: '#e84393',
                    text: '#333'
                },
                timeRange: [18, 20]
            },
            night: {
                name: 'Night',
                icon: '🌙',
                colors: {
                    background: 'linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 50%, #16213e 100%)',
                    snake: '#00ff88',
                    food: '#ff0080',
                    border: '#00ff88',
                    text: '#fff'
                },
                timeRange: [20, 24]
            },
            midnight: {
                name: 'Midnight',
                icon: '🌌',
                colors: {
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    snake: '#9b59b6',
                    food: '#e74c3c',
                    border: '#9b59b6',
                    text: '#ecf0f1'
                },
                timeRange: [0, 5]
            },
            winter: {
                name: 'Winter',
                icon: '❄️',
                colors: {
                    background: 'linear-gradient(135deg, #ddd6f3 0%, #faaca8 100%)',
                    snake: '#3498db',
                    food: '#e74c3c',
                    border: '#3498db',
                    text: '#2c3e50'
                },
                season: 'winter'
            },
            spring: {
                name: 'Spring',
                icon: '🌸',
                colors: {
                    background: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%)',
                    snake: '#27ae60',
                    food: '#e74c3c',
                    border: '#27ae60',
                    text: '#2c3e50'
                },
                season: 'spring'
            },
            summer: {
                name: 'Summer',
                icon: '🏖️',
                colors: {
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    snake: '#f39c12',
                    food: '#e74c3c',
                    border: '#f39c12',
                    text: '#fff'
                },
                season: 'summer'
            },
            autumn: {
                name: 'Autumn',
                icon: '🍂',
                colors: {
                    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                    snake: '#d35400',
                    food: '#c0392b',
                    border: '#d35400',
                    text: '#2c3e50'
                },
                season: 'autumn'
            }
        };
        
        this.userLocation = null;
        this.updateInterval = null;
        
        this.initialize();
    }
    
    initialize() {
        this.getUserLocation();
        this.updateTheme();
        
        // Update theme every minute
        this.updateInterval = setInterval(() => {
            this.updateTheme();
        }, 60000);
    }
    
    getUserLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                    console.log('🌍 Location detected, updating theme based on local time');
                    this.updateTheme();
                },
                (error) => {
                    console.log('📍 Location access denied, using system time for themes');
                    this.updateTheme();
                }
            );
        }
    }
    
    updateTheme() {
        const now = new Date();
        const hour = now.getHours();
        const season = this.getCurrentSeason(now);
        
        // Determine theme based on time of day
        let newTheme = this.getThemeByTime(hour);
        
        // Override with seasonal theme if it's a special season
        const seasonalTheme = this.getSeasonalTheme(season);
        if (seasonalTheme && Math.random() > 0.7) { // 30% chance to use seasonal theme
            newTheme = seasonalTheme;
        }
        
        if (newTheme !== this.currentTheme) {
            this.applyTheme(newTheme);
        }
    }
    
    getThemeByTime(hour) {
        for (let themeName in this.themes) {
            const theme = this.themes[themeName];
            if (theme.timeRange) {
                const [start, end] = theme.timeRange;
                if (start <= end) {
                    if (hour >= start && hour < end) {
                        return themeName;
                    }
                } else {
                    // Handle midnight range (e.g., 20-24 or 0-5)
                    if (hour >= start || hour < end) {
                        return themeName;
                    }
                }
            }
        }
        return 'night'; // Default fallback
    }
    
    getCurrentSeason(date) {
        const month = date.getMonth(); // 0-11
        
        if (month >= 11 || month <= 1) return 'winter';
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'autumn';
        
        return 'spring';
    }
    
    getSeasonalTheme(season) {
        for (let themeName in this.themes) {
            if (this.themes[themeName].season === season) {
                return themeName;
            }
        }
        return null;
    }
    
    applyTheme(themeName) {
        if (!this.themes[themeName]) return;
        
        this.currentTheme = themeName;
        const theme = this.themes[themeName];
        
        console.log(`🎨 Applying theme: ${theme.name}`);
        
        // Update theme display
        this.updateThemeDisplay(theme);
        
        // Apply colors to the game
        this.updateGameColors(theme);
        
        // Apply background to body
        document.body.style.background = theme.colors.background;
        
        // Update text colors
        document.body.style.color = theme.colors.text;
        
        // Create transition effect
        this.createThemeTransition();
    }
    
    updateThemeDisplay(theme) {
        const themeIcon = document.querySelector('.theme-icon');
        const themeName = document.querySelector('.theme-name');
        
        if (themeIcon) themeIcon.textContent = theme.icon;
        if (themeName) themeName.textContent = theme.name;
    }
    
    updateGameColors(theme) {
        if (!game) return;
        
        // Update canvas border
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.style.borderColor = theme.colors.border;
            canvas.style.boxShadow = `
                0 0 30px ${theme.colors.border}30,
                inset 0 0 30px ${theme.colors.border}10
            `;
        }
        
        // Store theme colors for game rendering
        game.themeColors = theme.colors;
    }
    
    createThemeTransition() {
        // Add a subtle transition effect
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: ${this.themes[this.currentTheme].colors.background};
            opacity: 0;
            pointer-events: none;
            z-index: 10000;
            transition: opacity 0.5s ease;
        `;
        
        document.body.appendChild(overlay);
        
        // Fade in and out
        setTimeout(() => {
            overlay.style.opacity = '0.3';
        }, 10);
        
        setTimeout(() => {
            overlay.style.opacity = '0';
        }, 300);
        
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 800);
    }
    
    // Weather-based theme updates (if weather API is available)
    updateThemeForWeather(weatherData) {
        if (!weatherData) return;
        
        const condition = weatherData.main.toLowerCase();
        let weatherTheme = null;
        
        if (condition.includes('rain') || condition.includes('storm')) {
            weatherTheme = 'night'; // Dark theme for rain
        } else if (condition.includes('snow')) {
            weatherTheme = 'winter';
        } else if (condition.includes('clear') && weatherData.temperature > 25) {
            weatherTheme = 'summer';
        }
        
        if (weatherTheme && weatherTheme !== this.currentTheme) {
            console.log(`🌦️ Weather-based theme change: ${condition} -> ${weatherTheme}`);
            this.applyTheme(weatherTheme);
        }
    }
    
    // Special event themes
    applySpecialTheme(eventName) {
        const specialThemes = {
            halloween: {
                name: 'Halloween',
                icon: '🎃',
                colors: {
                    background: 'linear-gradient(135deg, #2c1810 0%, #8b4513 100%)',
                    snake: '#ff6600',
                    food: '#ff0000',
                    border: '#ff6600',
                    text: '#fff'
                }
            },
            christmas: {
                name: 'Christmas',
                icon: '🎄',
                colors: {
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    snake: '#00ff00',
                    food: '#ff0000',
                    border: '#00ff00',
                    text: '#fff'
                }
            },
            neon: {
                name: 'Neon City',
                icon: '🌃',
                colors: {
                    background: 'linear-gradient(135deg, #000000 0%, #1a0033 100%)',
                    snake: '#00ffff',
                    food: '#ff00ff',
                    border: '#00ffff',
                    text: '#00ffff'
                }
            }
        };
        
        if (specialThemes[eventName]) {
            // Temporarily add special theme
            this.themes[eventName] = specialThemes[eventName];
            this.applyTheme(eventName);
        }
    }
    
    // Manual theme selection
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.applyTheme(themeName);
        }
    }
    
    // Get current theme info
    getCurrentThemeInfo() {
        return {
            name: this.currentTheme,
            displayName: this.themes[this.currentTheme].name,
            icon: this.themes[this.currentTheme].icon,
            colors: this.themes[this.currentTheme].colors
        };
    }
    
    // Cleanup
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Custom drawing methods that use theme colors
function setupThemeOverrides() {
    if (typeof GameEngine === 'undefined' || !window.game) {
        // Retry after a short delay if game isn't ready yet
        setTimeout(setupThemeOverrides, 100);
        return;
    }
    
    // Override the drawSnake method to use theme colors
    const originalDrawSnake = GameEngine.prototype.drawSnake;
    GameEngine.prototype.drawSnake = function() {
        const snakeColor = this.themeColors ? this.themeColors.snake : '#00ff88';
        
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (i === 0) {
                // Snake head
                this.ctx.fillStyle = snakeColor;
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
                
                // Add glow effect
                this.ctx.shadowColor = snakeColor;
                this.ctx.shadowBlur = 10;
                this.ctx.fillRect(x + 4, y + 4, this.gridSize - 8, this.gridSize - 8);
                this.ctx.shadowBlur = 0;
                
                // Draw eyes
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(x + 6, y + 6, 3, 3);
                this.ctx.fillRect(x + 11, y + 6, 3, 3);
            } else {
                // Snake body with theme color
                const alpha = 1 - (i / this.snake.length) * 0.5;
                this.ctx.fillStyle = snakeColor + Math.floor(alpha * 255).toString(16).padStart(2, '0');
                this.ctx.fillRect(x + 3, y + 3, this.gridSize - 6, this.gridSize - 6);
            }
        }
    };
    
    // Override drawFood to use theme colors
    const originalDrawFood = GameEngine.prototype.drawFood;
    GameEngine.prototype.drawFood = function() {
        const foodColor = this.themeColors ? this.themeColors.food : '#ff0080';
        
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // Animate food with pulsing effect
        const time = Date.now() * 0.005;
        const scale = 1 + Math.sin(time) * 0.1;
        const size = (this.gridSize - 4) * scale;
        const offset = (this.gridSize - size) / 2;
        
        this.ctx.fillStyle = foodColor;
        this.ctx.fillRect(x + offset, y + offset, size, size);
        
        // Add glow
        this.ctx.shadowColor = foodColor;
        this.ctx.shadowBlur = 15;
        this.ctx.fillRect(x + offset + 2, y + offset + 2, size - 4, size - 4);
        this.ctx.shadowBlur = 0;
    };
}

// Initialize theme system
window.themeSystem = new ThemeSystem();

// Setup theme overrides after game loads
setupThemeOverrides();
