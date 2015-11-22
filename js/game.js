var widgetBar = $("#widgetCounter");
var checkVals = ["totalWidgets", "factories", "factoryCost", "widgetsPerSecond"];


var counters = {
	"none" : 0,
	"time" : 0,
	"ore" : 0,
	"money" : 0,
	"widgets" : 0,
	"widgetsPerClick" : 1,
	"widgetsPerSecond" : 0,
	"tools" : 0
}

// this instantiates the Producer Class
var makeWidgetButton = new Producer({
	"UIname"     : "#btnMakeWidget",
	"showReq"    : 0,
	"showType"   : "none",
	"cost"       : 0,
	"costType"	 : "none",
	"costScaler" : 0,
	"buttonTag"  : "Make Widget",
	"gainType"	 : "widgets",
	"gainAmount" : 1
});

var sellWidgetButton = new Producer({
	"UIname"     : "#btnSellWidgets",
	"showReq"    : 1,
	"showType"   : "widgets",
	"cost"       : 1,
	"costType"	 : "widgets",
	"costScaler" : 1,
	"buttonTag"  : "Sell Widgets",
	"gainType"	 : "money",
	"gainAmount" : 5
});

var toolsButton = new Producer({
	"UIname"     : "#btnBuyTool",
	"showReq"    : 1,
	"showType"   : "widgets",
	"cost"       : 50,
	"costType"	 : "money",
	"costScaler" : 1.25,
	"buttonTag"  : "Tools Cost",
	"gainType"	 : "tools",
	"gainAmount" : 1
});

function Producer( vars )
{
	var bar;
	var v = vars;/* VARIABLES ***
	"UIname"     = "button",
	"showReq"    = 0,
	"showType"   = "money",
	"cost"       = 0,
	"costType"	 = "money",
	"costScaler" = 1.2,
	"buttonTag"  = "cost",
	"gainType"	 = "tools",
	"gainAmount" = 1
    *****************************/ 
	
	this.draw = function(){
		// If the button hasn't been initialized, then find it
			if( ! bar )
				bar = $(this.v["UIname"]);
			
		if( counters[this.v["showReqType"]] >= this.v["showReq"] ){
			this.bar.show();
			this.bar.prop('disabled', false);
        
		} else {
			this.bar.prop('disabled', true);
		}
		bar.prop( 'value', v["buttonTag"]+": "+v["cost"] );
	}
	
	this.clicked = function(){
		if( counters[v[costType]] >= v[cost] )
		{
			counters[v[costType]] -= v[cost];
			Math.round( v[cost] = v[cost]*v[costScaler] ) ;
			counters[v[gainType]] += v[gainAmount];
		}
		drawUI();		
	}
}

/*** MAIN LOOP ****************************************/

$(document).ready(function(){
    readSaveData();
});

window.setInterval(function(){
    runLoop();
    drawUI();
}, 1000);

function runLoop(){
    totalWidgets += widgetsPerSecond;
	counters["time"]++;
}

function drawUI(){
    var outputText =
		counters["time"] + " seconds" + "<br/>"+
		"$"+counters["money"] + "<br/>" +
        counters["widgets"] + " total widgets" + "<br/>" +
        counters["widgetsPerSecond"] + " widgets per second" + "<br/>" +
        counters["tools"] + " tools" + "<br/>";
	widgetBar.html(outputText);
		
	// Draw all of the buttons	
		makeWidgetButton.draw();	
		sellWidgetButton.draw();
		toolsButton.draw();
}

/*** SAVE IO *******************************************/

function readSaveData(){
    _.each(checkVals,function(name){
       var temp = window.localStorage.getItem(name);
       if(temp){
           window[name] = Number(temp);
       }
    });
}

function writeData(){
    _.each(checkVals,function(name){
       window.localStorage.setItem(name, window[name]);
    });
}


