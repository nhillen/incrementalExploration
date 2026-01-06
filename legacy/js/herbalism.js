const herbs = [
    {
        name: "Daisy",
        rarity: RARITY.COMMON,
        difficulty: 5,
    },
    {
        name: "Bluebell",
        rarity: RARITY.COMMON,
        difficulty: 7,
    },
    {
        name: "Foxglove",
        rarity: RARITY.UNCOMMON,
        difficulty: 12,
    },
    {
        name: "Nightshade",
        rarity: RARITY.UNCOMMON,
        difficulty: 15,
    },
    {
        name: "Bloodroot",
        rarity: RARITY.RARE,
        difficulty: 20,
    },
    {
        name: "Frostcap",
        rarity: RARITY.RARE,
        difficulty: 25,
    },
    {
        name: "Glowing Mushroom",
        rarity: RARITY.EPIC,
        difficulty: 35,
    },
    {
        name: "Wisp Flower",
        rarity: RARITY.EPIC,
        difficulty: 40,
    },
    {
        name: "Dragonscale Plant",
        rarity: RARITY.LEGENDARY,
        difficulty: 50,
    },
    {
        name: "Starblossom",
        rarity: RARITY.LEGENDARY,
        difficulty: 55,
    },
];

function getHerbPool(localHerbs) {
    return localHerbs.map((herb) => {
        const rarity = findHerbByName(herb).rarity;
        return { name: herb, rarity: rarity };
    });
}

function findHerbByName(herbName) {
    return herbs.find((herb) => herb.name === herbName);
}

function getRandomHerb(localHerbs) {
    const herbPool = getHerbPool(localHerbs);
    const totalWeight = herbPool.reduce((acc, curr) => acc + getItemRarityValue(findHerbByName(curr.name).rarity), 0);
    let randomNum = Math.random() * totalWeight;
    let chosenHerb = null;

    for (let i = 0; i < herbPool.length; i++) {
        const herb = herbPool[i];
        const rarityValue = getItemRarityValue(findHerbByName(herb.name).rarity);
        randomNum -= rarityValue;

        if (randomNum <= 0) {
            chosenHerb = herb.name;
            break;
        }
    }

    return chosenHerb;
}