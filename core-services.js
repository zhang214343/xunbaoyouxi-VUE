// 核心服务模块 - 音频管理器
const AudioManager = {
    audioContext: null,
    oscillator: null,
    gainNode: null,
    variationInterval: null,
    
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.log('音频初始化失败:', error);
        }
    },
    
    playMusic(frequency = 220, type = 'sine') {
        this.stopMusic();
        
        if (!this.audioContext) return;
        
        this.oscillator = this.audioContext.createOscillator();
        this.gainNode = this.audioContext.createGain();
        
        this.oscillator.type = type;
        this.oscillator.frequency.value = frequency;
        this.gainNode.gain.value = 0.05;
        
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
        
        this.oscillator.start();
        this.startToneVariation(frequency);
    },
    
    startToneVariation(baseFrequency) {
        if (this.variationInterval) {
            clearInterval(this.variationInterval);
        }
        
        this.variationInterval = setInterval(() => {
            if (this.oscillator) {
                const variation = Math.random() * 50 - 25;
                this.oscillator.frequency.value = baseFrequency + variation;
            }
        }, 1500);
    },
    
    stopMusic() {
        if (this.oscillator) {
            this.oscillator.stop();
            this.oscillator = null;
        }
        if (this.variationInterval) {
            clearInterval(this.variationInterval);
            this.variationInterval = null;
        }
    },
    
    setVolume(volume) {
        if (this.gainNode) {
            this.gainNode.gain.value = volume * 0.05;
        }
    }
};

// 游戏数据管理
const GameDataManager = {
    // 保存游戏数据到本地存储
    saveGameData(gameData) {
        try {
            localStorage.setItem('treasureGameData', JSON.stringify(gameData));
        } catch (error) {
            console.error('保存游戏数据失败:', error);
        }
    },

    // 从本地存储加载游戏数据
    loadGameData() {
        try {
            const savedData = localStorage.getItem('treasureGameData');
            return savedData ? JSON.parse(savedData) : null;
        } catch (error) {
            console.error('加载游戏数据失败:', error);
            return null;
        }
    },

    // 初始化游戏数据
    initializeGameData() {
        return {
            library: { completed: false, progress: 0 },
            decoding: { completed: false, progress: 0 },
            puzzle: { completed: false, progress: 0 },
            temple: { completed: false, progress: 0 },
            forest: { completed: false, progress: 0 },
            cave: { completed: false, progress: 0 },
            totalProgress: 0,
            unlockedLocations: ['library'],
            lastPlayed: null
        };
    },

    // 计算总进度
    calculateTotalProgress(gameData) {
        const locations = ['library', 'decoding', 'puzzle', 'temple', 'forest', 'cave'];
        return Math.round(
            locations.reduce((sum, loc) => sum + (gameData[loc]?.progress || 0), 0) / locations.length
        );
    },

    // 解锁新地点
    unlockNewLocations(gameData) {
        const unlocked = [...gameData.unlockedLocations];
        
        if (gameData.library.completed && !unlocked.includes('decoding')) {
            unlocked.push('decoding');
        }
        if (gameData.decoding.completed && !unlocked.includes('puzzle')) {
            unlocked.push('puzzle');
        }
        if (gameData.puzzle.completed && !unlocked.includes('temple')) {
            unlocked.push('temple');
        }
        if (gameData.temple.completed && !unlocked.includes('forest')) {
            unlocked.push('forest');
        }
        if (gameData.forest.completed && !unlocked.includes('cave')) {
            unlocked.push('cave');
        }
        
        return unlocked;
    }
};

