// Vue 组件定义

// 导航栏组件
const NavBar = {
    template: `
        <nav class="nav-bar">
            <div class="nav-title">🏆 Vue寻宝游戏</div>
            
            <div class="nav-links">
                <div 
                    class="nav-link" 
                    :class="{ active: currentPage === 'home' }"
                    @click="$emit('navigate', 'home')"
                >
                    🏠 主页
                </div>
                <div 
                    class="nav-link" 
                    :class="{ active: currentPage === 'users' }"
                    @click="$emit('navigate', 'users')"
                >
                    👤 用户管理
                </div>
                <div 
                    class="nav-link" 
                    :class="{ active: currentPage === 'leaderboard' }"
                    @click="$emit('navigate', 'leaderboard')"
                >
                    📊 排行榜
                </div>
            </div>
            
            <div class="music-controls">
                <div 
                    class="music-btn" 
                    :class="{ active: musicPlaying }"
                    @click="$emit('toggle-music')"
                    :title="musicPlaying ? '暂停音乐' : '播放音乐'"
                >
                    {{ musicPlaying ? '🎵' : '🔇' }}
                </div>
                <div 
                    class="music-btn" 
                    @click="$emit('adjust-volume', -0.2)"
                    title="减小音量"
                >
                    🔉
                </div>
                <div 
                    class="music-btn" 
                    @click="$emit('adjust-volume', 0.2)"
                    title="增大音量"
                >
                    🔊
                </div>
                <div class="music-btn" :title="'音量: ' + Math.round(volume * 10) + '/10'">
                    {{ volume > 0.7 ? '🔊' : volume > 0.3 ? '🔉' : '🔈' }}
                </div>
            </div>
        </nav>
    `,
    props: ['currentPage', 'musicPlaying', 'volume'],
    emits: ['navigate', 'toggle-music', 'adjust-volume']
};

// 地点卡片组件
const LocationCard = {
    template: `
        <div 
            class="location-card"
            :class="{ 
                completed: isCompleted, 
                locked: isLocked 
            }"
            @click="handleClick"
        >
            <div class="location-icon">{{ location.icon }}</div>
            <div class="location-title">{{ location.name }}</div>
            <div class="location-desc">{{ location.description }}</div>
            <div class="location-progress">
                <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <div v-if="isLocked" class="locked-overlay">🔒</div>
        </div>
    `,
    props: ['location', 'gameData'],
    computed: {
        isCompleted() {
            return this.gameData[this.location.id]?.completed || false;
        },
        isLocked() {
            return !this.gameData.unlockedLocations.includes(this.location.id);
        },
        progress() {
            return this.gameData[this.location.id]?.progress || 0;
        }
    },
    methods: {
        handleClick() {
            if (!this.isLocked) {
                this.$emit('start', this.location.id);
            }
        }
    },
    emits: ['start']
};

// 主页组件
const HomePage = {
    template: `
        <div class="page-container">
            <header class="page-header">
                <h1 class="page-title">寻宝冒险之旅</h1>
                <p class="page-subtitle">探索神秘地点，解锁珍贵宝藏！</p>
            </header>
            
            <div class="locations-grid">
                <div class="location-row">
                    <location-card 
                        v-for="location in locations"
                        :key="location.id"
                        :location="location"
                        :game-data="gameData"
                        @start="startLocationGame"
                    ></location-card>
                </div>
            </div>
            
            <div class="progress-section">
                <h3>总体进度</h3>
                <div class="progress-bar">
                    <div 
                        class="progress-fill" 
                        :style="{ width: totalProgress + '%' }"
                    ></div>
                    <div class="progress-text">{{ totalProgress }}%</div>
                </div>
                <p>已解锁地点: {{ unlockedLocations }}/{{ locations.length }}</p>
            </div>
        </div>
    `,
    props: ['gameData'],
    components: {
        'location-card': LocationCard
    },
    setup(props, { emit }) {
        const locations = GameLocations.getAllLocations();

        const totalProgress = Vue.computed(() => {
            return props.gameData.totalProgress || 0;
        });

        const unlockedLocations = Vue.computed(() => {
            return props.gameData.unlockedLocations.length;
        });

        const startLocationGame = (locationId) => {
            emit('start-location', locationId);
        };

        return {
            locations,
            totalProgress,
            unlockedLocations,
            startLocationGame
        };
    }
};

