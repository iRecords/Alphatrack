loadAPI(1);
//loadAPI(2);
load("FRONTIER_ALPHATRACK_var.js");
load("FRONTIER_ALPHATRACK.display.js");
load("FRONTIER_ALPHATRACK_encoders.js");

host.defineController("Frontier", "AlphaTrack", "1.0", "253256C0-EB4A-4ADF-837B-5EEE9F07E62E");
host.defineMidiPorts(1, 1);
host.addDeviceNameBasedDiscoveryPair(["Frontier AlphaTrack"],["Frontier AlphaTrack"]);
host.addDeviceNameBasedDiscoveryPair(["Frontier AlphaTrack MIDI 1"],["Frontier AlphaTrack MIDI 1"]);


var isShiftPressed = false;
var isVpotPressed = initArray(false, 8);
var isFlipOn = false;
var pageUp = VPOT_ASSIGN.EQ;

var activePage = PAGE.PAN;
var activeDisplayPage = DISPLAY_PAGES.NAME_AND_VOLUME;
var activePanPage = VPOT_PAGE.DEFAULT;
var activeSendPage = VPOT_PAGE.SEND0;
var activeDevicePage = VPOT_PAGE.DEFAULT;

var currentPage = new CurrentPage();

function init(){
	
	sendSysex(NATIVE_MODE); // Set to native mode
	sendNoteOn(0, FUNCTION.F1, 0);
	
	clearLCD();
	writeToLCD(0, 0, "     VST.RU     ", TOTAL_DISPLAY_SIZE);
	
	host.getMidiInPort(0).setMidiCallback(onMidi);

	//=========================== HOST ==============================
	application 			= host.createApplication();
	masterTrack 			= host.createMasterTrack(1);
	trackBank 				= host.createTrackBank(maxNumChannels, numSendPages, 99);
	transport 				= host.createTransport();
	cursorTrack 			= host.createCursorTrack(numSendPages, 99);
	cursorDevice			= cursorTrack.createCursorDevice();
	arranger 				= host.createArranger();
	mixer					= host.createMixer();
	//groove 				= host.createGrooveSection();
	//cursorClip 			= host.createCursorClipSection(16, 16);
	clearLCD();
	
	//=========================== TRACKS ==============================
	for (var t = 0; t < maxNumChannels; t++){
		track = trackBank.getChannel(t);
		track.addNameObserver(6, "", makeIndexedFunction(t, function(index, value){
			if (value.length > 0){
				maxTracks = index;
			}
		}));
		track.addIsSelectedObserver(makeIndexedFunction(t, function(t, isSelected){
			if (isSelected){
				currentTrack = t;
			}
		}));
	}
	/*-----------------------Application Mode -----------------------------*/
	application.addPanelLayoutObserver(function(string)
	{
		writeToLCD(0, 0, string, DISPLAY_WIDTH);
	}, 8);
	/*------------------Mixer-----------------------------------------------------*/
	mixer.addClipLauncherSectionVisibilityObserver(function(on)
	{
		//sendNoteOn(0, FUNCTION.F2, on ? 127 : 0);
	}); 
	mixer.addMeterSectionVisibilityObserver(function(on)
	{
		//sendNoteOn(0, FUNCTION.F1, on ? 127 : 0);
	});
	mixer.addSendsSectionVisibilityObserver(function(on)
	{
		//sendNoteOn(0, FUNCTION.F3, on ? 127 : 0);
	});
	/*-----------------------Faders / Encoders--------------------------------*/
	cursorTrack.getSend(0).addValueDisplayObserver(10, "", function(value)
	{
		currentSend1 = value;
		writeToLCD(1, 0, "Send1", 6);
		writeToLCD(1, 6, currentSend1, 10);
	});
	cursorTrack.getSend(1).addValueDisplayObserver(10, "", function(value)
	{
		currentSend2 = value;
		writeToLCD(1, 0, "Send2", 6);
		writeToLCD(1, 6, currentSend2, 10);
	});
	cursorTrack.getPan().addValueDisplayObserver(10, "", function(value){
		currentPan = value;
		writeToLCD(1, 0, "Pan", 4);
		writeToLCD(1, 4, currentPan, 12);
	});
	cursorTrack.getVolume().addValueObserver(16384, function(value){
		sendPitchBend(0, value);
	});
	cursorTrack.getVolume().addValueDisplayObserver(10, "", function(value){
		currentVolume = value;
		writeToLCD(1, 0, "Volume", 7);
		writeToLCD(1, 7, value, 9);
	});
	/*--------------------------- Arms -----------------------------------------*/
	cursorTrack.getMute().addValueObserver(function(on){
		sendNoteOn(0, CHANNEL_BUTTON.MUTE0, on ? 127 : 0);
	});
	cursorTrack.getSolo().addValueObserver(function(on){
		sendNoteOn(0, CHANNEL_BUTTON.SOLO0, on ? 127 : 0);
	});
	cursorTrack.getArm().addValueObserver(function(on){
		sendNoteOn(0, CHANNEL_BUTTON.ARM0, on ? 127 : 0);
	});
	// =========================== TRANSPORT LEDs ==============================
	transport.addIsPlayingObserver(function(on){
		sendNoteOn(0, TRANSPORT.PLAY, on ? 127 : 0);
		sendNoteOn(0, TRANSPORT.STOP, on ? 0 : 127);
	});
	transport.addIsLoopActiveObserver(function(on){
		sendNoteOn(0, TRANSPORT.CYCLE, on ? 127 : 0);
	});
	transport.addPunchInObserver(function(on){
		sendNoteOn(0, TRANSPORT.TRACKL, on ? 127 : 0);
	});
	transport.addPunchOutObserver(function(on){
		sendNoteOn(0, TRANSPORT.TRACKR, on ? 127 : 0);
	});
	transport.addIsRecordingObserver(function(on){
		sendNoteOn(0, TRANSPORT.RECORD, on ? 127 : 0);
	});
	transport.addPunchInObserver(function(on){
		//isPunchIn = on;
		sendNoteOn(0, TRANSPORT.REW, on ? 127 : 0);
	});
	transport.addPunchOutObserver(function(on){
		//isPunchOut = on;
		sendNoteOn(0, TRANSPORT.FF, on ? 127 : 0);
	});
	// Automation Leds
	transport.addIsWritingArrangerAutomationObserver(function(on)
	{
		sendNoteOn(0, AUTOMATION.WRITE, on ? 127 : 0);
	});
	// ================================ Transport =====================================================
	transport.getPosition().addTimeObserver(":", 3, 2, 2, 2, function(value)
	{
		transportPosition = value;
		currentPage.update(activePage);
	});
	transport.getTempo().addValueDisplayObserver(6, "", function(value)
	{
		//setTempo(value);
		tempo = value;
		//isTempoDisplayActive ? setTransportTempoDisplay(value) : null;
	});
	// ============================= Arranger Panels Leds ====================================
	arranger.addPlaybackFollowObserver(function(on)
	{
		//sendNoteOn(0, TRANSPORT.TRACKL, on ? 127 : 0);
	});
	
	// Page Screen
	host.scheduleTask(function() // вызывается один раз, если нет аргумента в виде callback функции
	{
		trackBank.getTrack(0).select();
		currentPage.show(activePage);
	}, null, 2000);
}

