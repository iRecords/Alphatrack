		/*track.getVolume().addValueDisplayObserver(10, "", makeIndexedFunction(t, function(index, value)
		{
			currentVolume = value;	
			writeToLCD(1, 0, "Volume", 7);
			writeToLCD(1, 7, currentVolume, 9);
		}));*/
		
		/*track.getPan().addValueDisplayObserver(12, "", makeIndexedFunction(t, function(index, value)
		{
			currentPan = value;
			writeToLCD(1, 0, "Pan", 4);
			writeToLCD(1, 4, currentPan, 12);
		}));*/
		
		/*track.getSend(0).addValueObserver(16384, makeIndexedFunction(t, function(index, value)
		{
			//encoderPages[VPOT_PAGE.SEND0].setEncoder(index, value, 0, 0);
			//currentSend1 = value;
			//writeToLCD(1, 0, "Send1", 6);
			//writeToLCD(1, 6, uint7ToHex(value), 10);
		}));*/
		
		/*track.getSend(0).addValueDisplayObserver(10, "", makeIndexedFunction(t, function(index, value)
		{
			currentSend1 = value;
			writeToLCD(1, 0, "Send1", 6);
			writeToLCD(1, 6, currentSend1, 10);
		}));*/
		
		/*track.getSend(1).addValueObserver(16384, makeIndexedFunction(t, function(index, value)
		{
			//encoderPages[VPOT_PAGE.SEND0].setEncoder(index, value, 0, 0);
		}));
		
		track.getSend(1).addValueDisplayObserver(10, "", makeIndexedFunction(t, function(index, value)
		{
			currentSend2 = value;
			writeToLCD(1, 0, "Send2", 6);
			writeToLCD(1, 6, currentSend2, 10);
		}));*/
	/*-----------------------Application----------------------------------*/

	/*application.addSelectedModeObserver(function(string)
	{
		writeToLCD(0, 8, string, 8);
	}, 8, selectedmode);*/
	
	/*application.addDisplayProfileObserver(function(string)
	{
		writeToLCD(1, 8, string, 8);
	}, 8);*/
	/*------------------Mixer-----------------------------------------------------*/
	
	/*transport.addAutomationWriteModeObserver(function(mode)
	{
		clearLCD();
		writeToLCD(0, 0, uint7ToHex(mode), COLUMN_WIDTH);
	});*/


/*function toggleFlip(){ // toggle flip on/off and send all values to all vpots and faders
	switch (isFlipOn){
		case true:
			isFlipOn = false;
			sendNoteOn(0, FADER_BANKS.FLIP, 0);
			encoderPages[mcuActiveEncoderPage].sendAllValuesToVpots();
			encoderPages[VPOT_PAGE.VOLUME].sendAllValuesToFaders();
			break;
		case false:
			isFlipOn = true;
			sendNoteOn(0, FADER_BANKS.FLIP, 127);
			encoderPages[mcuActiveEncoderPage].sendAllValuesToFaders();
			encoderPages[VPOT_PAGE.VOLUME].sendAllValuesToVpots();
			break;
	}
}*/