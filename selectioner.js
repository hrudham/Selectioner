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

Selectioner.Settings =
{
	cssPrefix: 'select-',
	noSelectionText: 'Select an option',
	emptyOptionText: 'None',
	maxAutoCompleteItems: 5
};

Selectioner.Core = {};

Selectioner.Dialog = {};

Selectioner.Display = {};

Selectioner.Extensions = {};

Selectioner.Popup = {};
var Popup = function() {};

Popup.prototype.initialize = function(selectioner)
{
	this.selectioner = selectioner;
	this.dialogs = [];

	this.element = $('<div />')
		.addClass(Selectioner.Settings.cssPrefix + 'popup')
		.css
		({
			visibility: 'hidden',
			position: 'absolute',
			zIndex: '-1'
		});

	this.render();

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

// Render all the dialogs that appear on this popup.
Popup.prototype.render = function()
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
	if (!this.isShown())
	{
		this._isVisible = true;
		this.render();
		this.reposition();

		this.element.css({ visibility: 'visible', zIndex: '' });
		this.selectioner.trigger('show.selectioner');
	}
};

// Simply hides the pop-up.
Popup.prototype.hide = function()
{
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
var Display = Selectioner.Core.Display = function() {};

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

	// Find any labels associated with this underlying target
	//  element, and make them focus on this display instead.
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
	}
};

// Create a new dialog for the underlying target element.
Display.prototype.createPopup = function()
{
	// Bind this display to a popup.
	var popup = this.popup = new Popup();
	popup.initialize(this.selectioner);

	var displayElement = this.selectioner.display.element;

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
		var text = Selectioner.Settings.noSelectionText;
		
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
	
	if (!this.textElement.is('[placeholder]'))
	{
		this.textElement.attr('placeholder', Selectioner.Settings.noSelectionText);
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
var DateBox = Selectioner.Display.DateBox = function() {};

DateBox.prototype = new Selectioner.Core.Display();

DateBox.prototype.validateTarget = function()
{
	if (!this.selectioner.target.is('input[type="date"]'))
	{
		throw new Error('DateBox expects it\'s underlying target element to to be a <input type="date" /> element');
	}
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
		var date = new Date(dateValue);
		
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
		
		this.textElement
			.removeClass('none')
			.text(year + '-' + month + '-' + day);
	}
	else
	{
		this.textElement
			.addClass('none')
			.text(this.selectioner.target.attr('placeholder') || 'Select a date');
	}
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
	var target = this.selectioner.target;

	var selectOption = function(event)
	{
		option[0].selected = true;
		dialog.popup.hide();
		target.trigger('change');
	};
	
	var text = option.text();

	var selectAnchor = $('<a />')
		.attr('href', 'javascript:;')
		.on('click', selectOption)
		.text(text || Selectioner.Settings.emptyOptionText);
	
	var listItem = $('<li />');
	
	if (!text)
	{
		listItem.addClass('none');
	}

	return listItem.append(selectAnchor);
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
				selectioner.target.trigger('change');
			}
		);
		
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
		var checkboxes = $(this).closest('ul').find('input:checkbox');
		var checkedCount = checkboxes.filter(':checked').length;
		if (checkedCount > 0 && checkboxes.length === checkedCount)
		{
			checkboxes.prop('checked', false);
		}
		else
		{
			checkboxes.prop('checked', true);
		}
		
		checkboxes.trigger('change.selectioner');
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

