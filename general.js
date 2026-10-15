const AVATARS = Array.from({
    length: 200
}, (_, i) =>
`https://api.dicebear.com/7.x/notionists/svg?seed=${i + 1}`
);

const NAMES = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth",
    "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen",
    "Christopher", "Nancy", "Daniel", "Lisa", "Matthew", "Margaret", "Anthony", "Betty", "Mark", "Sandra",
    "Donald", "Ashley", "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
    "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa", "Edward", "Deborah",
    "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon", "Jeffrey", "Laura", "Ryan", "Cynthia",
    "Jacob", "Kathleen", "Gary", "Amy", "Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen",
    "Stephen", "Anna", "Larry", "Brenda", "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma",
    "Benjamin", "Samantha", "Samuel", "Katherine", "Frank", "Christine", "Gregory", "Debra", "Raymond", "Rachel",
    "Alexander", "Catherine", "Patrick", "Carolyn", "Jack", "Janet", "Dennis", "Ruth", "Jerry", "Maria",
    "Tyler", "Heather", "Aaron", "Diane", "Henry", "Virginia", "Douglas", "Julie", "Jose", "Joyce",
    "Adam", "Victoria", "Nathan", "Olivia", "Zachary", "Kelly", "Walter", "Christina", "Kyle", "Lauren",
    "Carl", "Joan", "Arthur", "Evelyn", "Gerald", "Judith", "Roger", "Megan", "Keith", "Cheryl",
    "Lawrence", "Andrea", "Terry", "Hannah", "Sean", "Martha", "Christian", "Jacqueline", "Albert", "Frances",
    "Joe", "Gloria", "Ethan", "Ann", "Austin", "Teresa", "Jesse", "Kathryn", "Willie", "Sara",
    "Billy", "Janice", "Bryan", "Jean", "Bruce", "Alice", "Jordan", "Madison", "Dylan", "Doris",
    "Alan", "Abigail", "Ralph", "Julia", "Roy", "Judy", "Wayne", "Grace", "Eugene", "Denise"
];

const ACHIEVEMENTS = [{
    id: 'first-worker',
    name: 'First Worker',
    description: 'You hired your first worker.',
    icon: 'fa-user'
},
{
    id: 'happy-workers',
    name: 'Happy Workers',
    description: 'All employees have morale above 90%.',
    icon: 'fa-smile'
},
{
    id: 'factory-empire',
    name: 'Factory Empire',
    description: 'You reached 10 workers.',
    icon: 'fa-industry'
},
{
    id: 'master-seller',
    name: 'Master Seller',
    description: 'You reached 10 salespeople.',
    icon: 'fa-user-tie'
},
{
    id: 'production-master',
    name: 'Production Master',
    description: 'You reached a production speed of 10 products per second.',
    icon: 'fa-cogs'
},
{
    id: 'marketing-master',
    name: 'Marketing Master',
    description: 'Your brand value exceeded 10.',
    icon: 'fa-chart-line'
},
{
    id: 'storage-king',
    name: 'Storage King',
    description: 'You increased your storage capacity to 1000.',
    icon: 'fa-warehouse'
},
{
    id: 'millionaire',
    name: 'Millionaire',
    description: 'You reached a capital of $1,000,000.',
    icon: 'fa-dollar-sign'
},
{
    id: 'billionaire',
    name: 'Billionaire',
    description: 'You reached a capital of $1,000,000,000.',
    icon: 'fa-dollar-sign'
},
{
    id: 'supporter',
    name: 'Supporter',
    description: 'You viewed the developer on GitHub.',
    icon: 'fa-heart'
}];

