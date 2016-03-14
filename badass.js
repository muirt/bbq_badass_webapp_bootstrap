var socketaddyLocal = "ws://192.168.0.9:9001"


var socketaddyInternet = "ws://bbqba.ddns.net:9001";
var sock;			

var debug_list = [];
var autoVisible = true;
var confirmedObjectList = []
var confirmtedMenu;	

var set_point_temperature = 0;
var meat_goal_temperature = 0; 

var stored_command = null;
var required_choice_to_send = 0;

var saved_log_count = 0;
muted_color = "#999999";
primary_color = "#428bca";
warning_color = "#c09853";
danger_color = "#b94a48";
success_color = "#468847";


info_color = "#3a87ad";	



function graph(data)
{
	var meatData = [];
	var grillData = [];	

	var height = 0;
	height = parseInt($('.graphing').css('height'));

	if (height < 300)
	{
		var full_size = 380;
		$('.graphing').css({'height': full_size});
	}

	var chart_height = parseInt($('.chart').css('height'));

	if(chart_height < 300)
	{
		var full_size = 300;
		$('.chart').css({'height': full_size});
	}	

	for (var j = 1; j < data.length; j++) {
		var val_meat = parseInt(data[j][0]);
		var val_grill = parseInt(data[j][1]);
		var time = new Date(data[j][2]).getTime();

		var dataPoint1 = [
		  time,	 
		  val_meat
		];

		var dataPoint2 = [
		  time,	 
		  val_grill
		];

		meatData.push(dataPoint1);
		grillData.push(dataPoint2);
	}

	var chart = $(".chart").highcharts({
		chart: {
		  zoomType: 'x',
		  type: 'line'
		},
		title: {
		  text: ''
		},
		xAxis: {
		  type: 'datetime'
		},
		yAxis: {
		  title: {
		    text: 'TEMPERATURE'
		  }
		},
		legend: {
		  enabled: true
		},
		series: [{
		  name: 'MEAT',
		  data: meatData
		},
		{
		  name: 'GRILL',
		  data: grillData
		}]
	});
}
	Highcharts.theme = {
   colors: ["#2b908f", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee",
      "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
   chart: {
      backgroundColor: {
         linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
         stops: [
            [0, '#2a2a2b'],
            [1, '#3e3e40']
         ]
      },
      style: {
         
      },
      plotBorderColor: '#606063'
   },
   title: {
      style: {
         color: '#E0E0E3',
         textTransform: 'uppercase',
         fontSize: '20px'
      }
   },
   subtitle: {
      style: {
         color: '#E0E0E3',
         textTransform: 'uppercase'
      }
   },
   xAxis: {
      gridLineColor: '#707073',
      labels: {
         style: {
            color: '#E0E0E3'
         }
      },
      lineColor: '#707073',
      minorGridLineColor: '#505053',
      tickColor: '#707073',
      title: {
         style: {
            color: '#A0A0A3'

         }
      }
   },
   yAxis: {
      gridLineColor: '#707073',
      labels: {
         style: {
            color: '#E0E0E3'
         }
      },
      lineColor: '#707073',
      minorGridLineColor: '#505053',
      tickColor: '#707073',
      tickWidth: 1,
      title: {
         style: {
            color: '#A0A0A3'
         }
      }
   },
   tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      style: {
         color: '#F0F0F0'
      }
   },

   legend: {
      itemStyle: {
         color: '#E0E0E3'
      },
      itemHoverStyle: {
         color: '#FFF'
      },
      itemHiddenStyle: {
         color: '#606063'
      }
   },


   // special colors for some of the
   legendBackgroundColor: 'rgba(0, 0, 0, 0.5)',
   background2: '#505053',
   dataLabelsColor: '#B0B0B3',
   textColor: '#C0C0C0',
   contrastTextColor: '#F0F0F3',
   maskColor: 'rgba(255,255,255,0.3)'
};
	// Apply the theme
Highcharts.setOptions(Highcharts.theme);


function saved_recording_expand(e){
	var height = 0;
	
	height = parseInt($('#saved_recordings_div').css('height'));
	var offset = -185;
	if($($(this).data("target")).hasClass("collapse"))
	{			
		offset *= -1;
	}

	$('#saved_recordings_div').css({'height': height + offset});	

}

function saved_recording_graph(e){
	var name = $(e.target).attr("id");
	var root = name.split("_graph_button")[0];
	var command = new Object();
	command.graph_log = root + ".csv";
	sendCommand(command);

}

function saved_recording_delete(e){
	var name = $(e.target).attr("id");
	var root = name.split("_delete_button")[0];
	var command = new Object();
	command.delete_log = root + ".csv";
	start_message(command, 1);
	configure_modal('Confirm', 'Delete this recording?', 'OK', 'Cancel');
	$('#generic_modal').modal('toggle')
}		
		

