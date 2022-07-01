
const infoBlock = $('#statsText');
const activityTitle = $("#activityName")

let currentActivity = '';
let currentActivityCustomModifiers = {}
let currentLocation = 'home';
let currentActivityWork = 0;
let currentActivityWorkTarget = 0;
let character;
let activityTextTimestamp = 0;
let activityMessage = false;

const progress = document.querySelector('.progress-done');

function stop(){
  console.log("Stopping")
  currentActivity = false;
  currentActivityCustomModifiers = false;
  currentActivityWorkTarget = 0;
  currentActivityWork = 0;

  progress.setAttribute('data-done', "0" )
  progress.innerHTML = "0%"
}

function setActivity(name){
    console.log("Setting Activity " + name)
    if(name === "stop"){
        //Special Case for stopping
        stop();
    } else {
        currentActivity = name;
        setCurrentActivityCustomModifiers(name);
        activityTitle.html(name.substring(0,1).toUpperCase()+name.substring(1));
    }

}


//TODO: Rewrite this to not iterate through all activities in a location each time we set a new activity
function setCurrentActivityCustomModifiers(activityName){
  if(locations[currentLocation].activities){
    _.each(locations[currentLocation].activities, function(activity) {
      if(activity.id === activityName){
        if(activity.variableValues){
          currentActivityCustomModifiers = activity.variableValues
        }
        if(activities[activityName].activityMessage){
            setActivityMessage(activities[activityName].activityMessage)
        }
      }
    })
  }  
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

  } else {
    //TODO: Set the current activity
    runGenericActivity(name);
  }

}

function runGenericActivity(name){
  let thisActivity = activities[name]

  let uiUpdateValue
  if (currentActivityWorkTarget === 0 || !currentActivityWorkTarget) {
    //Initialize activity
    currentActivityWorkTarget = character[thisActivity.timeTarget]
    //Apply any modifiers
    currentActivityWorkTarget = currentActivityWorkTarget * character[thisActivity.timeTargetMultiplier]
  }

  //Make sure we should be running this activity
    if(!thisActivity.canRun()){
        stop();
        setActivityMessage(thisActivity.failText);
    }

  if (currentActivityWork >= currentActivityWorkTarget) {
      //Grant Rewards For Finishing Work
      if(thisActivity.rewards){
        _.each(thisActivity.rewards, function(reward){
            if(reward.type === "stat"){
                gainResource(reward.stat, reward.amount())
            } else if(reward.type === "xp"){
                grantXP(reward.stat, reward.amount())
            }
        })
      }
    currentActivityWork = 0;
    uiUpdateValue = 100;

   } else {
     uiUpdateValue = (currentActivityWork / currentActivityWorkTarget) * 100
   }
  progress.setAttribute('data-done', uiUpdateValue )
  progress.innerHTML = uiUpdateValue + "%"

  currentActivityWork += character[thisActivity.workMultiplier] * 1
}

function gainResource(resource, amount, integerOnly = false){
    let amountToAdd;

    if(integerOnly){
        amountToAdd = Math.floor(amount)
    } else {
        amountToAdd = parseFloat(amount.toPrecision(2))
    }

    character[resource].add(amountToAdd)

}

function grantXP(skill, amount){
    if(!character.skills[skill]){
        character.skills[skill] = defaultSkill;
    }
    let tempSkill = character.skills[skill];

    tempSkill.xp += amount;
    if(tempSkill.xp >= tempSkill.xpRequired){
        tempSkill.level++;
        tempSkill.xp = 0;
        tempSkill.xpRequired = Math.round(tempSkill.xpRequired * tempSkill.growthMultiplier);
    }
}

function setActivityMessage(message){
    activityTextTimestamp = Date.now();
    activityMessage = message;
}

/*** Custom Activities ********************************/
//TODO:  Move all travel stuff into its own JS
function travel(){
  console.log(currentActivityCustomModifiers);
  let travelType = character.travelType;
  const TravelSpeed = getSpeedByTravelType(travelType);
}

function getSpeedByTravelType(type){
  switch(type){
    case "walking":
      return character.walkingSpeed;
    default: 
      return 0;
  }


}



/*** MAIN LOOP ****************************************/
document.addEventListener("DOMContentLoaded", function(){
    // Handler when the DOM is fully loaded
    window.localStorage.clear();
    readSaveData();

    if (!character) {
        character = defaultCharacter
        setLocation('home')
    } else {
        console.log(character.currentLocation)
        setLocation(character.currentLocation)
    }

    const setup = function(){
        $("#activityTextContainer").hide();
    }
    setup();
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

   const activityArea = $("#ActivityContainer");

  _.each(jsonObjectArray, function(activity) {
      addActivityButton(activityArea, activity)
  });
}

/* Refactored this to its own method in case we ever want to add one-off non-location buttons */
//TODO: Implement Remove activity button
function addActivityButton(area, activity){
  let buttonHTML = '<button" class="btn btn-warning activityButton" id="'+activity.id +'">'+activity.displayName+'</button>';
  area.append(buttonHTML);
  $("#"+ activity.id).on("click", function(){
    const clickedBtnID = $(this).attr('id');
    setActivity(clickedBtnID)
  });
}

//Add method to add UI
function drawUI() {
    let outputText = "<b>Current Session:</b> " + counters.time + " seconds" + "<br/>";

    outputText += "<h3>Stats</h3>";
    _.each(statsToDisplay, function(statType, statName){
        if(statType === "derived"){
            outputText += derivedStats[statName].value() + "<br/>";
        } else if (statType === "skill" && character.skills[statName]){
            let thisStat = character.skills[statName]
            outputText += thisStat.statDisplayName + ": " + thisStat.level + " (" + thisStat.xp + "/" + thisStat.xpRequired + ")" + "<br/>";
        } else {
            if((statDisplayName[statName]) && (character[statName])){
                outputText += statDisplayName[statName] + ": " + character[statName]+"<br/>"
            }
        }
    });


    infoBlock.html(outputText);

    // Draw all the buttons
    /*
    _.each(allThings, function (button) {
        button.draw();
    });*/

    progress.style.width = progress.getAttribute('data-done') + '%';
    progress.style.opacity = 1;
    if(activityMessage && Date.now() - activityTextTimestamp <= 2000){
        const activityText = $("#activityText");
       if( activityText.text() !== activityMessage ){
           activityText.text(activityMessage);
           $("#activityTextContainer").fadeIn("slower");
       }
    } else if (activityMessage) {

      activityMessage = false;
      $("#activityTextContainer").fadeOut("fast", function(){
          $(this).text("");
      });
    }

}

function getSkillModifier(skillName){
    if(!character.skills[skillName]){
        return 0;
    }
    return character.skills[skillName].level * character.skills[skillName].boostPerLevel;
}

/*** SAVE IO *******************************************/

function readSaveData() {
    const tempCounter =  window.localStorage.getItem("counters");
    if(tempCounter){
        counters = JSON.parse(tempCounter);
    }

    const tempCharacter = window.localStorage.getItem("character");
    if(tempCharacter){
        character = JSON.parse(tempCharacter);
    }
}

function writeData() {
    window.localStorage.setItem("counters", JSON.stringify(counters));
    window.localStorage.setItem("character", JSON.stringify(character));
}
