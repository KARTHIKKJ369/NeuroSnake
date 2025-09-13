class PowerUpSystem {
    constructor(game) {
        this.game = game; // Store reference to game engine
        this.powerUps = {
            speed: { count: 0, duration: 5000, icon: '⚡', color: '#ffff00' },
            teleport: { count: 0, cooldown: 0, icon: '🌀', color: '#9400d3' },
            shield: { count: 0, duration: 3000, icon: '🛡️', color: '#00bfff' },
            freeze: { count: 0, duration: 2000, icon: '❄️', color: '#87ceeb' },
            ghost: { count: 0, duration: 4000, icon: '👻', color: '#696969' }
        };
        
        this.activePowerUps = new Set();
        this.powerUpChance = 0.02; // Base chance per frame
        this.lastSpawnTime = 0;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Individual power-up activation
        document.getElementById('speed-boost').addEventListener('click', () => {
            console.log('🖱️ Speed boost clicked');
            this.usePowerUp('speed');
        });
        document.getElementById('teleport').addEventListener('click', () => {
            console.log('🖱️ Teleport clicked');
            this.usePowerUp('teleport');
        });
        document.getElementById('shield').addEventListener('click', () => {
            console.log('🖱️ Shield clicked');
            this.usePowerUp('shield');
        });
        document.getElementById('freeze').addEventListener('click', () => {
            console.log('🖱️ Freeze clicked');
            this.usePowerUp('freeze');
        });
        document.getElementById('ghost').addEventListener('click', () => {
            console.log('🖱️ Ghost clicked');
            this.usePowerUp('ghost');
        });
    }
    
    spawnRandomPowerUp() {
        console.log('🎮 spawnRandomPowerUp called');
        console.log('🎮 this.game:', this.game);
        console.log('🎮 tileCount:', this.game?.tileCount);
        
        if (!this.game || Date.now() - this.lastSpawnTime < 5000) {
            console.log('❌ Cannot spawn power-up: no game or cooldown active');
            return; // Minimum 5 seconds between spawns
        }
        
        const powerUpTypes = ['speed', 'teleport', 'shield', 'freeze', 'ghost'];
        const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
        
        console.log('🎯 Spawning power-up type:', randomType);
        console.log('🎯 Current inventory before spawn:', this.powerUps[randomType].count);
        this.spawnPowerUp(randomType);
        console.log('🎯 Current inventory after spawn:', this.powerUps[randomType].count);
        this.lastSpawnTime = Date.now();
    }
    
    spawnPowerUp(type) {
        console.log('🎯 spawnPowerUp called for type:', type);
        if (!this.game) {
            console.log('❌ No game object found');
            return;
        }
        
        let validPosition = false;
        let attempts = 0;
        let position = { x: 0, y: 0 };
        
        while (!validPosition && attempts < 20) {
            position = {
                x: Math.floor(Math.random() * this.game.tileCount),
                y: Math.floor(Math.random() * this.game.tileCount)
            };
            
            validPosition = true;
            
            // Check if position conflicts with snake
            for (let segment of this.game.snake) {
                if (segment.x === position.x && segment.y === position.y) {
                    validPosition = false;
                    break;
                }
            }
            
            // Check if position conflicts with food
            if (this.game.food.x === position.x && this.game.food.y === position.y) {
                validPosition = false;
            }
            
            // Check if position conflicts with other power-ups
            for (let powerUp of this.game.powerUps) {
                if (powerUp.x === position.x && powerUp.y === position.y) {
                    validPosition = false;
                    break;
                }
            }
            
            attempts++;
        }
        
        if (validPosition) {
            const powerUpData = this.powerUps[type];
            this.game.powerUps.push({
                x: position.x,
                y: position.y,
                type: type,
                icon: powerUpData.icon,
                color: powerUpData.color,
                spawnTime: Date.now()
            });
            
            console.log(`✨ ${type} power-up spawned at (${position.x}, ${position.y})`);
        }
    }
    
    collect(type) {
        if (this.powerUps[type]) {
            console.log(`🎁 Collecting ${type} power-up. Current count: ${this.powerUps[type].count}`);
            this.powerUps[type].count++;
            console.log(`🎁 After collection, ${type} count: ${this.powerUps[type].count}`);
            this.updatePowerUpDisplay();
            
            // Show collection effect
            this.showCollectionEffect(type);
            
            console.log(`🎁 Collected ${type} power-up! Count: ${this.powerUps[type].count}`);
        }
    }
    
    usePowerUp(type) {
        console.log(`🎮 Using power-up: ${type}`);
        console.log(`🎮 Current ${type} count before use:`, this.powerUps[type]?.count);
        
        if (!this.powerUps[type] || this.powerUps[type].count <= 0) {
            this.showMessage('No power-ups available!', 'warning');
            return false;
        }
        
        // Check cooldowns
        if (type === 'teleport' && this.powerUps.teleport.cooldown > Date.now()) {
            this.showMessage('Teleport on cooldown!', 'warning');
            return false;
        }
        
        this.powerUps[type].count--;
        console.log(`🎮 ${type} count after decrement:`, this.powerUps[type].count);
        this.updatePowerUpDisplay();
        
        switch(type) {
            case 'speed':
                this.activateSpeedBoost();
                break;
            case 'teleport':
                this.activateTeleport();
                break;
            case 'shield':
                this.activateShield();
                break;
            case 'freeze':
                this.activateFreeze();
                break;
            case 'ghost':
                this.activateGhost();
                break;
        }
        
        return true;
    }
    
    use() {
        // Use the first available power-up
        for (let type in this.powerUps) {
            if (this.powerUps[type].count > 0) {
                return this.usePowerUp(type);
            }
        }
        return false;
    }
    
    activateSpeedBoost() {
        if (this.activePowerUps.has('speed')) return;
        
        this.activePowerUps.add('speed');
        const originalSpeed = this.game.gameSpeed;
        this.game.gameSpeed = Math.max(30, originalSpeed * 0.5); // Double speed
        
        this.showMessage('⚡ SPEED BOOST ACTIVATED!', 'success');
        
        setTimeout(() => {
            if (this.game) {
                this.game.gameSpeed = originalSpeed;
            }
            this.activePowerUps.delete('speed');
            this.showMessage('Speed boost expired', 'info');
        }, this.powerUps.speed.duration);
    }
    
    activateTeleport() {
        if (!this.game) return;
        
        // Find a safe teleport location
        let safeLocation = this.findSafeTeleportLocation();
        
        if (safeLocation) {
            // Teleport effect
            this.createTeleportEffect(this.game.snake[0]);
            
            // Move snake head to new location
            this.game.snake[0] = { ...safeLocation };
            
            this.showMessage('🌀 TELEPORTED!', 'success');
            
            // Set cooldown
            this.powerUps.teleport.cooldown = Date.now() + 8000; // 8 second cooldown
            
            // Teleport arrival effect
            setTimeout(() => {
                this.createTeleportEffect(safeLocation);
            }, 200);
        } else {
            this.showMessage('No safe teleport location!', 'warning');
            this.powerUps.teleport.count++; // Refund the power-up
            this.updatePowerUpDisplay();
        }
    }
    
    findSafeTeleportLocation() {
        let attempts = 0;
        
        while (attempts < 50) {
            const location = {
                x: Math.floor(Math.random() * this.game.tileCount),
                y: Math.floor(Math.random() * this.game.tileCount)
            };
            
            let safe = true;
            
            // Check distance from current position (don't teleport too close)
            const distance = Math.abs(location.x - this.game.snake[0].x) + Math.abs(location.y - this.game.snake[0].y);
            if (distance < 5) {
                safe = false;
            }
            
            // Check if location conflicts with snake body
            for (let i = 1; i < this.game.snake.length; i++) {
                if (this.game.snake[i].x === location.x && this.game.snake[i].y === location.y) {
                    safe = false;
                    break;
                }
            }
            
            // Check surrounding area for safety
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const checkX = location.x + dx;
                    const checkY = location.y + dy;
                    
                    if (checkX < 0 || checkX >= this.game.tileCount || checkY < 0 || checkY >= this.game.tileCount) {
                        continue;
                    }
                    
                    for (let segment of this.game.snake) {
                        if (segment.x === checkX && segment.y === checkY) {
                            safe = false;
                            break;
                        }
                    }
                    
                    if (!safe) break;
                }
                if (!safe) break;
            }
            
            if (safe) {
                return location;
            }
            
            attempts++;
        }
        
        return null;
    }
    
    activateShield() {
        console.log('🛡️ Attempting to activate shield');
        
        if (this.activePowerUps.has('shield')) {
            console.log('🛡️ Shield already active, skipping');
            return false;
        }
        
        this.activePowerUps.add('shield');
        
        // Override collision detection
        const originalGameOver = this.game.gameOver;
        let shieldBlocks = 0;
        
        this.game.gameOver = () => {
            if (shieldBlocks < 3) { // Shield can block up to 3 collisions
                shieldBlocks++;
                this.showMessage(`🛡️ SHIELD BLOCKED! (${3-shieldBlocks} left)`, 'success');
                this.createShieldEffect();
                return;
            }
            originalGameOver.call(this.game);
        };
        
        this.showMessage('🛡️ SHIELD ACTIVATED!', 'success');
        console.log('🛡️ Shield activated successfully');
        
        setTimeout(() => {
            if (this.game) {
                this.game.gameOver = originalGameOver;
            }
            this.activePowerUps.delete('shield');
            this.showMessage('Shield expired', 'info');
            console.log('🛡️ Shield expired');
        }, this.powerUps.shield.duration);
        
        return true;
    }
    
    activateFreeze() {
        console.log('❄️ Attempting to activate freeze');
        console.log('❄️ Freeze count:', this.powerUps.freeze.count);
        
        if (this.activePowerUps.has('freeze')) {
            this.showMessage('❄️ Freeze already active!', 'warning');
            return false;
        }
        
        this.activePowerUps.add('freeze');
        const originalSpeed = this.game.gameSpeed;
        this.game.gameSpeed = originalSpeed * 3; // Slow down significantly
        
        this.showMessage('❄️ TIME FREEZE!', 'success');
        
        setTimeout(() => {
            if (this.game) {
                this.game.gameSpeed = originalSpeed;
            }
            this.activePowerUps.delete('freeze');
            this.showMessage('Time resumed', 'info');
        }, this.powerUps.freeze.duration);
        
        return true;
    }
    
    activateGhost() {
        console.log('👻 Attempting to activate ghost mode');
        console.log('👻 Ghost count:', this.powerUps.ghost.count);
        
        if (this.powerUps.ghost.count <= 0) {
            this.showMessage('👻 No ghost power-ups available!', 'warning');
            return false;
        }
        
        if (this.activePowerUps.has('ghost')) {
            this.showMessage('👻 Ghost mode already active!', 'warning');
            return false;
        }
        
        // Use one ghost power-up
        this.powerUps.ghost.count--;
        this.updatePowerUpDisplay();
        
        this.activePowerUps.add('ghost');
        
        // Set ghost mode flag on the game engine
        this.game.isGhostMode = true;
        
        this.showMessage('👻 GHOST MODE!', 'success');
        
        setTimeout(() => {
            if (this.game) {
                this.game.isGhostMode = false;
            }
            this.activePowerUps.delete('ghost');
            this.showMessage('Ghost mode ended', 'info');
        }, this.powerUps.ghost.duration);
        
        return true;
    }
    
    createTeleportEffect(position) {
        if (!this.game) return;
        
        for (let i = 0; i < 20; i++) {
            this.game.particles.push({
                x: position.x * this.game.gridSize + Math.random() * this.game.gridSize,
                y: position.y * this.game.gridSize + Math.random() * this.game.gridSize,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                size: Math.random() * 6 + 2,
                alpha: 1,
                color: '148, 0, 211', // Purple
                life: 40
            });
        }
    }
    
    createShieldEffect() {
        if (!this.game) return;
        
        const head = this.game.snake[0];
        for (let i = 0; i < 15; i++) {
            this.game.particles.push({
                x: head.x * this.game.gridSize + Math.random() * this.game.gridSize,
                y: head.y * this.game.gridSize + Math.random() * this.game.gridSize,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                size: Math.random() * 5 + 3,
                alpha: 1,
                color: '0, 191, 255', // Blue
                life: 30
            });
        }
    }
    
    showCollectionEffect(type) {
        const powerUpData = this.powerUps[type];
        this.showMessage(`Collected ${powerUpData.icon} ${type}!`, 'success');
    }
    
    showMessage(text, type = 'info') {
        // Create floating message
        const message = document.createElement('div');
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#00ff88' : type === 'warning' ? '#ffaa00' : '#00ccff'};
            color: #000;
            padding: 10px 20px;
            border-radius: 10px;
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            font-size: 1.1rem;
            z-index: 1000;
            animation: messageFloat 2s ease-out forwards;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 2000);
    }
    
    updatePowerUpDisplay() {
        console.log('🔄 Updating power-up display...');
        console.log('Shield count:', this.powerUps.shield.count);
        console.log('All power-ups:', this.powerUps);
        
        document.getElementById('speed-boost').querySelector('.power-up-count').textContent = this.powerUps.speed.count;
        document.getElementById('teleport').querySelector('.power-up-count').textContent = this.powerUps.teleport.count;
        document.getElementById('shield').querySelector('.power-up-count').textContent = this.powerUps.shield.count;
        document.getElementById('freeze').querySelector('.power-up-count').textContent = this.powerUps.freeze.count;
        document.getElementById('ghost').querySelector('.power-up-count').textContent = this.powerUps.ghost.count;
    }
    
    increasePowerUpChance() {
        this.powerUpChance = Math.min(0.1, this.powerUpChance * 1.5);
        console.log('🎁 Power-up spawn chance increased for struggling player');
    }
    
    // Clean up active power-ups when game ends
    reset() {
        // Clear all active power-ups
        this.activePowerUps.clear();
        
        // Reset all power-up counts
        for (let type in this.powerUps) {
            this.powerUps[type].count = 0;
        }
        
        // Reset cooldowns
        this.powerUps.teleport.cooldown = 0;
        
        // Reset spawn chance
        this.powerUpChance = 0.02;
        
        // Make sure game speed is not affected by any lingering power-ups
        if (this.game && this.game.gameSpeed) {
            // This will be overridden by the game engine's reset, but good to be safe
            const baseSpeed = 150;
            this.game.gameSpeed = baseSpeed;
        }
        
        this.updatePowerUpDisplay();
        
        console.log('🔄 Power-up system reset for new game');
    }
}

// Add CSS for message animation
const style = document.createElement('style');
style.textContent = `
    @keyframes messageFloat {
        0% {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
        }
        20% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        80% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        100% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
`;
document.head.appendChild(style);
