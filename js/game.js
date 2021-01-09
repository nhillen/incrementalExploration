var infoBlock = $('#widgetCounter');

var currentActivity = '';
var currentLocation = 'home';
var currentActivityWork = 0;
var currentActivityWorkTarget = 0;
let character;
var activityTextTimestamp = 0;
var activityMessage = false;

const progress = document.querySelector('.progress-done');

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
   var activityArea = $("#ActivityContainer");
   var activities = locations[currentLocation].activities;
   addActivityButtons(activityArea, activities);


    //var oreArea = $("#oreArea");
    //var oreThings = _.where(allThings, {gainType: ore});

    //addToArea(oreArea,oreThings);

    callback();
}


function addActivityButtons(area, activityArray) {
    _.each(activityArray, function(activity) {
          var buttonHTML = '<button" class="btn btn-warning activityButton" id="'+activity.id +'">'+activity.displayName+'</button>';
          area.append(buttonHTML);

          $("#"+ activity.id).click(activity.clickFunction);
    });
}

function addToArea(area, thing){
    _.each(thing, function(button){
           var newUID = button.UID.replace('#','');
           var buttonHTML = '<button id="'+newUID+'" class="btn btn-warning activityButton" value="'+button.displayName+'">'+button.displayName+'</button>';
           area.append(buttonHTML);
       });

}

function setCurrentActivity(activityName){

  if (typeof window[activityName] === "function") {
    // celebrate
    //window[strOfFunction](); //To call the function dynamically!
    currentActivity = window[activityName];
  } else {
    currentActivity = false;
  }
}

function rest(){
    let uiUpdateValue = 0;
    if (currentActivityWorkTarget == 0) {
      //Initialize activity
      currentActivityWorkTarget = character.timeToRest
    }

    if (currentActivityWork >= currentActivityWorkTarget) {
      let proposedEnergy = character.energy + character.energyPerRest
      if(proposedEnergy < character.maxEnergy ){
        characterEnergy = proposedEnergy
        setActivityMessage("Gained " + character.energyPerRest + " Energy from Resting")
     }

     currentActivityWork = 0;
     uiUpdateValue = 100;
   } else {
     uiUpdateValue = (currentActivityWork / currentActivityWorkTarget) * 100
   }

   progress.setAttribute('data-done', uiUpdateValue )
   progress.innerHTML = uiUpdateValue + "%"



   currentActivityWork += character.restSpeedMultiplier * 1
}

function setActivityMessage(message){
    activityTextTimestamp = Date.now();
    activityMessage = message;
}

/*** MAIN LOOP ****************************************/

$(document).ready(function () {

   window.localStorage.clear();
    readSaveData();

    if (!character) {
      character = defaultCharacter
    }

    var setup = function(){
         $("#activityText").hide();
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
    if(typeof currentActivity === "function"){
      currentActivity();
    }
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

    progress.style.width = progress.getAttribute('data-done') + '%';
    progress.style.opacity = 1;
    if(activityMessage && Date.now() - activityTextTimestamp <= 2000){
       if( $("#activityText").text() != activityMessage ){
         $("#activityText").text(activityMessage);
         $("#activityText").fadeIn("slower");
       }
    } else if (activityMessage) {

      activityMessage = false;
      $("#activityText").fadeOut("fast", function(){
          $(this).text("");
      });
    }

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

    var tempCharacter = window.localStorage.getItem("character");
    if(tempCharacter){
        character = JSON.parse(tempCharacter);
    }
}

function writeData() {
    window.localStorage.setItem("counters", JSON.stringify(counters));
    window.localStorage.setItem("allButtons", JSON.stringify(allThings));
    window.localStorage.setItem("character", JSON.stringify(character));
}