AutoComplete.prototype = new Selectioner.Core.Dialog();

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
	this.textElement = this
		.selectioner
		.display
		.element
		.find('input[type="text"]');
	
	if (this.textElement.length === 0)
	{
		throw new Error('AutoComplete expects the Display to contain an <input type="text" /> element');
	}

	this.element = $('<ul />');
	this.update();
	
	var dialog = this;
	
	this.textElement.on
		(
			'keyup', 
			function(event)
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
/*
	Soem of this code was inspired by the DatePicker for Bootstrap plugin,
	which can be found here: http://www.eyecon.ro/bootstrap-datepicker/
*/

var DateSelect = Selectioner.Dialog.DateSelect = function() {};

DateSelect.prototype = new Selectioner.Core.Dialog();

DateSelect.Settings = 
{
	dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
	shortDayNames: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
	monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	shortMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
	weekStartIndex: 1
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
	this.element = $('<div />')
		.addClass(Selectioner.Settings.cssPrefix + 'date');
		
	this.renderDays(this.getDate());
};

DateSelect.prototype.update = function()
{
	this.renderDays(this.getDate());
};

DateSelect.prototype.renderDays = function(date)
{
	var dateSelect = this;
	
	var weekStartIndex = DateSelect.Settings.weekStartIndex;
	
	var isLeapYear = function (year) 
	{
		return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
	};
	
	var getDaysInMonth = function (year, month) 
	{
		return [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
	};
	
	var prevMonthDate = new Date(date.getFullYear(), date.getMonth() - 1, 28, 0, 0, 0, 0);
	var day = getDaysInMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth());
	prevMonthDate.setDate(day);
	prevMonthDate.setDate(day - (prevMonthDate.getDay() - weekStartIndex + 7) % 7);
	
	var nextMonthDate = new Date(prevMonthDate);
	nextMonthDate.setDate(nextMonthDate.getDate() + 42);
	nextMonthDate = nextMonthDate;
	
	// Header
	var renderHeader = function()
	{
		var currentMonth = $('<span />')
			.text(DateSelect.Settings.shortMonthNames[date.getMonth()] + ' ' + date.getFullYear());
		
		var nextMonth = $('<a />')
			.attr('href', 'javascript:;')
			.addClass('next')
			.text('›')
			.on
				(
					'click', 
					function()
					{
						dateSelect.renderDays(nextMonthDate);
					}
				);
		
		var previousMonth = $('<a />')
			.attr('href', 'javascript:;')
			.addClass('prev')
			.text('‹')
			.on
				(
					'click', 
					function()
					{
						dateSelect.renderDays(prevMonthDate);
					}
				);
		
		return $('<div />')
			.append(previousMonth)
			.append(currentMonth)
			.append(nextMonth);
	};
		
	// Body
	var renderBody = function()
	{
		var thead = $('<thead />');
		var headRow = $('<tr />');
		
		var dayNames = DateSelect.Settings.shortDayNames;
		
		for (var dayNameIndex = 0, dayNamesLength = dayNames.length; dayNameIndex < dayNamesLength; dayNameIndex++)
		{
			headRow.append($('<th />').text(dayNames[(dayNameIndex + weekStartIndex) % 7]));
		}
		thead.append(headRow);
	
		var tbody = $('<tbody />');
	
		// Find out what days we need to display.
		var days = [];
		var recursiveDate = new Date(prevMonthDate.valueOf());
		var currentMonth = date.getMonth();
		var today = dateSelect.getToday().valueOf();
		var selectedDate = new Date(dateSelect.getDate().valueOf());
		selectedDate.setHours(0);
		selectedDate.setMinutes(0);
		selectedDate.setSeconds(0);
		selectedDate.setMilliseconds(0);
		var selectedDateValue = selectedDate.valueOf();
		
		while (recursiveDate.valueOf() < nextMonthDate.valueOf()) 
		{
			var dateValue = recursiveDate.valueOf();
			var dateOfMonth = recursiveDate.getDate();
			var dayOfWeek = recursiveDate.getDay();
			
			days.push
				({
					name: dateOfMonth,
					isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
					isNextMonth: recursiveDate.getMonth() > currentMonth,
					isPrevMonth: recursiveDate.getMonth() < currentMonth,
					isToday: today === dateValue,
					isSelected: selectedDateValue === dateValue,
					dateValue: dateValue
				});
				
			recursiveDate.setDate(dateOfMonth + 1);
		}
		
		var dateToString = function(date)
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
		
		var buildDateCell = function(day)
		{
			var dayDate = new Date(day.dateValue);
			var cell = $('<td />')
				.text(day.name)
				.on 
					(
						'click',
						function()
						{
							dateSelect
								.selectioner
								.target
								.val(dateToString(dayDate))
								.trigger('change.selectioner');
								
							dateSelect.renderDays(dateSelect.getDate());
						}
					);
			
			if (day.isWeekend)
			{
				cell.addClass('weekend');
			}
			
			if (day.isNextMonth)
			{
				cell.addClass('next-month');
			}
			
			if (day.isPrevMonth)
			{
				cell.addClass('prev-month');
			}
			
			if (day.isToday)
			{
				cell.addClass('today');
			}
			
			if (day.isSelected)
			{
				cell.addClass('selected');
			}
			
			return cell;
		};
		
		// Render out each individual day. We make the assumption here that 
		// there will be exactly seven items per row, and that the total number 
		// of days we found is evenly divisible by seven as well.
		for (var i = 0, length = days.length / 7; i < length; i++)
		{
			var weekRow = $('<tr />');
			for (var j = 0; j < 7; j++)
			{
				weekRow.append(buildDateCell(days[i * 7 + j]));
			}
			tbody.append(weekRow);
		}
		
		return $('<table />')
			.append(thead)
			.append(tbody);
	};
	
	this.element
		.empty()
		.append(renderHeader())
		.append(renderBody());
};

// Get the currently selected date, or today's date if no date is selected.
DateSelect.prototype.getDate = function()
{
	var dateValue = this.selectioner.target.val();

	if (dateValue !== '')
	{
		return new Date(dateValue);
	}
	
	return this.getToday();
};

// Get today's date.
DateSelect.prototype.getToday = function()
{
	var today = new Date();
	
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	today.setMilliseconds(0);
	
	return today;
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