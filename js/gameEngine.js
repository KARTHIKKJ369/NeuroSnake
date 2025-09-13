class GameEngine {
    constructor(canvas) {
        console.log('🎮 GameEngine constructor called with canvas:', canvas);
        this.canvas = canvas;
        this.ctx = canvas ? canvas.getContext('2d') : null;
        
        if (!this.canvas || !this.ctx) {
            console.error('❌ Canvas or context not found!');
            return;
        }
        
        console.log('✅ Canvas found:', this.canvas.width, 'x', this.canvas.height);
        
        this.gridSize = 25; // Increased from 20 for larger game elements
        this.tileCount = Math.floor(this.canvas.width / this.gridSize); // Add tileCount property for power-ups
        this.snake = [{ x: 10, y: 10 }]; // Grid coordinates, not pixel coordinates
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 }; // Buffer for next direction change
        this.lastDirectionChange = 0; // Timestamp of last direction change
        this.food = null;
        this.score = 0;
        this.gameRunning = false;
        this.gameLoopRunning = false; // Track if game loop is active
        this.isGhostMode = false; // Track ghost mode state
        this.speed = 150;
        this.originalSpeed = 150;
        this.lastAIUpdate = 0; // Throttle AI updates
        this.particles = [];
        this.powerUps = []; // Initialize powerUps array
        this.socialBoostCounter = 0; // For trending food social boost effect
        
        this.generateFood();
        this.loadHighScore(); // Load and display the high score
        console.log('🎮 GameEngine initialized successfully');
    }
    
    setupEventListeners() {
        // Event listeners are now handled by main.js to avoid conflicts
        // Keeping this method for compatibility
        
        // Menu buttons (if they exist)
        const singlePlayerBtn = document.getElementById('single-player');
        const multiplayerBtn = document.getElementById('multiplayer');
        const aiTrainingBtn = document.getElementById('ai-training');
        const playAgainBtn = document.getElementById('play-again');
        const shareReplayBtn = document.getElementById('share-replay');
        const leaderboardBtn = document.getElementById('view-leaderboard');
        
        if (singlePlayerBtn) singlePlayerBtn.addEventListener('click', () => this.startGame('single'));
        if (multiplayerBtn) multiplayerBtn.addEventListener('click', () => this.startGame('multiplayer'));
        if (aiTrainingBtn) aiTrainingBtn.addEventListener('click', () => this.startGame('ai-training'));
        // Note: Play Again button is handled by main.js to avoid conflicts
        if (shareReplayBtn) shareReplayBtn.addEventListener('click', () => this.shareReplay());
        if (leaderboardBtn) leaderboardBtn.addEventListener('click', () => this.showLeaderboard());
    }
    
    handleKeyPress(e) {
        if (!this.gameRunning) return;
        
        switch(e.code) {
            case 'ArrowUp':
                if (this.direction.y !== 1) {
                    this.direction.x = 0;
                    this.direction.y = -1;
                }
                break;
            case 'ArrowDown':
                if (this.direction.y !== -1) {
                    this.direction.x = 0;
                    this.direction.y = 1;
                }
                break;
            case 'ArrowLeft':
                if (this.direction.x !== 1) {
                    this.direction.x = -1;
                    this.direction.y = 0;
                }
                break;
            case 'ArrowRight':
                if (this.direction.x !== -1) {
                    this.direction.x = 1;
                    this.direction.y = 0;
                }
                break;
            case 'Space':
                this.usePowerUp();
                break;
            case 'KeyP':
                this.togglePause();
                break;
            case 'KeyR':
                this.restartGame();
                break;
        }
        e.preventDefault();
    }
    
    startGame() {
        console.log('🚀 Starting game...');
        console.log('🎮 gameRunning before reset:', this.gameRunning);
        
        this.snake = [{ x: 10, y: 10 }]; // Grid coordinates, not pixel coordinates
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 }; // Reset buffered direction
        this.lastDirectionChange = 0; // Reset direction change timestamp
        this.score = 0;
        this.updateScore(); // Initialize score display
        this.loadHighScore(); // Ensure high score is loaded
        this.speed = this.originalSpeed;
        this.socialBoostCounter = 0; // Reset social boost
        this.gameRunning = true;
        this.isGhostMode = false; // Reset ghost mode
        this.lastAIUpdate = 0; // Reset AI update timer
        
        console.log('🎮 gameRunning after reset:', this.gameRunning);
        
        this.generateFood();
        
        console.log('🐍 Snake initialized at:', this.snake[0]);
        console.log('🍎 Food generated at:', this.food);
        console.log('🎮 Game running:', this.gameRunning);

        // Reset AI system modifiers
        if (window.aiSystem && window.aiSystem.initializeGame) {
            window.aiSystem.initializeGame('single');
        }

        // Reset power-ups
        if (window.powerUpSystem && window.powerUpSystem.reset) {
            window.powerUpSystem.reset();
        }

        // Reset multiplayer if active
        if (window.multiplayer && window.multiplayer.isActive && window.multiplayer.reset) {
            window.multiplayer.reset();
        }

        // Draw initial state
        console.log('🎨 Drawing initial state...');
        this.draw();

        console.log('🔄 Starting game loop...');
        console.log('🎮 Game running status before loop:', this.gameRunning);
        
        // Only start a new game loop if one isn't already running
        if (!this.gameLoopRunning) {
            this.gameLoopRunning = true;
            console.log('🔄 New game loop started');
            this.gameLoop();
        } else {
            console.log('🔄 Game loop already running');
        }
    }    changeDirection(dx, dy) {
        console.log(`🎮 changeDirection called: dx=${dx}, dy=${dy}, current direction:`, this.direction);
        
        // Prevent too rapid direction changes (debounce)
        const now = Date.now();
        if (now - this.lastDirectionChange < 50) { // 50ms minimum between direction changes
            console.log('⏱️ Direction change too rapid, ignoring');
            return;
        }
        
        // Prevent reverse direction based on current direction
        if ((dx === -this.direction.x && this.direction.x !== 0) || 
            (dy === -this.direction.y && this.direction.y !== 0)) {
            console.log('❌ Reverse direction blocked');
            return;
        }
        
        // Also prevent reverse direction based on next buffered direction
        if ((dx === -this.nextDirection.x && this.nextDirection.x !== 0) || 
            (dy === -this.nextDirection.y && this.nextDirection.y !== 0)) {
            console.log('❌ Reverse direction blocked (buffered)');
            return;
        }
        
        // Buffer the direction change
        this.nextDirection.x = dx;
        this.nextDirection.y = dy;
        this.lastDirectionChange = now;
        console.log('✅ Direction buffered:', this.nextDirection);
    }
    
    gameLoop() {
        if (!this.gameRunning) {
            console.log('🛑 Game loop stopped - gameRunning is false');
            this.gameLoopRunning = false; // Allow new game loops to start
            return; // Stop the game loop completely when game is over
        }
        
        if (this.isPaused) {
            setTimeout(() => this.gameLoop(), this.speed);
            return;
        }
        
        this.update();
        this.draw();
        setTimeout(() => this.gameLoop(), this.speed);
    }
    
    update() {
        // Apply buffered direction change at the start of each update cycle
        if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
            this.direction.x = this.nextDirection.x;
            this.direction.y = this.nextDirection.y;
            this.nextDirection.x = 0;
            this.nextDirection.y = 0;
            console.log('🔄 Applied buffered direction:', this.direction);
        }
        
        // Don't update if snake is not moving yet
        if (this.direction.x === 0 && this.direction.y === 0) {
            return;
        }
        
        // Move snake head
        const head = { 
            x: this.snake[0].x + this.direction.x, 
            y: this.snake[0].y + this.direction.y 
        };
        
        // Calculate canvas bounds in grid units
        const maxX = Math.floor(this.canvas.width / this.gridSize);
        const maxY = Math.floor(this.canvas.height / this.gridSize);
        
        // Check wall collision (skip if in ghost mode)
        if (!this.isGhostMode && (head.x < 0 || head.x >= maxX || head.y < 0 || head.y >= maxY)) {
            console.log('💥 Wall collision detected!', head, 'bounds:', {maxX, maxY});
            this.gameOver();
            return;
        }
        
        // In ghost mode, wrap around walls
        if (this.isGhostMode) {
            if (head.x < 0) head.x = maxX - 1;
            if (head.x >= maxX) head.x = 0;
            if (head.y < 0) head.y = maxY - 1;
            if (head.y >= maxY) head.y = 0;
        }
        
        // Check self collision (skip if in ghost mode)
        if (!this.isGhostMode) {
            for (let segment of this.snake) {
                if (head.x === segment.x && head.y === segment.y) {
                    console.log('💥 Self collision detected!', head, 'segment:', segment);
                    this.gameOver();
                    return;
                }
            }
        }
        
        this.snake.unshift(head);
        
                // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            // Apply bonus effects if trending food system is available
            if (window.trendingFoodSystem && this.food.bonusEffect !== 'none') {
                window.trendingFoodSystem.applyBonusEffect(this.food, this);
            }
            
            // Calculate score with potential social boost multiplier
            let foodPoints = this.food.points || 10;
            if (this.socialBoostCounter > 0) {
                foodPoints *= 2;
                this.socialBoostCounter--;
            }
            
            this.score += foodPoints;
            this.updateScore(); // Update the display
            this.food = null;
            this.generateFood();
            
            // Add power-up occasionally
            if (Math.random() < 0.1 && window.powerUpSystem && window.powerUpSystem.spawnRandomPowerUp) {
                window.powerUpSystem.spawnRandomPowerUp();
            }
        } else {
            this.snake.pop(); // Remove tail if no food eaten
        }
        
        // Update power-ups
        this.updatePowerUps();
        
        // Update particles
        this.updateParticles();
        
        // AI difficulty adaptation - only in single player mode, and throttled
        if (this.gameMode === 'single' && window.aiSystem && window.aiSystem.adaptDifficulty) {
            const now = Date.now();
            if (now - this.lastAIUpdate > 3000) { // Only update AI every 3 seconds
                window.aiSystem.adaptDifficulty(this.score, this.snake.length);
                this.lastAIUpdate = now;
            }
        }
    }
    
    draw() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid (subtle)
        this.drawGrid();

        // Draw snake
        this.drawSnake();

        // Draw food
        this.drawFood();

        // Draw power-ups
        this.drawPowerUps();
        
        // Draw particles
        this.drawParticles();
        
        // Draw other players in multiplayer mode
        if (this.gameMode === 'multiplayer' && window.multiplayer) {
            window.multiplayer.renderOtherPlayers();
        }
        
        // Show "Press arrow key to start" message if snake is not moving
        if (this.direction.x === 0 && this.direction.y === 0 && this.gameRunning) {
            this.ctx.fillStyle = 'rgba(0, 255, 136, 0.8)';
            this.ctx.font = '20px Orbitron';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Press Arrow Key to Start!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        }
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#111';
        this.ctx.lineWidth = 1;
        
        const tileCountX = this.canvas.width / this.gridSize;
        const tileCountY = this.canvas.height / this.gridSize;
        
        for (let i = 0; i <= tileCountX; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let i = 0; i <= tileCountY; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        // Set transparency for ghost mode
        const originalAlpha = this.ctx.globalAlpha;
        if (this.isGhostMode) {
            this.ctx.globalAlpha = 0.5; // Make snake 50% transparent in ghost mode
        }
        
        for (let i = 0; i < this.snake.length; i++) {
            const segment = this.snake[i];
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (i === 0) {
                // Snake head
                this.ctx.fillStyle = this.isGhostMode ? '#9999ff' : '#00ff88'; // Different color in ghost mode
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
                
                // Add glow effect
                this.ctx.shadowColor = this.isGhostMode ? '#9999ff' : '#00ff88';
                this.ctx.shadowBlur = this.isGhostMode ? 15 : 10; // More glow in ghost mode
                this.ctx.fillRect(x + 4, y + 4, this.gridSize - 8, this.gridSize - 8);
                this.ctx.shadowBlur = 0;
                
                // Draw eyes
                this.ctx.fillStyle = '#000';
                this.ctx.fillRect(x + 6, y + 6, 3, 3);
                this.ctx.fillRect(x + 11, y + 6, 3, 3);
            } else {
                // Snake body
                const alpha = 1 - (i / this.snake.length) * 0.5;
                const color = this.isGhostMode ? `rgba(153, 153, 255, ${alpha})` : `rgba(0, 255, 136, ${alpha})`;
                this.ctx.fillStyle = color;
                this.ctx.fillRect(x + 3, y + 3, this.gridSize - 6, this.gridSize - 6);
            }
        }
        
        // Restore original alpha
        this.ctx.globalAlpha = originalAlpha;
    }
    
    drawFood() {
        if (!this.food) return;
        
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // Animate food with pulsing effect
        const time = Date.now() * 0.005;
        const scale = 1 + Math.sin(time) * 0.1;
        const size = (this.gridSize - 4) * scale;
        const offset = (this.gridSize - size) / 2;
        
        const centerX = x + this.gridSize / 2;
        const centerY = y + this.gridSize / 2;
        
        // Draw glowing background for special foods
        if (this.food.type !== 'classic') {
            this.ctx.save();
            
            // Create glow effect
            const gradient = this.ctx.createRadialGradient(
                centerX, centerY, 0,
                centerX, centerY, this.gridSize * 1.5
            );
            gradient.addColorStop(0, (this.food.color || '#ff0080') + '80');
            gradient.addColorStop(0.7, (this.food.color || '#ff0080') + '40');
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(
                x - this.gridSize/2, 
                y - this.gridSize/2, 
                this.gridSize * 2, 
                this.gridSize * 2
            );
            
            this.ctx.restore();
        }
        
        // Draw food background
        this.ctx.fillStyle = this.food.color || '#ff0080';
        this.ctx.fillRect(x + offset, y + offset, size, size);
        
        // Add glow
        this.ctx.shadowColor = this.food.color || '#ff0080';
        this.ctx.shadowBlur = this.food.type !== 'classic' ? 20 : 15;
        this.ctx.fillRect(x + offset + 2, y + offset + 2, size - 4, size - 4);
        this.ctx.shadowBlur = 0;
        
        // Draw emoji/icon
        this.ctx.font = `${size * 0.7}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'white';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(
            this.food.emoji || '🍎',
            centerX,
            centerY
        );
        
        // Draw type indicator for trending foods
        if (this.food.type !== 'classic') {
            this.ctx.font = '8px Arial';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'top';
            
            let typeText = '';
            switch (this.food.type) {
                case 'hashtag': typeText = 'TREND'; break;
                case 'crypto': typeText = 'CRYPTO'; break;
                case 'meme': typeText = 'MEME'; break;
            }
            
            if (typeText) {
                this.ctx.fillText(typeText, centerX, y - 12);
            }
        }
        
        // Reset text baseline
        this.ctx.textBaseline = 'alphabetic';
    }
    
    drawPowerUps() {
        for (let powerUp of this.powerUps) {
            const x = powerUp.x * this.gridSize;
            const y = powerUp.y * this.gridSize;
            
            this.ctx.fillStyle = powerUp.color;
            this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            
            // Draw power-up icon
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(powerUp.icon, x + this.gridSize/2, y + this.gridSize/2 + 4);
        }
    }
    
    drawParticles() {
        for (let particle of this.particles) {
            this.ctx.fillStyle = `rgba(${particle.color}, ${particle.alpha})`;
            this.ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
        }
    }
    
    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        
        // Get trending food from trending food system if available
        if (window.trendingFoodSystem) {
            const trendingFood = window.trendingFoodSystem.getNextFood();
            this.food = { 
                x, 
                y,
                ...trendingFood
            };
        } else {
            // Fallback to classic apple
            this.food = { 
                x, 
                y,
                type: 'classic',
                content: 'Apple',
                emoji: '🍎',
                color: '#FF0080',
                bonusEffect: 'none',
                points: 10,
                description: 'Classic Apple'
            };
        }
    }
    
    createParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: x + Math.random() * this.gridSize,
                y: y + Math.random() * this.gridSize,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: Math.random() * 4 + 2,
                alpha: 1,
                color: '0, 255, 136',
                life: 30
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.alpha = particle.life / 30;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updatePowerUps() {
        // Check power-up collisions
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            const head = this.snake[0];
            
            if (head.x === powerUp.x && head.y === powerUp.y) {
                this.collectPowerUp(powerUp);
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    collectPowerUp(powerUp) {
        if (window.powerUpSystem) {
            window.powerUpSystem.collect(powerUp.type);
        }
        this.createParticles(powerUp.x * this.gridSize, powerUp.y * this.gridSize);
    }
    
    usePowerUp() {
        if (window.powerUpSystem) {
            window.powerUpSystem.use();
        }
    }
    
    updateScore() {
        document.getElementById('current-score').textContent = this.score;
        this.updateHighScore();
    }
    
    getHighScore() {
        const scores = JSON.parse(localStorage.getItem('neurosnake-scores') || '[]');
        return scores.length > 0 ? scores[0].score : 0;
    }
    
    updateHighScore() {
        const highScore = this.getHighScore();
        const currentHighScore = Math.max(highScore, this.score);
        document.getElementById('high-score').textContent = currentHighScore;
    }
    
    loadHighScore() {
        const highScore = this.getHighScore();
        document.getElementById('high-score').textContent = highScore;
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        console.log('⏸️ Pause toggled, isPaused:', this.isPaused);
        // Don't call this.gameLoop() - the existing loop will continue when isPaused becomes false
    }
    
    gameOver() {
        console.log('🎮 Game Over called!');
        this.gameRunning = false;
        console.log('🛑 Game running set to false');
        
        // Update final scores
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-ai-level').textContent = 
            window.aiSystem ? window.aiSystem.getCurrentLevel() : 1;
        
        // Show game over menu
        console.log('📺 Showing game over menu...');
        this.showGameOverMenu();
        
        // Save to leaderboard
        this.saveScore();
    }
    
    restartGame() {
        console.log('🔄 Restarting game...');
        
        // Reset game loop flag
        this.gameLoopRunning = false;
        
        // Hide the game over overlay
        const overlay = document.getElementById('game-overlay');
        const gameOver = document.getElementById('game-over');
        
        if (overlay) {
            console.log('🙈 Hiding game overlay...');
            overlay.classList.add('hidden');
            overlay.style.display = 'none';
            overlay.style.visibility = 'hidden';
        }
        
        if (gameOver) {
            gameOver.classList.add('hidden');
        }
        
        // Start the new game
        this.startGame(this.gameMode);
        console.log('✅ Game restarted successfully');
    }
    
    showMenu() {
        document.getElementById('game-overlay').classList.remove('hidden');
        document.getElementById('main-menu').classList.remove('hidden');
        document.getElementById('game-over').classList.add('hidden');
    }
    
    hideMenu() {
        document.getElementById('game-overlay').classList.add('hidden');
    }
    
    showGameOverMenu() {
        console.log('📺 showGameOverMenu called');
        const overlay = document.getElementById('game-overlay');
        const mainMenu = document.getElementById('main-menu');
        const gameOver = document.getElementById('game-over');
        
        console.log('📺 Elements found:', {overlay, mainMenu, gameOver});
        
        if (overlay) {
            console.log('📺 Overlay classes before:', overlay.className);
            console.log('📺 Overlay style before:', overlay.style.cssText);
            overlay.classList.remove('hidden');
            overlay.style.display = 'flex'; // Force display
            overlay.style.visibility = 'visible'; // Clear any hidden visibility
            console.log('📺 Overlay classes after:', overlay.className);
            console.log('📺 Overlay style after:', overlay.style.cssText);
        }
        
        if (mainMenu) {
            console.log('📺 MainMenu classes before:', mainMenu.className);
            mainMenu.classList.add('hidden');
            console.log('📺 MainMenu classes after:', mainMenu.className);
        }
        
        if (gameOver) {
            console.log('📺 GameOver classes before:', gameOver.className);
            gameOver.classList.remove('hidden');
            gameOver.style.display = 'block'; // Force display
            console.log('📺 GameOver classes after:', gameOver.className);
        }
        
        console.log('📺 Game over menu should now be visible');
    }
    
    shareReplay() {
        // Implement replay sharing functionality
        alert('Replay shared! 🎮 Check your social media for the awesome snake moves!');
    }
    
    showLeaderboard() {
        // Implement full leaderboard view
        alert('Full leaderboard coming soon! 🏆');
    }
    
    saveScore() {
        // Save score to localStorage (in real app, would save to backend)
        const scores = JSON.parse(localStorage.getItem('neurosnake-scores') || '[]');
        scores.push({
            score: this.score,
            date: new Date().toISOString(),
            mode: this.gameMode,
            aiLevel: window.aiSystem ? window.aiSystem.getCurrentLevel() : 1
        });
        scores.sort((a, b) => b.score - a.score);
        scores.splice(10); // Keep top 10
        localStorage.setItem('neurosnake-scores', JSON.stringify(scores));
        
        this.updateLeaderboardDisplay();
        this.loadHighScore(); // Update high score display after saving
    }
    
    updateLeaderboardDisplay() {
        const scores = JSON.parse(localStorage.getItem('neurosnake-scores') || '[]');
        const leaderboard = document.getElementById('leaderboard-preview');
        
        leaderboard.innerHTML = '';
        scores.slice(0, 3).forEach((score, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span class="rank">${index + 1}.</span>
                <span class="player">Player ${index + 1}</span>
                <span class="score">${score.score}</span>
            `;
            leaderboard.appendChild(item);
        });
    }
}

// Initialize game when DOM is loaded
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new GameEngine();
    game.updateLeaderboardDisplay();
});
