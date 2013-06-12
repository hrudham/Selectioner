// this provides some basic keyboard integration. Since non-input 
// elements without a tab-index attribute do not trigger key-related
// events, we catch them on the document level and then feed them
// down to any currently visible or focused selectioners.
var keyboardReceiver = Selectioner.Core.KeyboardReceiver = function() { };

keyboardReceiver.prototype.onKeyDown = function(key, event)
{
	// This method should typically be overridden by 
	// the prototypes that inherit from this prototype.
};

keyboardReceiver.prototype.getKeyboardFocus = function()
{
	keyboardReceiver._currentReceiver = this;
};

keyboardReceiver.prototype.removeKeyboardFocus = function()
{
	if (keyboardReceiver._currentReceiver === this)
	{
		keyboardReceiver._currentReceiver = null;
	}
};

$(document)
	.off('keydown.selectioner')
	.on
	(
		'keydown.selectioner',
		function(event)
		{
			if (keyboardReceiver._currentReceiver)
			{
				keyboardReceiver._currentReceiver.onKeyDown
					(
						event.which || event.keyCode,
						event
					);
			}
		}
	);

