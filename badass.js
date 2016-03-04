var socketaddyLocal= "ws://192.168.4.1:9001";


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

function calculate_progress(part, whole)
{	
	//alert(part + " " + whole);
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
		//alert(">110");							
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

					case "saved_logs":
						var updateObject = messageObject.value;
						var ul = document.getElementById('saved_recordings_list');
						ul.innerHTML = '';
						updateObject.forEach(function(recording){
							
							var li = document.createElement("li");
							li.appendChild(document.createTextNode(recording.name));
		
							ul.appendChild(li);
						});
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
							//alert(updateObject.temperature_units);
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


	/*

var updateObject = messageObject.value;
						var ul = document.getElementById('saved_recordings_list');
						ul.innerHTML = '';
						updateObject.forEach(function(recording){
							
							var li = document.createElement("li");
							li.appendChild(document.createTextNode(recording.name));
		
							ul.appendChild(li);
						});
var li = document.createElement("li");
							li.appendChild(document.createTextNode(recording.name));
		
							ul.appendChild(li);
*/
	$('#current_recording_graph_button').on('click', function(e){
		// var command = new Object();
		// command.menu_request = "list_saved_logs";
		// //command.show_current_log="show_current_log";
		// //sendCommand(command);
		 var ul = document.getElementById('saved_recordings_list');
		// ul.innerHTML = '';
		// var btn = document.createElement("button");
		// btn.class = "btn btn-success";
		// btn.value = "Brisket";
		var li = document.createElement("li");
		li.style.marginBottom = '10px';
		/*li.innerHTML ="<div class=\"accordion\" id=\"accordion2\"> \
                    <div class=\"accordion-group\"> \
                        <div class=\"accordion-heading\"> \
                            <a class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#accordion2\" href=\"#collapseTwo\"> \
                            Brisket 1 \
                            </a> \
                         </div> \
                         <div id=\"collapseTwo\" class=\"accordion-body collapse\"> \
                             <div class=\"accordion-inner\"> \
                <button id=\"hystersis_plus_button2\" class=\"btn btn-danger\" type=\"button\">+</button> \
                 </div> \
                    </div> \
                     </div> </div> ";
		*/
		li.innerHTML = "<div style=\"width: 100%; margin-bottom:10px;\"><button  id=\"saved_recording_button" + saved_log_count + "\" style=\"width: 98%\" class=\"btn btn-xlarge btn-success \" data-target=\"#recording_template" + saved_log_count + "\" data-toggle=\"collapse\">Pork Butt</button></div> \
		<div class=\"cont collapse\" id=\"recording_template" + saved_log_count + "\"> \
		     <h2> <span class=\"label label-success pull-left\">Name</span><div >Not</div></h2>  \
		          <h2 ><span class=\"label label-warning pull-left\"> Duration</span><div >Recording</h2> \
		           <div class=\"btn-group pull-right\" id=\"current_recording_control\" role=\"group\" aria-label=\"Basic example\">\
		           <button type=\"button\" class=\"btn btn-primary btn-secondary \" >Stop</button>\
        <button type=\"button\" class=\"btn btn-warning btn-secondary \" >\
        Graph</button> \
    </div>\
  </div>";
		ul.appendChild(li);

		var template = document.getElementById("recording_template" + saved_log_count);
		template.style.marginBottom = '10px';
		var button = document.getElementById("saved_recording_button" + saved_log_count);
		saved_log_count += 1;
		button.addEventListener("click", saved_recording_expand);

		var height = 0;
		height = parseInt($('#saved_recordings_div').css('height'));
		var offset = 50;

		$('#saved_recordings_div').css({'height': height + offset});	


	});

	function saved_recording_expand(e){
		var height = 0;
		
		height = parseInt($('#saved_recordings_div').css('height'));
		var offset = -160;
		if($($(this).data("target")).hasClass("collapse"))
		{			
			offset *= -1;
		}
	
		$('#saved_recordings_div').css({'height': height + offset});	
/*
		if($('this').data('state') == "closed")
		{
			height = $('#saved_recordings_div').css('height');
			$('#saved_recordings_div').css('height') = height + 30;
			$('this').data('state') == "open";
		}
		else
		{
			height = $('#saved_recordings_div').css('height');
			$('#saved_recordings_div').css({'height': height - 30});
			$('this').data('state') == "closed"
		}
*/		
	}
		
	
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

 
	

 
	

