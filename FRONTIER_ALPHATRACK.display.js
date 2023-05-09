load("FRONTIER_ALPHATRACK_var.js");

// //////////////////////////////////////////////////// LCD Display ///////
function DisplayPage()
{
	this.textBuffer = [];

	for ( var i = 0; i < TOTAL_DISPLAY_SIZE; i++)
	{
		this.textBuffer[i] = ' ';
	}
}

DisplayPage.prototype.writeToColumnBuffer = function(row, column, text)
{
	var pos = row * DISPLAY_WIDTH + column * COLUMN_WIDTH;

	var forcedText = text.forceLength(COLUMN_WIDTH);

	for ( var i = 0; i < COLUMN_WIDTH; i++)
	{
		this.textBuffer[pos + i] = forcedText[i];
	}
};

DisplayPage.prototype.writeToFullDisplaySizeBuffer = function(row, position, text, len)
{
	var pos = row * DISPLAY_WIDTH + position;
	var forcedText = text.forceLength(len);
	for ( var i = 0; i < len; i++)
	{
		this.textBuffer[pos + i] = forcedText[i];
	}
};

DisplayPage.prototype.sendToLCD = function()
{
	var text = "";

	for ( var i = 0; i < TOTAL_DISPLAY_SIZE; i++)
	{
		text += this.textBuffer[i];
	}
	writeToLCD(0, 0, text, TOTAL_DISPLAY_SIZE);
};
//================================ Core Display ===================================
function setDisplayPage(display_page)
{
	activeDisplayPage = display_page;
	displayPages[display_page].sendToLCD();

}

function writeToColumn(display_page, row, column, text)
{
	if (display_page == mcuActiveDisplayPage)
	{
		writeToLCD(row, 7 * column, text, 7);
	}

	displayPages[display_page].writeToColumnBuffer(row, column, text);
}

function writeToDisplay(display_page, row, position, text, len)
{
	if (display_page == activeDisplayPage)
	{
		writeToLCD(row, position, text, len);
	}

	displayPages[display_page].writeToFullDisplaySizeBuffer(row, position, text, len);
}

function writeToLCD(row, x, text, len)
{
	var pos = row * 16 + x;
	sendSysex(SYSEX_HDR + uint7ToHex(pos) + text.toHex(len) + "f7");
}

//============================= Customs ====================================
function defaultPage()
{
	writeToLCD(0, 0, "    DEFAULT     ", TOTAL_DISPLAY_SIZE);
}
// =========================== Current Page Class ========================== 
function CurrentPage()
{}

CurrentPage.prototype.show = function(page)
{	
	sendNoteOn(0, VPOT_ASSIGN.PAN, VPOT_ASSIGN.PAN_STATE);
	sendNoteOn(0, VPOT_ASSIGN.SEND, VPOT_ASSIGN.SEND_STATE);
	sendNoteOn(0, VPOT_ASSIGN.EQ, VPOT_ASSIGN.EQ_STATE);
	sendNoteOn(0, VPOT_ASSIGN.PLUGIN, VPOT_ASSIGN.PLUGIN_STATE);
	sendNoteOn(0, VPOT_ASSIGN.AUTO, VPOT_ASSIGN.AUTO_STATE);
	switch(page)
	{
		case PAGE.DEFAULT:
			break;
		case PAGE.PAN:
			sendNoteOn(0, VPOT_ASSIGN.PAN, VPOT_ASSIGN.PAN_STATE);
			writeToLCD(0, 0, "  " + transportPosition, DISPLAY_WIDTH);
			writeToLCD(1, 0, "Tmp:" + tempo + " bpm", DISPLAY_WIDTH);
			break;
		case PAGE.SEND:
			sendNoteOn(0, VPOT_ASSIGN.SEND, VPOT_ASSIGN.SEND_STATE);
			writeToLCD(0, 0, "      SEND      ", TOTAL_DISPLAY_SIZE);
			break;
		case PAGE.EQ:
			sendNoteOn(0, VPOT_ASSIGN.EQ, VPOT_ASSIGN.EQ_STATE);
			writeToLCD(0, 0, "      EQ      ", TOTAL_DISPLAY_SIZE);
			break;
		case PAGE.PLUGIN:
			sendNoteOn(0, VPOT_ASSIGN.PLUGIN, VPOT_ASSIGN.PLUGIN_STATE);
			writeToLCD(0, 0, "    PLUGIN    ", TOTAL_DISPLAY_SIZE);
			break;
		case PAGE.AUTO:
			sendNoteOn(0, VPOT_ASSIGN.AUTO, VPOT_ASSIGN.AUTO_STATE);
			writeToLCD(0, 0, "     AUTO     ", TOTAL_DISPLAY_SIZE);
			break;
	}
}
CurrentPage.prototype.update = function(page)
{
	switch(page)
	{
		case PAGE.PAN:
			writeToLCD(0, 0, "  " + transportPosition, DISPLAY_WIDTH);
			break;
	}
}
function setTransportTempoDisplay(tempo)
{
	if (isTempoDisplayActive)
	{
		if (parseInt(tempo) < 100)
		{
			for ( var i = 0; i < 2; i++)
			{
				var singleDigit = Number("0x30") + Number(tempo.slice(i, i + 1));

				sendChannelController(0, 66, 0x20);
				sendChannelController(0, 65 - i, singleDigit);
			}
		}
		else
		{
			for ( var i = 0; i < 3; i++)
			{
				var singleDigit = Number("0x30") + Number(tempo.slice(i, i + 1));
				sendChannelController(0, 66 - i, singleDigit);
			}
		}
	}
}
function setPageDisplay(page)
{
	var singleDigit = Number("0x31") + page;
	sendChannelController(0, 74, singleDigit);
	// for (var i = 0; i < 2; i++)
	// {
	// var singleDigit = Number("0x30") + Number(page.slice(i, i + 1));
	// sendChannelController(0, 76 - i, singleDigit);
	// }
}
function clearLCD()
{
	writeToLCD(0, 0, "                ", DISPLAY_WIDTH);
	writeToLCD(1, 0, "                ", DISPLAY_WIDTH);
}
