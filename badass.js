var socketaddyLocal = "ws://192.168.0.9:9001"
var socketaddyInternet = "ws://bbqba.ddns.net:9001";
var sock;	
var sockState = false;		

var debug_list = [];
var autoVisible = true;
var confirmedObjectList = []
var confirmtedMenu;	


var stored_command = null;

function sendCommand(command)
{
	if(sockState)
	{
		sock.send(JSON.stringify(command));
	}
	else
	{
		show_error_modal("Error", "Not Connected", "OK");
	}
}

function handleMessage(evt)
{

	var reader = new FileReader();
    reader.onload = function(event){    	
	    messageString = reader.result;

		var noSingleQuotes = messageString.replace(/'/g, '"');		
		
		var messages = noSingleQuotes.split(";")

		messages.forEach(function(message){
			if(message.length > 1){
				
				var messageObject = JSON.parse(message);
				var keys = Object.keys(messageObject);
				
				displayConnected();								
				
				if(keys.indexOf('secret') != -1 && keys.indexOf('target') != -1 && keys.indexOf('value') !=-1)
				{			

					if(messageObject.secret == 'badass')
					{		
						var updateObject = messageObject.value;
						var updateKeys = Object.keys(updateObject);
						switch(messageObject.target)
						{				
							
							case "error":
								
								if(updateKeys.indexOf('message') != -1) 
								{
									var message = updateObject.message;
									show_error_modal(message.title, message.body, message.button);
								}
								break;
						
							case "magic":	

								updateObject.forEach(function(element){									
									switch(element.value_type){
										case "text":
											$("#" + element.control).text(element.value);
										case "val":
											$("#" + element.control).val(element.value);
											break;
										case "int":
											// if(element.control == "fan_control_state")
											// {
											// 	fanControlIndication(element.value);
											// }
											break;
										case "bool":
											switch (element.control)
											{
												// case "fan_state":											
												// 	var visibility = (element.value=="true") ? 'visible' : 'hidden';
												// 	$("#fan_state_icon").css({'visibility': visibility});
												// 	break;

												// case "temperature_units":
												// 	document.getElementById("C").checked = element.value;
												// 	break;

												// case "current_recording_buttons":
												// 	var visibility = (element.value=="true") ? 'visible' : 'hidden';
												// 	$('#current_recording_control').css({'visibility': visibility});
												// 	break;
											}
											break;
										case "button":
											$(".tic_button").text(element.value);
											break;
										case "button_clear":
											$(".tic_button").css({'visibility':'hidden'});
									 		break;	
									 	case "visibility":
									 	
									 		$("#" + element.control).css({'visibility': element.value});
									 		break					
									 }
								});
								
								break;
						}				
					}
				}
				
			}
		});
		


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



function configure_modal(title, body, button1, button2, button2_visible)
{
	
	$('#modal_title').text(title);
	$('#modal_body').text(body);
	$('#modal_button_1').text(button1);
	$('#modal_button_2').text(button2);

	if(button2_visible == true)
	{
		$('#modal_button_2').css({'visibility': 'visible'});	
	}
	else
	{
		$('#modal_button_2').css({'visibility': 'hidden'});
	}
}

function show_error_modal(title, body, button){
	configure_modal(title, body, button, "", false);
	$('#generic_modal').modal('toggle')
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
	//var internetSock = new WebSocket(socketaddyInternet);
	
	
	localSock.onopen = function(){ 
		sock = localSock;
		displayConnected();
		sockState = true;
	};

	localSock.onclose = function(){
		displayError();
		sockState = false;

	};
	
	// internetSock.onclose = function(){
	// 	displayError();
	// 	sockState = false;
	// };
	
	localSock.onerror = function(){
		//displayError();
	};
		
	// internetSock.onopen = function(){
	// 	sock = internetSock;
	// 	displayConnected();
	// 	sockState = true;
	// };

	// internetSock.onerror = function(){
	// 	//displayError();
	//  };
	
	// internetSock.onmessage = function(evt){ 
	// 	handleMessage(evt);
	// }; 
	 
	localSock.onmessage = function(evt){ 
		handleMessage(evt);
	}; 	
	

	$('.tic_button').on('click', function(e){
		var id = $(this).attr('id');
		var command = new Object();
		command.move = id;
		sendCommand(command);
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


});

 
	

 
	

