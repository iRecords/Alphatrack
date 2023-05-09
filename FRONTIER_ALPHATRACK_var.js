var STATUS = {
	ON : 127,
	OFF : 0
}

var CHANNEL_BUTTON = {
	ARM0 : 0,
	SOLO0 : 8,
	MUTE0 : 16
};

var PAGE = {
	DEFAULT : 99,
	PAN : 0,
	SEND : 1,
	EQ : 2,
	PLUGIN : 3,
	AUTO : 4	
};

var DISPLAY_PAGES =
{
	NAME_AND_VOLUME : 0,
	NAME_AND_PAN : 1,
	DEVICE_PARAMETERS : 2,
	DEVICE_PRESETS : 3,
	NAME_AND_SEND0 : 4,
	NAME_AND_SEND1 : 5,
	NAME_AND_SEND2 : 6,
	NAME_AND_SEND3 : 7,
	NAME_AND_SEND4 : 8
};

var VPOT_PAGE = {
	DEFAULT : 0,
	PAN : 1,
	SEND0 : 4,
	SEND1 : 5,
	VOLUME : 10
};

var VPOT_ASSIGN =
{
	PAN	 : 42,
	PAN_STATE : 127,
	SEND : 41,
	SEND_STATE : 0,
	EQ : 44,
	EQ_STATE : 0,
	PLUGIN: 43,
	PLUGIN_STATE : 0,
	AUTO : 74,
	AUTO_STATE : 0
};

var FADER_BANKS =
{
	FLIP : 50
};

var TRANSPORT = {
	REW : 91,
	FF : 92,
	STOP : 93,
	PLAY : 94,
	RECORD : 95,
	CYCLE : 86,
	ANYSOLO : 115,
	TRACKL : 87,
	TRACKR : 88
};

var AUTOMATION =
{
	READ : 74,
	WRITE : 75,
};

var FUNCTION = {
	F1 : 54,
	F2 : 55,
	F3 : 56,
	F4 : 57
};

var MODIFIER = {
	SHIFT : 70
};

var VPOT_KNOBS = {
	VPOT0 : 16,
	VPOT_CLICK0 : 32,
	VPOT_TOUCH0 : 120,
	VPOT1 : 17,
	VPOT_CLICK1 : 33,
	VPOT_TOUCH1 : 121,
	VPOT2 : 18,
	VPOT_CLICK2 : 34,
	VPOT_TOUCH2 : 122,
};

var FADER = {
	TOUCH0 : 104
};

var ENCODER_RESOLUTION =
{
	SEND_STD	: 30,
	SEND_FINE	: 100,
	PAN_STD		: 80,
	PAN_FINE	: 2000
};

var DISPLAY_WIDTH = 16;
var COLUMN_WIDTH = 8;
var TOTAL_DISPLAY_SIZE = DISPLAY_WIDTH * 2;

var track					= 0;
var currentTrack 			= 0;
var previousTrackSelect 	= 24;
var isFlipOn 				= false;
var maxNumChannels			= 200;
var maxTracks;
var buttonTrigger			= false;
var arrAutomationOn;
var isShiftPressed = false;
var isResetPressed = false;
var selectedmode;
var currentVolume;
var currentPan;
var currentSend1 = 0;
var currentSend2 = 0;
var isFaderTouched;
var isVPOT0Touched;
var isVPOT1Touched;
var isVPOT2Touched;
var numSendPages = 8;
var tempo;
var transportPosition;

var NATIVE_MODE = "f0 00 01 40 20 01 00 f7";
var SYSEX_HDR   = "f0 00 01 40 20 00";