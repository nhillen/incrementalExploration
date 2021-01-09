var counters = {
    time: 0
}

const locations = {
  home : {
    activities : [
      {
        id: "sleep",
        displayName: "Sleep on the Bed",
        clickFunction: function(){setCurrentActivity('rest')}
      },
      {
        id: "Stop",
        displayName: "Stop All Activities",
        clickFunction: function(){setCurrentActivity('')}
      }
    ]
  }
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
    displayName: "Mine Ore",
    gainType: ore,
    gainAmount: 1,
    productionType: "single"
}

var buildMine = {
    UID: "#btnBuyMine",
    cost: 300,
    costType: money,
    costScaler: 1.4,
    displayName: "Buy Mine",
    gainAmount: 5,
    gainType: ore,
    productionType: "perSecond",
    gainMultiplier: 1
};

var buildSmelter = {
    UID: "#btnBuySmelter",
    cost: 12000,
    costType: money,
    costScaler: 1.4,
    displayName: "Buy Smelter",
    gainAmount: 50,
    gainType: ore,
    productionType: "perSecond",
    gainMultiplier: 1
};

var buildWidget = {
    UID: "#btnMakeWidget",
    cost: 1,
    costType: ore,
    costScaler: 1,
    displayName: "Create Widget",
    gainType: widget,
    gainAmount: 1,
    productionType: "single"
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

var buildShop = {
    UID: "#btnBuyShop",
    cost: 100,
    costType: widget,
    costScaler: 1.25,
    displayName: "Shop Cost",
    gainAmount: 8,
    gainType: widget,
    productionType: "perSecond",
    gainMultiplier: 1
};

var buildFactory = {
    UID: "#btnBuyFactory",
    cost: 1500,
    costType: widget,
    costScaler: 1.25,
    displayName: "Factory Cost",
    gainAmount: 100,
    gainType: widget,
    productionType: "perSecond",
    gainMultiplier: 1
};

var sellWidget = {
    UID: "#btnSellWidget",
    cost: 1,
    costType: widget,
    costScaler: 1,
    displayName: "Sell Widget",
    gainType: money,
    gainAmount: 5,
    productionType: "single"
};

var buildStall = {
    UID: "#btnBuyStall",
    cost: 20,
    costType: widget,
    costScaler: 1.25,
    displayName: "Buy Stall",
    gainAmount: 5,
    gainType: money,
    productionType: "perSecond",
    gainMultiplier: 1
};

var buildStore = {
    UID: "#btnBuyStore",
    cost: 150,
    costType: widget,
    costScaler: 1.25,
    displayName: "Buy Store",
    gainAmount: 45,
    gainType: money,
    productionType: "perSecond",
    gainMultiplier: 1
};

var buildDistributor = {
    UID: "#btnBuyDistributor",
    cost: 7000,
    costType: widget,
    costScaler: 1.25,
    displayName: "Buy Distributor ",
    gainAmount: 600,
    gainType: money,
    productionType: "perSecond",
    gainMultiplier: 1
};



var allThings = [makeOre, buildMine, buildSmelter, buildWidget, sellWidget, buildStall, buildStore, buildDistributor, buildTool, buildShop, buildFactory];


/**
 * The other file gets counters, allThings and resources, if your stuff isnt in those
 * files it doesnt make it into the game
 *
 */