const MISSIONS = [{
    id: 'shipment-starter',
    name: 'First Shipment',
    description: 'Sell 25 products in total.',
    reward: '+$250 and +1 brand value',
    isCompleted: (state) => state.totalSold >= 25,
    onComplete: (state) => {
        state.money += 250;
        state.brand += 1;
    }
},
{
    id: 'brand-rise',
    name: 'Brand Rising',
    description: 'Reach brand value 20.',
    reward: '+$400 and +200 credit limit',
    isCompleted: (state) => state.brand >= 20,
    onComplete: (state) => {
        state.money += 400;
        state.creditLimit += 200;
    }
},
{
    id: 'efficient-factory',
    name: 'Lean Production',
    description: 'Reach production rate 5/s.',
    reward: '+$500 and +10% efficiency',
    isCompleted: (state) => state.productionRate >= 5,
    onComplete: (state) => {
        state.money += 500;
        state.efficiency = Math.min(100, state.efficiency + 10);
    }
},
{
    id: 'industrial-giant',
    name: 'Industrial Giant',
    description: 'Earn $20,000 total capital.',
    reward: '+$1000 and +2 brand value',
    isCompleted: (state) => state.money >= 20000,
    onComplete: (state) => {
        state.money += 1000;
        state.brand += 2;
    }
}];

const SAVE_KEY = 'myDreamFactorySaveV2';

function createInitialGameState() {
    return {
        money: 500,
        rawMaterials: 0,
        products: 0,
        workers: [],
        marketers: [],
        salesmen: [],
        brand: 0,
        productionRate: 1,
        baseProductPrice: 10,
        marketDemand: 1,
        maxStorage: 100,
        maxProducts: 100,
        efficiency: 100,
        credit: 0,
        creditLimit: 5000,
        interestRate: 10,
        achievements: new Set(),
        completedMissions: new Set(),
        autoSell: false,
        day: 1,
        totalSold: 0,
        totalProduced: 0,
        demandTimer: 0
    };
}

let gameState = createInitialGameState();

function formatNumber(num) {
return Number(num.toFixed(1));
}

function normalizeEmployee(employee) {
    return {
        ...employee,
        mood: typeof employee.mood === 'number' ? employee.mood : 100,
        experience: typeof employee.experience === 'number' ? employee.experience : 0
    };
}

