const infoBlock = $('#statsText');
const activityTitle = $("#activityName")

const customActivities = ['travel'];

let timerInterval;
let activityInterval;
let currentActivity = '';
let currentActivityCustomModifiers = {}
let currentLocation = 'home';
let currentActivityWork = 0;
let currentActivityWorkTarget = 0;
let activityTextTimestamp = 0;
let activityMessage = false;
let activityStopped = false;

let counters = {
    time: 0
}

const progressBar = document.querySelector('.progress-bar');
const progressBarMaxWidth = progressBar.offsetWidth;
const progressBarFill = document.querySelector('.progress-bar-fill');
const progressBarValue = document.querySelector('.progress-bar-value');
let progressBarTween = null;


/* Stops the current activity, resetting relevant variables. */
function stop(){
    console.log("stop");
    currentActivity = false;
    currentActivityCustomModifiers = false;
    currentActivityWorkTarget = 0;
    currentActivityWork = 0;
    activityStopped = true;

    if (progressBarTween) {
        progressBarTween.kill();
        progressBarTween = null;
    }

    // Update the progress bar to 0% when stopping the activity
    updateProgressBar(0, 0);
}

// Sets the current activity to name, updating the activity title and calling setCurrentActivityCustomModifiers() for the new activity.
function setActivity(name) {
    // Clear the interval to stop the current loop
    stopLoop();

    if (progressBarTween) {
        progressBarTween.kill();
        progressBarTween = null;
    }
    updateProgressBar(0, 0);


    if (name === "stop") {
        stop();
        return;
    }


    // Extract variableValues from the player's current location
    const location = locations[character.currentLocation];
    console.log(character.currentLocation);

    if (location.activities[name].variableValues) {
        activities[name].variableValues = location.activities[name].variableValues;
    } else {
        console.log("No variable values");
    }

    const activity = activities[name];

    if (!activity || (typeof activity.canRun === 'function' && !activity.canRun())) {
        setActivityMessage(activity.failText);
        return;
    } else {
        // Check and spend resourceCost for the activity
        if (activity.requiresResource && typeof activity.resourceCost === 'function') {
            const resourceCost = activity.resourceCost();
            if (!spendResource(character, activity.resourceGenerated, resourceCost)) {
                setActivityMessage("Not enough resources to start this activity");
                return;
            }
        }
    }

    console.log("Setting Activity " + name);
    activityStopped = false;
    currentActivity = name;
    setCurrentActivityCustomModifiers(name);
    activityTitle.html(name.substring(0, 1).toUpperCase() + name.substring(1));

    startLoop();
}

function spendResource(character, resource, amount) {
    if (character[resource].current >= amount) {
        character[resource].current -= amount;
        return true;
    } else {
        return false;
    }
}

//Sets currentActivityCustomModifiers to the custom modifiers for the specified activity and sets the activity message to the message defined in the activities module, if any.
function setCurrentActivityCustomModifiers(activityName){
    const activity = locations[character.currentLocation]?.activities[activityName];

    if (activity?.variableValues) {
        currentActivityCustomModifiers = activity.variableValues;
    }

    if (activities[activityName]?.activityMessage) {
        setActivityMessage(activities[activityName].activityMessage);
    }
}

const customActivityFunctions = {

};

//	Calls the appropriate function to run the specified activity, either a custom function or runGenericActivity().
function runActivity(name) {

    if (customActivityFunctions[name]) {
        customActivityFunctions[name]();
        console.log('Custom Function: ' + name);
    } else {
        const activity = locations[character.currentLocation]?.activities[name];
        if (activity) {
            runGenericActivity(name, activity);
        } else {
            console.log("Couldn't find " + name);
        }
    }

}

//Runs a generic activity with the specified name, updating the progress bar and giving rewards upon completion.
function runGenericActivity(name){
    const thisActivity = activities[name];

    setWorkTarget(character, thisActivity);

    const workMultiplier = typeof thisActivity.workMultiplier === 'function' ? thisActivity.workMultiplier() : getStatMultiplier(thisActivity.workMultiplier);

    if (currentActivityWork >= currentActivityWorkTarget) {
        if (thisActivity.rewards) {
            const rewards =
                typeof thisActivity.rewards === "function"
                    ? thisActivity.rewards()
                    : thisActivity.rewards;

            if (Array.isArray(rewards)) {
                rewards.forEach(function (reward) {
                    if (reward.type === "stat") {
                        gainResource(character, reward.stat, reward.amount());
                    } else if (reward.type === "xp") {
                        grantXP(character, reward.stat, reward.amount());
                    }
                });
            }
        }

        if(thisActivity.onCompletion) {
            thisActivity.onCompletion();
        }
        currentActivityWork = 0;
        currentActivityWorkTarget = 0;
        updateProgressBar(0, 0);
        return;
    }

    currentActivityWork += workMultiplier;

    const percentage = (currentActivityWork / (currentActivityWorkTarget || 1)) * 100;
    updateProgressBar(percentage, 1);
}

