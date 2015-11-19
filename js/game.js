var widgetBar = $("#widgetCounter");
var factoryBar = $("#buyFactory");
var totalWidgets = 0;
var widgetsPerSecond = 0;
var widgetsPerClick = 1;
var factories = 0;
var factoryCost = 25;
var factoryValue = 2;
var checkVals = ["totalWidgets", "factories", "factoryCost", "widgetsPerSecond"];


var counters {
	"ore" : 0,
	"money" : 0,
	"widgets" : 0,
	"widgetsPerClick" : 1,
	"widgetsPerSecond" : 0,
	"tools" : 0
}

// this instantiates the Producer Class
var toolsButton = new Producer({
	"UIname"     = "#buyFactory",
	"showReq"    = 1,
	"showType"   = "widgets",
	"cost"       = 0,
	"costType"	 = "widgets",
	"costScaler" = 1.25,
	"buttonTag"  = "Tools Cost",
	"gainType"	 = "tools",
	"gainAmount" = 1
});


function Producer( vars )
{
	var v = vars;/* VARIABLES
	"UIname"     = "button",
	"showReq"    = 0,
	"showType"   = "money",
	"cost"       = 0,
	"costType"	 = "money",
	"costScaler" = 1.2,
	"buttonTag"  = "cost",
	"gainType"	 = "tools",
	"gainAmount" = 1
    */
	var bar  = $(this.v[UIname]);
	
	this.draw(){
		if( !bar ) // if we haven't made the button, make it now
			bar = $(this.v[name])
			
		if( counters[this.v[showReqType]] >= this.v[showReq] ){
			this.bar.show();
			this.bar.prop('disabled', false);
        
		} else {
			this.bar.prop('disabled', true);
		}
		bar.prop( 'value, v[buttonTag]+": "+v[cost],);
	}
	
	this.clicked(){
		if( counters[v[costType]] >= v[cost] )
		{
			counters[v[costType]] -= v[cost];
			Math.round( v[cost] = v[cost]*v[costScaler] ) ;
			counters[v[gainType]] += v[gainAmount];
		}
		drawUI();		
	}
}

function runLoop(){
    totalWidgets += widgetsPerSecond;
}

function drawUI(){
    var outputText =
        counters[totalWidgets] + " total widgets" + "<br/>" +
        counters[widgetsPerSecond] + " widgets per second" + "<br/>" +
        counters[tools] + " tools" + "<br/>";
    
 /*   if(totalWidgets > factoryCost){
        factoryBar.show();
        factoryBar.prop('disabled', false);
        
    } else {
        factoryBar.prop('disabled', true);
    }
    
    factoryBar.prop('value', "Buy Factory - " + factoryCost);
	*/
	
	toolsButton.draw();
    widgetBar.html(outputText);
}

/*function buyFactory(){
    if(totalWidgets > factoryCost){
        totalWidgets -= factoryCost;
        factories += 1;
        factoryCost *= 2;
        widgetsPerSecond += factoryValue;
    }
    
    factoryBar.text("Buy Factory - " + factoryCost);
    writeData();
    drawUI();
}*/

function readSaveData(){
    _.each(checkVals,function(name){
       var temp = window.localStorage.getItem(name);
       if(temp){
           window[name] = Number(temp);
       }
    });
    
    /*if(factories > 0){
        factoryBar.show();
        factoryBar.text("Buy Factory - " + factoryCost);
    }*/
}

function writeData(){
    _.each(checkVals,function(name){
       window.localStorage.setItem(name, window[name]);
    });
}

function clickBar(){
    counters[totalWidgets] += counters[widgetsPerClick];
    drawUI();
}

$(document).ready(function(){
    readSaveData();
});

window.setInterval(function(){
    runLoop();
    drawUI();
}, 1000);