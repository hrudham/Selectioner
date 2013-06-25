/*!
 * Copyright 2013 Hilton Rudham
 * Released under the MIT license
 * https://github.com/hrudham/Selectioner/blob/master/LICENSE
 */
 
 /* 
	jshint strict: true
	jslint vars: true 
	global Selectioner, window, document, jQuery 
*/

 /* jshint scripturl: true */
(function ($)
{
	'use strict';
var Eventable = function () { };
    
Eventable.prototype.on = function (name, handler, context)
{
    var names = name.split(' ');
    if (names.length > 1)
    {
        // Bind a set of space separated events to a single 
        // event handler recursively.
        names.forEach
            (
                function (item, index, array)
                {
                    this.on(item, handler, context);
                },
                this
            );
    }
    else
    {
        // Bind a single event to an event handler.
        if (!this._eventHandlers) this._eventHandlers = {};
        if (!this._eventHandlers[name]) this._eventHandlers[name] = [];

        this._eventHandlers[name].push
            ({
                handler: handler,
                context: context ? context : this
            });
    }

    return this;
};

Eventable.prototype.off = function (name, handler)
{
    if (!this._eventHandlers) return this;

    // Function that unbinds any occurances of an event handler from an event.
    var unbindEventHandler = function (eventName, eventHandler)
    {
        for (var i = 0, length = this._eventHandlers[eventName].length; i < length; i++)
        {
            if (this._eventHandlers[eventName][i].handler == eventHandler)
            {
                this._eventHandlers[eventName].splice(i, 1);
            }
        }
    };

    if (!name)
    {
        // Unbind all events from this object.
        delete this._eventHandlers;
    }
    else if (name && !handler)
    {
        if (typeof name != 'function')
        {
            // Name is the name of an event that needs to 
            // have all it's handlers be unbound.
            if (!this._eventHandlers[name]) return this;

            // Setting an Arrays length to zero empties it.
            this._eventHandlers[name].length = 0; 
        }
        else
        {
            // Name is a function, and is therefore the handler 
            // being unbound for events its associated with.
            var eventHandler = name;
            for (var eventName in this._eventHandlers)
            {
                unbindEventHandler.call(this, eventName, eventHandler);
            }
        }
    }
    else
    {
        // Unbind an event handler associated with this event.
        if (!this._eventHandlers[name]) return this;

        unbindEventHandler.call(this, name, handler);
    }

    return this;
};


// Triggers an event, passing through data as an optional parameter.
Eventable.prototype.trigger = function (name, data)
{
    if (!this._eventHandlers) return;

    var eventHandlers = this._eventHandlers[name];
    if (eventHandlers)
    {
        var target = this;
		for (var i = 0, length = eventHandlers.length; i < length; i++)
		{
			var eventHandler = eventHandlers[i];
			eventHandler.handler.call
				(
					eventHandler.context,
					{
						target: target,
						name: name,
						data: data
					}
				);
		}
    }

    return this;
};
var Selectioner = window.Selectioner = function(target, display, dialogs)
{
	// Convert dialogs to an array if it isn't one already.
	if (!(dialogs instanceof Array))
	{
		dialogs = [ dialogs ];
	}

	// Associate the underlying target element, display and dialog with this selectioner object.
	this.target = target = $(target);
	this.display = display;
	this.dialogs = dialogs;

	if (target.data('selectioner'))
	{
		// This occurs if we attempt to provide more than one Selectioner on a single element.
		throw new Error('The target element has already has a Selectioner associated with it.');
	}
	else if (target.next().hasClass(Selectioner.Settings.cssPrefix + 'display'))
	{
		// Remove any old Displays that may already have been rendered.
		// This can occur if someone saves a webpage as-is to their PC, 
		// and then opens it in their browser from their file-system.
		// This will unfortunately break for any control that "steals" 
		// elements from elsewhere on the page, such as the ComboBox,
		// but at least it won't be rendered twice.
		target.next().remove();
	}	

	// Initialize the display;
	display.initialize(this);

	// Add each dialog to the display.
	for (var i = 0, length = dialogs.length; i < length; i++)
	{
		display.addDialog(dialogs[i]);
	}

	// Store a reference to the selectioner object on the underlying 
	// target element, and render the display element after it.
	target
		.data('selectioner', this)
		.css('display', 'none')
		.after(this.display.element);
};

Selectioner.prototype = new Eventable();

Selectioner.Core = {};

Selectioner.Dialog = {};

Selectioner.Display = {};

Selectioner.Extensions = {};

Selectioner.Popup = {};

Selectioner.Settings =
{
	cssPrefix: 'select-',
	noSelectionText: 'Select an option',
	emptyOptionText: 'None',
	maxAutoCompleteItems: 5
};
var Popup = function() {};

Popup.prototype.initialize = function(selectioner)
{
	var popup = this;

	this.selectioner = selectioner;
	this.dialogs = [];

	this.element = $('<div />')
		.addClass(Selectioner.Settings.cssPrefix + 'popup')
		.css
			({
				visibility: 'hidden',
				position: 'absolute',
				zIndex: '-1'
			})
		.on
			(
				'mousedown focusin',
				function(event)
				{
					// The selectioner watches for mouse-down / focusin events outside of 
					// itself in order to know when to close. Sometimes, however, these
					// event will occur insides the popup and cause a re-render,
					// and thus the element that caused the event no longer exists.
					// This means we cannot determine if it exists inside or outside
					// the popup. Thus, we stop propagation of these events here.
					event.stopPropagation();
				}
			);

	this.update();
	
	// If the contents of the pop-up changes while the 
	// pop-up is actually displayed, then make sure it 
	// updates as expected. This is useful when loading
	// up information via AJAX, for example.
	this.selectioner
		.target
		.on
		(
			'change',
			function(event, data)
			{
				if (!data || data.source !== 'selectioner')
				{
					if (popup.isShown())
					{
						popup.update();
						popup.reposition();
					}
				}
			}
		);
			
	$('body').append(this.element);
};

// Add a dialog to this popup.
Popup.prototype.addDialog = function(dialog)
{
	// Initialize the dialog in order to associated
	// it with the underlying target element.
	var dialogElement;
	
	if (!(dialog instanceof Selectioner.Core.Dialog))
	{
		// This is a static dialog in the form of a CSS selector or vanilla HTML.
		// An example could be buttons added at the end of dialog.
		// We basically wrap this up as a very simple, vanilla dialog.
		var staticDialog = new Selectioner.Core.Dialog();
		var element = $(dialog);
		staticDialog.render = function()
		{
			this.element = element;
		};
		
		dialog = staticDialog;
	}
		
	dialog.initialize(this.selectioner);
	dialog.setPopup(this);
	dialog.render();
	dialogElement = dialog.element;
		
	this.element.append(dialogElement);
	
	this.dialogs.push(dialog);
};

// Update all the dialogs that appear on this popup.
Popup.prototype.update = function()
{
	for (var i = 0, length = this.dialogs.length; i < length; i++)
	{
		this.dialogs[i].update();
	}
};

// Refresh the position of the pop-up
// relative to it's display element.
Popup.prototype.reposition = function()
{
	var displayElement = this.selectioner.display.element;
	var offset = displayElement.offset();
	var borderWidth = this.element.outerWidth(false) - this.element.width();
	var width = displayElement.outerWidth(false) - borderWidth;
	var top = displayElement.outerHeight(false) + offset.top;

	var scrollTop = $(window).scrollTop();
	var popUpHeight = this.element.outerHeight(true);

	this.element
		.removeClass('below')
		.removeClass('above')
		.removeClass('over');

	// If this popup would appear off-screen if below
	// the display, then make it appear above it instead.
	if ($(window).height() + scrollTop < top + popUpHeight)
	{
		top = offset.top - popUpHeight + 1;

		if (top < scrollTop)
		{
			top = scrollTop;
			this.element.addClass('over');
		}
		else
		{
			this.element.addClass('above');
		}
	}
	else
	{
		this.element.addClass('below');
	}
	
	this.element.css
	({
		width: width + 'px',
		left: offset.left + 'px',
		top: top + 'px'
	});
};

// Shows the pop-up.
Popup.prototype.show = function()
{
	if (!this.selectioner.display.isDisabled() && 
		!this.selectioner.display.isReadOnly() && 
		!this.isShown())
	{
		// Hide the popup any time the window resizes.
		var popup = this;
		$(window)
			.one
			(
				'resize.selectioner',
				function()
				{
					popup.hide();
				}
			);

		if (!this.isShown())
		{
			this._isVisible = true;
			this.update();
			
			var popUpHeight = this.element.height();
			
			this.reposition();
			
			this.element.css({ visibility: 'visible', zIndex: '' });
			
			if (popUpHeight != this.element.height())
			{
				// Height can often only be calculated by jQuery after the 
				// element is visible on the page. If our CSS happens to change
				// the height of the pop-up because of this, reposition it again.
				this.reposition();
			}
			
			if (this.element.hasClass('above'))
			{
				this.previous();
			}
			else
			{
				this.next();
			}
						
			this.selectioner.trigger('show.selectioner');
		}
	}
};

// Simply hides the pop-up.
Popup.prototype.hide = function()
{
	$(window).off('resize.selectioner');

	if (this.isShown())
	{
		this._isVisible = false;
		this.element.css({ visibility: 'hidden', zIndex: '-1' });
		this.selectioner.trigger('hide.selectioner');
	}
};

// Simply indicates whether the popup is shown to the user currently.
Popup.prototype.isShown = function()
{
	return this._isVisible;
};

Popup.prototype.next = function()
{
	var canMove = false;
	
	if (!this.currentDialogIndex)
	{
		this.currentDialogIndex = 0;
	}
		
	while (!canMove)
	{
		canMove = this.dialogs[this.currentDialogIndex].next();
		
		if (!canMove)
		{
			if (this.currentDialogIndex < this.dialogs.length - 1)
			{
				this.currentDialogIndex++;
			}
			else
			{				
				return false;
			}
		}
	}
	
	return true;
};

Popup.prototype.previous = function()
{
	var canMove = false;
	
	if (!this.currentDialogIndex)
	{
		this.currentDialogIndex = this.dialogs.length - 1;
	}
		
	while (!canMove)
	{
		canMove = this.dialogs[this.currentDialogIndex].previous();
		
		if (!canMove)
		{
			if (this.currentDialogIndex > 0)
			{
				this.currentDialogIndex--;
			}
			else
			{				
				return false;
			}
		}
	}
	
	return true;
};

Popup.prototype.select = function()
{
	if (!this.currentDialogIndex)
	{
		this.currentDialogIndex = this.dialogs.length - 1;
	}
	
	this.dialogs[this.currentDialogIndex].select();
};

Popup.prototype.onKeyDown = function(key, event)
{
	// Keyboard integration
	if (this.isShown() && event.target === this.selectioner.display.element[0])
	{
		switch(key)
		{
			// Escape
			case 27:
				this.hide();
				break;
				
			// Up arrow
			case 38: 
				event.preventDefault();
				this.previous();
				break;
				
			// Down arrow
			case 40: 
				event.preventDefault();
				this.next();			
				break;
				
			// Space
			case 32:
			// Enter / Return
			case 13:
				event.preventDefault();
				this.select();
				break;
		}
	}
};
var Display = Selectioner.Core.Display = function() {};

Display.prototype.initialize = function(selectioner)
{
	this.selectioner = selectioner;

	this.validateTarget();

	// This selectioner needs to be rendered out.
	this.createDisplay();
	this.createPopup();
};

Display.prototype.updateInteractivity = function()
{
	var isDisabled = this.isDisabled();

	if (isDisabled)
	{
		this.element.removeAttr('tabindex');		
	}
	else
	{
		this.element
			.prop
				(
					'tabindex', 
					this.selectioner.target.prop('tabindex')
				);
	}
	
	this.element.toggleClass('disabled', isDisabled);
	this.element.toggleClass('readonly', this.isReadOnly());
};

Display.prototype.isReadOnly = function()
{
	return false;
};

Display.prototype.isDisabled = function()
{
	return this.selectioner.target.is('[disabled]');
};

Display.prototype.createDisplay = function()
{
	var display = this;

	this.render();
	this.update();

	this.element
		.addClass(Selectioner.Settings.cssPrefix + 'display');
	
	this.updateInteractivity();
			
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
	
	// Watch for keydown events.
	this.element.on
		(
			'keydown.selectioner',
			function(event)
			{
				display.onKeyDown
					(
						event.which || event.keyCode,
						event
					);
			}
		);
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
					event.target !== displayElement[0] &&
					!$.contains(displayElement[0], event.target) &&
					event.target !== popup.element[0] &&
					!$.contains(popup.element[0], event.target))
				{
					popup.hide();
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
	// Only perform keyboard-related actions if they are directly 
	// related to the display, and not a child element thereof.
	if (event.target == this.element[0])
	{
		if (this.popup.isShown())
		{
			this.popup.onKeyDown(key, event);
		}
		else
		{
			switch(key)
			{
				case 38: // Up arrow
				case 40: // Down arrow
				case 13: // Return / Enter
					this.popup.show();
					break;
			}
		}
	}
	else if (key === 27) 
	{
		// Escape key was pressed.
		this.element.focus();
	}
};
var Dialog = Selectioner.Core.Dialog = function() {};

Dialog.prototype.initialize = function(selectioner)
{	
	this.selectioner = selectioner;
	this.validateTarget();
};

// Render the dialog. This method should be explicity 
// overridden by prototypes that inherit from it, 
// and must set this.element to some jQuery object.
Dialog.prototype.render = function()
{
	throw new Error('The render method needs to be explicity overridden, and must set "this.element" to a jQuery object.');
};

// Associates a dialog with a popup.
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

// In the case where a dialog displays a collection of child items,
// override this method in order to move to the next item. Return
// true if moving to the item was successful, and false if not.
Dialog.prototype.next = function()
{
	return false;
};

// In the case where a dialog displays a collection of child items,
// override this method in order to move to the previous item. Return
// true if moving to the item was successful, and false if not.
Dialog.prototype.previous = function()
{
	return false;
};

// Override this to select the currently highlighted option.
Dialog.prototype.select = function()
{
};
var ListBox = Selectioner.Display.ListBox = function() {};

ListBox.prototype = new Selectioner.Core.Display();

ListBox.prototype.validateTarget = function()
{
	if (!this.selectioner.target.is('select'))
	{
		throw new Error('ListBox expects it\'s underlying target element to to be a <select /> element');
	}
};

ListBox.prototype.render = function()
{
	var display = this;
	
	this.element = $('<span />');
		
	this.textElement = $('<span />')
		.addClass(Selectioner.Settings.cssPrefix + 'text');
	
	var button = $('<span />').addClass(Selectioner.Settings.cssPrefix + 'button');
			
	this.element
		.append(button)
		.append(this.textElement);
};

ListBox.prototype.update = function()
{
	var selectedOptions = this.selectioner.target.find('option:selected');
	this.textElement.removeClass('none');
	
	if (selectedOptions.length === 0 || selectedOptions.is('option[value=""], option:empty:not([value])'))
	{
		var text = this.getNoSelectionText();
		
		if (!text)
		{
			this.textElement.html('&nbsp;');
		}
		else
		{
			this.textElement.text(text);
		}
		
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
		this.textElement.text('Selected ' + selectedOptions.length + ' of ' + this.selectioner.target.find('option').length);
	}
};
var ComboBox = Selectioner.Display.ComboBox = function() {};

ComboBox.prototype = new Selectioner.Core.Display();

ComboBox.prototype.validateTarget = function()
{
	if (!this.selectioner.target.is('select:not([multiple])'))
	{
		throw new Error('ComboBox expects it\'s underlying target element to to be a <select /> element without a "multiple" attribute');
	}
};
	
ComboBox.prototype.render = function()
{
	this.textElement = this.selectioner.target.next();
	
	if (!this.textElement.is('input[type="text"]'))
	{
		throw new Error('ComboBox expects the element to follow it\'s target <select /> to be an <input type="text" />');
	}
	
	var noSelectionText = this.getNoSelectionText();
	
	if (noSelectionText !== null)
	{
		this.textElement.attr('placeholder', this.getNoSelectionText());
	}
		
	// Turn off auto-completion on the text box.
	this.textElement.attr('autocomplete', 'off');

	// Make sure we have an empty option, otherwise throw an error.
	var emptyOptions = this.getEmptyOptions();
	if (emptyOptions.length === 0)
	{
		// We require an <option></option> element in the underlying select.
		throw new Error('ComboBox elements require an empty and value-less <option></option> in their underlying <select /> elements.');
	}

	this.element = $('<span />');
		
	var comboBox = this;
		
	this.textElement
		.addClass(Selectioner.Settings.cssPrefix + 'text')
		.on('change.selectioner', function() { comboBox.textChanged(); });
	
	var button = $('<span />')
		.addClass(Selectioner.Settings.cssPrefix + 'button');
		
	this.selectioner.on
		(
			'show.selectioner',
			function()
			{
				comboBox.element.one
					(
						'focusin.selectioner', 
						function()
						{
							comboBox.textElement.select();
						}
					);
			}
		);
		
	if (this.selectioner.isDisabled)
	{
		this.element.addClass('disabled');
		this.textElement.prop('disabled', true);
	}
	
	this.element
		.append(button)
		.append(this.textElement);
};

ComboBox.prototype.textChanged = function()
{
	// Find out if the text matches an item in 
	// the drop-down, and select it if it does.
	// If it doesn't match an option, select the 
	// option with no value.
	var text = this.textElement.val().toUpperCase();
	var option = this.selectioner.target.find('option')
		.filter(function() { return $(this).text().toUpperCase() == text; });
	
	if (option.length != 1)
	{
		option = this.getEmptyOptions();
	}
	
	option[0].selected = true;
	this.selectioner.target.trigger('change');
};

ComboBox.prototype.update = function()
{
	var selectedOption = this.selectioner.target.find('option:selected');
	this.textElement.removeClass('none');
		
	var value = selectedOption.text();
		
	if (selectedOption.length === 0)
	{
		this.textElement.addClass('none');
	}
	else if (value !== '')
	{
		this.textElement.val(value);
	}
};

ComboBox.prototype.getEmptyOptions = function()
{
	// Find all options that either have an 
	// empty value, or have no value and no text.
	return this.selectioner
		.target
		.find('option[value=""], option:empty:not([value])');
};

ComboBox.prototype.remove = function()
{
	this.selectioner
		.target
		.after(this.textElement);
		
	Selectioner.Core.Display.prototype.remove.call(this);
};

Display.prototype.getNoSelectionText = function()
{
	var text = this.selectioner
		.target
		.data('placeholder');
		
	if (!text)
	{
		text = this.textElement.attr('placeholder');
	}

	if (!text)
	{
		text = Selectioner.Settings.noSelectionText;
	}
	
	return text;	
};
var DateBox = Selectioner.Display.DateBox = function() {};

DateBox.prototype = new Selectioner.Core.Display();

DateBox.prototype.validateTarget = function()
{
	if (!this.selectioner.target.is('input[type="date"]'))
	{
		throw new Error('DateBox expects it\'s underlying target element to to be a <input type="date" /> element');
	}
};

DateBox.prototype.isReadOnly = function()
{
	return this.selectioner.target.is('[readonly]');
};

DateBox.prototype.render = function()
{
	this.element = $('<span />');
		
	this.textElement = $('<span />')
		.addClass(Selectioner.Settings.cssPrefix + 'text');
	
	var button = $('<span />').addClass(Selectioner.Settings.cssPrefix + 'button');
	
	this.element
		.append(button)
		.append(this.textElement);
};

DateBox.prototype.update = function()
{
	var dateValue = this.selectioner.target.val();

	if (dateValue !== '')
	{
		var datePart = dateValue.match(/(\d+)/g);
		var date = new Date(datePart[0], datePart[1] - 1, datePart[2]); // months are zero-based
		var dateText = this.getDateText(date);
		
		this.textElement
			.removeClass('none')
			.text(dateText);
	}
	else
	{
		this.textElement
			.addClass('none')
			.text(this.selectioner.target.attr('placeholder') || 'Select a date');
	}
};

// Obtains the the string representation of the date provided.
DateBox.prototype.getDateText = function(date)
{
	var day = date.getDate().toString();
	var month = (date.getMonth() + 1).toString();
	var year = date.getFullYear().toString();
	
	if (day.length == 1)
	{
		day = '0' + day;
	}
	
	if (month.length == 1)
	{
		month = '0' + month;
	}
	
	return year + '-' + month + '-' + day;
};
var SingleSelect = Selectioner.Dialog.SingleSelect = function() {};

SingleSelect.prototype = new Selectioner.Core.Dialog();

SingleSelect.prototype.validateTarget = function()
{
	if (!this.selectioner.target.is('select:not([multiple])'))
	{
		throw new Error('SingleSelect expects it\'s underlying target element to to be a <select /> element without a "multiple" attribute');
	}
};

SingleSelect.prototype.render = function()
{
	this.element = $('<ul />');
	
	var dialog = this;
	
	var element = this.element
		.on
			(
				'mouseenter',
				'li',
				function(event)
				{
					var target = dialog.getSelectableOptions().filter(this);
					if (target.length > 0 && !target.hasClass('current'))
					{
						element.find('li').removeClass('current');
						target.addClass('current');
					}
				}
			);
};

SingleSelect.prototype.update = function()
{
	this.element.empty();

	var children = this.selectioner.target.children();
	
	for (var i = 0, length = children.length; i < length; i++)
	{
		var child = $(children[i]);
		if (children[i].tagName == 'OPTION')
		{
			this.element.append(this.renderOption(child));
		}
		else if (children[i].tagName == 'OPTGROUP')
		{
			this.element.append(this.renderGroup(child));
		}
	}
};

// Render an the equivilant control that represents an 
// <option /> element for the underlying <select /> element. 
SingleSelect.prototype.renderOption = function(option)
{
	var dialog = this;

	var text = option.text();
	
	var selectElement;
	
	if (option.is(':disabled'))
	{
		selectElement = $('<span />')
			.addClass('disabled')
			.text(text || Selectioner.Settings.emptyOptionText);
	}
	else
	{
		selectElement = $('<a />')
			.attr('href', 'javascript:;')
			.on('click', function(){ dialog.selectOption(option); })
			.text(text || Selectioner.Settings.emptyOptionText);
	}
	
	var listItem = $('<li />');
	
	var value = option.val();
	if (value === null || value === '')
	{
		listItem.addClass('none');
	}

	return listItem.append(selectElement);
};

// This will select the option specified, hide the pop-up,
// and trigger the "change" event on the underlying element.
SingleSelect.prototype.selectOption = function(option)
{
	option[0].selected = true;
	this.popup.hide();
	this.selectioner.target.trigger('change', { source: 'selectioner' });
};

// Render an the equivilant control that represents an 
// <optgroup /> element for the underlying <select /> element. 
SingleSelect.prototype.renderGroup = function(group)
{		
	var groupTitle = $('<span />')
			.text(group.attr('label'));

	var options = $('<li />')
		.addClass(Selectioner.Settings.cssPrefix + 'group-title')
		.append(groupTitle);
	
	var children = group.children();
	for (var i = 0, length = children.length; i < length; i++)
	{
		var child = $(children[i]);
		options = options.add(this.renderOption(child));
	}
	
	var groupElement = $('<li />').append
		(
			$('<ul >').append(options)
		);

	return groupElement;
};

SingleSelect.prototype.getSelectableOptions = function()
{
	return this.element
		.find('li')
		.filter
			(
				function()
				{ 
					return $(this)
						.children('a,input,label')
						.filter(':not(.disabled,[disabled])').length > 0; 
				}
			);
};

SingleSelect.prototype.next = function()
{
	var items = this.getSelectableOptions();
	
	if (items.filter('.current').length === 0)
	{
		items.first().addClass('current');
		return true;
	}
	else
	{
		for (var i = 0, length = items.length; i < length; i++)
		{
			var item = $(items[i]);
			
			if (item.hasClass('current'))
			{
				if (i < length - 1)
				{
					item.removeClass('current');
					var currentItem = $(items[i + 1]).addClass('current');
					
					var maxScrollTop = currentItem.position().top + currentItem.height();
					var height = this.popup.element.height();
											
					if (maxScrollTop > height)
					{
						this.popup.element.scrollTop(this.popup.element.scrollTop() + maxScrollTop - height);
					}
					
					return true;
				}
				
				return false;
			}
		}
	}
};

SingleSelect.prototype.previous = function()
{
	var items = this.getSelectableOptions();
	
	if (items.filter('.current').length === 0)
	{
		items.last().addClass('current');
		return true;
	}
	else
	{
		for (var i = 0, length = items.length; i < length; i++)
		{
			var item = $(items[i]);
			
			if (item.hasClass('current'))
			{
				if (i > 0)
				{
					item.removeClass('current');
					var currentItem = $(items[i - 1]).addClass('current');
					
					var minScrollTop = currentItem.position().top;
										
					if (minScrollTop < 0)
					{
						this.popup.element.scrollTop(this.popup.element.scrollTop() + minScrollTop);
					}
					
					return true;
				}
				
				return false;
			}
		}
	}
};

SingleSelect.prototype.select = function()
{
	var selectedItem = this.getSelectableOptions()
		.filter('.current')
		.find('a,label')
		.trigger('click');
};
var MultiSelect = Selectioner.Dialog.MultiSelect = function() {};

MultiSelect._inputIdIndex = 0;

// Inherit from the SingleSelect dialog, not the core dialog.
MultiSelect.prototype = new Selectioner.Dialog.SingleSelect();

MultiSelect.prototype.validateTarget = function()
{
	if (!this.selectioner.target.is('select[multiple]'))
	{
		throw new Error('MultiSelect expects it\'s underlying target element to to be a <select /> element with a "multiple" attribute');
	}
};

// Render an the equivilant control that represents an
// <option /> element for the underlying <select /> element. 
// This overrides the SingleSelect version of this method.
MultiSelect.prototype.renderOption = function(option)
{
	var element = $('<li />');
	var checkboxId = 'MultiSelectCheckbox' + MultiSelect._inputIdIndex++;
	var checkbox = $('<input type="checkbox" />')
		.data('option', option)
		.attr('id', checkboxId);
					
	if (option[0].selected)
	{
		checkbox.attr('checked', 'checked');
	}
	
	var label = $('<label />')
		.append(checkbox)
		.append($('<span />').text(option.text()))
		.attr('for', checkboxId);
		
	var selectioner = this.selectioner;
		
	checkbox.on
		(
			'change.selectioner', 
			function() 
			{
				option[0].selected = this.checked;
				selectioner.target.trigger('change', { source: 'selectioner' });
			}
		);
		
	if (option.is(':disabled'))
	{
		label.addClass('disabled');
		checkbox.prop('disabled', true);
	}
		
	element.append(label);

	return element;
};

// Render an the equivilant control that represents an 
// <optgroup /> element for the underlying <select /> element. 
// This overrides the SingleSelect version of this method.
MultiSelect.prototype.renderGroup = function(group)
{
	var dialog = this;
	
	var toggleGroupSelect = function(event)
	{
		var checkboxes = $(this).closest('ul').find('input:checkbox:not(:disabled)');
		var checkedCount = checkboxes.filter(':checked').length;
		
		checkboxes
			.prop('checked', checkedCount != checkboxes.length || checkedCount === 0)
			.each
				(
					function()
					{
						$(this).data('option')[0].selected = this.checked;
					}
				);
		
		dialog.selectioner.target.trigger('change', { source: 'selectioner' });
	};
	
	var groupTitle = $('<a />')
			.attr('href', 'javascript:;')
			.on('click', toggleGroupSelect)
			.text(group.attr('label'));

	var options = $('<li />')
		.addClass(Selectioner.Settings.cssPrefix + 'group-title')
		.append(groupTitle);
	
	var children = group.children();
	for (var i = 0, length = children.length; i < length; i++)
	{
		var child = $(children[i]);
		options = options.add(this.renderOption(child));
	}

	var groupElement = $('<li />').append
		(
			$('<ul >').append(options)
		);
	
	return groupElement;
};
var ComboSelect = Selectioner.Dialog.ComboSelect = function() {};

ComboSelect.prototype = new Selectioner.Dialog.SingleSelect();

ComboSelect.prototype.validateTarget = function()
{
	if (!this.selectioner.target.is('select:not([multiple])'))
	{
		throw new Error('ComboSelect expects it\'s underlying target element to to be a <select /> element without a "multiple" attribute');
	}
};

// Render an the equivilant control that represents an 
// <option /> element for the underlying <select /> element. 
ComboSelect.prototype.renderOption = function(option)
{
	if (!option.is('option[value=""], option:empty:not([value])'))
	{
		return Selectioner.Dialog.SingleSelect.prototype.renderOption.call(this, option);
	}
	
	return null;
};
var AutoComplete = Selectioner.Dialog.AutoComplete = function() {};

AutoComplete.prototype = new Selectioner.Dialog.SingleSelect();

AutoComplete.prototype.validateTarget = function()
{
	if (!this.selectioner.target.is('select:not([multiple])'))
	{
		throw new Error('ComboSelect expects it\'s underlying target element to to be a <select /> element without a "multiple" attribute');
	}
};

// Render an the equivilant control that represents an 
// <option /> element for the underlying <select /> element. 
AutoComplete.prototype.render = function()
{
	SingleSelect.prototype.render.apply(this, arguments);

	this.textElement = this
		.selectioner
		.display
		.element
		.find('input[type="text"]');
	
	if (this.textElement.length === 0)
	{
		throw new Error('AutoComplete expects the Display to contain an <input type="text" /> element');
	}
	
	this.update();
	this._textValue = this.textElement.val();
	
	var dialog = this;
	
	this.textElement.on
		(
			'keyup change', 
			function(event)
			{
				if (dialog._textValue !== dialog.textElement.val())
				{
					dialog.update();
					if (!dialog.popup.isShown())
					{
						dialog.popup.show();
					}
					else
					{
						dialog.popup.reposition();
					}
					
					dialog._textValue = dialog.textElement.val();
				}
			}
		);
	
	this.update();
};

AutoComplete.prototype.update = function()
{
	var dialog = this;

	var buildOption = function(option)
	{
		var selectAnchor = $('<a />')
			.attr('href', 'javascript:;')
			.text(option.text())
			.on
				(
					'click', 
					function(event)
					{
						option[0].selected = true;
						dialog.popup.hide();
						dialog.selectioner.target.trigger('change');
					}
				);
		
		return $('<li />').append(selectAnchor);
	};

	var filterText = this.textElement.val().toLowerCase();
	
	var children = this.selectioner.target.find('option');
	var filteredOptions = $();
	
	for (var i = 0, length = children.length; i < length; i++)
	{
		var option = $(children[i]);
		var text = option.text().toLowerCase();
		
		if (text !== '' && text.indexOf(filterText) === 0)
		{
			filteredOptions = filteredOptions.add(buildOption(option));
			
			if (filteredOptions.length > Selectioner.Settings.maxAutoCompleteItems)
			{
				break;
			}
		}
	}
	
	this.element
		.empty()
		.append(filteredOptions);
};
var DateSelect = Selectioner.Dialog.DateSelect = function() {};

DateSelect.prototype = new Selectioner.Core.Dialog();

DateSelect.Settings = 
{
	monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
	weekStartIndex: 1
};

DateSelect.Utility = 
{
	isLeapYear: function(year)
	{
		return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
	},
	daysInMonth: function(year, month)
	{
		return [31, (DateSelect.Utility.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
	},
	dateToString: function(date)
	{
		if (!date)
		{
			return null;
		}
	
		var day = date.getDate().toString();
		var month = (date.getMonth() + 1).toString();
		var year = date.getFullYear().toString();
		
		if (day.length == 1) day = '0' + day;
		if (month.length == 1) month = '0' + month;
		
		return year + '-' + month + '-' + day;
	},
	buildScroller: function(collection, currentValue)
	{	
		var buildItem = function(i)
		{
			var item = $('<a />')
				.attr('href', 'javascript:;')
				.append($('<span />').text(collection[i]));
				
			if (currentValue === collection[i])
			{
				item.addClass('current');
			}
				
			return item;
		};
		
		return $('<span />')
			.append($('<a />').attr('href', 'javascript:;').addClass('up'))
			.append(buildItem(0).addClass('previous'))
			.append(buildItem(1).addClass('selected'))
			.append(buildItem(2).addClass('next'))
			.append($('<a />').attr('href', 'javascript:;').addClass('down'));
	}
};

DateSelect.prototype.validateTarget = function()
{
	if (!this.selectioner.target.is('input[type="date"]'))
	{
		throw new Error('DateBox expects it\'s underlying target element to to be a <input type="date" /> element');
	}
};

DateSelect.prototype.render = function()
{
	var dateSelect = this;

	this.element = $('<div />')
		.addClass(Selectioner.Settings.cssPrefix + 'date')
		.on
			(
				'click',
				'.days .previous, .days .up',
				function()
				{
					dateSelect.addDays(-1);
				}
			)
		.on
			(
				'click',
				'.days .next, .days .down',
				function()
				{
					dateSelect.addDays(1);
				}
			)
		.on
			(
				'click',
				'.months .previous, .months .up',
				function()
				{
					dateSelect.addMonths(-1);
				}
			)
		.on
			(
				'click',
				'.months .next, .months .down',
				function()
				{
					dateSelect.addMonths(1);
				}
			)
		.on
			(
				'click',
				'.years .previous, .years .up',
				function()
				{
					dateSelect.addYears(-1);
				}
			)
		.on
			(
				'click',
				'.years .next, .years .down',
				function()
				{
					dateSelect.addYears(1);
				}
			)
		.on
			(
				'click',
				'.selected',
				function()
				{
					dateSelect.popup.hide();
				}
			)
		.on
			(
				'click',
				'.today',
				function()
				{
					dateSelect.setCurrentDate(new Date());
				}
			)
		.on
			(
				'click',
				'.clear',
				function()
				{
					dateSelect.setCurrentDate(null);
					dateSelect.popup.hide();
				}
			);
		
	this.update();
};

DateSelect.prototype.update = function()
{
	var currentDate = this.getCurrentDate();
	
	// Years
	var currentYear = currentDate.getFullYear();
	
	// Months
	var monthNames = DateSelect.Settings.monthNames;
	var currentMonth = currentDate.getMonth();
	var previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
	var nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
	var months = 
		[
			monthNames[previousMonth],
			monthNames[currentMonth],
			monthNames[nextMonth]
		];
	
	// Days
	var currentDay = currentDate.getDate();
	var previousDate = new Date(currentDate);
	previousDate.setDate(currentDay - 1);
	
	var days = 
		[
			(currentDay === 1 ? previousDate.getDate() : currentDay - 1),
			currentDay,
			(currentDay === DateSelect.Utility.daysInMonth(currentYear, currentMonth)) ? 1 : currentDay + 1
		];
		
	var today = new Date();
	
	var todayButton = $('<a />').attr('href', 'javascript:;').addClass('today').text('Today');
	var clearButton = $('<a />').attr('href', 'javascript:;').addClass('clear').text('Clear');
	
	// Build the control
	this.element
		.empty()
		.append(todayButton)
		.append(DateSelect.Utility.buildScroller(days, today.getDate()).addClass('days'))
		.append(DateSelect.Utility.buildScroller(months, monthNames[today.getMonth()]).addClass('months'))
		.append(DateSelect.Utility.buildScroller([currentYear - 1, currentYear, currentYear + 1], today.getFullYear()).addClass('years'))
		.append(clearButton);
};

DateSelect.prototype.addDays = function(day)
{
	var date = this.getCurrentDate();
	date.setDate(date.getDate() + day);
	this.setCurrentDate(date);	
};

DateSelect.prototype.addMonths = function(months)
{
	var date = this.getCurrentDate();
	date.setMonth(date.getMonth() + months);
	this.setCurrentDate(date);	
};

DateSelect.prototype.addYears = function(years)
{
	var date = this.getCurrentDate();
	date.setYear(date.getFullYear() + years);
	this.setCurrentDate(date);	
};

// Get the currently selected date, or today's date if no date is selected.
DateSelect.prototype.getCurrentDate = function()
{
	var dateValue = this.selectioner.target.val();

	if (dateValue !== '')
	{
		var datePart = dateValue.match(/(\d+)/g);
		return new Date(datePart[0], datePart[1] - 1, datePart[2]); // months are zero-based
	}
	
	return new Date();
};

DateSelect.prototype.setCurrentDate = function(date)
{
	this.selectioner
		.target
		.val(DateSelect.Utility.dateToString(date))
		.trigger('change.selectioner');
	this.update();
};
$.fn.singleSelect = function ()
{
	this
		.each
		(
			function()
			{
				new Selectioner
					(
						this, 
						new Selectioner.Display.ListBox(),
						new Selectioner.Dialog.SingleSelect()
					);
			}
		);
	
	return this;
};
$.fn.multiSelect = function ()
{
	this
		.each
		(
			function()
			{
				new Selectioner
					(
						this, 
						new Selectioner.Display.ListBox(),
						new Selectioner.Dialog.MultiSelect()
					);
			}
		);
		
	return this;
};
$.fn.comboSelect = function (textInput)
{
	this
		.each
		(
			function()
			{
				new Selectioner
					(
						this, 
						new Selectioner.Display.ComboBox(textInput),
						new Selectioner.Dialog.ComboSelect()
					);
			}
		);
		
	return this;
};
$.fn.autoComplete = function ()
{
	this
		.each
		(
			function()
			{
				new Selectioner
					(
						this, 
						new Selectioner.Display.ComboBox(),
						new Selectioner.Dialog.AutoComplete()
					);
			}
		);
		
	return this;
};
$.fn.dateSelect = function ()
{
	this
		.each
		(
			function()
			{
				new Selectioner
					(
						this, 
						new Selectioner.Display.DateBox(),
						new Selectioner.Dialog.DateSelect()
					);
			}
		);
	
	return this;
};
})(jQuery);