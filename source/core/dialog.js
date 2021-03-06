define(
	['core/selectioner'],
	function()
	{
		var Dialog = Selectioner.Core.Dialog = function() {};

		Dialog.prototype.initialize = function(selectioner)
		{	
			this.selectioner = selectioner;
			this.validateTarget();
		};

		// Render the dialog. This method should be explicitly 
		// overridden by prototypes that inherit from it, 
		// and must set this.element to some jQuery object.
		Dialog.prototype.render = function()
		{
			throw new Error('The render method needs to be explicitly overridden, and must set "this.element" to a jQuery object.');
		};

		// Associates a dialog with a pop-up.
		Dialog.prototype.setPopup = function(popup)
		{
			this.popup = popup;
		};

		// Update the dialog. This is called whenever a significant
		// change occurs, such as when a new option is selected,
		// or the pop-up is displayed.
		Dialog.prototype.update = function()
		{
			// This method should be explicitly overridden, but
			// it is not required if it will never be updated.
		};

		Dialog.prototype.validateTarget = function()
		{
			// This method should be overwritten to validate the expected target of a dialog.
			// If an invalid target element is found, descriptive errors should be thrown.
			// This may be ignored if no validation is required.
		};

		// Override this method to allow for keyboard integration.
		// The method itself can be called manually, although this 
		// is generally not recommended, as this is usually 
		// handled by the pop-up. 
		Dialog.prototype.keyDown = function(simpleEvent)
		{
			var result = { handled: false };
			
			// Escape
			if (simpleEvent.key == 27)
			{
				this.popup.hide();
				simpleEvent.preventDefault();
				result.handled = true;
			}
			
			return result;
		};

		// Override this method to allow for keyboard integration.
		// The method itself can be called manually, although this 
		// is generally not recommended, as this is usually 
		// handled by the pop-up. 
		Dialog.prototype.keyPress = function(simpleEvent)
		{					
			return { handled: false };
		};

		// This will fire every time the dialog loses mouse or keyboard 
		// focus within the keyboard focus within the pop-up.
		Dialog.prototype.lostFocus = function()
		{
		};
	});