function setWorkTarget(character, activity) {
    if(currentActivityWorkTarget) return;

    //Check to see if timeTarget for this activity is a function, if so call it, if not assume it is a value and pull it from the character
    if (typeof activity.timeTarget === 'function') {
        currentActivityWorkTarget = activity.timeTarget();
    } else {
        currentActivityWorkTarget = getStatMultiplier(activity.timeTarget) * getStatMultiplier(activity.timeTargetMultiplier);
    }

}


function getStatMultiplier(statMultiplier) {
    //if statMultiplier isn't a string, return it
    if (typeof statMultiplier !== 'string') {
        return statMultiplier;
    }

    if(character[statMultiplier]){
        return character[statMultiplier];
    } else {
        return 1;
    }
}

function updateProgressBar(targetPercentage = null, duration = 1) {
    const percentage = targetPercentage !== null ? targetPercentage : (currentActivityWork / (currentActivityWorkTarget || 1)) * 100;

    if (progressBarTween) {
        progressBarTween.kill();
    }

    progressBarTween = gsap.to(progressBarFill, {
        width: `${percentage}%`,
        duration: duration,
        ease: 'linear',
        opacity: 1,
        onUpdate: () => {
            const width = parseFloat(gsap.getProperty(progressBarFill, 'width'));
            const pct = Math.floor((width / progressBarMaxWidth) * 100);
            progressBarValue.innerHTML = `${pct}%`;
        }
    });
}



//Adds the specified amount of the specified resource to the character, rounding to the nearest integer unless integerOnly is set to false.
function gainResource(character, resource, amount, integerOnly = false){
    let amountToAdd;

    if(integerOnly){
        amountToAdd = Math.round(amount);
    } else {
        amountToAdd = Number.parseFloat(amount.toPrecision(2));
    }

    character[resource].add(amountToAdd);
}

function getDefaultSkillObject() {
    return Object.assign({}, defaultSkill);
}

//Grants the specified amount of XP to the specified skill for the given character, increasing the skill's level if enough XP has been earned.
function grantXP(character, skillName, amount) {
    console.log(`Granting ${amount} XP to skill ${skillName}`);
    console.log(skillName);
    const skill = character.skills[skillName];
    skill.xp += amount;
    while (skill.xp >= skill.xpRequired) {
        skill.level++;
        skill.xp -= skill.xpRequired;
        skill.xpRequired *= skill.growthMultiplier;
        updateCharacterStat(skillName, skill);
        setActivityMessage(`<b>${skillName}</b> skill increased to level <b>${character.skills[skillName].level}</b>!`);
    }
}