function onMidi(status, data1, data2)
{
	track = trackBank.getTrack(currentTrack);

	// Fader
	if(isPitchBend(status))
	{
		var index = MIDIChannel(status);
		if (index < 8){
			track.getVolume().set(pitchBendValue(data1, data2), 16384 - 127);
		}else if (index == 8){
			masterTrack.getVolume().set(pitchBendValue(data1, data2), 16384 - 127);
		}
	}
	// Encoders
	if(isChannelController(status))
	{
		switch(data1)
		{
			case VPOT_KNOBS.VPOT0:		//Left Encoder
				if(isShiftPressed)
				{
					if(data2 < 65) track.getPan().inc(1, ENCODER_RESOLUTION.PAN_FINE);
					else track.getPan().inc(-1, ENCODER_RESOLUTION.PAN_FINE);
				}
				else
				{
					if(data2 < 65) track.getPan().inc(1, ENCODER_RESOLUTION.PAN_STD);
					else track.getPan().inc(-1, ENCODER_RESOLUTION.PAN_STD);
				}
				break;
			case VPOT_KNOBS.VPOT1:		//Center Encoder
				if(isShiftPressed)
				{
					if(data2 < 65) track.getSend(0).inc(1, ENCODER_RESOLUTION.SEND_FINE);
					else track.getSend(0).inc(-1, ENCODER_RESOLUTION.SEND_FINE);
				}
				else
				{
					if(data2 < 65) track.getSend(0).inc(1, ENCODER_RESOLUTION.SEND_STD);
					else track.getSend(0).inc(-1, ENCODER_RESOLUTION.SEND_STD);
				}
				break;
			case VPOT_KNOBS.VPOT2:		//Right Encoder
				if(isShiftPressed)
				{
					if(data2 < 65) track.getSend(1).inc(1, ENCODER_RESOLUTION.SEND_FINE);
					else track.getSend(1).inc(-1, ENCODER_RESOLUTION.SEND_FINE);
				}
				else
				{
					if(data2 < 65) track.getSend(1).inc(1, ENCODER_RESOLUTION.SEND_STD);
					else track.getSend(1).inc(-1, ENCODER_RESOLUTION.SEND_STD);
				}
				break;
		}
	}
	// Keys
	if (isNoteOn(status))
	{
		if (!buttonTrigger)
		{
			buttonTrigger = true;
			host.scheduleTask(function()
			{
				buttonTrigger = false;
			}, null, 250);

			switch(data1)
			{
				case MODIFIER.SHIFT:
					//isShiftPressed = data2 > 0;	//boolean that is true as long as the shift button is pressed
					isShiftPressed = isShiftPressed ? 0 : 127;
					break;
				case FADER.TOUCH0:
					isFaderTouched = data2 > 0;
					writeToLCD(1, 0, "Volume", 7);
					writeToLCD(1, 7, currentVolume, 9);
					break;
				case VPOT_KNOBS.VPOT_TOUCH0:
					isVPOT0Touched = data2 > 0;
					writeToLCD(1, 0, "Pan", 4);
					writeToLCD(1, 4, currentPan, 12);
					break;
				case VPOT_KNOBS.VPOT_TOUCH1:
					writeToLCD(1, 0, "Send1", 6);
					writeToLCD(1, 6, currentSend1, 10);
					break;
				case VPOT_KNOBS.VPOT_TOUCH2:
					writeToLCD(1, 0, "Send2", 6);
					writeToLCD(1, 6, currentSend2, 10);
					break;
				case VPOT_KNOBS.VPOT_CLICK0:
					track.getPan().reset();
					break;
				case VPOT_KNOBS.VPOT_CLICK1:
					track.getSend(0).reset();
					break;
				case VPOT_KNOBS.VPOT_CLICK2:
					track.getSend(1).reset();
					break;
				// Channel up / down
				case TRANSPORT.TRACKL:
					if(isShiftPressed) transport.togglePunchIn();
					else prevTrack();
					break;
				case TRANSPORT.TRACKR:
					if(isShiftPressed) transport.togglePunchOut();
					//if(isShiftPressed) lastTrack();
					else nextTrack();
					break;
				// Rewind
				case TRANSPORT.REW:
					transport.rewind();
					transport.incPosition(-0014, true);
					break;
				// Forward
				case TRANSPORT.FF:
					transport.fastForward();
					transport.incPosition(0014, true);
					break;
				// Stop
				case TRANSPORT.STOP:
					transport.stop();
					break;
				// Play
				case TRANSPORT.PLAY:
					transport.play();
					break;
				// Record
				case TRANSPORT.RECORD:
					transport.record();
					break;
				case TRANSPORT.CYCLE:
					if(isShiftPressed) transport.toggleOverdub();
					else transport.toggleLoop();
					break;
				case FUNCTION.F1:
					application.toggleNoteEditor();
					writeToLCD(0, 8, "Detail", COLUMN_WIDTH);
					break;
				// Trns	
				case FUNCTION.F2:
					application.toggleAutomationEditor();
					writeToLCD(0, 8, "Automation", COLUMN_WIDTH);
					break;
				// Trns	
				case FUNCTION.F3:
					application.toggleDevices();
					writeToLCD(0, 8, "Devices", COLUMN_WIDTH);
					break;
				// Mix	
				case FUNCTION.F4:
					application.toggleMixer();
					writeToLCD(0, 8, "Mixer", COLUMN_WIDTH);
					break;
				// Mute	
				case CHANNEL_BUTTON.MUTE0:
					track.getMute().toggle();
					break;
				// Solo	
				case CHANNEL_BUTTON.SOLO0:
					track.getSolo().toggle();
					break;
				// Rec	
				case CHANNEL_BUTTON.ARM0:
					if(isShiftPressed)
					{
						if (arrAutomationOn) transport.toggleWriteArrangerAutomation();
						else transport.toggleWriteArrangerAutomation();
					}
					else track.getArm().toggle();
					break;
				case VPOT_ASSIGN.PAN:
					activePage = PAGE.PAN;
					VPOT_ASSIGN.PAN_STATE = STATUS.ON;
					VPOT_ASSIGN.SEND_STATE = STATUS.OFF;
					VPOT_ASSIGN.EQ_STATE = STATUS.OFF;
					VPOT_ASSIGN.PLUGIN_STATE = STATUS.OFF;
					VPOT_ASSIGN.AUTO_STATE = STATUS.OFF;
					currentPage.show(activePage);
					//sendNoteOn(0, VPOT_ASSIGN.PAN, VPOT_ASSIGN.PAN_STATE);
					break;
				case VPOT_ASSIGN.SEND:
					activePage = PAGE.SEND;
					VPOT_ASSIGN.PAN_STATE = STATUS.OFF;
					VPOT_ASSIGN.EQ_STATE = STATUS.OFF;
					VPOT_ASSIGN.PLUGIN_STATE = STATUS.OFF;
					VPOT_ASSIGN.AUTO_STATE = STATUS.OFF;
					VPOT_ASSIGN.SEND_STATE = STATUS.ON;
					currentPage.show(activePage);
					//sendNoteOn(0, VPOT_ASSIGN.SEND, VPOT_ASSIGN.SEND_STATE);
					break;
				case VPOT_ASSIGN.EQ:
					activePage = PAGE.EQ;
					VPOT_ASSIGN.PAN_STATE = STATUS.OFF;
					VPOT_ASSIGN.SEND_STATE = STATUS.OFF;
					VPOT_ASSIGN.EQ_STATE = STATUS.ON;
					VPOT_ASSIGN.PLUGIN_STATE = STATUS.OFF;
					VPOT_ASSIGN.AUTO_STATE = STATUS.OFF;
					currentPage.show(activePage);
					//sendNoteOn(0, VPOT_ASSIGN.EQ, VPOT_ASSIGN.EQ_STATE);
					break;
				case VPOT_ASSIGN.PLUGIN:
					activePage = PAGE.PLUGIN;
					VPOT_ASSIGN.PAN_STATE = STATUS.OFF;
					VPOT_ASSIGN.SEND_STATE = STATUS.OFF;
					VPOT_ASSIGN.EQ_STATE = STATUS.OFF;
					VPOT_ASSIGN.PLUGIN_STATE = STATUS.ON;
					VPOT_ASSIGN.AUTO_STATE = STATUS.OFF;
					currentPage.show(activePage);
					//sendNoteOn(0, VPOT_ASSIGN.PLUGIN, VPOT_ASSIGN.PLUGIN_STATE);
					break;
				case VPOT_ASSIGN.AUTO:
					if(isShiftPressed)
					{
						if (arrAutomationOn) transport.toggleWriteArrangerAutomation();
						else transport.toggleWriteArrangerAutomation();
					}
					else
					{
						activePage = PAGE.AUTO;
						VPOT_ASSIGN.PAN_STATE = VPOT_ASSIGN.PAN_OFF;
						VPOT_ASSIGN.SEND_STATE = VPOT_ASSIGN.SEND_OFF;
						VPOT_ASSIGN.EQ_STATE = VPOT_ASSIGN.EQ_OFF;
						VPOT_ASSIGN.PLUGIN_STATE = VPOT_ASSIGN.PLUGIN_OFF;
						VPOT_ASSIGN.AUTO_STATE = VPOT_ASSIGN.AUTO_ON;
						currentPage.show(activePage);
						//sendNoteOn(0, VPOT_ASSIGN.AUTO, VPOT_ASSIGN.AUTO_STATE);
					}
					break;
			}
			if(isShiftPressed) sendNoteOn(0, MODIFIER.SHIFT, STATUS.ON);
			else sendNoteOn(0, MODIFIER.SHIFT, STATUS.OFF);
		}	
	}
	// Return to default vision for current page
	host.scheduleTask(function(){
		currentPage.show(activePage);
	}, null, 2000);
}

