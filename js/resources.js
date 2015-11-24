var counters = {
    time: 0
}

var ore = {
    name: "Ore",
    count: 0,
    perSecond: 0,
    staticGainMultiplier: 1,
    perSecondGainMultiplier: 1
}

var widget = {
    name: "Widgets",
    count: 0,
    perSecond: 0,
    staticGainMultiplier: 1,
    perSecondGainMultiplier: 1,
    perSecondResourceType: ore,
    perSecondResourceRate: 1
}

var money = {
    name: "Money",
    count: 0,
    perSecond: 0,
    staticGainMultiplier: 1,
    perSecondGainMultiplier: 1,
    perSecondResourceCost: widget,
    perSecondResourceRate: 5
}

var resources = {
    ore: ore,
    widget : widget,
    money: money
}

//TODO: Seperate out data
var makeOre = {
    UID: "#btnMineOre",
    cost: 0,
    costType: "none",
    costScaler: 0,
    displayName: "Make Ore",
    gainType: ore,
    gainAmount: 1,
    productionType: "single"
}

var buildWidget = {
    UID: "#btnMakeWidget",
    cost: 1,
    costType: ore,
    costScaler: 1,
    displayName: "Make Widget",
    gainType: widget,
    gainAmount: 1,
    productionType: "single"
};

var sellWidget = {
    UID: "#btnSellWidget",
    cost: 1,
    costType: widget,
    costScaler: 1,
    displayName: "Sell Widgets",
    gainType: money,
    gainAmount: 5,
    productionType: "single"
};

var buildStall = {
    UID: "#btnBuyStall",
    cost: 20,
    costType: widget,
    costScaler: 1.25,
    buttonTag: "Stall Cost",
    gainAmount: 5,
    gainType: money,
    productionType: "perSecond",
    gainMultiplier: 1
};

var buildStore = {
    UID: "#btnBuyStre",
    cost: 150,
    costType: widget,
    costScaler: 1.25,
    buttonTag: "Stall Cost",
    gainAmount: 45,
    gainType: money,
    productionType: "perSecond",
    gainMultiplier: 1
};



var buildTool = {
    UID: "#btnBuyTool",
    cost: 50,
    costType: money,
    costScaler: 1.25,
    displayName: "Tools Cost",
    gainAmount: 1,
    gainType: widget,
    productionType: "perSecond",
    gainMultiplier: 1
};

var buildFactory = {
    UID: "#btnBuyFactory",
    cost: 100,
    costType: widget,
    costScaler: 1.25,
    buttonTag: "Factory Cost",
    gainAmount: 8,
    gainType: widget,
    productionType: "perSecond",
    gainMultiplier: 1
};

var allThings = [makeOre, buildWidget, sellWidget, buildStall, buildStore, buildTool, buildFactory];


/**
 * The other file gets counters, allThings and resources, if your stuff isnt in those
 * files it doesnt make it into the game
 * 
 */