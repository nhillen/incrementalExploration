var widgetBar = $("#widgetCounter");
var checkVals = ["totalWidgets", "factories", "factoryCost", "widgetsPerSecond"];

function drawObject() {
    if (!this.uiObject) {
        this.uiObject = $(this.UID);
    }
    
    if (counters[this.costType] >= this.cost) {
        this.uiObject.show();
        this.uiObject.prop('disabled', false);
    } else {
        this.uiObject.prop('disabled', true);
    }
    
    this.uiObject.prop('value', this.buttonTag + ": " + this.cost);
}

function findObject(someObject){
    var returnObject;
    //Get the ID of the passed in element
    var checkUID = "#" + someObject.id;
    _.each(allButtons, function (name) {
        if(name.UID === checkUID){
            returnObject = name;
        }
    });
    
    return returnObject;
}

function purchase() {
    var controlObject = findObject(this);
    
    //If we have enough resources to buy the thing
    if (counters[controlObject.costType] >= controlObject.cost)
    {
        //Remove the amount
        counters[controlObject.costType] -= controlObject.cost;

        //Set the new price
        controlObject.cost = Math.round(controlObject.cost * controlObject.costScaler);

        //Set the new amount
        counters[controlObject.gainType] += controlObject.gainAmount;
    }  
    
    drawUI();
}


var counters = {
    "none": 0,
    "time": 0,
    "ore": 0,
    "money": 0,
    "widgets": 0,
    "widgetsPerClick": 1,
    "widgetsPerSecond": 0,
    "tools": 0
}

// this instantiates the Producer Class
var makeWidgetButton = {
    UID: "#btnMakeWidget",
    showReq: 0,
    showType: "none",
    cost: 0,
    costType: "none",
    costScaler: 0,
    buttonTag: "Make Widget",
    gainType: "widgets",
    gainAmount: 1,
    draw: drawObject,
    purchase: purchase
};

var sellWidgetButton = {
    UID: "#btnSellWidget",
    showReq: 1,
    showType: "widgets",
    cost: 1,
    costType: "widgets",
    costScaler: 1,
    buttonTag: "Sell Widgets",
    gainType: "money",
    gainAmount: 5,
    draw: drawObject,
    purchase: purchase
};

var toolsButton = {
    UID: "#btnBuyTool",
    showReq: 1,
    showType: "widgets",
    cost: 50,
    costType: "money",
    costScaler: 1.25,
    buttonTag: "Tools Cost",
    gainType: "tools",
    gainAmount: 1,
    draw: drawObject,
    purchase: purchase
};

var allButtons = [makeWidgetButton, sellWidgetButton, toolsButton];


/*** MAIN LOOP ****************************************/

$(document).ready(function () {
    readSaveData();

    _.each(allButtons, function (button) {
        $(button.UID).click(button.purchase);
    });
});

window.setInterval(function () {
    runLoop();
    drawUI();
}, 1000);

function runLoop() {
    totalWidgets += widgetsPerSecond;
    counters["time"]++;
}

function drawUI() {
    var outputText =
            counters["time"] + " seconds" + "<br/>" +
            "$" + counters["money"] + "<br/>" +
            counters["widgets"] + " total widgets" + "<br/>" +
            counters["widgetsPerSecond"] + " widgets per second" + "<br/>" +
            counters["tools"] + " tools" + "<br/>";
    widgetBar.html(outputText);

    // Draw all of the buttons	
    _.each(allButtons, function (button) {
        button.draw();
    });
}

/*** SAVE IO *******************************************/

function readSaveData() {
    _.each(checkVals, function (name) {
        var temp = window.localStorage.getItem(name);
        if (temp) {
            window[name] = Number(temp);
        }
    });
}

function writeData() {
    _.each(checkVals, function (name) {
        window.localStorage.setItem(name, window[name]);
    });
}


