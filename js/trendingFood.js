class TrendingFoodSystem {
    constructor() {
        this.trendingData = {
            hashtags: [],
            crypto: [],
            memes: [],
            lastUpdate: 0
        };
        
        this.currentFood = null;
        this.foodHistory = [];
        this.updateInterval = 300000; // 5 minutes
        this.fallbackMode = false;
        
        // API configurations
        this.apis = {
            twitter: {
                enabled: false, // Requires API key
                baseUrl: 'https://api.twitter.com/1.1/trends/place.json',
                woeid: 1 // Worldwide
            },
            coingecko: {
                enabled: true,
                baseUrl: 'https://api.coingecko.com/api/v3',
                trending: '/search/trending'
            }
        };
        
        // Fallback trending content
        this.fallbackContent = {
            hashtags: [
                '#AI', '#Gaming', '#Tech', '#NFT', '#Web3', '#Crypto', 
                '#Blockchain', '#Metaverse', '#VR', '#AR', '#Memes', 
                '#Viral', '#Trending', '#Innovation', '#Future'
            ],
            crypto: [
                { name: 'Bitcoin', symbol: 'BTC', emoji: '₿' },
                { name: 'Ethereum', symbol: 'ETH', emoji: 'Ξ' },
                { name: 'Dogecoin', symbol: 'DOGE', emoji: '🐕' },
                { name: 'Shiba', symbol: 'SHIB', emoji: '🐶' },
                { name: 'Pepe', symbol: 'PEPE', emoji: '🐸' }
            ],
            memes: [
                { name: 'Doge', emoji: '🐕', type: 'classic' },
                { name: 'Pepe', emoji: '🐸', type: 'crypto' },
                { name: 'Chad', emoji: '💪', type: 'sigma' },
                { name: 'Stonks', emoji: '📈', type: 'finance' },
                { name: 'Moon', emoji: '🌙', type: 'crypto' }
            ]
        };
        
        this.initialize();
    }
    
    async initialize() {
        console.log('🌍 Initializing Trending Food System...');
        
        // Start with fallback content
        this.loadFallbackContent();
        
        // Try to fetch real trending data
        await this.fetchTrendingData();
        
        // Start update cycle
        this.startUpdateCycle();
        
        // Initialize food preview
        this.updateFoodPreview();
        
        console.log('✅ Trending Food System ready!');
    }
    
    loadFallbackContent() {
        this.trendingData = {
            hashtags: [...this.fallbackContent.hashtags],
            crypto: [...this.fallbackContent.crypto],
            memes: [...this.fallbackContent.memes],
            lastUpdate: Date.now()
        };
        this.fallbackMode = true;
        console.log('📱 Loaded fallback trending content');
    }
    
    async fetchTrendingData() {
        try {
            console.log('🔄 Fetching real-time trending data...');
            
            // Fetch crypto trends from CoinGecko
            await this.fetchCryptoTrends();
            
            // Twitter trends would require API key
            // await this.fetchTwitterTrends();
            
            this.fallbackMode = false;
            this.trendingData.lastUpdate = Date.now();
            
        } catch (error) {
            console.warn('⚠️ Failed to fetch trending data, using fallback:', error.message);
            this.loadFallbackContent();
        }
    }
    
    async fetchCryptoTrends() {
        try {
            const response = await fetch(`${this.apis.coingecko.baseUrl}${this.apis.coingecko.trending}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`CoinGecko API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Process trending coins
            if (data.coins && data.coins.length > 0) {
                this.trendingData.crypto = data.coins.slice(0, 10).map(coin => ({
                    name: coin.item.name,
                    symbol: coin.item.symbol.toUpperCase(),
                    emoji: this.getCryptoEmoji(coin.item.symbol),
                    rank: coin.item.market_cap_rank,
                    id: coin.item.id
                }));
                
                console.log(`📈 Fetched ${this.trendingData.crypto.length} trending crypto coins`);
            }
            
        } catch (error) {
            console.warn('⚠️ CoinGecko API failed:', error.message);
            // Keep fallback crypto data
        }
    }
    
    getCryptoEmoji(symbol) {
        const cryptoEmojis = {
            'BTC': '₿', 'ETH': 'Ξ', 'DOGE': '🐕', 'SHIB': '🐶',
            'PEPE': '🐸', 'ADA': '🔷', 'SOL': '☀️', 'MATIC': '🔮',
            'AVAX': '🏔️', 'DOT': '⚫', 'LINK': '🔗', 'UNI': '🦄'
        };
        return cryptoEmojis[symbol.toUpperCase()] || '💰';
    }
    
    async fetchTwitterTrends() {
        // Note: This would require Twitter API v2 bearer token
        // For demo, we'll simulate this functionality
        
        console.log('🐦 Twitter trends would be fetched here with API key');
        
        // Simulated trending hashtags
        const simulatedTrends = [
            '#AI2024', '#GameDev', '#Crypto', '#NFTs', '#Web3',
            '#Blockchain', '#VirtualReality', '#MachineLearning',
            '#Innovation', '#TechNews', '#DigitalArt', '#Gaming'
        ];
        
        this.trendingData.hashtags = simulatedTrends.slice(0, 8);
    }
    
    generateTrendingFood() {
        const foodTypes = ['hashtag', 'crypto', 'meme'];
        const weights = [0.4, 0.4, 0.2]; // 40% hashtags, 40% crypto, 20% memes
        
        const randomValue = Math.random();
        let cumulativeWeight = 0;
        let selectedType = 'hashtag';
        
        for (let i = 0; i < foodTypes.length; i++) {
            cumulativeWeight += weights[i];
            if (randomValue <= cumulativeWeight) {
                selectedType = foodTypes[i];
                break;
            }
        }
        
        let foodItem;
        
        switch (selectedType) {
            case 'hashtag':
                foodItem = this.createHashtagFood();
                break;
            case 'crypto':
                foodItem = this.createCryptoFood();
                break;
            case 'meme':
                foodItem = this.createMemeFood();
                break;
        }
        
        // Add to food history
        this.foodHistory.push({
            ...foodItem,
            timestamp: Date.now()
        });
        
        // Keep only recent history
        if (this.foodHistory.length > 20) {
            this.foodHistory.shift();
        }
        
        return foodItem;
    }
    
    createHashtagFood() {
        const hashtags = this.trendingData.hashtags;
        if (hashtags.length === 0) return this.createFallbackFood();
        
        const hashtag = hashtags[Math.floor(Math.random() * hashtags.length)];
        
        return {
            type: 'hashtag',
            content: hashtag,
            emoji: '📱',
            color: '#1DA1F2', // Twitter blue
            bonusEffect: 'social_boost',
            points: 15,
            description: `Trending: ${hashtag}`
        };
    }
    
    createCryptoFood() {
        const crypto = this.trendingData.crypto;
        if (crypto.length === 0) return this.createFallbackFood();
        
        const coin = crypto[Math.floor(Math.random() * crypto.length)];
        
        return {
            type: 'crypto',
            content: coin.symbol,
            emoji: coin.emoji,
            color: '#F7931A', // Bitcoin orange
            bonusEffect: 'crypto_surge',
            points: 25,
            description: `${coin.name} (${coin.symbol})`
        };
    }
    
    createMemeFood() {
        const memes = this.trendingData.memes;
        if (memes.length === 0) return this.createFallbackFood();
        
        const meme = memes[Math.floor(Math.random() * memes.length)];
        
        return {
            type: 'meme',
            content: meme.name,
            emoji: meme.emoji,
            color: '#FF6B9D', // Meme pink
            bonusEffect: 'meme_power',
            points: 20,
            description: `Meme: ${meme.name}`
        };
    }
    
    createFallbackFood() {
        return {
            type: 'classic',
            content: 'Apple',
            emoji: '🍎',
            color: '#FF0080',
            bonusEffect: 'none',
            points: 10,
            description: 'Classic Apple'
        };
    }
    
    applyBonusEffect(foodItem, game) {
        console.log(`🎁 Applying bonus effect: ${foodItem.bonusEffect}`);
        
        switch (foodItem.bonusEffect) {
            case 'social_boost':
                this.applySocialBoost(game);
                break;
            case 'crypto_surge':
                this.applyCryptoSurge(game);
                break;
            case 'meme_power':
                this.applyMemePower(game);
                break;
            default:
                // No special effect
                break;
        }
    }
    
    applySocialBoost(game) {
        // Double points for next 3 foods
        game.socialBoostCounter = 3;
        this.showBonusMessage('📱 SOCIAL BOOST! Double points for next 3 foods!', '#1DA1F2');
    }
    
    applyCryptoSurge(game) {
        // Temporary speed boost + extra points
        if (window.powerUpSystem) {
            window.powerUpSystem.powerUps.speed.count++;
            window.powerUpSystem.updatePowerUpDisplay();
        }
        game.score += 15; // Bonus crypto gains
        game.updateScore(); // Update the display
        this.showBonusMessage('🚀 CRYPTO SURGE! Speed boost + bonus coins!', '#F7931A');
    }
    
    applyMemePower(game) {
        // Random power-up + score multiplier
        if (window.powerUpSystem) {
            const powerUps = ['speed', 'teleport', 'shield'];
            const randomPowerUp = powerUps[Math.floor(Math.random() * powerUps.length)];
            window.powerUpSystem.powerUps[randomPowerUp].count++;
            window.powerUpSystem.updatePowerUpDisplay();
        }
        this.showBonusMessage('🎭 MEME POWER! Random power-up gained!', '#FF6B9D');
    }
    
    showBonusMessage(text, color) {
        if (window.powerUpSystem && window.powerUpSystem.showMessage) {
            window.powerUpSystem.showMessage(text, 'success');
        }
    }
    
    startUpdateCycle() {
        setInterval(async () => {
            console.log('🔄 Updating trending data...');
            await this.fetchTrendingData();
        }, this.updateInterval);
    }
    
    getTrendingStatus() {
        const timeSinceUpdate = Date.now() - this.trendingData.lastUpdate;
        const isRecent = timeSinceUpdate < this.updateInterval * 2;
        
        return {
            isLive: !this.fallbackMode && isRecent,
            lastUpdate: this.trendingData.lastUpdate,
            hashtagCount: this.trendingData.hashtags.length,
            cryptoCount: this.trendingData.crypto.length,
            memeCount: this.trendingData.memes.length,
            fallbackMode: this.fallbackMode
        };
    }
    
    getFoodHistory() {
        return this.foodHistory.slice(-10); // Last 10 foods eaten
    }
    
    // Public API for game integration
    getNextFood() {
        this.currentFood = this.generateTrendingFood();
        this.updateFoodPreview(); // Update preview when new food is generated
        return this.currentFood;
    }
    
    getCurrentFood() {
        return this.currentFood;
    }
    
    // Generate preview of what the next food will be (without consuming it)
    previewNextFood() {
        return this.generateTrendingFood();
    }
    
    // Update the UI preview element
    updateFoodPreview() {
        const previewElement = document.getElementById('next-food-preview');
        if (previewElement) {
            const nextFood = this.previewNextFood();
            previewElement.textContent = nextFood.emoji;
            previewElement.title = nextFood.description; // Tooltip with description
        }
    }
}

// Initialize trending food system
window.trendingFoodSystem = new TrendingFoodSystem();