// 游戏动画组件
const GameAnimation = {
    template: `
        <div class="animation-area">
            <div class="character" :style="{ left: characterPosition + 'px' }">🧙‍♂️</div>
            <div 
                v-for="(marker, index) in locationMarkers" 
                :key="index"
                class="location-marker"
                :style="{ left: marker.position + 'px' }"
            >
                {{ marker.icon }}
            </div>
            <div class="treasure">💎</div>
            <div class="message" :class="{ show: showMessage }">{{ message }}</div>
        </div>
    `,
    props: ['location', 'step'],
    data() {
        return {
            characterPosition: 20,
            showMessage: false,
            message: ''
        };
    },
    computed: {
        locationMarkers() {
            const markers = {
                'library': [
                    { position: 120, icon: '📖' },
                    { position: 240, icon: '🕯️' },
                    { position: 360, icon: '🗞️' }
                ],
                'decoding': [
                    { position: 120, icon: '🔠' },
                    { position: 240, icon: '📐' },
                    { position: 360, icon: '🔍' }
                ],
                'puzzle': [
                    { position: 120, icon: '❓' },
                    { position: 240, icon: '🔢' },
                    { position: 360, icon: '⚡' }
                ],
                'temple': [
                    { position: 120, icon: '🚪' },
                    { position: 240, icon: '🕯️' },
                    { position: 360, icon: '🗿' }
                ],
                'forest': [
                    { position: 120, icon: '🌲' },
                    { position: 240, icon: '🦌' },
                    { position: 360, icon: '🍄' }
                ],
                'cave': [
                    { position: 120, icon: '🪨' },
                    { position: 240, icon: '✨' },
                    { position: 360, icon: '🔮' }
                ]
            };
            return markers[this.location] || markers['library'];
        }
    },
    watch: {
        step(newStep) {
            if (newStep > 0) {
                this.moveCharacter(newStep * 100);
                this.showGameMessage(`进行第${newStep}步...`);
            }
        }
    },
    methods: {
        moveCharacter(position) {
            this.characterPosition = position;
        },
        showGameMessage(text) {
            this.message = text;
            this.showMessage = true;
            setTimeout(() => {
                this.showMessage = false;
            }, 2000);
        }
    }
};

// 游戏步骤组件
const GameSteps = {
    template: `
        <div class="steps-container">
            <div 
                v-for="(step, index) in steps" 
                :key="index"
                class="step"
                :class="{
                    active: index === currentStep,
                    completed: completedSteps.includes(index)
                }"
            >
                <div class="step-header">
                    <div class="step-icon">{{ step.icon }}</div>
                    <div class="step-title">{{ step.title }}</div>
                </div>
                <div class="step-content">
                    {{ step.description }}
                </div>
            </div>
        </div>
    `,
    props: ['location', 'steps', 'currentStep', 'completedSteps']
};

// 游戏控制组件
const GameControls = {
    template: `
        <div class="controls">
            <button 
                class="btn btn-success" 
                :disabled="!canStart"
                @click="$emit('start')"
            >
                {{ isPlaying ? '进行中...' : '开始探索' }}
            </button>
            <button 
                class="btn" 
                :disabled="!canReset"
                @click="$emit('reset')"
            >
                重新开始
            </button>
        </div>
    `,
    props: ['canStart', 'canReset', 'isPlaying'],
    emits: ['start', 'reset']
};

// 游戏结果组件
const GameResult = {
    template: `
        <div class="result-area">
            <div v-if="result" v-html="result"></div>
            <div v-else>等待开始探索...</div>
        </div>
    `,
    props: ['result']
};

