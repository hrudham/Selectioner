var Display = Selectioner.Base.Display = function() {};

Display.prototype = new Eventable();

Display.prototype.initialize = function(select)
{
	this.select = select;
		
	if (select.attr('data-' + Selectioner.Settings.isSelectionerDataAttributeName))
	{
		// This is an existing selectioner.
	}
	else
	{
		// This selectioner needs to be rendered out.
		this.createDisplay();
		this.createPopup();
		
		select
			.attr('data-' + Selectioner.Settings.isSelectionerDataAttributeName, true)
			.data('selectioner', { display: this })
			.after(this.element);
	}
};

Display.prototype.createDisplay = function()
{
	var display = this;

	this.render();
	this.update();
	
	this.element
		.addClass(Selectioner.Settings.cssPrefix + 'display')
		.prop('tabindex', this.select.prop('tabindex'));
		
	// Find any labels associated with this select element,
	// and make them focus on this display instead.
	var selectId = this.select.attr('id');
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
	}
};

// Create a new dialog for this <select /> element.
Display.prototype.createPopup = function()
{		
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

	var cssClass = Selectioner.Settings.cssPrefix + 'visible';
		
	popup
		.on
			(
				'show.selectioner',
				function()
				{
					popup.display.element.addClass(cssClass);
				}
			)
		.on
			(
				'hide.selectioner',
				function()
				{
					popup.display.element.removeClass(cssClass);
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

// Removes this display element, and restores 
// the original elements used to build it.
Display.prototype.remove = function()
{
	this.select.removeAttr('data-' + Selectioner.Settings.isSelectionerDataAttributeName);
	this.element.add(this.popup.element).remove();
};