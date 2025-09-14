// Main initialization and coordination file for NeuroSnake
class NeuroSnakeApp {
    constructor() {
        this.version = '1.0.0';
        this.initialized = false;
        this.components = {};
        
        // Get canvas element
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
        // Performance monitoring
        this.performanceMetrics = {
            frameRate: 60,
            gameStartTime: null,
            totalFrames: 0
        };
        
        this.initialize();
    }
    
    async initialize() {
        console.log('� Initializing NeuroSnake...');
        
        // Initialize game components in order
        this.gameEngine = new GameEngine(this.canvas);
        this.aiSystem = new AISystem();
        this.powerUpSystem = new PowerUpSystem(this.gameEngine);
        this.themeSystem = new ThemeSystem(this.gameEngine);
        this.multiplayer = new MultiplayerSystem(this.gameEngine);
        this.trendingFoodSystem = new TrendingFoodSystem();
        
        // Make systems globally accessible
        window.gameEngine = this.gameEngine;
        window.aiSystem = this.aiSystem;
        window.powerUpSystem = this.powerUpSystem;
        window.themeSystem = this.themeSystem;
        window.multiplayer = this.multiplayer;
        window.trendingFoodSystem = this.trendingFoodSystem;
        
        // Wait for trending food system to initialize
        if (this.trendingFoodSystem) {
            console.log('⏳ Waiting for trending food system...');
            // Give it a moment to fetch initial data
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Make systems globally accessible
        window.gameEngine = this.gameEngine;
        window.aiSystem = this.aiSystem;
        window.powerUpSystem = this.powerUpSystem;
        window.themeSystem = this.themeSystem;
        window.multiplayer = this.multiplayer;
        
        this.setupEventListeners();
        this.startPerformanceMonitoring();
        this.updateUI();
        
        console.log('✅ NeuroSnake initialized successfully!');
    }
    
    updateUI() {
        console.log('🖥️ Updating UI...');
        // Update any UI elements that need initial values
        const scoreElement = document.getElementById('current-score');
        if (scoreElement) {
            scoreElement.textContent = '0';
        }
        
        const levelElement = document.getElementById('current-level');
        if (levelElement) {
            levelElement.textContent = '1';
        }
        
        // Update food preview if trending food system is available
        if (window.trendingFoodSystem) {
            window.trendingFoodSystem.updateFoodPreview();
        }
    }
    
    startPerformanceMonitoring() {
        console.log('📊 Performance monitoring started');
        // Basic performance monitoring
        this.performanceMetrics.gameStartTime = Date.now();
    }
    
    setupEventListeners() {
        console.log('🎮 Setting up button event listeners...');
        
        // Single Player button
        const singlePlayerBtn = document.getElementById('single-player');
        if (singlePlayerBtn) {
            singlePlayerBtn.addEventListener('click', () => {
                console.log('🎯 Single Player button clicked!');
                this.startGame('single');
            });
        } else {
            console.error('❌ Single Player button not found!');
        }
        
        // Multiplayer button
        const multiplayerBtn = document.getElementById('multiplayer');
        if (multiplayerBtn) {
            multiplayerBtn.addEventListener('click', () => {
                console.log('👥 Starting Multiplayer mode...');
                this.startGame('multiplayer');
            });
        }
        
        // AI Training button
        const aiTrainingBtn = document.getElementById('ai-training');
        if (aiTrainingBtn) {
            aiTrainingBtn.addEventListener('click', () => {
                console.log('🧠 Starting AI Training mode...');
                this.startGame('ai-training');
            });
        }
        
        // Play Again button
        const playAgainBtn = document.getElementById('play-again');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                console.log('🔄 Restarting game...');
                this.restartGame();
            });
        }
        
        // Pause menu buttons
        const resumeBtn = document.getElementById('resume-game');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                console.log('▶️ Resume button clicked');
                this.resumeGame();
            });
        }
        
        const restartBtn = document.getElementById('restart-game');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                console.log('🔄 Restart from pause menu');
                this.restartGame();
            });
        }
        
        const mainMenuBtn = document.getElementById('main-menu-btn');
        if (mainMenuBtn) {
            mainMenuBtn.addEventListener('click', () => {
                console.log('🏠 Return to main menu from pause');
                this.showMainMenu();
            });
        }
        
        // Game controls
        document.addEventListener('keydown', (e) => {
            console.log('⌨️ Key pressed:', e.code, 'Game running:', this.gameEngine?.gameRunning);
            
            // Handle Escape key regardless of game state
            if (e.code === 'Escape') {
                e.preventDefault();
                console.log('🔙 Escape pressed');
                console.log('Current game state:', this.gameEngine?.gameRunning);
                console.log('Current pause state:', this.gameEngine?.isPaused);
                
                if (this.gameEngine && this.gameEngine.gameRunning) {
                    // Game is running - pause using proper pause mechanism
                    if (!this.gameEngine.isPaused) {
                        this.gameEngine.togglePause();
                        console.log('⏸️ Game paused - showing pause menu');
                        this.showPauseMenu();
                    } else {
                        // Already paused - show main menu
                        console.log('📋 Already paused - showing main menu');
                        this.showMainMenu();
                    }
                } else {
                    // Game is not running - show main menu
                    console.log('📋 Showing main menu');
                    this.showMainMenu();
                }
                return;
            }
            
            if (!this.gameEngine || !this.gameEngine.gameRunning) {
                console.log('❌ Game not running, ignoring key');
                return;
            }
            
            switch(e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    e.preventDefault();
                    console.log('⬆️ Moving up');
                    this.gameEngine.changeDirection(0, -1);
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    e.preventDefault();
                    console.log('⬇️ Moving down');
                    this.gameEngine.changeDirection(0, 1);
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    e.preventDefault();
                    console.log('⬅️ Moving left');
                    this.gameEngine.changeDirection(-1, 0);
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    e.preventDefault();
                    console.log('➡️ Moving right');
                    this.gameEngine.changeDirection(1, 0);
                    break;
                case 'Space':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case 'KeyP':
                    e.preventDefault();
                    if (this.powerUpSystem) {
                        this.powerUpSystem.spawnRandomPowerUp();
                    }
                    break;
                case 'KeyT':
                    e.preventDefault();
                    console.log('🌀 Teleport key pressed');
                    if (this.powerUpSystem) {
                        this.powerUpSystem.usePowerUp('teleport');
                    }
                    break;
                case 'KeyF':
                    e.preventDefault();
                    console.log('❄️ Freeze key pressed');
                    if (this.powerUpSystem) {
                        this.powerUpSystem.usePowerUp('freeze');
                    }
                    break;
                case 'Digit1':
                    e.preventDefault();
                    console.log('⚡ Speed boost key pressed');
                    if (this.powerUpSystem) {
                        this.powerUpSystem.usePowerUp('speed');
                    }
                    break;
                case 'Digit2':
                    e.preventDefault();
                    console.log('👻 Ghost mode key pressed');
                    if (this.powerUpSystem) {
                        this.powerUpSystem.usePowerUp('ghost');
                    }
                    break;
                case 'Digit3':
                    e.preventDefault();
                    console.log('🛡️ Shield key pressed');
                    console.log('🛡️ this.powerUpSystem:', this.powerUpSystem);
                    console.log('🛡️ window.powerUpSystem:', window.powerUpSystem);
                    if (this.powerUpSystem) {
                        console.log('🛡️ Calling usePowerUp(shield)');
                        this.powerUpSystem.usePowerUp('shield');
                    } else {
                        console.error('❌ No powerUpSystem available!');
                    }
                    break;
            }
        });
        
        // Setup mobile touch controls
        this.setupMobileControls();
        
        console.log('✅ Event listeners set up successfully!');
    }
    
    setupMobileControls() {
        console.log('📱 Setting up mobile touch controls...');
        
        // Direction buttons
        const directionButtons = {
            'up-btn': { x: 0, y: -1 },
            'down-btn': { x: 0, y: 1 },
            'left-btn': { x: -1, y: 0 },
            'right-btn': { x: 1, y: 0 }
        };
        
        Object.entries(directionButtons).forEach(([buttonId, direction]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    if (this.gameEngine && this.gameEngine.gameRunning) {
                        this.gameEngine.changeDirection(direction.x, direction.y);
                    }
                });
                
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (this.gameEngine && this.gameEngine.gameRunning) {
                        this.gameEngine.changeDirection(direction.x, direction.y);
                    }
                });
            }
        });
        
        // Power-up buttons
        const powerUpButtons = {
            'speed-btn': '1',
            'teleport-btn': '2', 
            'shield-btn': '3',
            'freeze-btn': '4',
            'ghost-btn': '5'
        };
        
        Object.entries(powerUpButtons).forEach(([buttonId, key]) => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.usePowerUpByKey(key);
                });
                
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.usePowerUpByKey(key);
                });
            }
        });
        
        // Pause button
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                if (this.gameEngine && this.gameEngine.gameRunning) {
                    this.togglePause();
                }
            });
            
            pauseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.gameEngine && this.gameEngine.gameRunning) {
                    this.togglePause();
                }
            });
        }
        
        console.log('✅ Mobile controls set up successfully!');
        
        // Add swipe gesture support
        this.setupSwipeControls();
    }
    
    setupSwipeControls() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        const canvas = this.canvas;
        if (!canvas) return;
        
        canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }, { passive: true });
        
        canvas.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 0) return;
            
            const touch = e.changedTouches[0];
            endX = touch.clientX;
            endY = touch.clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const minSwipeDistance = 30;
            
            // Only process swipe if it's long enough
            if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
                // Determine primary direction
                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    // Horizontal swipe
                    if (deltaX > 0) {
                        this.gameEngine?.changeDirection(1, 0); // Right
                    } else {
                        this.gameEngine?.changeDirection(-1, 0); // Left
                    }
                } else {
                    // Vertical swipe
                    if (deltaY > 0) {
                        this.gameEngine?.changeDirection(0, 1); // Down
                    } else {
                        this.gameEngine?.changeDirection(0, -1); // Up
                    }
                }
            }
        }, { passive: true });
        
        console.log('✅ Swipe controls set up successfully!');
    }
    
    usePowerUpByKey(key) {
        if (this.powerUpSystem && this.gameEngine && this.gameEngine.gameRunning) {
            switch(key) {
                case '1':
                    this.powerUpSystem.usePowerUp('speed');
                    break;
                case '2':
                    this.powerUpSystem.usePowerUp('teleport');
                    break;
                case '3':
                    this.powerUpSystem.usePowerUp('shield');
                    break;
                case '4':
                    this.powerUpSystem.usePowerUp('freeze');
                    break;
                case '5':
                    this.powerUpSystem.usePowerUp('ghost');
                    break;
            }
        }
    }
    
    togglePause() {
        if (this.gameEngine) {
            this.gameEngine.togglePause();
            
            const pauseMenu = document.getElementById('pause-menu');
            const gameOverlay = document.getElementById('game-overlay');
            
            if (this.gameEngine.isPaused) {
                this.showMenu('pause-menu');
            } else {
                this.hideGameOverlay();
            }
        }
    }
    
    startGame(mode = 'single') {
        console.log(`🎮 Main.js: Starting game in ${mode} mode...`);
        
        // Hide menu overlay
        this.hideGameOverlay();
        
        // Make sure canvas is visible
        if (this.canvas) {
            this.canvas.style.display = 'block';
            this.canvas.style.visibility = 'visible';
            console.log('✅ Canvas visibility ensured');
        }
        
        // Set game mode
        if (this.gameEngine) {
            console.log('✅ GameEngine found, calling startGame...');
            this.gameEngine.gameMode = mode;
            
            // Configure multiplayer if needed
            if (mode === 'multiplayer' && this.multiplayer) {
                this.multiplayer.joinGame();
                this.multiplayer.isActive = true;
            } else if (this.multiplayer) {
                // Deactivate multiplayer for other modes
                this.multiplayer.leaveGame();
                this.multiplayer.isActive = false;
            }
            
            // Start the game
            this.gameEngine.startGame();
            
            // Force a manual draw as backup
            setTimeout(() => {
                console.log('🔄 Manual backup draw...');
                if (this.gameEngine && this.gameEngine.draw) {
                    this.gameEngine.draw();
                }
            }, 100);
        } else {
            console.error('❌ GameEngine not found!');
        }
    }
    
    resumeGame() {
        console.log('▶️ Resuming game...');
        
        // Hide the pause menu and overlay
        this.hidePauseMenu();
        this.hideGameOverlay();
        
        // Resume the game using proper unpause mechanism
        if (this.gameEngine && this.gameEngine.isPaused) {
            this.gameEngine.togglePause(); // This will unpause and restart the loop
            console.log('✅ Game resumed using togglePause');
        } else if (this.gameEngine) {
            console.log('⚠️ Game was not paused, just hiding menu');
        } else {
            console.error('❌ GameEngine not found for resume');
        }
    }
    
    restartGame() {
        console.log('🔄 Main.js restartGame called');
        if (this.gameEngine) {
            console.log('🎮 Current gameRunning:', this.gameEngine.gameRunning);
            const currentMode = this.gameEngine.gameMode || 'single';
            console.log('🎮 Restarting in mode:', currentMode);
            
            // Hide all menus and overlays
            this.hideAllMenus();
            this.hideGameOverlay();
            
            // Start fresh game
            this.startGame(currentMode);
        } else {
            console.error('❌ No gameEngine found for restart');
        }
    }
    
    togglePause() {
        if (this.gameEngine) {
            this.gameEngine.togglePause(); // Use the gameEngine's proper togglePause method
            console.log('⏸️ Pause toggled, isPaused:', this.gameEngine.isPaused);
        }
    }
    
    hideGameOverlay() {
        console.log('🙈 Attempting to hide game overlay...');
        
        const overlay = document.getElementById('game-overlay');
        if (overlay) {
            console.log('✅ Found overlay element');
            
            // Multiple approaches to ensure it's hidden
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
            overlay.style.visibility = 'hidden';
            
            console.log('✅ Overlay hidden using multiple methods');
            console.log('Overlay classes:', overlay.className);
            console.log('Overlay style display:', overlay.style.display);
        } else {
            console.error('❌ Game overlay element not found!');
        }
    }
    
    showGameOverlay() {
        const overlay = document.getElementById('game-overlay');
        if (overlay) {
            overlay.classList.remove('hidden');
            overlay.style.display = 'flex'; // Restore display
            overlay.style.visibility = 'visible'; // Restore visibility
            
            console.log('✅ Overlay shown using multiple methods');
            console.log('Overlay classes:', overlay.className);
            console.log('Overlay style display:', overlay.style.display);
        } else {
            console.error('❌ Game overlay element not found!');
        }
    }
    
    hideMainMenu() {
        const menu = document.getElementById('main-menu');
        if (menu) {
            menu.classList.add('hidden');
        }
    }
    
    showMainMenu() {
        const menu = document.getElementById('main-menu');
        if (menu) {
            menu.classList.remove('hidden');
        }
        this.hideAllMenus();
        menu.classList.remove('hidden');
        this.showGameOverlay();
    }
    
    showPauseMenu() {
        const menu = document.getElementById('pause-menu');
        if (menu) {
            this.hideAllMenus();
            menu.classList.remove('hidden');
            this.showGameOverlay();
            console.log('⏸️ Pause menu shown');
        }
    }
    
    hidePauseMenu() {
        const menu = document.getElementById('pause-menu');
        if (menu) {
            menu.classList.add('hidden');
        }
    }
    
    hideAllMenus() {
        const menus = ['main-menu', 'pause-menu', 'game-over'];
        menus.forEach(menuId => {
            const menu = document.getElementById(menuId);
            if (menu) {
                menu.classList.add('hidden');
            }
        });
    }
    
    onDOMReady() {
        console.log('📱 DOM ready, starting initialization...');
        
        // Initialize all components in order
        this.initializeComponents();
        
        // Set up global event listeners
        this.setupGlobalEventListeners();
        
        // Show welcome message
        this.showWelcomeMessage();
        
        // Start performance monitoring
        this.startPerformanceMonitoring();
        
        this.initialized = true;
        console.log('✅ NeuroSnake fully initialized!');
    }
    
    initializeComponents() {
        // Store references to all components
        this.components = {
            game: window.game,
            aiSystem: window.aiSystem,
            powerUpSystem: window.powerUpSystem,
            themeSystem: window.themeSystem,
            multiplayer: window.multiplayer
        };
        
        // Verify all components are loaded
        for (let [name, component] of Object.entries(this.components)) {
            if (!component) {
                console.warn(`⚠️ Component ${name} not found`);
            } else {
                console.log(`✅ Component ${name} loaded`);
            }
        }
        
        // Set up component interactions
        this.setupComponentInteractions();
    }
    
    setupComponentInteractions() {
        // Enhanced game loop with all systems
        if (this.components.game) {
            const originalGameLoop = this.components.game.gameLoop;
            this.components.game.gameLoop = () => {
                // Update performance metrics
                this.updatePerformanceMetrics();
                
                // Update multiplayer leaderboard
                if (this.components.multiplayer && this.components.game.gameMode === 'multiplayer') {
                    this.components.multiplayer.displayLiveLeaderboard();
                }
                
                // Call original game loop
                originalGameLoop.call(this.components.game);
            };
            
            // Enhanced game over handling
            const originalGameOver = this.components.game.gameOver;
            this.components.game.gameOver = () => {
                // Notify AI system
                if (this.components.aiSystem) {
                    const gameTime = Date.now() - (this.performanceMetrics.gameStartTime || Date.now());
                    this.components.aiSystem.gameEnded(this.components.game.score, gameTime);
                }
                
                // Reset power-ups
                if (this.components.powerUpSystem) {
                    this.components.powerUpSystem.reset();
                }
                
                // Leave multiplayer if needed
                if (this.components.multiplayer && this.components.game.gameMode === 'multiplayer') {
                    this.components.multiplayer.leaveGame();
                }
                
                // Call original game over
                originalGameOver.call(this.components.game);
            };
            
            // Enhanced start game
            const originalStartGame = this.components.game.startGame;
            this.components.game.startGame = (mode) => {
                this.performanceMetrics.gameStartTime = Date.now();
                this.performanceMetrics.totalFrames = 0;
                
                // Call original start game
                originalStartGame.call(this.components.game, mode);
                
                // Show mode-specific messages
                this.showGameModeMessage(mode);
            };
        }
        
        // Enhanced movement tracking for AI
        if (this.components.game && this.components.aiSystem) {
            const originalHandleKeyPress = this.components.game.handleKeyPress;
            this.components.game.handleKeyPress = (e) => {
                // Record movement for AI analysis
                if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                    this.components.aiSystem.recordMovement(e.code, Date.now());
                    
                    // Send to multiplayer if connected
                    if (this.components.multiplayer && this.components.game.gameMode === 'multiplayer') {
                        this.components.multiplayer.sendPlayerMove(e.code);
                    }
                }
                
                // Call original handler
                originalHandleKeyPress.call(this.components.game, e);
            };
        }
        
        // Enhanced score updates
        if (this.components.game && this.components.multiplayer) {
            const originalUpdateScore = this.components.game.updateScore;
            this.components.game.updateScore = () => {
                originalUpdateScore.call(this.components.game);
                
                // Send score to multiplayer
                if (this.components.game.gameMode === 'multiplayer') {
                    this.components.multiplayer.sendPlayerScore(this.components.game.score);
                }
            };
        }
    }
    
    setupGlobalEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.code) {
                    case 'KeyH':
                        e.preventDefault();
                        this.showHelpModal();
                        break;
                    case 'KeyI':
                        e.preventDefault();
                        this.showGameInfo();
                        break;
                    case 'KeyT':
                        e.preventDefault();
                        this.toggleTheme();
                        break;
                }
            }
        });
        
        // Window events
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
        
        // Visibility change (pause when tab hidden)
        document.addEventListener('visibilitychange', () => {
            if (this.components.game && this.components.game.gameRunning) {
                if (document.hidden) {
                    this.components.game.isPaused = true;
                } else {
                    // Resume after a short delay
                    setTimeout(() => {
                        if (this.components.game) {
                            this.components.game.isPaused = false;
                        }
                    }, 1000);
                }
            }
        });
        
        // Resize handling
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    showWelcomeMessage() {
        const message = document.createElement('div');
        message.innerHTML = `
            <div style="text-align: center;">
                <h2>🎮 Welcome to NeuroSnake!</h2>
                <p>The AI-powered Snake game that adapts to your skill level</p>
                <div style="margin: 20px 0; font-size: 0.9rem; color: #aaa;">
                    <p>🧠 <strong>AI Features:</strong> Adaptive difficulty, smart food placement</p>
                    <p>⚡ <strong>Power-ups:</strong> Speed boost, teleport, shield, and more!</p>
                    <p>🎨 <strong>Dynamic Themes:</strong> Changes based on time and location</p>
                    <p>👥 <strong>Multiplayer:</strong> Compete with players worldwide</p>
                </div>
                <div style="margin-top: 20px; font-size: 0.8rem; color: #666;">
                    Press <kbd>Ctrl+H</kbd> for help • <kbd>Ctrl+I</kbd> for info • <kbd>Ctrl+T</kbd> to cycle themes
                </div>
            </div>
        `;
        
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(26, 26, 46, 0.95);
            color: #fff;
            padding: 30px;
            border-radius: 20px;
            border: 2px solid #00ff88;
            box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
            z-index: 10000;
            max-width: 500px;
            font-family: 'Orbitron', monospace;
            animation: fadeInScale 0.5s ease;
        `;
        
        // Add close functionality
        message.addEventListener('click', () => {
            message.style.animation = 'fadeOutScale 0.3s ease forwards';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        });
        
        document.body.appendChild(message);
        
        // Auto-close after 8 seconds
        setTimeout(() => {
            if (message.parentNode) {
                message.click();
            }
        }, 8000);
    }
    
    showGameModeMessage(mode) {
        const messages = {
            single: '🎯 Single Player Mode - AI will adapt to your skills!',
            multiplayer: '👥 Multiplayer Arena - Compete with others!',
            'ai-training': '🧠 AI Training Mode - Help train the AI system!'
        };
        
        const message = messages[mode] || 'Game started!';
        this.showTemporaryMessage(message, 'info', 3000);
    }
    
    showTemporaryMessage(text, type = 'info', duration = 2000) {
        const colors = {
            info: '#00ccff',
            success: '#00ff88',
            warning: '#ffaa00',
            error: '#ff4757'
        };
        
        const message = document.createElement('div');
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 10%;
            left: 50%;
            transform: translateX(-50%);
            background: ${colors[type]};
            color: #000;
            padding: 12px 24px;
            border-radius: 25px;
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            font-size: 1rem;
            z-index: 9999;
            animation: messageSlideIn 0.5s ease, messageSlideOut 0.5s ease ${duration - 500}ms forwards;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, duration);
    }
    
    toggleTheme() {
        if (this.components.themeSystem) {
            const themes = Object.keys(this.components.themeSystem.themes);
            const currentIndex = themes.indexOf(this.components.themeSystem.currentTheme);
            const nextIndex = (currentIndex + 1) % themes.length;
            const nextTheme = themes[nextIndex];
            
            this.components.themeSystem.setTheme(nextTheme);
            this.showTemporaryMessage(`🎨 Theme: ${this.components.themeSystem.themes[nextTheme].name}`, 'info', 1500);
        }
    }
    
    showHelpModal() {
        // Implementation for help modal
        this.showTemporaryMessage('Help: Use arrow keys to move, Space for power-ups, P to pause', 'info', 4000);
    }
    
    showGameInfo() {
        if (this.components.aiSystem) {
            const insights = this.components.aiSystem.getPlayerInsights();
            const message = `🧠 AI Level: ${insights.skillLevel.toFixed(1)} | Best Score: ${insights.bestScore} | Games: ${insights.totalGames}`;
            this.showTemporaryMessage(message, 'info', 4000);
        }
    }
    
    updatePerformanceMetrics() {
        this.performanceMetrics.totalFrames++;
        
        // Calculate FPS every second
        if (this.performanceMetrics.totalFrames % 60 === 0) {
            const gameTime = Date.now() - (this.performanceMetrics.gameStartTime || Date.now());
            const fps = Math.round((this.performanceMetrics.totalFrames * 1000) / gameTime);
            this.performanceMetrics.frameRate = fps;
            
            // Show performance warning if needed
            if (fps < 30 && this.components.game && this.components.game.gameRunning) {
                console.warn('⚠️ Low FPS detected:', fps);
            }
        }
    }
    
    startPerformanceMonitoring() {
        setInterval(() => {
            if (this.components.game && this.components.game.gameRunning) {
                // Could send performance data to analytics
                console.log('📊 Performance:', {
                    fps: this.performanceMetrics.frameRate,
                    gameTime: Date.now() - (this.performanceMetrics.gameStartTime || Date.now()),
                    score: this.components.game.score
                });
            }
        }, 30000); // Every 30 seconds
    }
    
    handleResize() {
        // Responsive canvas resizing would go here
        console.log('📱 Window resized');
    }
    
    cleanup() {
        console.log('🧹 Cleaning up NeuroSnake...');
        
        // Cleanup all components
        for (let [name, component] of Object.entries(this.components)) {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        }
    }
    
    // Public API
    getGameState() {
        return {
            version: this.version,
            initialized: this.initialized,
            performance: this.performanceMetrics,
            components: Object.keys(this.components),
            game: this.components.game ? {
                running: this.components.game.gameRunning,
                score: this.components.game.score,
                mode: this.components.game.gameMode
            } : null
        };
    }
}

// Add CSS animations for messages
const appStyle = document.createElement('style');
appStyle.textContent = `
    @keyframes fadeInScale {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    
    @keyframes fadeOutScale {
        to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
    }
    
    @keyframes messageSlideIn {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes messageSlideOut {
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
    
    kbd {
        background: #333;
        color: #fff;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 0.8em;
        border: 1px solid #555;
    }
`;
document.head.appendChild(appStyle);

// Initialize the app when everything is loaded
window.addEventListener('load', () => {
    window.neuroSnakeApp = new NeuroSnakeApp();
});

// Make app available globally for debugging
window.NeuroSnake = {
    version: '1.0.0',
    getState: () => window.neuroSnakeApp ? window.neuroSnakeApp.getGameState() : null,
    components: () => window.neuroSnakeApp ? window.neuroSnakeApp.components : null
};
