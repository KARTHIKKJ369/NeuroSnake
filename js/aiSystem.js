class AISystem {
    constructor() {
        this.playerSkillLevel = 1;
        this.adaptationHistory = [];
        this.gameStats = {
            averageScore: 0,
            averageGameTime: 0,
            totalGames: 0,
            bestScore: 0,
            collisionPatterns: [],
            reactionTimes: []
        };
        this.difficultyModifiers = {
            speedMultiplier: 1,
            foodComplexity: 1,
            powerUpFrequency: 1,
            obstacleChance: 0
        };
        this.analysisInterval = null;
    }
    
    initializeGame(gameMode) {
        // Stop any previous analysis
        this.stopRealTimeAnalysis();
        
        this.gameMode = gameMode;
        this.gameStartTime = Date.now();
        this.movementHistory = [];
        this.lastMoveTime = Date.now();
        
        // Reset difficulty modifiers for new game
        this.difficultyModifiers = {
            speedMultiplier: 1,
            foodComplexity: 1,
            powerUpFrequency: 1,
            obstacleChance: 0
        };
        
        // Load player stats from localStorage
        this.loadPlayerStats();
        
        // Start real-time analysis
        this.startRealTimeAnalysis();
        
        console.log(`🧠 AI System initialized for ${gameMode} mode. Current skill level: ${this.playerSkillLevel}`);
    }
    
    loadPlayerStats() {
        const savedStats = localStorage.getItem('neurosnake-ai-stats');
        if (savedStats) {
            this.gameStats = { ...this.gameStats, ...JSON.parse(savedStats) };
            this.calculateSkillLevel();
        }
    }
    
    savePlayerStats() {
        localStorage.setItem('neurosnake-ai-stats', JSON.stringify(this.gameStats));
    }
    
    startRealTimeAnalysis() {
        this.analysisInterval = setInterval(() => {
            this.analyzePlayerBehavior();
        }, 2000); // Analyze every 2 seconds
    }
    
    stopRealTimeAnalysis() {
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
        }
    }
    
    adaptDifficulty(currentScore, snakeLength) {
        // Record performance metrics
        const gameTime = Date.now() - this.gameStartTime;
        const scoreRate = currentScore / (gameTime / 1000); // Score per second
        
        // Analyze performance and adjust
        if (scoreRate > this.getExpectedScoreRate()) {
            this.increaseDifficulty();
        } else if (scoreRate < this.getExpectedScoreRate() * 0.5) {
            this.decreaseDifficulty();
        }
        
        // Update speed based on current performance
        this.adjustGameSpeed(currentScore, snakeLength);
        
        // Trigger power-up spawning based on difficulty
        this.managePowerUpSpawning();
        
        this.updateAILevelDisplay();
    }
    
    getExpectedScoreRate() {
        return this.playerSkillLevel * 2; // Expected score per second based on skill
    }
    
    increaseDifficulty() {
        this.playerSkillLevel = Math.min(10, this.playerSkillLevel + 0.05); // Slower increase
        this.difficultyModifiers.speedMultiplier = Math.min(1.5, this.difficultyModifiers.speedMultiplier + 0.02); // Smaller increments
        this.difficultyModifiers.foodComplexity = Math.min(2, this.difficultyModifiers.foodComplexity + 0.05); // Less extreme
        
        console.log('🔥 Difficulty increased! Player is performing well.');
    }
    
    decreaseDifficulty() {
        this.playerSkillLevel = Math.max(0.5, this.playerSkillLevel - 0.02); // Smaller decrease
        this.difficultyModifiers.speedMultiplier = Math.max(0.8, this.difficultyModifiers.speedMultiplier - 0.01); // Smaller decrease
        this.difficultyModifiers.powerUpFrequency = Math.min(1.5, this.difficultyModifiers.powerUpFrequency + 0.05); // Less extreme
        
        console.log('🎯 Difficulty adjusted down. Providing more support.');
    }
    
    adjustGameSpeed(score, snakeLength) {
        if (window.gameEngine) {
            const baseSpeed = window.gameEngine.originalSpeed; // Use original speed as base
            const speedReduction = Math.floor(score / 100) * 10; // Less aggressive: faster every 100 points, by 10ms
            const aiSpeedModifier = Math.max(0.8, Math.min(1.5, this.difficultyModifiers.speedMultiplier)); // Less extreme range
            
            // Calculate new speed more conservatively
            const targetSpeed = Math.max(80, baseSpeed - speedReduction); // Higher minimum speed
            const newSpeed = Math.max(60, targetSpeed / aiSpeedModifier); // Even higher absolute minimum
            
            // Only change speed if the difference is significant (avoid micro-adjustments)
            if (Math.abs(window.gameEngine.speed - newSpeed) > 5) {
                window.gameEngine.speed = newSpeed;
                console.log(`🎮 Speed adjusted: Base=${baseSpeed}, Reduction=${speedReduction}, Modifier=${aiSpeedModifier.toFixed(2)}, Final=${newSpeed.toFixed(0)}`);
            }
        }
    }
    
    optimizeFoodPlacement(proposedFood, snake) {
        const head = snake[0];
        const distanceToHead = Math.abs(proposedFood.x - head.x) + Math.abs(proposedFood.y - head.y);
        
        // Adjust food placement based on skill level
        if (this.playerSkillLevel > 7 && distanceToHead < 5) {
            // For skilled players, make food placement more challenging
            return this.findChallengingFoodPosition(snake);
        } else if (this.playerSkillLevel < 3 && distanceToHead > 15) {
            // For beginners, place food closer
            return this.findHelpfulFoodPosition(snake);
        }
        
        return proposedFood;
    }
    
    findChallengingFoodPosition(snake) {
        const head = snake[0];
        let attempts = 0;
        let bestFood = { x: 15, y: 15 };
        let maxComplexity = 0;
        
        while (attempts < 20) {
            const candidateFood = {
                x: Math.floor(Math.random() * game.tileCount),
                y: Math.floor(Math.random() * game.tileCount)
            };
            
            // Check if position is valid
            let valid = true;
            for (let segment of snake) {
                if (segment.x === candidateFood.x && segment.y === candidateFood.y) {
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                const complexity = this.calculatePathComplexity(head, candidateFood, snake);
                if (complexity > maxComplexity) {
                    maxComplexity = complexity;
                    bestFood = candidateFood;
                }
            }
            
            attempts++;
        }
        
        return bestFood;
    }
    
    findHelpfulFoodPosition(snake) {
        const head = snake[0];
        let attempts = 0;
        let bestFood = { x: 15, y: 15 };
        let minDistance = Infinity;
        
        while (attempts < 20) {
            const candidateFood = {
                x: Math.floor(Math.random() * game.tileCount),
                y: Math.floor(Math.random() * game.tileCount)
            };
            
            // Check if position is valid
            let valid = true;
            for (let segment of snake) {
                if (segment.x === candidateFood.x && segment.y === candidateFood.y) {
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                const distance = Math.abs(candidateFood.x - head.x) + Math.abs(candidateFood.y - head.y);
                if (distance < minDistance && distance > 3) { // Not too close, but closer
                    minDistance = distance;
                    bestFood = candidateFood;
                }
            }
            
            attempts++;
        }
        
        return bestFood;
    }
    
    calculatePathComplexity(start, end, snake) {
        // Simple heuristic: consider distance and snake body obstacles
        const directDistance = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
        let obstacleCount = 0;
        
        // Count snake segments that might interfere with direct path
        for (let segment of snake) {
            if ((segment.x >= Math.min(start.x, end.x) && segment.x <= Math.max(start.x, end.x)) ||
                (segment.y >= Math.min(start.y, end.y) && segment.y <= Math.max(start.y, end.y))) {
                obstacleCount++;
            }
        }
        
        return directDistance + (obstacleCount * 2);
    }
    
    managePowerUpSpawning() {
        if (!game || !window.powerUpSystem) return;
        
        const shouldSpawnPowerUp = Math.random() < (0.02 * this.difficultyModifiers.powerUpFrequency);
        
        if (shouldSpawnPowerUp && game.powerUps.length < 2) {
            window.powerUpSystem.spawnRandomPowerUp();
        }
    }
    
    analyzePlayerBehavior() {
        if (!game || !game.gameRunning) return;
        
        // Analyze movement patterns
        const recentMoves = this.movementHistory.slice(-10);
        const averageReactionTime = this.calculateAverageReactionTime();
        
        // Update player stats
        this.gameStats.reactionTimes.push(averageReactionTime);
        if (this.gameStats.reactionTimes.length > 100) {
            this.gameStats.reactionTimes.shift(); // Keep only recent data
        }
        
        // Detect if player is struggling
        if (averageReactionTime > 300 && this.playerSkillLevel > 2) {
            this.provideSupportHints();
        }
        
        console.log(`🔍 Player analysis: Avg reaction time: ${averageReactionTime}ms, Skill level: ${this.playerSkillLevel.toFixed(1)}`);
    }
    
    calculateAverageReactionTime() {
        if (this.gameStats.reactionTimes.length === 0) return 200;
        
        const sum = this.gameStats.reactionTimes.reduce((a, b) => a + b, 0);
        return sum / this.gameStats.reactionTimes.length;
    }
    
    provideSupportHints() {
        // Could show helpful tips or adjust difficulty
        if (window.powerUpSystem) {
            window.powerUpSystem.increasePowerUpChance();
        }
    }
    
    recordMovement(direction, timestamp) {
        this.movementHistory.push({
            direction,
            timestamp,
            reactionTime: timestamp - this.lastMoveTime
        });
        
        this.lastMoveTime = timestamp;
        
        // Keep only recent movement history
        if (this.movementHistory.length > 50) {
            this.movementHistory.shift();
        }
    }
    
    gameEnded(finalScore, gameTime) {
        this.stopRealTimeAnalysis();
        
        // Update statistics
        this.gameStats.totalGames++;
        this.gameStats.averageScore = 
            (this.gameStats.averageScore * (this.gameStats.totalGames - 1) + finalScore) / this.gameStats.totalGames;
        this.gameStats.averageGameTime = 
            (this.gameStats.averageGameTime * (this.gameStats.totalGames - 1) + gameTime) / this.gameStats.totalGames;
        this.gameStats.bestScore = Math.max(this.gameStats.bestScore, finalScore);
        
        // Recalculate skill level based on overall performance
        this.calculateSkillLevel();
        
        // Save updated stats
        this.savePlayerStats();
        
        console.log(`🎯 Game ended. Final score: ${finalScore}, New skill level: ${this.playerSkillLevel.toFixed(1)}`);
    }
    
    calculateSkillLevel() {
        // Complex algorithm to determine skill level based on multiple factors
        let skillScore = 1;
        
        // Score-based component
        if (this.gameStats.averageScore > 0) {
            skillScore += Math.log(this.gameStats.averageScore / 100) * 0.5;
        }
        
        // Game time component (longer games = more skill)
        if (this.gameStats.averageGameTime > 0) {
            skillScore += Math.log(this.gameStats.averageGameTime / 30000) * 0.3; // 30 seconds baseline
        }
        
        // Reaction time component (faster = more skill)
        const avgReactionTime = this.calculateAverageReactionTime();
        if (avgReactionTime > 0) {
            skillScore += (300 - avgReactionTime) / 100 * 0.2; // 300ms baseline
        }
        
        // Consistency component
        if (this.gameStats.totalGames > 5) {
            const consistency = 1 - (Math.abs(this.gameStats.bestScore - this.gameStats.averageScore) / this.gameStats.bestScore);
            skillScore += consistency * 0.5;
        }
        
        this.playerSkillLevel = Math.max(0.5, Math.min(10, skillScore));
    }
    
    getCurrentLevel() {
        return Math.ceil(this.playerSkillLevel);
    }
    
    updateAILevelDisplay() {
        const levelElement = document.getElementById('current-level');
        if (levelElement) {
            levelElement.textContent = this.getCurrentLevel();
        }
    }
    
    // Public API for external systems
    getPlayerInsights() {
        return {
            skillLevel: this.playerSkillLevel,
            averageScore: this.gameStats.averageScore,
            bestScore: this.gameStats.bestScore,
            totalGames: this.gameStats.totalGames,
            averageReactionTime: this.calculateAverageReactionTime(),
            currentDifficulty: this.difficultyModifiers
        };
    }
}

// Initialize AI system
window.aiSystem = new AISystem();