// 游戏页面组件
const GamePage = {
    template: `
        <div class="page-container">
            <header class="page-header">
                <button class="btn btn-secondary" @click="$emit('back-to-home')">← 返回主页</button>
                <h1 class="page-title">{{ currentLocation.name }}</h1>
                <p class="page-subtitle">{{ currentLocation.description }}</p>
            </header>
            
            <div class="game-content">
                <game-animation 
                    :location="location"
                    :step="currentStep"
                ></game-animation>
                
                <game-steps 
                    :location="location"
                    :steps="currentLocation.steps"
                    :current-step="currentStep"
                    :completed-steps="completedSteps"
                ></game-steps>
                
                <game-controls 
                    :can-start="canStart"
                    :can-reset="canReset"
                    :is-playing="isPlaying"
                    @start="startGame"
                    @reset="resetGame"
                ></game-controls>
                
                <game-result 
                    :result="currentResult"
                ></game-result>
            </div>
        </div>
    `,
    props: ['location', 'gameData'],
    components: {
        'game-animation': GameAnimation,
        'game-steps': GameSteps,
        'game-controls': GameControls,
        'game-result': GameResult
    },
    setup(props, { emit }) {
        const currentLocation = Vue.computed(() => GameLocations.getLocationConfig(props.location));
        const currentStep = Vue.ref(0);
        const completedSteps = Vue.ref([]);
        const isPlaying = Vue.ref(false);
        const currentResult = Vue.ref('');
        
        const canStart = Vue.computed(() => !isPlaying.value && completedSteps.value.length < currentLocation.value.steps.length);
        const canReset = Vue.computed(() => completedSteps.value.length > 0);

        const startGame = async () => {
            if (isPlaying.value) return;
            
            isPlaying.value = true;
            currentResult.value = '';
            
            for (let i = 0; i < currentLocation.value.steps.length; i++) {
                currentStep.value = i + 1;
                
                // 模拟游戏过程
                await Utils.delay(2000);
                
                completedSteps.value.push(i);
                currentResult.value = `
                    <strong>步骤 ${i + 1} 完成！</strong><br>
                    <small>发现了重要线索...</small>
                `;
            }
            
            // 游戏完成
            currentResult.value = `
                <strong style="color: #ffd700; font-size: 1.3rem;">
                    ${currentLocation.value.name}探索完成！
                </strong><br>
                <small>获得了珍贵的知识和经验</small>
            `;
            
            isPlaying.value = false;
            
            // 更新游戏进度
            emit('update-progress', props.location, {
                completed: true,
                progress: 100
            });
        };

        const resetGame = () => {
            currentStep.value = 0;
            completedSteps.value = [];
            currentResult.value = '';
            isPlaying.value = false;
            
            emit('update-progress', props.location, {
                completed: false,
                progress: 0
            });
        };

        return {
            currentLocation,
            currentStep,
            completedSteps,
            isPlaying,
            currentResult,
            canStart,
            canReset,
            startGame,
            resetGame
        };
    },
    emits: ['update-progress', 'back-to-home']
};

