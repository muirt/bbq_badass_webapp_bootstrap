var socketaddyLocal= "ws://192.168.0.2:9001";


var socketaddyInternet = "ws://bbqba.ddns.net:9001";
var sock;			

var debug_list = [];
var autoVisible = true;
var confirmedObjectList = []
var confirmtedMenu;		

function selectorize(name)
{	
	return name.toLowerCase().replace(' ', '_');
}

function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
  }
}

function showMenu(menuName)
{	/*			
	menuName = '#' + menuName;
	var slideout = $(menuName);
	var slideoutWidth = $(menuName).width();
	slideout.toggleClass("open");			
	if (slideout.hasClass("open")) {
		slideout.animate({
			left: "0px"
		});	
	} else {
		slideout.animate({
			left: -(slideoutWidth + 20)
		}, slideoutWidth);	
	}
	*/
}

function fanLED(color)
{
	/*
	var colorCode = "#FF0000";
	var canvas = document.getElementById("output_state_graphic");
	var context = canvas.getContext("2d");
	if(color == "green")
	{
		colorCode = "#00FF00"
	}	
	context.fillStyle = colorCode;
	context.arc(50, 50, 50, 0, Math.PI * 2, false);
	context.fill()
	*/
}

function setTempUnit(unit)
{
	/*
	$('#output_control_set_point_unit').text(unit);	
	$('#current_temperatures_readouts_1_temperature_unit').text(unit);
	$('#current_temperatures_readouts_2_temperature_unit').text(unit);
	*/
}

function debug(message)
{

	var linewidth = 50;
	
	if(message.length > linewidth)
	{		
		debug_list.push(message.substring(0, linewidth))
	}
	
	
	var count = 0;
	var debug_text = "";
	debug_list.forEach(function(line){
		debug_text = count + ':'+ line +  '\n';
		count += 1;   

		if(count >7)
		{
			return;
		}
	});
	
	
	$("#debug_string").text(debug_text);
	
}

function sendCommand(command)
{
	sock.send(JSON.stringify(command));
}

function handleMessage(evt)
{
	var messageString = evt.data;			
	if(messageString.indexOf('{') == 0)
	{			
		var noSingleQuotes = messageString.replace(/'/g, '"');				
		var messageObject = JSON.parse(noSingleQuotes);
		var keys = Object.keys(messageObject);
		
		displayConnected();
		//debug(messageString);
		if(keys.indexOf('secret') != -1 && keys.indexOf('target') != -1 && keys.indexOf('value') !=-1)
		{				
			if(messageObject.secret == 'badass')
			{					
				switch(messageObject.target)
				{			
					case "periodic_update":							
						var updateObject = messageObject.value;
						var updateKeys = Object.keys(updateObject);						
						if(updateKeys.indexOf('input') != -1) 
						{	
							if(updateObject.input.length > 1)
							{
								$("#meat_temperature_string").text(updateObject.input[0].value);
								$("#grill_temperature_string").text(updateObject.input[1].value);									
							}
						}
						if(updateKeys.indexOf('set_point') != -1) 
						{															
							$("#set_point_string").text(updateObject.set_point);								
						}
						
						
						if(updateKeys.indexOf('cook_time') != -1) 
						{
							$("#cook_time_string").text(updateObject.cook_time);
						}
						if(updateKeys.indexOf('output_state') != -1) 
						{
							if(updateObject.output_state=="on")
							{
								$("#fan_state_icon").css({'visibility': 'visible'});
							}
							else if(updateObject.output_state=="off")
							{
								$("#fan_state_icon").css({'visibility': 'hidden'});
							}								
						}							
						break;
					case "initial_update":						
						var updateObject = messageObject.value;
						var updateKeys = Object.keys(updateObject);							
						if(updateKeys.indexOf('set_point_value') != -1) 
						{
							$("#set_point_string").text(updateObject.set_point_value);
						}		
						if(updateKeys.indexOf('fan_control') != -1) 
						{
							$('#on_button').css({'color': 'white'});
							$('#auto_button').css({'color': 'white'});
							$('#off_button').css({'color': 'white'});
							
							if(updateObject.fan_control=="on")
							{
								$('#on_button').css({'color': 'yellow'});								
							}
							else if(updateObject.fan_control=="off")
							{
								$('#off_button').css({'color': 'yellow'});
							}	
							else if(updateObject.fan_control=="auto")
							{
								$('#auto_button').css({'color': 'yellow'});	
							}							
						}						
						break;	
									
				}				
			}
		}
	}
} 

function displayError()
{
	$("#connected_label").text("Error");	
	$("#connected_label").css({ 'color': 'blue'});
}

function displayDisconnected()
{
	$("#connected_label").text("Not Connected");	
	$("#connected_label").css({ 'color': 'blue'});
}

function displayConnected()
{
	$("#connected_label").text("Connected");
	$("#connected_label").css({ 'color': 'lightgreen'});
}


$(document).ready(function(){

	var localSock = new WebSocket(socketaddyLocal);
	var internetSock = new WebSocket(socketaddyInternet);
	
	
	localSock.onopen = function(){ 
		sock = localSock;
		displayConnected();
	};

	localSock.onclose = function(){
		displayError();
	};
	
	internetSock.onclose = function(){
		displayError();
	};
	
	localSock.onerror = function(){
		//displayError();
	};
		
	internetSock.onopen = function(){
		sock = internetSock;
		displayConnected();
	};

	internetSock.onerror = function(){
		//displayError();
	 };
	
	internetSock.onmessage = function(evt){ 
		handleMessage(evt);
	}; 
	 
	localSock.onmessage = function(evt){ 
		handleMessage(evt);
	}; 

	$('#set_point_decrease_button').on('click', function(e){
		
		var command = new Object();
		command.set_point="down";
		sendCommand(command);
		
	});
	

	$('#set_point_increase_button').on('click', function(e){
		
		var command = new Object();
		command.set_point="up";
		sendCommand(command);	
	});
	
	$('#auto_button').on('click', function(e){	
		var command = new Object();
		command.output_mode="auto";
		sendCommand(command);

		$('#on_button').css({'color': 'white'});
		$('#auto_button').css({'color': 'yellow'});
		$('#off_button').css({'color': 'white'});
	});
	
	$('#on_button').on('click', function(e){
		
		var command = new Object();
		command.output_mode="on";
		sendCommand(command);
		$('#on_button').css({'color': 'yellow'});
		$('#auto_button').css({'color': 'white'});
		$('#off_button').css({'color': 'white'});
		
	});
	
	$('#off_button').on('click', function(e){
		
		var command = new Object();
		command.output_mode="off";
		sendCommand(command);
		$('#on_button').css({'color': 'white'});
		$('#auto_button').css({'color': 'white'});
		$('#off_button').css({'color': 'yellow'});
		
	});

	$('#fullscreen_button').on('click', function (e) {
		toggleFullScreen();
	})
});

 
	

 
	

