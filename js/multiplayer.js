class MultiplayerSystem {
    constructor(gameEngine) {
        this.game = gameEngine; // Store reference to game engine
        this.isConnected = false;
        this.playerId = this.generatePlayerId();
        this.otherPlayers = new Map();
        this.gameRoom = null;
        this.websocket = null;
        this.connectionStatus = 'disconnected';
        this.isActive = false; // Track if multiplayer mode is active
        
        // Simulated multiplayer for demo (in real app, would use WebSocket server)
        this.isSimulated = true;
        this.simulatedPlayers = [];
        this.simulationInterval = null;
    }
    
    generatePlayerId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    joinGame() {
        // Clean up any previous game session
        this.leaveGame();
        
        console.log('🎮 Joining multiplayer arena...');
        
        if (this.isSimulated) {
            this.joinSimulatedGame();
        } else {
            this.connectToWebSocket();
        }
    }
    
    // Simulated multiplayer for demo purposes
    joinSimulatedGame() {
        console.log('🎮 Joining simulated multiplayer arena...');
        
        // Create AI opponents
        this.createSimulatedPlayers();
        
        // Update online player count
        this.updateOnlinePlayerCount(this.simulatedPlayers.length + 1);
        
        // Start simulation
        this.startPlayerSimulation();
        
        this.connectionStatus = 'connected';
        this.isActive = true;
        this.showMultiplayerMessage('Connected to Arena! 🎯');
        
        console.log(`👥 ${this.simulatedPlayers.length} other players in the arena`);
        console.log('🎮 Multiplayer mode activated!');
    }
    
    createSimulatedPlayers() {
        const playerNames = [
            'SnakeMaster', 'AI_Hunter', 'Speedster', 'TacticalGamer', 
            'NinjaNinja', 'PixelWarrior', 'RetroGamer', 'ProSnaker'
        ];
        
        const numPlayers = Math.floor(Math.random() * 4) + 2; // 2-5 other players
        
        for (let i = 0; i < numPlayers; i++) {
            const player = {
                id: 'ai_' + i,
                name: playerNames[Math.floor(Math.random() * playerNames.length)],
                score: Math.floor(Math.random() * 1000),
                snake: this.generateRandomSnake(),
                isAlive: true,
                color: this.getRandomColor()
            };
            
            this.simulatedPlayers.push(player);
            this.otherPlayers.set(player.id, player);
        }
    }
    
    generateRandomSnake() {
        // Ensure game is initialized before generating snakes
        if (!this.game || !this.game.tileCount) {
            console.warn('⚠️ Game not initialized, using default snake');
            return [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
        }
        
        const length = Math.floor(Math.random() * 3) + 3; // 3-5 segments
        const margin = Math.max(5, length + 2); // Ensure enough space
        const startX = Math.floor(Math.random() * (this.game.tileCount - margin * 2)) + margin;
        const startY = Math.floor(Math.random() * (this.game.tileCount - margin * 2)) + margin;
        
        const snake = [];
        for (let i = 0; i < length; i++) {
            snake.push({ 
                x: Math.max(0, Math.min(this.game.tileCount - 1, startX - i)), 
                y: Math.max(0, Math.min(this.game.tileCount - 1, startY))
            });
        }
        
        return snake;
    }
    
    getRandomColor() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    startPlayerSimulation() {
        this.simulationInterval = setInterval(() => {
            this.updateSimulatedPlayers();
        }, 200);
    }
    
    updateSimulatedPlayers() {
        for (let player of this.simulatedPlayers) {
            if (!player.isAlive) continue;
            
            // Simple AI movement for simulated players
            this.moveSimulatedPlayer(player);
            
            // Random chance of death/respawn
            if (Math.random() < 0.001) { // 0.1% chance per update
                this.simulatePlayerDeath(player);
            }
            
            // Random score increases
            if (Math.random() < 0.02) { // 2% chance per update
                player.score += 10;
            }
        }
        
        this.broadcastPlayerUpdate();
    }
    
    moveSimulatedPlayer(player) {
        if (!player.snake || player.snake.length === 0 || !this.game || !this.game.tileCount) return;
        
        const head = player.snake[0];
        if (!head || typeof head.x !== 'number' || typeof head.y !== 'number') return;
        
        const directions = [
            { x: 0, y: -1 }, // up
            { x: 0, y: 1 },  // down
            { x: -1, y: 0 }, // left
            { x: 1, y: 0 }   // right
        ];
        
        const direction = directions[Math.floor(Math.random() * directions.length)];
        const newHead = {
            x: Math.max(0, Math.min(this.game.tileCount - 1, head.x + direction.x)),
            y: Math.max(0, Math.min(this.game.tileCount - 1, head.y + direction.y))
        };
        
        // Validate new head position
        if (newHead.x < 0 || newHead.x >= this.game.tileCount || newHead.y < 0 || newHead.y >= this.game.tileCount) {
            return; // Skip invalid moves
        }
        
        player.snake.unshift(newHead);
        
        // Randomly grow or maintain size
        if (Math.random() > 0.95) {
            // Grow (keep tail)
        } else {
            player.snake.pop();
        }
        
        // Keep reasonable size limits
        if (player.snake.length > 15) {
            player.snake.pop();
        }
        
        // Ensure minimum size
        if (player.snake.length < 2) {
            player.snake.push({ x: newHead.x - 1, y: newHead.y });
        }
    }
    
    simulatePlayerDeath(player) {
        player.isAlive = false;
        console.log(`💀 ${player.name} was eliminated!`);
        
        // Respawn after a delay
        setTimeout(() => {
            player.isAlive = true;
            player.snake = this.generateRandomSnake();
            console.log(`🔄 ${player.name} respawned!`);
        }, 5000 + Math.random() * 10000); // 5-15 seconds
    }
    
    broadcastPlayerUpdate() {
        // In real multiplayer, this would send updates to server
        // For demo, we just trigger a redraw of other players
        // Note: Don't render here - let the main game loop handle it
    }
    
    renderOtherPlayers() {
        if (!this.game || !this.game.ctx || !this.game.gameRunning) return;
        
        // Only render in multiplayer mode
        if (this.game.gameMode !== 'multiplayer') return;
        
        // Only render if multiplayer is active
        if (!this.isActive) return;
        
        // Save current canvas state
        this.game.ctx.save();
        
        for (let [playerId, player] of this.otherPlayers) {
            if (!player.isAlive || !player.snake) continue;
            
            this.drawOtherPlayerSnake(player);
        }
        
        // Restore canvas state
        this.game.ctx.restore();
    }
    
    drawOtherPlayerSnake(player) {
        const ctx = this.game.ctx;
        const gridSize = this.game.gridSize;
        
        if (!player.snake || player.snake.length === 0) return;
        
        for (let i = 0; i < player.snake.length; i++) {
            const segment = player.snake[i];
            
            // Validate segment coordinates
            if (!segment || typeof segment.x !== 'number' || typeof segment.y !== 'number') continue;
            
            // Check if segment is within bounds
            if (segment.x < 0 || segment.x >= this.game.tileCount || segment.y < 0 || segment.y >= this.game.tileCount) continue;
            
            const x = segment.x * gridSize;
            const y = segment.y * gridSize;
            
            if (i === 0) {
                // Other player's head
                ctx.fillStyle = player.color;
                ctx.fillRect(x + 1, y + 1, gridSize - 2, gridSize - 2);
                
                // Add transparency to distinguish from main player
                ctx.globalAlpha = 0.7;
                ctx.fillStyle = player.color;
                ctx.fillRect(x + 3, y + 3, gridSize - 6, gridSize - 6);
                ctx.globalAlpha = 1;
                
                // Draw player name above head
                ctx.fillStyle = '#fff';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.shadowColor = '#000';
                ctx.shadowBlur = 2;
                ctx.fillText(player.name, x + gridSize/2, y - 5);
                ctx.shadowBlur = 0;
            } else {
                // Other player's body
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = player.color;
                ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
                ctx.globalAlpha = 1;
            }
        }
    }
    
    // Real WebSocket implementation (for future use)
    connectToWebSocket() {
        console.log('🌐 Connecting to multiplayer server...');
        
        // In a real implementation:
        // this.websocket = new WebSocket('wss://your-game-server.com/snake');
        // this.websocket.onopen = () => this.onWebSocketOpen();
        // this.websocket.onmessage = (event) => this.onWebSocketMessage(event);
        // this.websocket.onclose = () => this.onWebSocketClose();
        // this.websocket.onerror = (error) => this.onWebSocketError(error);
        
        // For now, fall back to simulated multiplayer
        setTimeout(() => {
            this.joinSimulatedGame();
        }, 1000);
    }
    
    sendGameUpdate(data) {
        if (this.isSimulated) {
            // In simulated mode, just log the update
            console.log('📡 Sending game update:', data);
        } else if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
                type: 'game_update',
                playerId: this.playerId,
                data: data
            }));
        }
    }
    
    sendPlayerMove(direction) {
        this.sendGameUpdate({
            type: 'move',
            direction: direction,
            timestamp: Date.now()
        });
    }
    
    sendPlayerScore(score) {
        this.sendGameUpdate({
            type: 'score',
            score: score,
            timestamp: Date.now()
        });
    }
    
    updateOnlinePlayerCount(count) {
        const element = document.getElementById('online-players');
        if (element) {
            element.textContent = count;
        }
    }
    
    showMultiplayerMessage(message) {
        // Create a multiplayer-specific message
        const messageEl = document.createElement('div');
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 15%;
            right: 20px;
            background: #6c5ce7;
            color: #fff;
            padding: 10px 15px;
            border-radius: 8px;
            font-family: 'Orbitron', monospace;
            font-size: 0.9rem;
            z-index: 1000;
            animation: slideInRight 0.5s ease, fadeOut 3s ease 2s forwards;
            box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.parentNode.removeChild(messageEl);
            }
        }, 5000);
    }
    
    getLeaderboard() {
        const players = Array.from(this.otherPlayers.values());
        players.push({
            id: this.playerId,
            name: 'You',
            score: game ? game.score : 0,
            isAlive: game ? game.gameRunning : false
        });
        
        return players.sort((a, b) => b.score - a.score);
    }
    
    displayLiveLeaderboard() {
        const leaderboard = this.getLeaderboard();
        const container = document.getElementById('leaderboard-preview');
        
        if (container) {
            container.innerHTML = '';
            leaderboard.slice(0, 5).forEach((player, index) => {
                const item = document.createElement('div');
                item.className = 'leaderboard-item';
                item.innerHTML = `
                    <span class="rank">${index + 1}.</span>
                    <span class="player">${player.name}${player.id === this.playerId ? ' (You)' : ''}</span>
                    <span class="score">${player.score}</span>
                `;
                
                if (player.id === this.playerId) {
                    item.style.background = 'rgba(0, 255, 136, 0.1)';
                    item.style.border = '1px solid #00ff88';
                }
                
                container.appendChild(item);
            });
        }
    }
    
    leaveGame() {
        console.log('👋 Leaving multiplayer arena...');
        
        // Clear simulation interval
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        
        // Close WebSocket connection
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
        
        // Clear all player data
        this.otherPlayers.clear();
        this.simulatedPlayers = [];
        
        // Deactivate multiplayer
        this.isActive = false;
        this.connectionStatus = 'disconnected';
        
        console.log('🎮 Multiplayer mode deactivated');
        this.connectionStatus = 'disconnected';
        this.isConnected = false;
        
        // Reset player count
        this.updateOnlinePlayerCount(1);
        
        console.log('✅ Left multiplayer arena successfully');
    }
    
    // Cleanup
    destroy() {
        this.leaveGame();
    }
}

// Add CSS for multiplayer animations
const multiplayerStyle = document.createElement('style');
multiplayerStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(multiplayerStyle);

// Initialize multiplayer system
window.multiplayer = new MultiplayerSystem();
