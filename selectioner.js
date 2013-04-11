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
window.Selectioner = 
{
	Base: {},
	Dialog: {},
	Display: {},
	Extensions: {},
	Popup: {},
	Settings: {}
};
var settings = Selectioner.Settings = 
{
	cssPrefix: 'select-',
	noSelectionText: 'Select an option',
	emptyOptionText: 'None',
	maxAutoCompleteItems: 5,
	isSelectionerDataAttributeName: 'is-selectioner'
};
var Eventable = Selectioner.Base.Eventable = function () { };
    
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
var PopupBase = Selectioner.Base.Popup = function() {};

PopupBase.prototype = new Eventable();

PopupBase.prototype.initialize = function(display)
{
	this.display = display;
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
PopupBase.prototype.addDialog = function(dialog)
{
	dialog.setPopup(this);
	this.dialogs.push(dialog);
};

// Render all the dialogs that appear on this popup.
PopupBase.prototype.render = function()
{
	this.element.empty();

	for (var i = 0, length = this.dialogs.length; i < length; i++)
	{
		var dialog = this.dialogs[i];
		dialog.render();
		this.element.append(dialog.element);
	}
};

// Refresh the position of the pop-up 
// relative to it's display element.
PopupBase.prototype.reposition = function()
{
	var offset = this.display.element.offset();
	var borderWidth = this.element.outerWidth(false) - this.element.width();		
	var width = this.display.element.outerWidth(false) - borderWidth;
	var top = this.display.element.outerHeight(false) + offset.top;
	
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
PopupBase.prototype.show = function()
{
	if (!this.isShown())
	{
		this._isVisible = true;
		this.render();
		this.reposition();

		this.element.css({ visibility: 'visible', zIndex: '' });
		this.trigger('show.selectioner');
	}
};

// Simply hides the pop-up.
PopupBase.prototype.hide = function()
{
	if (this.isShown())
	{
		this._isVisible = false;
		this.element.css({ visibility: 'hidden', zIndex: '-1' });
		this.trigger('hide.selectioner');
	}
};

// Simply indicates whether the popup is shown to the user currently.
PopupBase.prototype.isShown = function()
{
	return this._isVisible;
};
var Display = Selectioner.Base.Display = function() {};

Display.prototype = new Eventable();

Display.prototype.initialize = function(select)
{
	this.select = select;
	
	if (select.data('selectioner'))
	{
		throw new Error('This <select /> element has already been process by the Selectioner.');
	}
		
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
	this.select
		.removeAttr('data-' + Selectioner.Settings.isSelectionerDataAttributeName)
		.off('.selectioner');
	this.element.add(this.popup.element).remove();
};
var Dialog = Selectioner.Base.Dialog = function() {};

Dialog.prototype = new Eventable();

Dialog.prototype.initialize = function(select)
{	
	this.select = select;
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
var ListBox = Selectioner.Display.ListBox = function() {};

ListBox.prototype = new Selectioner.Base.Display();

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
	var selectedOptions = this.select.find('option:selected');
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
		this.textElement.text('Selected ' + selectedOptions.length + ' of ' + this.select.find('option').length);
	}
};
var ComboBox = Selectioner.Display.ComboBox = function() {};

ComboBox.prototype = new Selectioner.Base.Display();
	
ComboBox.prototype.render = function()
{
	this.textElement = this.select.next();
	
	if (!this.textElement.is('input[type="text"]'))
	{
		throw new Error('ComboBox expects the element to follow it\'s target <select /> to be an <input type="text" />');
	}
	
	if (!this.textElement.is('[placeholder]'))
	{
		this.textElement.attr('placeholder', Selectioner.Settings.noSelectionText);
	}

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
	var option = this.select.find('option')
		.filter(function() { return $(this).text().toUpperCase() == text; });
	
	if (option.length != 1)
	{
		option = this.getEmptyOptions();
	}
	
	option[0].selected = true;
	this.select.trigger('change');
};

ComboBox.prototype.update = function()
{
	var selectedOption = this.select.find('option:selected');
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
	return this.select
		.find('option[value=""], option:empty:not([value])');
};

ComboBox.prototype.remove = function()
{
	this.select.after(this.textElement);
	Selectioner.Base.Display.prototype.remove.call(this);
};
var SingleSelect = Selectioner.Dialog.SingleSelect = function() {};

SingleSelect.prototype = new Selectioner.Base.Dialog();

SingleSelect.prototype.render = function()
{
	this.element = $('<ul />');

	var children = this.select.children();
	
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
	var select = this.select;

	var selectOption = function(event)
	{
		option[0].selected = true;
		dialog.popup.hide();
		select.trigger('change');
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

// Inherit from the SingleSelect dialog, not the base dialog.
MultiSelect.prototype = new Selectioner.Dialog.SingleSelect();

// Render an the equivilant control that represents an
// <option /> element for the underlying <select /> element. 
// This overrides the SingleSelect version of this method.
MultiSelect.prototype.renderOption = function(option)
{
	var element = $('<li />');
	var checkboxId = 'MultiSelectCheckbox' + MultiSelect._inputIdIndex++;
	var checkbox = $('<input type="checkbox" />')
		.attr('id', checkboxId);
					
	if (option[0].selected)
	{
		checkbox.attr('checked', 'checked');
	}
		
	var label = $('<label />')
		.append(checkbox)
		.append($('<span />').text(option.text()))
		.attr('for', checkboxId);
		
	var dialog = this;
		
	checkbox.on
		(
			'change.selectioner', 
			function() 
			{
				option[0].selected = this.checked;
				dialog.select.trigger('change');
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

AutoComplete.prototype = new Selectioner.Base.Dialog();

// Render an the equivilant control that represents an 
// <option /> element for the underlying <select /> element. 
AutoComplete.prototype.render = function()
{
	this.textElement = this.select
		.data('selectioner')
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
	var select = this.select;
	var children = this.select.find('option');
	
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
						select.trigger('change');
					}
				);
		
		return $('<li />').append(selectAnchor);
	};
	
	for (var i = 0, length = children.length; i < length; i++)
	{
		var option = $(children[i]);
		this.element.append(buildOption(option));
	}
	
	this.update();
};

AutoComplete.prototype.update = function()
{
	var filterText = this.textElement.val().toLowerCase();

	var children = this.element.find('li');
	
	var visibleChildren = children
		.filter
		(
			function() 
			{ 
				var text = $(this).text().toLowerCase();
				return text !== '' && text.indexOf(filterText) === 0; 
			}
		)
		.filter
		(
			function(index)
			{
				return index < Selectioner.Settings.maxAutoCompleteItems;
			}
		);
			
	children.not(visibleChildren).css('display', 'none');
	visibleChildren.css('display', '');
};
$.fn.singleSelect = function ()
{
	this
		.filter('select:not([multiple])')
		.each
		(
			function()
			{
				var listBox = new Selectioner.Display.ListBox();
				listBox.initialize($(this));
				listBox.addDialog(new Selectioner.Dialog.SingleSelect());
			}
		);
	
	return this;
};
$.fn.multiSelect = function ()
{
	this
		.filter('select[multiple]')
		.each
		(
			function()
			{
				var listBox = new Selectioner.Display.ListBox();
				listBox.initialize($(this));
				listBox.addDialog(new Selectioner.Dialog.MultiSelect());
			}
		);
		
	return this;
};
$.fn.comboSelect = function (textInput)
{
	this
		.filter('select:not([multiple])')
		.each
		(
			function()
			{
				var comboBox = new Selectioner.Display.ComboBox(textInput);
				comboBox.initialize($(this));
				comboBox.addDialog(new Selectioner.Dialog.ComboSelect());
			}
		);
		
	return this;
};
$.fn.autoComplete = function (textInput)
{
	this
		.filter('select:not([multiple])')
		.each
		(
			function()
			{
				var comboBox = new Selectioner.Display.ComboBox(textInput);
				comboBox.initialize($(this));
				comboBox.addDialog(new Selectioner.Dialog.AutoComplete());
			}
		);
		
	return this;
};
})(jQuery);