function create_recording_button(name, duration)
{			
	var ul = document.getElementById('saved_recordings_list');
	var li = document.createElement("li");
	//li.style.marginTop = '40px';
	li.style.marginBottom = '10px';
	
	li.innerHTML = "<div style=\"width: 100%; margin-bottom:0px;\"><button  id=\"" + name + "_button\" style=\"width: 98%\" class=\"btn btn-xlarge btn-success \" data-target=\"#" + name + "_recording_template\" data-toggle=\"collapse\">" + name + "</button></div> \
	<div class=\"cont collapse recording_template\" style=\"margin-bottom:0px\" id=\"" + name + "_recording_template\"> \
	     <h2> <span class=\"label label-warning pull-left\">Name</span><div >" + name + "</div></h2>  \
	          <h2 ><span class=\"label label-warning pull-left\"> Duration</span><div >" + duration + "</h2> \
	           <div class=\"btn-group pull-right\" id=\"current_recording_control\" role=\"group\" aria-label=\"Basic example\">\
	           <button id=\"" + name + "_delete_button\" type=\"button\" class=\"btn btn-xlarge btn-danger btn-secondary \" >Delete</button>\
    		   <button id=\"" + name + "_graph_button\" type=\"button\" class=\"btn btn-xlarge btn-primary btn-secondary \" >Graph</button> \
	<div style=\"width:100%; height:70px;\"></div> \
	</div>\
		</div> ";

	ul.appendChild(li);

	var template = document.getElementById(name + "_recording_template");
	template.style.marginBottom = '10px';
	
	var log_button = document.getElementById(name + "_button");
	log_button.addEventListener("click", saved_recording_expand);

	var graph_button = document.getElementById(name + "_graph_button");
	graph_button.addEventListener("click", saved_recording_graph);

	var delete_button = document.getElementById(name + "_delete_button");
	delete_button.addEventListener("click", saved_recording_delete);

	saved_log_count += 1;
	

	var height = 0;
	height = parseInt($('#saved_recordings_div').css('height'));
	var offset = 60;

	$('#saved_recordings_div').css({'height': height + offset});	
}	

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


function sendCommand(command)
{
	sock.send(JSON.stringify(command));
}

function calculate_progress(part, whole)
{	
	
	var result = 0;

	if(whole != 0){
		result = part/whole;
	}


	return ("" + parseInt(result * 100) + "%");


}

function evaluate_progress()
{
	var meat_temp = parseInt($("#meat_temperature_string").text());
	var grill_temp = parseInt($("#grill_temperature_string").text());

	meat_width = calculate_progress(meat_temp, meat_goal_temperature);
	grill_width = calculate_progress(grill_temp, set_point_temperature);


	
	$('#meat_temp_progress').css({'width':meat_width});
	$('#grill_temp_progress').css({'width':grill_width});

	if(parseInt(meat_width) < 40)
	{
		$('#meat_temp_progress').css({'background':primary_color});
	}

	if(parseInt(meat_width) >=40 && parseInt(meat_width) < 90 )
	{
		$('#meat_temp_progress').css({'background':info_color});
	}

	if(parseInt(meat_width) >= 90 && parseInt(meat_width) < 100 )
	{
		$('#meat_temp_progress').css({'background':warning_color});
	}


	if(parseInt(meat_width) >=100 && parseInt(meat_width) < 105 )
	{

		$('#meat_temp_progress').css({'background':success_color});
	}
	if(parseInt(meat_width) >= 105 )
	{

		$('#meat_temp_progress').css({'background':danger_color});
	}

	if(parseInt(grill_width) < 90)
	{					
		
		$('#grill_temp_progress').css({'background': primary_color});

	}
	if(parseInt(grill_width) >90 && parseInt(grill_width) < 110 )
	{					
		
		$('#grill_temp_progress').css({'background': success_color});

	}
	if(parseInt(grill_width) >= 110)
	{		
		$('#grill_temp_progress').css({'background': danger_color});

	}
}

function handleMessage(evt)
{

	var reader = new FileReader();
    reader.onload = function(event){    	
	    messageString = reader.result;

		var noSingleQuotes = messageString.replace(/'/g, '"');		
		
		
		var messageObject = JSON.parse(noSingleQuotes);
		var keys = Object.keys(messageObject);
		
		displayConnected();
		set_point_temperature = parseInt($("#set_point_string").text());
		meat_goal_temperature = parseInt($("#goal_meat_input").val());
		evaluate_progress();
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

					case "response":

						var updateObject = messageObject.value;
						var updateKeys = Object.keys(updateObject);		
											
						if(updateKeys.indexOf('hysteresis') != -1) 
						{
							$("#hysteresis_input").val(updateObject.hysteresis);

						}
						if(updateKeys.indexOf('set_point') != -1) 
						{															
							$("#set_point_string").text(updateObject.set_point);														
						}

						break;
					case "recording":						
						var updateObject = messageObject.value;
						var updateKeys = Object.keys(updateObject);
						if(updateKeys.indexOf('details') != -1)
						{		
							$('#current_recording_name').text(updateObject.details.name);
							$('#current_recording_duration').text(updateObject.details.time);
						}
						break;
					case "graphing":
						var updateObject = messageObject.value;
						var updateKeys = Object.keys(updateObject);
						if(updateKeys.indexOf('graph_data') != -1)
						{							
							graph(updateObject.graph_data.graphData);
						}
						break;
					case "saved_logs":
						var updateObject = messageObject.value;		
						if(!$("ul").has("li").length){
							
							updateObject.logs.forEach(function(recording){

								create_recording_button(recording.name, recording.duration)						
							});
						}		
						break;
					case "initial_update":						
						var updateObject = messageObject.value;
						var updateKeys = Object.keys(updateObject);	

						if(updateKeys.indexOf('set_point_value') != -1) 
						{
							$("#set_point_string").text(updateObject.set_point_value);
							set_point_temperature = parseInt($("#set_point_string").text());
							
						}		

						if(updateKeys.indexOf('hysteresis') != -1)
						{
							$("#hysteresis_input").val(updateObject.hysteresis);
						}
						
						if(updateKeys.indexOf('meat_temperature_goal') != -1)
						{							
							$("#goal_meat_input").val(updateObject.meat_temperature_goal);
							meat_goal_temperature = parseInt($("#goal_meat_input").val());
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
						if(updateKeys.indexOf('temperature_units') != -1){
							if(updateObject.temperature_units == "C" ){
								document.getElementById("C").checked = true;
							}
							else if(updateObject.temperature_units == "F" ){
								document.getElementById("C").checked = false;
							}
							
							
						}
						break;					
				}				
			}
		}
		


	};
  	reader.readAsText(evt.data);
} 

