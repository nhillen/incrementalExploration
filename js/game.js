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

function stop(){
  console.log("Stopping")
  currentActivity = false;
  currentActivityWorkTarget = 0;
  currentActivityWork = 0;

  progress.setAttribute('data-done', 0 )
  progress.innerHTML = "0%"
}

function setActivity(name){
  currentActivity = name;
  console.log("Activity set to " + name)
}

//Figure out what to do with an activity
//This is currently broken in that it will set an activity but only execute them once
function runActivity(name){
  if(customActivities.includes(name)){
    //Do custom shit
    if (typeof window[name] === "function") {
      //Dynamically call the custom function
      window[name](); //To call the function dynamically!
      console.log("Running " + name)
    } else {
      //panic
    }
    return 
  } else {
    //TODO: Set the current activity
    runGenericActivity(name);
  }
}

function runGenericActivity(name){
  let thisActivity = activities[name];

  let uiUpdateValue = 0;
  if (currentActivityWorkTarget == 0 || !currentActivityWorkTarget) {
    //Initialize activity
    currentActivityWorkTarget = character[thisActivity.timeTarget]
    //Apply any modifiers
    currentActivityWorkTarget = currentActivityWorkTarget * character[thisActivity.timeTargetMultiplier]
    
    console.log(currentActivityWorkTarget)
  } 

  if (currentActivityWork >= currentActivityWorkTarget) {
    gainResource(thisActivity.resourceGenerated, thisActivity.rate )

    currentActivityWork = 0;
    uiUpdateValue = 100;

   } else {
     uiUpdateValue = (currentActivityWork / currentActivityWorkTarget) * 100
   }
  progress.setAttribute('data-done', uiUpdateValue )
  progress.innerHTML = uiUpdateValue + "%"

  currentActivityWork += character[thisActivity.workMultiplier] * 1
}

function gainResource(resource, amount){
  let proposedResource = character[resource] + character[amount]
  if(character[resource].max){
    if(proposedResource < character[resource].max) {
      character[resource] = proposedResource
      //TODO: Figure out messaging
      //setActivityMessage("Gained " + character.energyPerRest + " Energy from Resting")
    } else {
      character[resource] = character[resource].max
    }
  } else {
    character[resource] = proposedResource
  }
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
      setLocation('home')
    } else {
      console.log(character.currentLocation)
      setLocation(character.currentLocation)
    }

    var setup = function(){
         $("#activityText").hide();
        //Setup functions and parameters
        /*
        _.each(allThings, function (button) {
            button.draw = drawObject;
            button.uiObject = $(button.UID);
            button.purchase = purchase;
            $(button.UID).click(button.purchase);
        });*/
    }


});

window.setInterval(function () {
    runLoop();
    drawUI();
}, 1000);

function runLoop() {
  if(currentActivity){
    runActivity(currentActivity)
  } 

  counters.time++;
}


/* This takes a string index which sets the UI elements for the UI*/
function setLocation(key){
   if(!locations[key]){
    console.log("Location doesnt exist");
    return
   } else {
     character.currentLocation = locations[key]
     $("#locationName").text(locations[key].locationName)
     $("#locationDescription").text(locations[key].locationDescription)
   }

   setupActivities(locations[key].activities)
}

/* Set up activity buttons for each activity in our current location*/
function setupActivities(jsonObjectArray){
  if(!jsonObjectArray){
    //No Activities
    return
  }

   var activityArea = $("#ActivityContainer");

  _.each(jsonObjectArray, function(activity) {
    console.log(activityArea)
      addActivityButton(activityArea, activity)
  });
}

/* Refactored this to its own method in case we ever want to add one-off non-location buttons */
//TODO: Implement Remove activity button
function addActivityButton(area, activity){
  var buttonHTML = '<button" class="btn btn-warning activityButton" id="'+activity.id +'">'+activity.displayName+'</button>';
  area.append(buttonHTML);
  $("#"+ activity.id).click(function(){
    var clickedBtnID = $(this).attr('id');
    setActivity(clickedBtnID)
  });
}

//Add method to add UI
function drawUI() {
    var outputText = counters.time + " seconds" + "<br/>";

    outputText += "<h3>Stats</h3>";
    _.each(statsToDisplay, function(statName){
       outputText += statDisplayName[statName] + ": " + character[statName]+"<br/>"
    });


    infoBlock.html(outputText);

    // Draw all of the buttons
    /*
    _.each(allThings, function (button) {
        button.draw();
    });*/

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