// 用户管理服务
const UserService = {
    // 初始化用户数据
    initializeUsers() {
        return [
            { id: 1, username: 'admin', password: '123456', nickname: '管理员', registerTime: Date.now(), progress: 95 },
            { id: 2, username: 'player1', password: '123456', nickname: '冒险者一号', registerTime: Date.now() - 86400000, progress: 75 },
            { id: 3, username: 'player2', password: '123456', nickname: '宝藏猎人', registerTime: Date.now() - 172800000, progress: 60 },
            { id: 4, username: 'player3', password: '123456', nickname: '新手玩家', registerTime: Date.now() - 259200000, progress: 30 }
        ];
    },

    // 用户登录
    login(users, credentials) {
        return users.find(u => 
            u.username === credentials.username && 
            u.password === credentials.password
        );
    },

    // 用户注册
    register(users, userData) {
        const existingUser = users.find(u => u.username === userData.username);
        if (existingUser) {
            return { success: false, message: '用户名已存在！' };
        }
        
        const newUser = {
            id: Math.max(...users.map(u => u.id)) + 1,
            ...userData,
            registerTime: Date.now(),
            progress: 0
        };
        
        users.push(newUser);
        return { success: true, user: newUser };
    },

    // 更新用户进度
    updateUserProgress(users, userId, progress) {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            users[userIndex].progress = progress;
            return true;
        }
        return false;
    },

    // 获取排行榜数据
    getLeaderboard(users) {
        return [...users].sort((a, b) => (b.progress || 0) - (a.progress || 0));
    }
};

// 游戏地点配置
const GameLocations = {
    getLocationConfig(locationId) {
        const locations = {
            'library': {
                name: '古老图书馆',
                description: '在尘封的书籍中寻找线索',
                steps: [
                    { icon: '🔍', title: '查找古籍', description: '在书架中寻找关于宝藏的记载...' },
                    { icon: '📜', title: '解读日记', description: '解读探险家留下的古老日记...' }
                ]
            },
            'decoding': {
                name: '解码室',
                description: '解读古代文字和神秘符号',
                steps: [
                    { icon: '📖', title: '分析文字', description: '分析古代文字的语法和结构...' },
                    { icon: '🧩', title: '破译密码', description: '使用密码学方法破译隐藏信息...' }
                ]
            },
            'puzzle': {
                name: '谜题大厅',
                description: '解开古老谜题，通往神秘神庙',
                steps: [
                    { icon: '❓', title: '理解规则', description: '研究谜题的解决规则...' },
                    { icon: '🔢', title: '破解谜题', description: '按照正确顺序操作...' }
                ]
            },
            'temple': {
                name: '神秘神庙',
                description: '寻找最终的宝藏',
                steps: [
                    { icon: '🔍', title: '寻找宝箱', description: '在神庙深处寻找隐藏的宝箱...' },
                    { icon: '🗝️', title: '打开宝箱', description: '使用收集到的线索打开宝箱...' }
                ]
            },
            'forest': {
                name: '迷雾森林',
                description: '探索隐藏的森林路径',
                steps: [
                    { icon: '🧭', title: '导航路径', description: '在迷雾中找到正确的方向...' },
                    { icon: '🌿', title: '收集草药', description: '寻找神秘的治愈草药...' }
                ]
            },
            'cave': {
                name: '水晶洞穴',
                description: '收集能量水晶',
                steps: [
                    { icon: '⛏️', title: '挖掘水晶', description: '在洞穴墙壁上寻找水晶...' },
                    { icon: '💫', title: '充能水晶', description: '为水晶注入神秘能量...' }
                ]
            }
        };
        
        return locations[locationId] || locations['library'];
    },

    getAllLocations() {
        return [
            { id: 'library', name: '古老图书馆', icon: '📚', description: '寻找初始线索' },
            { id: 'decoding', name: '解码室', icon: '🔍', description: '解读古代文字' },
            { id: 'puzzle', name: '谜题大厅', icon: '🧩', description: '解开古老谜题' },
            { id: 'temple', name: '神秘神庙', icon: '🏛️', description: '寻找最终宝藏' },
            { id: 'forest', name: '迷雾森林', icon: '🌳', description: '探索隐藏路径' },
            { id: 'cave', name: '水晶洞穴', icon: '💎', description: '收集能量水晶' }
        ];
    }
};

// 工具函数
const Utils = {
    // 格式化日期
    formatDate(timestamp) {
        return new Date(timestamp).toLocaleDateString('zh-CN');
    },

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // 生成随机数
    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
};