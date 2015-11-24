var infoBlock = $('#widgetCounter');

function drawObject() {
 
    if (this.costType === "none" || this.costType.count >= this.cost) {
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
    _.each(allThings, function (name) {
        if(name.UID === checkUID){
            returnObject = name;
        }
    });
    
    return returnObject;
}

function recalculatePerSecond(resource){
    var pps = 0;
    
    _.each(allThings, function(producer){
       if(producer.gainType === resource && producer.productionType === "perSecond"){
           if(!producer.perSecondGainMultiplier){
               producer.perSecondGainMultiplier = 1;
           }
           
           if(!resource.perSecondGainMultiplier){
               producer.perSecondGainMultiplier = 1;
           }
           
           if(!producer.count){
               producer.count = 0;
           }
           
           pps += Math.round(producer.count * producer.perSecondGainMultiplier * resource.perSecondGainMultiplier);
           
       }
    });
    resource.perSecond = pps;
}

//TODO: Fix non-static purchase
function purchase() {
    var controlObject = findObject(this);
    var costType = controlObject.costType;
    
    //If we have enough resources to buy the thing
    if (!_.contains(resources, costType)){
        
        if(controlObject.productionType === "single"){
            if(!controlObject.staticGainMultiplier){
                controlObject.staticGainMultiplier = 1;
            }
            
           //Set the new amount including any resource or producer modifiers
            controlObject.gainType.count += Math.round(controlObject.gainAmount * controlObject.gainType.staticGainMultiplier * controlObject.staticGainMultiplier);
            
        } else{
            console.log("You probably should never be making these");
        }
        
    } else if(costType.count >= controlObject.cost){
        
        //Remove the amount
        costType.count -= controlObject.cost;

        //Set the new price
        controlObject.cost = Math.round(controlObject.cost * controlObject.costScaler);

        if(controlObject.productionType === "single"){
            if(!controlObject.staticGainMultiplier){
                controlObject.staticGainMultiplier = 1;
            }
           //Set the new amount including any resource or producer modifiers
            controlObject.gainType.count += (controlObject.gainAmount * controlObject.gainType.staticGainMultiplier * controlObject.staticGainMultiplier);
        } else {
            if(!controlObject.count){
                controlObject.count = 0;
            }
            controlObject.count++;
            
            recalculatePerSecond(controlObject.gainType);
        }
        
    }  
    
    writeData();
    drawUI();
}

function addAllTheThings(callback){
    var oreArea = $("#oreArea");
    var oreThings = _.where(allThings, {gainType: ore});
    
    var widgetArea = $("#widgetArea");
    var widgetThings = _.where(allThings, {gainType: widget});
    
    var moneyArea = $("#moneyArea");
    var moneyThings = _.where(allThings, {gainType: money});
    
    addToArea(oreArea,oreThings);
    addToArea(widgetArea,widgetThings);
    addToArea(moneyArea,moneyThings);
    
    callback();
}

function addToArea(area, thing){
    _.each(thing, function(button){
           var newUID = button.UID.replace('#','');
           var buttonHTML = '<button id="'+newUID+'" class="btn btn-warning" value="'+button.displayName+'">'+button.displayName+'</button>';
           area.append(buttonHTML);
       });
    
}

/*** MAIN LOOP ****************************************/

$(document).ready(function () {
    
   window.localStorage.clear();
    readSaveData();
    
    var setup = function(){
        //Setup functions and parameters
        _.each(allThings, function (button) { 
            button.draw = drawObject;
            button.uiObject = $(button.UID);
            button.purchase = purchase; 
            $(button.UID).click(button.purchase);
        });
    }
    
    addAllTheThings(setup);

    
});

window.setInterval(function () {
    runLoop();
    drawUI();
}, 1000);

function runLoop() {
    //Todo: Probably can encapsulate these
    
    //Make Ore: Currently Free
    resources.ore.count += (resources.ore.perSecondGainMultiplier * resources.ore.perSecond);
    
    //Make Widgets, currently 1/1
    var widgetsMade = resources.widget.perSecondGainMultiplier * resources.widget.perSecond;
    if(widgetsMade > resources.ore.count){
        widgetsMade = resources.ore.count;
    }
    resources.ore.count -= widgetsMade;
    resources.widget.count += (widgetsMade* resources.widget.perSecondResourceRate);
    
    //Make money, currently 5/1
    var moneyMade = resources.money.perSecondGainMultiplier * resources.money.perSecond;
    if(moneyMade > resources.widget.count){
        moneyMade = resources.widget.count;
    }
    resources.widget.count -= moneyMade;
    resources.money.count += (moneyMade * resources.money.perSecondResourceRate);
    
    counters.time++;
}

//Add method to add UI
function drawUI() {
    var outputText = counters.time + " seconds" + "<br/>";
    
    _.each(resources, function(resource){
        outputText += "<div class=resource><h3>" + resource.name + "</h3>";
        outputText += resource.count + " total<br/>";
        outputText += resource.perSecond + " gained Per Second <br/>";
        //outputText += resource.salePrice + " is current sale price <br/>";
        outputText += "</div><br/>";
    });
    
    infoBlock.html(outputText);

    // Draw all of the buttons	
    _.each(allThings, function (button) {
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
        allThings = JSON.parse(tempButtons);
    }
}

function writeData() {
    window.localStorage.setItem("counters", JSON.stringify(counters));
    window.localStorage.setItem("allButtons", JSON.stringify(allThings));
}


