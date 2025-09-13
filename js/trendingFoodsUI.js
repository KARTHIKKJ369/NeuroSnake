// Trending Foods UI System
class TrendingFoodsUI {
    constructor() {
        this.panel = null;
        this.isVisible = false;
        this.updateInterval = null;
        
        this.createUI();
        this.startUpdateCycle();
    }
    
    createUI() {
        // Create trending foods panel
        this.panel = document.createElement('div');
        this.panel.id = 'trending-foods-panel';
        this.panel.className = 'trending-panel';
        this.panel.innerHTML = `
            <div class="trending-header">
                <h3>🌍 Trending Eats</h3>
                <button class="toggle-btn" onclick="window.trendingFoodsUI.toggle()">📊</button>
            </div>
            <div class="trending-content" style="display: none;">
                <div class="trending-status">
                    <div class="status-indicator"></div>
                    <span class="status-text">Loading...</span>
                </div>
                
                <div class="trending-categories">
                    <div class="category hashtags">
                        <h4>📱 Trending Hashtags</h4>
                        <div class="items-list"></div>
                    </div>
                    
                    <div class="category crypto">
                        <h4>💰 Hot Crypto</h4>
                        <div class="items-list"></div>
                    </div>
                    
                    <div class="category memes">
                        <h4>🎭 Viral Memes</h4>
                        <div class="items-list"></div>
                    </div>
                </div>
                
                <div class="recent-foods">
                    <h4>🍽️ Recently Eaten</h4>
                    <div class="recent-list"></div>
                </div>
                
                <div class="trending-stats">
                    <div class="stat">
                        <span class="label">Last Update:</span>
                        <span class="value" id="last-update">Never</span>
                    </div>
                    <div class="stat">
                        <span class="label">Data Source:</span>
                        <span class="value" id="data-source">Fallback</span>
                    </div>
                </div>
            </div>
        `;
        
        // Add to game UI
        const gameUI = document.querySelector('.game-ui');
        if (gameUI) {
            gameUI.appendChild(this.panel);
        } else {
            document.body.appendChild(this.panel);
        }
        
        this.addStyles();
    }
    
