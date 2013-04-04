var Display = Selectioner.Base.Display = function() {};

Display.prototype = new Eventable();

Display.prototype.initialize = function(select, dialog)
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
			
	// Initialize the dialog in order to associated
	// it with the underlying select element.
	dialog.initialize(select);
	
	// Bind this display to a popup.
	var popup = new Selectioner.Base.Popup();
	popup.initialize(select, this, dialog);
	
	// Hide or show the pop-up on mouse-down or focus-in.
	this.element
		.on
		(
			'focusin.selectioner', 
			function() 
			{ 
				select.trigger('focusin');
				popup.show();
			}
		)
		.children()
		.on
		(
			'mousedown.selectioner', 
			function(event) 
			{ 
				event.stopPropagation(); 
				select.trigger('mousedown');
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
					display.leave();
				}
			}
		);
		
	// Hide the dialog any time the window resizes.
	$(window)
		.on
		(
			'resize.selectioner',
			function()
			{
				popup.hide();
				display.leave();
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

// Indicates that this control lost focus, so 
// simlulate the <select /> losing focus as well.
Display.prototype.leave = function()
{
	this.select
		.trigger('focusout')
		.trigger('blur');
	this.updateAttributes();
};

Display.prototype.render = function()
{	
	this.element = $('<span />')
		.addClass(settings.cssPrefix + 'display')
		.prop('tabindex', this.select.prop('tabindex'));
		
	this.textElement = $('<span />')
		.addClass(settings.cssPrefix + 'text');
	
	var button = $('<span />').addClass(settings.cssPrefix + 'button');
	
	this.element
		.append(button)
		.append(this.textElement);
};

Display.prototype.updateAttributes = function()
{
	// Classes and data attributes are copied over whenever this updates in case
	// there is some other JS out there updating the <select /> element, 
	// such as in the case of jQuery Validation.
	Selectioner.Utility.copyDataAttributes(this.select, this.element);
	Selectioner.Utility.copyCssClasses(this.select, this.element);
};

Display.prototype.update = function()
{
	this.updateAttributes();

	var selectedOptions = this.select.find('option:selected');
	this.textElement.removeClass('none');
	
	if (selectedOptions.length === 0)
	{
		this.textElement.text('None');
		this.textElement.addClass('none');
	}
	else if (selectedOptions.length <= 2)
	{
		var displayText = '';
		for (var i = 0, length = selectedOptions.length; i < length; i++)
		{
			displayText += selectedOptions[i].text;
			
			if (i < length - 1)
			{
				displayText += ', ';
			}
		}
		this.textElement.text(displayText);
	}
	else
	{
		this.textElement.text('Selected ' + selectedOptions.length + ' of ' + this.select.find('option').length);
	}
};