// 用户管理组件
const UserManagement = {
    template: `
        <div class="page-container">
            <header class="page-header">
                <h1 class="page-title">用户管理</h1>
                <p class="page-subtitle">登录或注册以保存游戏进度</p>
            </header>
            
            <div class="user-content">
                <div class="login-section" v-if="!currentUser">
                    <h3>用户登录</h3>
                    <form @submit.prevent="handleLogin">
                        <div class="form-group">
                            <input 
                                type="text" 
                                v-model="loginForm.username" 
                                placeholder="用户名" 
                                required
                            >
                        </div>
                        <div class="form-group">
                            <input 
                                type="password" 
                                v-model="loginForm.password" 
                                placeholder="密码" 
                                required
                            >
                        </div>
                        <button type="submit" class="btn btn-success">登录</button>
                    </form>
                </div>
                
                <div class="register-section" v-if="!currentUser">
                    <h3>用户注册</h3>
                    <form @submit.prevent="handleRegister">
                        <div class="form-group">
                            <input 
                                type="text" 
                                v-model="registerForm.username" 
                                placeholder="用户名" 
                                required
                            >
                        </div>
                        <div class="form-group">
                            <input 
                                type="password" 
                                v-model="registerForm.password" 
                                placeholder="密码" 
                                required
                            >
                        </div>
                        <div class="form-group">
                            <input 
                                type="text" 
                                v-model="registerForm.nickname" 
                                placeholder="昵称" 
                                required
                            >
                        </div>
                        <button type="submit" class="btn btn-secondary">注册</button>
                    </form>
                </div>
                
                <div class="user-info" v-if="currentUser">
                    <h3>欢迎, {{ currentUser.nickname }}!</h3>
                    <div class="user-stats">
                        <p>用户名: {{ currentUser.username }}</p>
                        <p>注册时间: {{ formatDate(currentUser.registerTime) }}</p>
                        <p>游戏进度: {{ currentUser.progress || 0 }}%</p>
                    </div>
                    <button class="btn" @click="handleLogout">退出登录</button>
                </div>
            </div>
        </div>
    `,
    props: ['users', 'currentUser'],
    setup(props, { emit }) {
        const loginForm = Vue.reactive({
            username: '',
            password: ''
        });

        const registerForm = Vue.reactive({
            username: '',
            password: '',
            nickname: ''
        });

        const handleLogin = () => {
            emit('login', { ...loginForm });
            loginForm.username = '';
            loginForm.password = '';
        };

        const handleRegister = () => {
            emit('register', { ...registerForm });
            registerForm.username = '';
            registerForm.password = '';
            registerForm.nickname = '';
        };

        const handleLogout = () => {
            emit('logout');
        };

        const formatDate = (timestamp) => {
            return Utils.formatDate(timestamp);
        };

        return {
            loginForm,
            registerForm,
            handleLogin,
            handleRegister,
            handleLogout,
            formatDate
        };
    },
    emits: ['login', 'register', 'logout']
};

// 排行榜组件
const Leaderboard = {
    template: `
        <div class="page-container">
            <header class="page-header">
                <h1 class="page-title">游戏排行榜</h1>
                <p class="page-subtitle">看看谁是最厉害的寻宝者！</p>
            </header>
            
            <div class="leaderboard-content">
                <div class="leaderboard-list">
                    <div 
                        v-for="(user, index) in sortedUsers" 
                        :key="user.id"
                        class="leaderboard-item"
                        :class="{ 
                            current: user.id === currentUser?.id,
                            top3: index < 3
                        }"
                    >
                        <div class="rank">{{ index + 1 }}</div>
                        <div class="user-info">
                            <div class="username">{{ user.nickname }}</div>
                            <div class="user-stats">
                                <span>进度: {{ user.progress || 0 }}%</span>
                                <span>注册: {{ formatDate(user.registerTime) }}</span>
                            </div>
                        </div>
                        <div class="medal">
                            {{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '' }}
                        </div>
                    </div>
                </div>
                
                <div class="current-user-stats" v-if="currentUser">
                    <h3>我的排名</h3>
                    <p>当前排名: {{ currentUserRank }}</p>
                    <p>游戏进度: {{ currentUser.progress || 0 }}%</p>
                </div>
            </div>
        </div>
    `,
    props: ['users', 'currentUser'],
    computed: {
        sortedUsers() {
            return UserService.getLeaderboard(this.users);
        },
        currentUserRank() {
            const rank = this.sortedUsers.findIndex(user => user.id === this.currentUser?.id);
            return rank >= 0 ? rank + 1 : '未上榜';
        }
    },
    methods: {
        formatDate(timestamp) {
            return Utils.formatDate(timestamp);
        }
    }
};