function lastTrack()
{
	if (currentTrack < maxTracks){
		currentTrack = maxTracks; // Report track number to this
		trackChange = true;
		cursorTrack.selectLast();
	}
}

function nextTrack(){
	if (currentTrack < maxTracks){
		currentTrack++;
		trackChange = true;
		cursorTrack.selectNext();
	}
}

function prevTrack(){
	if (currentTrack > 0){
		currentTrack--;
		trackChange = true;
		cursorTrack.selectPrevious();
	}
}

function exit(){
	clearLCD();
	writeToLCD(0, 0, "     VST.RU     ", TOTAL_DISPLAY_SIZE);
	for ( var j = 0; j < 8; j++)
	{
		sendSysex(SYSEX_HDR + "20 0" + j + "00 f7");
		// sendChannelPressure(0, 0xf + (j << 4));
	}
	sendSysex(SYSEX_HDR + "0a 00 f7"); // Transport Button Klick OFF=0a 00, ON=0a 01
	sendSysex(SYSEX_HDR + "61 f7"); // All faders to the bottom
	sendSysex(SYSEX_HDR + "62 f7"); // All leds off
	sendSysex(SYSEX_HDR + "21 01 f7");// set Global LCD meter mode to vertical

}
function flush(){
}
function onSysex(data){
	//clearLCD();
	//writeToLCD(0, 0, "Sysex", TOTAL_DISPLAY_SIZE);
}

function makeIndexedFunction(index, f){
	return function(value){
		f(index, value);
	};
}