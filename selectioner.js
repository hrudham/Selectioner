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
	Settings: {},
	Utility: {}
};
var settings = Selectioner.Settings = 
{
	cssPrefix: 'select-',
	dataAttributePrefix: 'select-', 
	canCopyCssClasses: true,
	canCopyDataAttributes: true
};
// Copy over the class attributes from the source element to the target element.
// Also removes those that had been copied previously but no longer exist on the source element.
var copyCssClasses = Selectioner.Utility.copyCssClasses = function(source, target)
{
	if (Selectioner.Settings.canCopyCssClasses)
	{
		// Get all the classes on the source element.
		var classes = (source.attr('class') || '').split(' ');
	
		var dataAttributeName = Selectioner.Settings.dataAttributePrefix + 'parent-css-class';
		
		// Remove any old classes on the target that no longer exist 
		// on the source element that were originally copied from it.
		var oldClasses = target.data(dataAttributeName) || [];
		for (var i = 0, length = oldClasses.length; i < length; i++)
		{
			var oldClass = oldClasses[i];
			if (classes.indexOf(oldClass) < 0)
			{
				target.removeClass(oldClass);
			}
		}
		
		// Save all the classes that belonged to the parent as a data attribute.
		target.data(dataAttributeName, classes);
		
		// Add the source's classes to the target element.
		for (var j = 0, classLength = classes.length; j < classLength; j++)
		{
			target.addClass(classes[j]);
		}
	}
};
// Copies over all HTML5 data attributes from one element to another.
// Note that we intentionally avoid using jQuery's data() method, 
// as we don't want things like data-attr="[Object object]".
var copyDataAttributes = Selectioner.Utility.copyDataAttributes = function(source, target)
{
	if (Selectioner.Settings.canCopyDataAttributes)
	{
		// Get all of the source element's data-attributes.
		var dataAttributes = {};
		source.each
			(
				function()
				{
					for (var i = 0, length = this.attributes.length; i < length; i++)
					{
						var attr = this.attributes[i];
						if (attr.name.indexOf('data-') === 0)
						{
							dataAttributes[attr.name] = attr.value;
						}
					}
				}
			);
			
		for (var attr in dataAttributes)
		{
			target.attr(attr, dataAttributes[attr]);
		}
	}
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

PopupBase.prototype.initialize = function(select, display, dialog)
{	
	this.select = select;
	this.display = display;
	this.dialog = dialog;

	this.element = $('<div />')
		.addClass(settings.cssPrefix + 'popup')
		.css
		({
			visibility: 'hidden',
			position: 'absolute',
			zIndex: '-1' 
		});
	
	this.render();
			
	$('body').append(this.element);
};

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
	
	// If this popup would appear off-screen if below the display, then make it appear above it instead.
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

PopupBase.prototype.render = function()
{
	this.dialog.render();
	
	this.element
		.empty()
		.append(this.dialog.element);
};

// Shows the pop-up.
PopupBase.prototype.show = function()
{
	this.render();
	this.reposition();

	this.element.css({ visibility: 'visible', zIndex: '' });
	this.trigger('show.selectioner');
	this._isVisible = true;
};

// Simply hides the pop-up.
PopupBase.prototype.hide = function()
{
	this.element.css({ visibility: 'hidden', zIndex: '-1' });
	this.trigger('hide.selectioner');
	this._isVisible = false;
};

PopupBase.prototype.isShown = function()
{
	return this._isVisible;
};
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
var Dialog = Selectioner.Base.Dialog = function() {};

Dialog.prototype = new Eventable();

Dialog.prototype.initialize = function(select)
{	
	this.select = select;
};

Dialog.prototype.render = function()
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
var ListBox = Selectioner.Display.ListBox = function() {};

ListBox.prototype = new Selectioner.Base.Display();

ListBox.prototype.render = function()
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

ListBox.prototype.update = function()
{	
	this.updateAttributes();

	var selectedOptions = this.select.find('option:selected');
	this.textElement.removeClass('none');
	
	if (selectedOptions.length === 0)
	{
		this.textElement
			.text('None')
			.addClass('none');
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
var ComboBox = Selectioner.Display.ComboBox = function(textElement) 
{
	this.textElement = $(textElement);
};

ComboBox.prototype = new Selectioner.Base.Display();
	
ComboBox.prototype.render = function()
{	
	this.element = $('<span />')
		.addClass(settings.cssPrefix + 'display')
		.prop('tabindex', this.select.prop('tabindex'));
		
	this.textElement
		.addClass(settings.cssPrefix + 'text');
	
	var button = $('<span />')
		.addClass(settings.cssPrefix + 'button')
		.on('focus', function() {  });
	
	this.element
		.append(button)
		.append(this.textElement);
};

ComboBox.prototype.update = function()
{
	this.updateAttributes();

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
var SingleSelect = Selectioner.Dialog.SingleSelect = function() {};

SingleSelect.prototype = new Selectioner.Base.Dialog();

SingleSelect.prototype.renderOption = function(option)
{
	var select = this.select;

	var selectOption = function(event)
	{
		option[0].selected = true;
		select.trigger('change');
	};

	var selectAnchor = $('<a />')
		.attr('href', 'javascript:;')
		.on('click', selectOption)
		.text(option.text());
		
	Selectioner.Utility.copyDataAttributes(option, selectAnchor);
	Selectioner.Utility.copyCssClasses(option, selectAnchor);

	return $('<li />').append(selectAnchor);
};

SingleSelect.prototype.renderGroup = function(group)
{		
	var groupTitle = $('<span />')
			.text(group.attr('label'));

	var options = $('<li />')
		.addClass(settings.cssPrefix + 'group-title')
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
	
	Selectioner.Utility.copyDataAttributes(group, groupElement);
	Selectioner.Utility.copyCssClasses(group, groupElement);

	return groupElement;
};
var MultiSelect = Selectioner.Dialog.MultiSelect = function() {};

MultiSelect._inputIdIndex = 0;
				
MultiSelect.prototype = new Selectioner.Base.Dialog();

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
	
	Selectioner.Utility.copyDataAttributes(option, element);
	Selectioner.Utility.copyCssClasses(option, element);

	return element;
};

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
		.addClass(settings.cssPrefix + 'group-title')
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
	
	Selectioner.Utility.copyDataAttributes(group, groupElement);
	Selectioner.Utility.copyCssClasses(group, groupElement);

	return groupElement;
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
				listBox.initialize($(this), new Selectioner.Dialog.SingleSelect());
			}
		);
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
				listBox.initialize($(this), new Selectioner.Dialog.MultiSelect());
			}
		);
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
				comboBox.initialize($(this), new Selectioner.Dialog.SingleSelect());
			}
		);
};
})(jQuery);