//Sets the current activity message to the specified message, fading it in or out depending on whether the message is truthy or falsy, respectively.
function setActivityMessage(message) {
    activityTextTimestamp = Date.now();
    activityMessage = message;
    /*
    const activityText = $("#activityText");
    if (activityMessage) {
        activityText.text(activityMessage);
        $("#activityTextContainer").fadeIn("slower");
    } else {
        $("#activityTextContainer").fadeOut("fast", function() {
            $(this).text("");
        });
    }*/

    const activityText = document.getElementById("activityText");
    activityText.innerHTML = message;
    $('.toast').toast('show');
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

function startLoop() {
    // Timer loop: increments the timer every second
    timerInterval = window.setInterval(function() {
        counters.time++;
        drawUI();
    }, 1000);

    // Activity loop: updates the progress bar every second if an activity is running
    activityInterval = window.setInterval(function() {
        if (currentActivity && !activityStopped) {
            runActivity(currentActivity);
        }
    }, 1000);
}

// Modify the stopLoop function
function stopLoop() {
    clearInterval(activityInterval);
}

//Sets the current location to the location with the specified key, updating the location name and description and calling setupActivities() with the activities for the new location.
function setLocation(key) {
    if (!locations[key]) {
        console.log("Location doesn't exist");
        return;
    } else {
        character.currentLocation = key; // Updated this line
        $("#locationName").text(locations[key].locationName);
        $("#locationDescription").text(locations[key].locationDescription);
    }

    const mergedActivities = mergeDefaultActivities(locations[key].activities);
    setupActivities(mergedActivities);
}

function mergeDefaultActivities(locationActivities) {
    const mergedActivities = {};

    // Iterate through the default activities
    for (const [key, value] of Object.entries(defaultActivities)) {
        mergedActivities[key] = value;
    }

    // Iterate through the location's activities
    for (const [key, value] of Object.entries(locationActivities)) {
        mergedActivities[key] = value;
    }

    return mergedActivities;
}

/* Adds an activity button for each activity in the specified jsonObjectArray. */
function setupActivities(jsonObjectArray) {
    if (!jsonObjectArray) {
        // No Activities
        return;
    }

    const activityArea = $("#ActivityContainer");
    activityArea.empty();

    _.each(jsonObjectArray, function (activity, activityName) {
        addActivityButton(activityArea, activityName, activity);
    });
}

/* Adds an activity button to the specified area for the given activity, with a display name and ID based on the activity object. */
function addActivityButton(area, activityName, activity) {
    console.log(activity);
    let buttonHTML = '<button class="btn btn-warning activityButton" id="' + activityName + '">' + activity.displayName + '</button>';
    area.append(buttonHTML);
    $("#" + activityName).on("click", function() {
        const clickedBtnID = $(this).attr('id');
        setActivity(clickedBtnID);
    });
}

/* Removes an activity button with the specified id */
function removeActivityButton(id) {
    $("#" + id).remove();
}

/* Updates the information block with the character's stats and progress bar, and updates the activity message if necessary.*/
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

    const inventoryTemplate = _.template(`
  <% _.each(inventory.items, function(count, item) { %>
    <div><%= item %>: <%= count %></div>
  <% }); %>
`);

// Inside your code that updates the inventory
    const inventoryHtml = inventoryTemplate({ inventory });
    $('#inventoryText').html(inventoryHtml);


    infoBlock.html(outputText);

    // Draw all the buttons
    /*
    _.each(allThings, function (button) {
        button.draw();
    });*/

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

function readSaveData() {
    const savedData = localStorage.getItem('incrementalGameData');
    if (savedData) {
        const gameData = JSON.parse(savedData);
        character = gameData.character;
        counters = gameData.counters;
    }
}

function saveGame() {
    const gameData = {
        character: character,
        counters: counters
    };
    window.localStorage.setItem("incrementalGameData", JSON.stringify(gameData));
    console.log("Game saved.");
}

function deleteSave() {
    if (confirm("Are you sure you want to delete your saved game? This action cannot be undone.")) {
        localStorage.removeItem('incrementalGameData');
        alert("Save deleted.");
    }
}

let autosaveInterval;
function toggleAutosave() {
    if (autosaveInterval) {
        clearInterval(autosaveInterval);
        autosaveInterval = null;
        alert("Autosave disabled.");
    } else {
        autosaveInterval = setInterval(saveGame, 60000); // Save every 60 seconds
        alert("Autosave enabled.");
    }
}

function logVar(obj) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            console.log(`${key}:`, obj[key]);
        }
    }
}

const homeButton = document.getElementById("homeButton");
const statsButton = document.querySelector('[data-tab="stats"]');
const settingsButton = document.querySelector('[data-tab="settings"]');

homeButton.addEventListener("click", () => {
    const locationContainer = document.getElementById("locationContainer");
    const statsContainer = document.getElementById("statsContainer");
    const settingsContainer = document.getElementById("settingsContainer");
    locationContainer.style.display = "";
    statsContainer.style.display = "none";
    settingsContainer.style.display = "none";
});

statsButton.addEventListener("click", () => {
    const locationContainer = document.getElementById("locationContainer");
    const statsContainer = document.getElementById("statsContainer");
    const settingsContainer = document.getElementById("settingsContainer");
    locationContainer.style.display = "none";
    statsContainer.style.display = "";
    settingsContainer.style.display = "none";
    drawUI();
});

settingsButton.addEventListener("click", () => {
    const locationContainer = document.getElementById("locationContainer");
    const statsContainer = document.getElementById("statsContainer");
    const settingsContainer = document.getElementById("settingsContainer");
    locationContainer.style.display = "none";
    statsContainer.style.display = "none";
    settingsContainer.style.display = "";
});

$(function() {
    $('#toastClose').on("click", function() {
        console.log("Clicked");
        $('.toast').toast('hide');
    });

    $("#saveButton").on("click", saveGame);
    $("#autosaveButton").on("click", toggleAutosave);
    $("#deleteButton").on("click", deleteSave);

    autosaveInterval = setInterval(saveGame, 60000); // Save every 60 seconds
});

readSaveData();

