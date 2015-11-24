var infoBlock = $('#widgetCounter');

function drawObject() {

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
    
    writeData();
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
    gainAmount: 1
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
    gainAmount: 5
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
    gainAmount: 1
    
};

var allButtons = [makeWidgetButton, sellWidgetButton, toolsButton];


/*** MAIN LOOP ****************************************/

$(document).ready(function () {
    
   //window.localStorage.clear();
    readSaveData();

    //Setup functions and parameters
    _.each(allButtons, function (button) {
        button.draw = drawObject;
        button.uiObject = $(button.UID);
        button.purchase = purchase; 
        $(button.UID).click(button.purchase);
    });
});

window.setInterval(function () {
    runLoop();
    drawUI();
}, 1000);

function runLoop() {
    counters.widgets += counters.widgetsPerSecond;
    counters.time++;
}

function drawUI() {
    var outputText =
            counters["time"] + " seconds" + "<br/>" +
            "$" + counters["money"] + "<br/>" +
            counters["widgets"] + " total widgets" + "<br/>" +
            counters["widgetsPerSecond"] + " widgets per second" + "<br/>" +
            counters["tools"] + " tools" + "<br/>";
    infoBlock.html(outputText);

    // Draw all of the buttons	
    _.each(allButtons, function (button) {
        button.draw();
    });
}

/*** SAVE IO *******************************************/

function readSaveData() {
    var tempCounter =  window.localStorage.getItem("counters");
    if(tempCounter){
        counters = JSON.parse(tempCounter);
    }
    
    var tempButtons = window.localStorage.getItem("allButtons");
    if(tempButtons){
        allButtons = JSON.parse(tempButtons);
    }
}

function writeData() {
    window.localStorage.setItem("counters", JSON.stringify(counters));
    window.localStorage.setItem("allButtons", JSON.stringify(allButtons));
}


