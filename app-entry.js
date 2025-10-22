// Vue 应用入口文件
const { createApp } = Vue;

const App = {
    components: {
        'nav-bar': NavBar,
        'home-page': HomePage,
        'game-page': GamePage,
        'user-management': UserManagement,
        'leaderboard': Leaderboard
    },
    
    setup() {
        // 状态管理
        const currentPage = Vue.ref('home');
        const musicPlaying = Vue.ref(true);
        const volume = Vue.ref(0.5);
        const currentUser = Vue.ref(null);
        
        // 游戏数据
        const gameData = Vue.reactive(GameDataManager.initializeGameData());
        
        // 用户数据
        const users = Vue.ref(UserService.initializeUsers());

        // 初始化
        Vue.onMounted(() => {
            AudioManager.init();
            AudioManager.playMusic();
            AudioManager.setVolume(volume.value);
            
            // 加载保存的游戏数据
            const savedData = GameDataManager.loadGameData();
            if (savedData) {
                Object.assign(gameData, savedData);
            }
        });

        // 页面导航
        const changePage = (page) => {
            currentPage.value = page;
        };

        // 开始地点游戏
        const startLocation = (locationId) => {
            currentPage.value = 'game-' + locationId;
        };

        // 更新游戏进度
        const updateGameProgress = (location, data) => {
            gameData[location] = { ...gameData[location], ...data };
            
            // 计算总进度
            gameData.totalProgress = GameDataManager.calculateTotalProgress(gameData);
            
            // 解锁新地点
            gameData.unlockedLocations = GameDataManager.unlockNewLocations(gameData);
            
            gameData.lastPlayed = new Date().toISOString();
            
            // 保存游戏数据
            GameDataManager.saveGameData(gameData);
            
            // 更新用户进度
            if (currentUser.value) {
                UserService.updateUserProgress(users.value, currentUser.value.id, gameData.totalProgress);
            }
        };

        // 音乐控制
        const toggleMusic = () => {
            musicPlaying.value = !musicPlaying.value;
            if (musicPlaying.value) {
                AudioManager.playMusic();
            } else {
                AudioManager.stopMusic();
            }
        };

        const adjustVolume = (change) => {
            volume.value = Math.max(0, Math.min(1, volume.value + change));
            AudioManager.setVolume(volume.value);
        };

        // 用户管理
        const loginUser = (credentials) => {
            const user = UserService.login(users.value, credentials);
            
            if (user) {
                currentUser.value = { ...user };
                alert(`欢迎回来，${user.nickname}！`);
            } else {
                alert('用户名或密码错误！');
            }
        };

        const registerUser = (userData) => {
            const result = UserService.register(users.value, userData);
            if (result.success) {
                currentUser.value = { ...result.user };
                alert(`注册成功，欢迎 ${userData.nickname}！`);
            } else {
                alert(result.message);
            }
        };

        const logoutUser = () => {
            currentUser.value = null;
            alert('已退出登录');
        };

        return {
            currentPage,
            musicPlaying,
            volume,
            currentUser,
            gameData,
            users,
            changePage,
            startLocation,
            updateGameProgress,
            toggleMusic,
            adjustVolume,
            loginUser,
            registerUser,
            logoutUser
        };
    }
};

// 创建并挂载Vue应用
const app = createApp(App);
app.mount('#app');