function saveGame(showMessage = true) {
    const saveData = {
        ...gameState,
        achievements: Array.from(gameState.achievements),
        completedMissions: Array.from(gameState.completedMissions)
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    if (showMessage) {
        showNotification('Progress saved!', 'success');
    }
}

function loadGame() {
    const rawData = localStorage.getItem(SAVE_KEY);
    if (!rawData) {
        return;
    }

    try {
        const parsed = JSON.parse(rawData);
        const initial = createInitialGameState();
        gameState = {
            ...initial,
            ...parsed,
            workers: (parsed.workers || []).map(normalizeEmployee),
            marketers: (parsed.marketers || []).map(normalizeEmployee),
            salesmen: (parsed.salesmen || []).map(normalizeEmployee),
            achievements: new Set(parsed.achievements || []),
            completedMissions: new Set(parsed.completedMissions || [])
        };
        showNotification('Save loaded successfully!', 'success');
    } catch (error) {
        localStorage.removeItem(SAVE_KEY);
        showNotification('Save data was corrupted and has been reset.', 'error');
    }
}

function resetGame() {
    if (!confirm('Start a new game? This will delete your saved progress.')) {
        return;
    }
    localStorage.removeItem(SAVE_KEY);
    gameState = createInitialGameState();
    updateUI();
    showNotification('New game started!', 'success');
}

function showNotification(message, type = 'info') {
const notification = $('#notification');
notification.text(message);
notification.css('background-color', type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1');
notification.css('color', 'white');
notification.fadeIn();
setTimeout(() => notification.fadeOut(), 3000);
}

function createEmployee(type) {
return {
    id: Date.now(),
    name: NAMES[Math.floor(Math.random() * NAMES.length)],
    avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
    type: type,
    mood: 100,
    experience: 0
};
}

function updateUI() {
$('#money').text(formatNumber(gameState.money));
$('#raw-materials').text(formatNumber(gameState.rawMaterials));
$('#products').text(formatNumber(gameState.products));
$('#brand').text(formatNumber(gameState.brand));
$('#production-rate').text(formatNumber(gameState.productionRate));
$('#efficiency').text(formatNumber(gameState.efficiency));
$('#max-storage').text(gameState.maxStorage);
$('#max-products').text(gameState.maxProducts);
$('#current-credit').text(formatNumber(gameState.credit));
$('#available-credit').text(formatNumber(Math.max(0, gameState.creditLimit - gameState.credit)));
$('#interest-rate').text(gameState.interestRate);
$('#market-demand').text(`${formatNumber(gameState.marketDemand * 100)}%`);
$('#day-count').text(gameState.day);

$('#raw-materials-bar').css('width', `${(gameState.rawMaterials / gameState.maxStorage) * 100}%`);
$('#products-bar').css('width', `${(gameState.products / gameState.maxProducts) * 100}%`);

const employeesList = $('#employees-list');
employeesList.empty();

function createEmployeeCard(employee) {
    return `
            <div class="employee-card">
                <img src="${employee.avatar}" class="employee-avatar">
                <div>
                    <strong>${employee.name}</strong> (${employee.type})
                    <div class="progress-bar">
                        <div class="progress-bar-fill" style="width: ${employee.mood}%; 
                             background-color: ${employee.mood > 90 ? '#48bb78' : employee.mood > 70 ? '#1b7240' : employee.mood > 30 ? '#ed8936' : '#f56565'}">
                        </div>
                    </div>
                    <small>Mood: ${formatNumber(employee.mood)}% | Experience: ${formatNumber(employee.experience)}</small>
                    <span class="mood-indicator">${employee.mood > 90 ? '🥳' : employee.mood > 70 ? '😊' : employee.mood > 30 ? '😐' : '😟'}</span>
                </div>
            </div>
        `;
}

gameState.workers.forEach(worker => employeesList.append(createEmployeeCard(worker)));
gameState.marketers.forEach(marketer => employeesList.append(createEmployeeCard(marketer)));
gameState.salesmen.forEach(salesman => employeesList.append(createEmployeeCard(salesman)));

const achievementsList = $('#achievements-list');
achievementsList.empty();

ACHIEVEMENTS.forEach(achievement => {
    const unlocked = gameState.achievements.has(achievement.id);
    achievementsList.append(`
            <div class="achievement ${unlocked ? 'unlocked' : ''}">
                <i class="fas ${achievement.icon}"></i>
                <div>
                    <strong>${achievement.name}</strong><br>
                    <small>${achievement.description}</small>
                </div>
            </div>
        `);
});

const missionsList = $('#missions-list');
missionsList.empty();
MISSIONS.forEach(mission => {
    const completed = gameState.completedMissions.has(mission.id);
    missionsList.append(`
            <div class="mission ${completed ? 'completed' : ''}">
                <i class="fas ${completed ? 'fa-check-circle' : 'fa-clock'}"></i>
                <div>
                    <strong>${mission.name}</strong><br>
                    <small>${mission.description}</small><br>
                    <small>Reward: ${mission.reward}</small>
                </div>
            </div>
        `);
});
}

function checkAchievements() {
    
    // First worker achievement
    if (gameState.workers.length > 0) {
        if (!gameState.achievements.has('first-worker')) {
            gameState.achievements.add('first-worker');
            showNotification('Achievement Unlocked: First Worker!', 'success');
        }
    }
    
    // Marketing Master achievement
    if (gameState.brand >= 10) {
        if (!gameState.achievements.has('marketing-master')) {
            gameState.achievements.add('marketing-master');
            showNotification('Achievement Unlocked: Marketing Master!', 'success');
        }
    }
    
    // Millionaire achievement
    if (gameState.money >= 1000000) {
        if (!gameState.achievements.has('millionaire')) {
            gameState.achievements.add('millionaire');
            showNotification('Achievement Unlocked: Millionaire!', 'success');
        }
    }
    
    // Billionaire achievement
    if (gameState.money >= 1000000000) {
        if (!gameState.achievements.has('billionaire')) {
            gameState.achievements.add('billionaire');
            showNotification('Achievement Unlocked: Billionaire!', 'success');
        }
    }
    
    // Factory Empire achievement
    if (gameState.workers.length >= 10) {
        if (!gameState.achievements.has('factory-empire')) {
            gameState.achievements.add('factory-empire');
            showNotification('Achievement Unlocked: Factory Empire!', 'success');
        }
    }
    
    // Storage King achievement
    if (gameState.maxStorage >= 1000) {
        if (!gameState.achievements.has('storage-king')) {
            gameState.achievements.add('storage-king');
            showNotification('Achievement Unlocked: Storage King!', 'success');
        }
    }
    
    // Happy Workers achievement
    const allEmployees = [...gameState.workers, ...gameState.marketers, ...gameState.salesmen];
    if (allEmployees.length > 0 && allEmployees.every(emp => emp.mood > 90)) {
        if (!gameState.achievements.has('happy-workers')) {
            gameState.achievements.add('happy-workers');
            showNotification('Achievement Unlocked: Happy Workers!', 'success');
        }
    }
    
    // Master Seller achievement
    if (gameState.salesmen.length >= 10) {
        if (!gameState.achievements.has('master-seller')) {
            gameState.achievements.add('master-seller');
            showNotification('Achievement Unlocked: Master Seller!', 'success');
        }
    }
    
    // Production Master achievement
    if (gameState.productionRate >= 10) {
        if (!gameState.achievements.has('production-master')) {
            gameState.achievements.add('production-master');
            showNotification('Achievement Unlocked: Production Master!', 'success');
        }
    }
    }

function checkMissions() {
    MISSIONS.forEach(mission => {
       if (!gameState.completedMissions.has(mission.id) && mission.isCompleted(gameState)) {
           gameState.completedMissions.add(mission.id);
           mission.onComplete(gameState);
           showNotification(`Mission Complete: ${mission.name}`, 'success');
       }
    });
}

function triggerRandomEvent() {
    const events = [{
       name: 'Social media trend',
       effect: () => {
           gameState.marketDemand = 1.4;
           gameState.demandTimer = 6;
           showNotification('A trend boosts demand for 30 seconds!', 'success');
       }
    },
    {
       name: 'Supplier delay',
       effect: () => {
           const loss = Math.floor(gameState.rawMaterials * 0.2);
           gameState.rawMaterials = Math.max(0, gameState.rawMaterials - loss);
           showNotification(`Supplier delay! Lost ${loss} raw materials.`, 'error');
       }
    },
    {
       name: 'Local grant',
       effect: () => {
           gameState.money += 300;
           showNotification('You received a local manufacturing grant (+$300)!', 'success');
       }
    },
    {
       name: 'Machine wear',
       effect: () => {
           gameState.efficiency = Math.max(40, gameState.efficiency - 8);
           showNotification('Machine wear reduced efficiency.', 'error');
       }
    }];

    const randomEvent = events[Math.floor(Math.random() * events.length)];
    randomEvent.effect();
}
     
    function buyRawMaterials(amount) {
        const cost = amount * 5;
        
        if (gameState.money >= cost) {
            if (gameState.rawMaterials + amount <= gameState.maxStorage) {
                gameState.money -= cost;
                gameState.rawMaterials += amount;
                updateUI();
                showNotification(`${amount} raw materials purchased!`, 'success');
            } else {
                showNotification('Storage capacity is full!', 'error');
            }
        } else {
            showNotification('Not enough money!', 'error');
        }
    }
    
    function sellProducts() {
    if (gameState.products >= 1) {
       let price = gameState.baseProductPrice * (1 + (gameState.brand * 0.1)) * gameState.marketDemand;
        let saleAmount = Math.floor(gameState.products);
        gameState.money += saleAmount * price;
        gameState.products -= saleAmount;
       gameState.totalSold += saleAmount;
       checkMissions();
       updateUI();
       showNotification(`${saleAmount} products sold!`, 'success');
    }
    }
    
    function hireWorker() {
    if (gameState.money >= 200) {
        gameState.money -= 200;
        gameState.workers.push(createEmployee('Worker'));
        gameState.productionRate += 0.5;
        updateUI();
        checkAchievements();
        checkMissions();
        showNotification('New worker hired!', 'success');
    }
    }
    
    function hireMarketer() {
    if (gameState.money >= 300) {
        gameState.money -= 300;
        gameState.marketers.push(createEmployee('Marketer'));
        updateUI();
        checkMissions();
        showNotification('New marketer hired!', 'success');
    }
    }
    
    function hireSalesman() {
    if (gameState.money >= 400) {
        gameState.money -= 400;
        gameState.salesmen.push(createEmployee('Salesman'));
        gameState.autoSell = true;
        updateUI();
        checkMissions();
        showNotification('New salesman hired!', 'success');
    }
    }
    
    function motivateEmployees() {
    if (gameState.money >= 100) {
        gameState.money -= 100;
        const allEmployees = [...gameState.workers, ...gameState.marketers, ...gameState.salesmen];
        allEmployees.forEach(employee => {
            employee.mood = Math.min(100, employee.mood + 20);
        });
        gameState.efficiency = Math.min(100, gameState.efficiency + 10);
        checkMissions();
        updateUI();
        showNotification('Employee morale boosted!', 'success');
    }
    }
    
    function upgradeStorage() {
    if (gameState.money >= 500) {
        gameState.money -= 500;
        gameState.maxStorage += 100;
        gameState.maxProducts += 100;
        checkMissions();
        updateUI();
        showNotification('Storage capacity increased!', 'success');
    }
    }
    
    function githubLink() {
    window.open('https://github.com/ufuayk', '_blank');
    if (!gameState.achievements.has('supporter')) {
        gameState.achievements.add('supporter');
        showNotification('Achievement Unlocked: Supporter!', 'success');
        updateUI();
    }
    }
    
    function takeCredit() {
    if (gameState.credit < gameState.creditLimit) {
        const amount = Math.min(1000, gameState.creditLimit - gameState.credit);
        gameState.credit += amount;
        gameState.money += amount;
        checkMissions();
        updateUI();
        showNotification(`$${amount} credit taken!`);
    } else {
        showNotification('Credit limit reached!', 'error');
    }
    }
    
    function payCredit() {
    if (gameState.credit > 0 && gameState.money >= 100) { 
        const amount = Math.min(100, Math.min(gameState.credit, gameState.money));
        gameState.credit -= amount;
        gameState.money -= amount;
        checkMissions();
        updateUI();
        showNotification(`$${amount} credit paid!`, 'success');
    } else {
        showNotification('Not enough money or no outstanding credit!', 'error');
    }
    }
    
    function runAdvertising() {
    if (gameState.money >= 100) {
        gameState.money -= 100;
        gameState.brand += 1;
        updateUI();
        checkAchievements();
        checkMissions();
        showNotification('Advertising campaign started!', 'success');
    }
    }
    
    function upgradeFactory() {
    if (gameState.money >= 1000) {
        gameState.money -= 1000;
        gameState.productionRate *= 1.5;
        checkMissions();
        updateUI();
        showNotification('Factory upgraded!', 'success');
    }
    }

setInterval(() => {
if (gameState.rawMaterials > 0 && gameState.workers.length > 0) {
    let efficiency = gameState.efficiency / 100;
    let production = (gameState.productionRate * efficiency) / 10;

    production = Math.min(production, gameState.rawMaterials);
    production = Math.min(production, gameState.maxProducts - gameState.products);

    if (production > 0) {
        gameState.rawMaterials -= production;
        gameState.products += production;
        gameState.totalProduced += production;

        gameState.workers.forEach(worker => {
            worker.experience = Math.min(100, worker.experience + 0.1);
        });

        updateUI();
        checkAchievements();
        checkMissions();
    }
}
}, 100);

setInterval(() => {
gameState.marketers.forEach(marketer => {
    gameState.brand += 0.1 * (1 + marketer.experience / 100);
    marketer.experience = Math.min(100, marketer.experience + 0.1);
});
updateUI();
}, 1000);

setInterval(() => {
if (gameState.autoSell && gameState.salesmen.length > 0 && gameState.products > 0) {
    let price = gameState.baseProductPrice * (1 + (gameState.brand * 0.1)) * gameState.marketDemand;
    let saleAmount = Math.min(gameState.products, gameState.salesmen.length * 2);
    gameState.money += saleAmount * price;
    gameState.products -= saleAmount;
    gameState.totalSold += saleAmount;

    gameState.salesmen.forEach(salesman => {
        salesman.experience = Math.min(100, salesman.experience + 0.1);
    });

    updateUI();
    checkMissions();
}
}, 2000);

setInterval(() => {
const allEmployees = [...gameState.workers, ...gameState.marketers, ...gameState.salesmen];

let totalSalary = gameState.workers.length * 20 +
    gameState.marketers.length * 30 +
    gameState.salesmen.length * 40;

if (gameState.money >= totalSalary) {
    gameState.money -= totalSalary;

    allEmployees.forEach(employee => {
        employee.mood = Math.min(100, employee.mood + 5);
    });
} else {
    allEmployees.forEach(employee => {
        employee.mood = Math.max(0, employee.mood - 20);
    });
    showNotification('Salaries not paid! Morale is dropping...', 'error');
}

gameState.workers = gameState.workers.filter(worker => {
    worker.mood = Math.max(0, worker.mood - 2);
    if (worker.mood <= 10) {
        showNotification(`${worker.name} has resigned! (Worker)`, 'error');
        gameState.productionRate -= 0.5;
        return false;
    }
    return true;
});

gameState.marketers = gameState.marketers.filter(marketer => {
    marketer.mood = Math.max(0, marketer.mood - 2);
    if (marketer.mood <= 10) {
        showNotification(`${marketer.name} has resigned! (Marketer)`, 'error');
        return false;
    }
    return true;
});

gameState.salesmen = gameState.salesmen.filter(salesman => {
    salesman.mood = Math.max(0, salesman.mood - 2);
    if (salesman.mood <= 10) {
        showNotification(`${salesman.name} has resigned! (Salesman)`, 'error');
        if (gameState.salesmen.length <= 1) {
            gameState.autoSell = false;
        }
        return false;
    }
    return true;
});

const remainingEmployees = [...gameState.workers, ...gameState.marketers, ...gameState.salesmen];
const avgMood = remainingEmployees.length > 0 ?
    remainingEmployees.reduce((sum, emp) => sum + emp.mood, 0) / remainingEmployees.length :
    100;

gameState.efficiency = remainingEmployees.length > 0 ? avgMood : 100;

updateUI();
}, 10000);

setInterval(() => {
if (gameState.credit > 0) {
    const interest = (gameState.credit * gameState.interestRate) / 100 / 12;
    gameState.money -= interest;
    updateUI();
}
}, 30000);

setInterval(() => {
    gameState.day += 1;

    if (gameState.demandTimer > 0) {
        gameState.demandTimer -= 1;
        if (gameState.demandTimer <= 0) {
            gameState.marketDemand = 1;
            showNotification('Market demand is back to normal.');
        }
    } else if (Math.random() < 0.35) {
        triggerRandomEvent();
    }

    checkAchievements();
    checkMissions();
    updateUI();
}, 5000);

setInterval(() => {
    saveGame(false);
}, 5000);

window.addEventListener('beforeunload', () => saveGame(false));

loadGame();
updateUI();