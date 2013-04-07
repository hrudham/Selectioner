var Display = Selectioner.Base.Display = function() {};

Display.prototype = new Eventable();

Display.prototype.initialize = function(select)
{
	this.select = select;
	
	this.render();
	this.update();
	
	this.select
		.css('display', 'none')
		.after(this.element);
	
	var display = this;
	
	// Find any labels associated with this select element,
	// and make them focus on this display instead.
	var selectId = select.attr('id');
	if (selectId !== undefined)
	{
		this.labels = $(document)
			.on
				(
					'click.selectioner',
					'label[for="' + selectId + '"]',
					function (event)
					{
						display.element.focus();
					}
				);
	}
	
	// Make sure the display updates any time 
	// it's underlying select element changes.
	this.select
		.on
			(
				'change.selectioner', 
				function()
				{
					display.update();
				}
			);
	
	// Bind this display to a popup.
	var popup = this.popup = new Selectioner.Base.Popup();
	popup.initialize(this);
	
	// Hide or show the pop-up on mouse-down or focus-in.
	this.element
		.on
		(
			'focusin.selectioner', 
			function() 
			{
				popup.show();
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
					event.target !== popup.display.element[0] &&
					!$.contains(popup.display.element[0], event.target) &&
					event.target !== popup.element[0] &&
					!$.contains(popup.element[0], event.target))
				{
					popup.hide();
				}
			}
		);
		
	// Hide the popup any time the window resizes.
	$(window)
		.on
		(
			'resize.selectioner',
			function()
			{
				popup.hide();
			}
		);

	popup
		.on
			(
				'show.selectioner',
				function()
				{
					display.element.addClass(settings.cssPrefix + 'visible');
				}
			)
		.on
			(
				'hide.selectioner',
				function()
				{
					display.element.removeClass(settings.cssPrefix + 'visible');
				}
			);
};

// Add a dialog to this display.
Display.prototype.addDialog = function(dialog)
{
	// Initialize the dialog in order to associated
	// it with the underlying select element.
	dialog.initialize(this.select);
	
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