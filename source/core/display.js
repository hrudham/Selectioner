var Display = Selectioner.Core.Display = function() {};

Display.prototype = new Selectioner.Core.KeyboardReceiver();

Display.prototype.initialize = function(selectioner)
{
	this.selectioner = selectioner;

	this.validateTarget();

	// This selectioner needs to be rendered out.
	this.createDisplay();
	this.createPopup();
};

Display.prototype.createDisplay = function()
{
	var display = this;

	this.render();
	this.update();

	this.element
		.addClass(Selectioner.Settings.cssPrefix + 'display')
		.prop('tabindex', this.selectioner.target.prop('tabindex'));
	
	// Make sure we update when parent forms are reset.
	this.selectioner
		.target
		.closest('form')
		.on
			(
				'reset', 
				function() 
				{
					// Strangely, this small timeout allows for the 
					// reset to be performed, and only then perform
					// the update required.
					setTimeout(function() { display.update(); }, 1);
				}
			);

	// Make sure the display updates any time
	// it's underlying target element changes.
	this.selectioner
		.target
		.on
			(
				'change.selectioner',
				function()
				{
					display.update();
				}
			);
		
	// Find any labels associated with this underlying target
	// element, and make them focus on this display instead.
	var targetId = this.selectioner.target.attr('id');
	if (targetId !== undefined)
	{
		this.labels = $(document)
			.on
				(
					'click.selectioner',
					'label[for="' + targetId + '"]',
					function (event)
					{
						display.element.focus();
					}
				);
	}
};

// Create a new dialog for the underlying target element.
Display.prototype.createPopup = function()
{
	// Bind this display to a popup.
	var dialog = this;
	var popup = this.popup = new Popup();
	popup.initialize(this.selectioner);

	
	var displayElement = this.selectioner
		.display
		.element;

	// Hide or show the pop-up on mouse-down or focus-in.
	this.element
		.on
			(
				'focusin.selectioner',
				function()
				{
					popup.show();
					dialog.getKeyboardFocus();
				}
			)
		.children()
		.andSelf()
		.on
			(
				'mousedown.selectioner',
				function(event)
				{
					event.stopPropagation();
					if (popup.isShown())
					{
						popup.hide();
					}
					else
					{
						popup.show();
					}
				}
			)
		.on
			(
				'focusout',
				function()
				{
					dialog.removeKeyboardFocus();
				}
			);

	// Hide the pop-up whenever it loses focus to an
	// element that is not part of the pop-up or display.
	$(document)
		.on
		(
			'mousedown.selectioner focusin.selectioner',
			function(event)
			{
				if (popup.isShown() &&
					event.target !== displayElement[0] &&
					!$.contains(displayElement[0], event.target) &&
					event.target !== popup.element[0] &&
					!$.contains(popup.element[0], event.target))
				{
					popup.hide();
					popup.removeKeyboardFocus();
				}
			}
		);

	var cssClass = Selectioner.Settings.cssPrefix + 'visible';

	this.selectioner
		.on
			(
				'show.selectioner',
				function()
				{
					displayElement.addClass(cssClass);
				}
			)
		.on
			(
				'hide.selectioner',
				function()
				{
					displayElement.removeClass(cssClass);
				}
			);
};

// Add a dialog to this display.
Display.prototype.addDialog = function(dialog)
{
	// Add the dialog to the popup.
	this.popup.addDialog(dialog);
};

// Render the display. This method should be explicity
// overridden by prototypes that inherit from it,
// and must set this.element to some jQuery object.
Display.prototype.render = function()
{
	throw new Error('The render method needs to be explicity overridden, and must set "this.element" to a jQuery object.');
};

// Update the display. This is called whenever a significant
// change occurs, such as when a new option is selected.
Display.prototype.update = function()
{
	// This method should be explicitly overridden, but
	// it is not required if it will never be updated.
};

// Removes this display element, and restores
// the original elements used to build it.
Display.prototype.remove = function()
{
	this.selectioner
		.target
		.off('.selectioner');

	this.element.add(this.popup.element).remove();
};

Display.prototype.getNoSelectionText = function()
{
	var text = this.selectioner
		.target
		.data('placeholder');

	if (!text)
	{
		text = Selectioner.Settings.noSelectionText;
	}
	
	return text;	
};

Display.prototype.onKeyDown = function(key, event)
{
	// Keyboard integration
	switch(event.which || event.keyCode)
	{
		case 27: // escape
			this.popup.hide();
			break;
		case 38: // up arrow
			event.preventDefault();
			this.popup.hide();
			break;
		case 40: // down arrow
			event.preventDefault();
			this.popup.show();
			this.popup.getKeyboardFocus();
			break;
	}
};