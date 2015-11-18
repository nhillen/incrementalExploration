var widgetBar = $("#widgetCounter");
var factoryBar = $("#buyFactory");
var totalWidgets = 0;
var widgetsPerSecond = 0;
var widgetsPerClick = 1;
var factories = 0;
var factoryCost = 25;
var factoryValue = 2;
var checkVals = ["totalWidgets", "factories", "factoryCost", "widgetsPerSecond"];

function runLoop(){
    totalWidgets += widgetsPerSecond;
    
}

function drawUI(){
    var outputText =
        totalWidgets + " total widgets" + "<br/>" +
        widgetsPerSecond + " widgets per second" + "<br/>" +
        factories + " factories" + "<br/>";
    
    if(totalWidgets > factoryCost){
        factoryBar.show();
        factoryBar.prop('disabled', false);
        
    } else {
        factoryBar.prop('disabled', true);
    }
    
    factoryBar.prop('value', "Buy Factory - " + factoryCost);
    widgetBar.html(outputText);
}

function buyFactory(){
    if(totalWidgets > factoryCost){
        totalWidgets -= factoryCost;
        factories += 1;
        factoryCost *= 2;
        widgetsPerSecond += factoryValue;
    }
    
    factoryBar.text("Buy Factory - " + factoryCost);
    writeData();
    drawUI();
}

function readSaveData(){
    _.each(checkVals,function(name){
       var temp = window.localStorage.getItem(name);
       if(temp){
           window[name] = Number(temp);
       }
    });
    
    if(factories > 0){
        factoryBar.show();
        factoryBar.text("Buy Factory - " + factoryCost);
    }
}

function writeData(){
    _.each(checkVals,function(name){
       window.localStorage.setItem(name, window[name]);
    });
}

function clickBar(){
    totalWidgets += widgetsPerClick;
    drawUI();
}

$(document).ready(function(){
    readSaveData();
});

window.setInterval(function(){
    runLoop();
    drawUI();
}, 1000);