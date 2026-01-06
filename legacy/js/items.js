const RARITY = {
    COMMON: { name: "Common", value: 10 },
    UNCOMMON: { name: "Uncommon", value: 5 },
    RARE: { name: "Rare", value: 3 },
    EPIC: { name: "Epic", value: 1 },
    LEGENDARY: { name: "Legendary", value: 0.5 },
};

function getItemRarityValue(rarityName) {
    const rarityObject = RARITY[rarityName];
    if (rarityObject) {
        return rarityObject.value;
    }
    return 0;
}

const inventory = {
    items: {},

    addItem: function(itemName, amount) {
        if (!this.items[itemName]) {
            this.items[itemName] = 0;
        }
        this.items[itemName] += amount;
    },

    getItemCount: function(itemName) {
        return this.items[itemName] || 0;
    },
};

function checkSkillSuccess(skillValue, difficulty) {
    const successRate = Math.max(0.1, 1 - (difficulty - skillValue) * 0.1);
    return Math.random() < successRate;
}

function getRandomItem(items, skillValue) {
    const totalRarity = Object.values(items).reduce((sum, item) => sum + item.rarity, 0);
    const random = Math.random() * totalRarity;
    let cumulative = 0;

    for (const itemName in items) {
        const item = items[itemName];
        cumulative += item.rarity;

        if (random <= cumulative) {
            if (checkSkillSuccess(skillValue, item.difficulty)) {
                return itemName;
            } else {
                return null;
            }
        }
    }

    return null;
}