    addStyles() {
        const styles = `
            .trending-panel {
                position: absolute;
                top: 20px;
                right: 20px;
                width: 300px;
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid #00ffff;
                border-radius: 10px;
                color: white;
                font-family: 'Orbitron', monospace;
                z-index: 1000;
                backdrop-filter: blur(10px);
            }
            
            .trending-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                border-bottom: 1px solid #00ffff40;
                background: linear-gradient(45deg, #ff006e, #8338ec);
            }
            
            .trending-header h3 {
                margin: 0;
                font-size: 14px;
                font-weight: bold;
            }
            
            .toggle-btn {
                background: none;
                border: none;
                color: white;
                font-size: 16px;
                cursor: pointer;
                padding: 5px;
                border-radius: 3px;
                transition: background 0.3s;
            }
            
            .toggle-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .trending-content {
                padding: 15px;
                max-height: 500px;
                overflow-y: auto;
            }
            
            .trending-status {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                padding: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 5px;
            }
            
            .status-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-right: 8px;
                background: #ff4444;
                animation: pulse 2s infinite;
            }
            
            .status-indicator.live {
                background: #44ff44;
            }
            
            .status-indicator.fallback {
                background: #ffaa44;
            }
            
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .status-text {
                font-size: 12px;
                font-weight: bold;
            }
            
            .category {
                margin-bottom: 15px;
            }
            
            .category h4 {
                margin: 0 0 8px 0;
                font-size: 12px;
                color: #00ffff;
                border-bottom: 1px solid #00ffff40;
                padding-bottom: 5px;
            }
            
            .items-list {
                display: flex;
                flex-wrap: wrap;
                gap: 5px;
            }
            
            .trending-item {
                background: rgba(255, 255, 255, 0.1);
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 10px;
                border: 1px solid transparent;
                transition: all 0.3s;
                cursor: pointer;
            }
            
            .trending-item:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: scale(1.05);
            }
            
            .trending-item.hashtag {
                border-color: #1DA1F2;
                color: #1DA1F2;
            }
            
            .trending-item.crypto {
                border-color: #F7931A;
                color: #F7931A;
            }
            
            .trending-item.meme {
                border-color: #FF6B9D;
                color: #FF6B9D;
            }
            
            .recent-foods {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #00ffff40;
            }
            
            .recent-list {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 5px;
                margin-top: 8px;
            }
            
            .recent-food {
                aspect-ratio: 1;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                position: relative;
                overflow: hidden;
            }
            
            .recent-food::before {
                content: attr(data-type);
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                font-size: 6px;
                padding: 1px;
                text-align: center;
                text-transform: uppercase;
            }
            
            .trending-stats {
                margin-top: 15px;
                padding-top: 15px;
                border-top: 1px solid #00ffff40;
            }
            
            .stat {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                font-size: 10px;
            }
            
            .stat .label {
                color: #aaa;
            }
            
            .stat .value {
                color: #00ffff;
                font-weight: bold;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    toggle() {
        const content = this.panel.querySelector('.trending-content');
        this.isVisible = !this.isVisible;
        content.style.display = this.isVisible ? 'block' : 'none';
        
        if (this.isVisible) {
            this.updateDisplay();
        }
    }
    
    updateDisplay() {
        if (!window.trendingFoodSystem) return;
        
        const status = window.trendingFoodSystem.getTrendingStatus();
        
        // Update status indicator
        const indicator = this.panel.querySelector('.status-indicator');
        const statusText = this.panel.querySelector('.status-text');
        
        if (status.isLive) {
            indicator.className = 'status-indicator live';
            statusText.textContent = '🟢 Live Data';
        } else if (status.fallbackMode) {
            indicator.className = 'status-indicator fallback';
            statusText.textContent = '🟡 Fallback Mode';
        } else {
            indicator.className = 'status-indicator';
            statusText.textContent = '🔴 No Data';
        }
        
        // Update trending categories
        this.updateHashtags();
        this.updateCrypto();
        this.updateMemes();
        this.updateRecentFoods();
        this.updateStats(status);
    }
    
    updateHashtags() {
        const container = this.panel.querySelector('.category.hashtags .items-list');
        const hashtags = window.trendingFoodSystem.trendingData.hashtags || [];
        
        container.innerHTML = hashtags.slice(0, 8).map(hashtag => 
            `<div class="trending-item hashtag" title="${hashtag}">${hashtag}</div>`
        ).join('');
    }
    
    updateCrypto() {
        const container = this.panel.querySelector('.category.crypto .items-list');
        const crypto = window.trendingFoodSystem.trendingData.crypto || [];
        
        container.innerHTML = crypto.slice(0, 6).map(coin => 
            `<div class="trending-item crypto" title="${coin.name}">
                ${coin.emoji} ${coin.symbol}
            </div>`
        ).join('');
    }
    
    updateMemes() {
        const container = this.panel.querySelector('.category.memes .items-list');
        const memes = window.trendingFoodSystem.trendingData.memes || [];
        
        container.innerHTML = memes.slice(0, 5).map(meme => 
            `<div class="trending-item meme" title="${meme.name}">
                ${meme.emoji} ${meme.name}
            </div>`
        ).join('');
    }
    
    updateRecentFoods() {
        const container = this.panel.querySelector('.recent-list');
        const recentFoods = window.trendingFoodSystem ? 
            window.trendingFoodSystem.getFoodHistory() : [];
        
        container.innerHTML = recentFoods.slice(-10).map(food => 
            `<div class="recent-food" data-type="${food.type}" title="${food.description}">
                ${food.emoji}
            </div>`
        ).join('');
    }
    
    updateStats(status) {
        const lastUpdateEl = this.panel.querySelector('#last-update');
        const dataSourceEl = this.panel.querySelector('#data-source');
        
        if (status.lastUpdate) {
            const timeDiff = Date.now() - status.lastUpdate;
            const minutes = Math.floor(timeDiff / 60000);
            lastUpdateEl.textContent = minutes < 1 ? 'Just now' : `${minutes}m ago`;
        } else {
            lastUpdateEl.textContent = 'Never';
        }
        
        dataSourceEl.textContent = status.fallbackMode ? 
            'Fallback Content' : 'Live APIs';
    }
    
    startUpdateCycle() {
        // Update display every 30 seconds if visible
        this.updateInterval = setInterval(() => {
            if (this.isVisible) {
                this.updateDisplay();
            }
        }, 30000);
    }
    
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
    }
}

// Initialize trending foods UI
window.trendingFoodsUI = new TrendingFoodsUI();