function displayError()
{
	$("#connected_label").text("Error");	
	$("#connected_label").css({ 'color': 'blue'});
	$("#connected_icon").css({'color': 'blue'});
}

function displayDisconnected()
{
	$("#connected_label").text("Not Connected");	
	$("#connected_label").css({ 'color': 'blue'});
	$("#connected_icon").css({'color': 'blue'});
}

function displayConnected()
{
	$("#connected_label").text("Connected");
	$("#connected_label").css({ 'color': 'lightgreen'});
	$("#connected_icon").css({'color': 'lightgreen'});
}

function configure_modal(title, body, button1, button2)
{
	$('#modal_title').text(title);
	$('#modal_body').text(body);
	$('#modal_button_1').text(button1);
	$('#modal_button_2').text(button2);
}

function start_message(command, required_choice){
	stored_command = command;
	required_choice_to_send = required_choice;
}

function complete_message(choice){
	if(choice == required_choice_to_send){
		sendCommand(stored_command);
		stored_command = null;
		required_choice_to_send = 0;
	
	}
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
	
	if(window.navigator.standalone == true) {
 		$('#fullscreen_button').css({'visibility': 'hidden'})
	}

	$('#fullscreen_button').on('click', function(e){
		$('#fullscreen_button').text("Exit Fullscreen");
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


	$('#hystersis_plus_button').on('click', function(e){
		var command = new Object();
		command.hysteresis_change="up";
		sendCommand(command);
		
	});

	$('#hystersis_minus_button').on('click', function(e){
		var command = new Object();
		command.hysteresis_change="down";
		sendCommand(command);
		
	});


	$('#goal_meat_save_button').on('click', function(e){
		var command = new Object();
		command.meat_temperature_goal=$('#goal_meat_input').val();
		sendCommand(command);
	});


	$('#current_recording_stop_button').on('click', function(e){
		var command = new Object();
		//command.finish_current_log="finish_current_log";
		command.menu_request = "list_saved_logs";
		start_message(command, 1);
		configure_modal('Confirm', 'Stop current recording?', 'OK', 'Cancel');
		$('#generic_modal').modal('toggle')
	});

	

	$('#current_recording_graph_button').on('click', function(e){
	
		var command = new Object();
		command.graph_log = "fake.csv";
		sendCommand(command);

	});


	
	$('#new_recording_button').on('click', function(e){
		var command = new Object();
		command.create_new_log=$('#new_recording_input').val();
		start_message(command, 1);
		configure_modal('Confirm', 'Start an new recording?', 'OK', 'Cancel');
		$('#generic_modal').modal('toggle')

	});
	
	
	$('#generic_modal .modal-footer button').on('click', function (e) {
    	var $target = $(e.target);
    	$(this).closest('.modal').on('hidden.bs.modal', function (e) {
        	if($target[0].id == "modal_button_1"){
        		complete_message(1);
        	}
        	if($target[0].id == "modal_button_2"){
        		complete_message(2);
        	}
    	});
	});

	function degrees_radio_handler(){
		var command = new Object();
		command.units = $('input:radio[name=unit]:checked').val();
		sendCommand(command);
		
	}

	$('#F').on('click', degrees_radio_handler);
	$('#C').on('click', degrees_radio_handler);

	function debug_radio_handler(){
		var command = new Object();
		command.debug = $('input:radio[name=view]:checked').val();
		sendCommand(command);
		
	}

	$('#on').on('click', debug_radio_handler);
	$('#off').on('click', debug_radio_handler);

	$('#first_button').on('click', function (e) {
    	var initial_height = $('#saved_recordings_div').css('height');
    	$('#saved_recordings_div').css({'height':(parseInt(initial_height) + 30)});
	});

});

 
	

 
	

