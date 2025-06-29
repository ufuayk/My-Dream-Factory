const NAMES = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
    "Matthew", "Margaret", "Anthony", "Betty", "Mark", "Sandra", "Donald", "Ashley",
    "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
    "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
    "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
    "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
    "Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen", "Stephen", "Anna",
    "Larry", "Brenda", "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma",
    "Benjamin", "Samantha", "Samuel", "Katherine", "Frank", "Christine", "Gregory", "Debra",
    "Raymond", "Rachel", "Alexander", "Catherine", "Patrick", "Carolyn", "Jack", "Janet",
    "Dennis", "Ruth", "Jerry", "Maria", "Tyler", "Heather", "Aaron", "Diane"
];

const AVATARS = Array.from({ length: 200 }, (_, i) => 
    `https://api.dicebear.com/7.x/notionists/svg?seed=${i + 1}`
);

export class Employee {
    constructor(type) {
        this.id = Date.now() + Math.random();
        this.name = NAMES[Math.floor(Math.random() * NAMES.length)];
        this.avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
        this.type = type;
        this.mood = 100;
        this.experience = 0;
        this.hireDate = Date.now();
        this.productivity = 1;
        this.salary = this.getBaseSalary();
        this.traits = this.generateTraits();
    }

    getBaseSalary() {
        const salaries = {
            'Worker': 20,
            'Marketer': 30,
            'Salesman': 40
        };
        return salaries[this.type] || 20;
    }

    generateTraits() {
        const allTraits = [
            { name: 'Hardworking', effect: 'productivity', value: 0.2 },
            { name: 'Creative', effect: 'brand', value: 0.15 },
            { name: 'Charismatic', effect: 'sales', value: 0.25 },
            { name: 'Efficient', effect: 'cost', value: -0.1 },
            { name: 'Loyal', effect: 'mood_decay', value: -0.5 },
            { name: 'Ambitious', effect: 'experience', value: 0.3 }
        ];

        const traits = [];
        const numTraits = Math.random() < 0.3 ? 1 : 0; // 30% chance to have a trait
        
        if (numTraits > 0) {
            const trait = allTraits[Math.floor(Math.random() * allTraits.length)];
            traits.push(trait);
        }

        return traits;
    }

    increaseMood(amount) {
        this.mood = Math.min(100, this.mood + amount);
    }

    decreaseMood(amount) {
        const moodDecayReduction = this.traits.find(t => t.effect === 'mood_decay')?.value || 0;
        const actualDecrease = amount * (1 + moodDecayReduction);
        this.mood = Math.max(0, this.mood - actualDecrease);
    }

    gainExperience(amount) {
        const experienceBonus = this.traits.find(t => t.effect === 'experience')?.value || 0;
        const actualGain = amount * (1 + experienceBonus);
        this.experience = Math.min(100, this.experience + actualGain);
    }

    getProductivity() {
        const baseProductivity = 1 + (this.experience / 100) * 0.5;
        const moodMultiplier = this.mood / 100;
        const traitBonus = this.traits.find(t => t.effect === 'productivity')?.value || 0;
        
        return baseProductivity * moodMultiplier * (1 + traitBonus);
    }

    getMoodEmoji() {
        if (this.mood > 90) return '🥳';
        if (this.mood > 70) return '😊';
        if (this.mood > 50) return '😐';
        if (this.mood > 30) return '😟';
        return '😢';
    }

    getExperienceLevel() {
        if (this.experience < 20) return 'Novice';
        if (this.experience < 40) return 'Beginner';
        if (this.experience < 60) return 'Intermediate';
        if (this.experience < 80) return 'Advanced';
        return 'Expert';
    }

    getDaysWorked() {
        return Math.floor((Date.now() - this.hireDate) / (1000 * 60 * 60 * 24));
    }

    // Serialization
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            avatar: this.avatar,
            type: this.type,
            mood: this.mood,
            experience: this.experience,
            hireDate: this.hireDate,
            productivity: this.productivity,
            salary: this.salary,
            traits: this.traits
        };
    }

    static fromData(data) {
        const employee = new Employee(data.type);
        Object.assign(employee, data);
        return employee;
    }
}