/*!
 * Copyright 2013 Hilton Rudham
 * Released under the MIT license
 * https://github.com/hrudham/Selectioner/blob/master/LICENSE
 */
 
(function ($)
{
Selectioner = 
{
	Base: {},
	Dialog: {},
	Display: {},
	Extensions: {},
	Popup: {},
	Utility: {}
};
// Copy over the class and style attributes from the source element to the target element.
var copyCss = Selectioner.Utility.copyCss = function(source, target)
{
	// Copy over the class and styleattributes from the source element to the target element.
	target.attr('style', source.attr('style'));
	
	var classes = (source.attr('class') || '').split(' ');

	for (var i = 0, length = classes.length; i < length; i++)
	{
		target.addClass(classes[i]);
	}
};
// Copies over all data attributes from one element to another.
var copyData = Selectioner.Utility.copyData = function(source, target)
{
	var data = source.data();
	for (var attr in data)
	{
		target.attr('data-' + attr, data[attr]);
	}
};
var Eventable = Selectioner.Base.Eventable = function () { };
    
Eventable.prototype.on = function (name, handler, context)
{
    //#IF INCLUDE_VALIDATION
    if (typeof name != 'string') throw new TypeError();
    if (typeof handler != 'function') throw new TypeError();
    //#ENDIF

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
        eventHandlers.forEach
            (
                function (eventHandler)
                {
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
            );
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
		.addClass('select-dialog')
		.css
		({
			visibility: 'hidden',
			position: 'absolute',
			zIndex: '-1' 
		});
	
	this.render();
	
	var dialog = this;
	
	var toggleDialog = function() 
	{ 
		if (dialog.isShown())
		{
			dialog.hide();
		}
		else
		{
			dialog.show();
		}
	};
	
	var display = this.display;
	
	this.display
		.element
		.on
		(
			'focusin.selectioner', 
			function(event) 
			{ 
				dialog.show();
			}
		)
		.children()
		.on
		(
			'mousedown.selectioner', 
			function(event) 
			{ 
				event.stopPropagation(); 
				toggleDialog(); 
			}
		);
		
	$(document)
		.on
		(
			'mousedown.selectioner focusin.selectioner',
			function(event)
			{
				if (dialog.isShown() &&
					event.target !== dialog.display.element[0] &&
					!$.contains(dialog.display.element[0], event.target) &&
					event.target !== dialog.element[0] &&
					!$.contains(dialog.element[0], event.target))
				{
					dialog.hide();
				}
			}
		);
		
	$(window)
		.on
		(
			'resize.selectioner',
			function()
			{
				dialog.hide();
			}
		);
		
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
	if (window.innerHeight + scrollTop < top + popUpHeight)
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
	this.element
		.empty()
		.append(this.dialog.render());
};

PopupBase.prototype.show = function()
{
	this.render();
	this.reposition();
	this.element.css({ visibility: 'visible', zIndex: '' });
	this.select.trigger('show-dialog.selectioner');
	this._isVisible = true;
};

PopupBase.prototype.hide = function()
{
	this.element.css({ visibility: 'hidden', zIndex: '-1' });
	this.select.trigger('hide-dialog.selectioner');
	this._isVisible = false;
};

PopupBase.prototype.isShown = function()
{
	return this._isVisible;
}
var Display = Selectioner.Base.Display = function() {};

Display.prototype = new Eventable();

Display.prototype.initialize = function(select, dialog)
{
	this.select = select;
		
	this.render();		
	this.update();
		
	Selectioner.Utility.copyData(select, this.element);
	Selectioner.Utility.copyCss(select, this.element);
	
	this.select
		.css('display', 'none')
		.after(this.element);
	
	var display = this;
	
	// Find any labels associated with this select element,
	// and make them focus on this display instead.
	var selectId = select.attr('id');
	if (selectId !== undefined)
	{
		$('label[for="' + selectId + '"]')
			.on
				(
					'click',
					function (event)
					{
						display.element.focus();
					}
				);
	}
		
	this.select
		.on
			(
				'change.selectioner', 
				function(event)
				{
					display.update();
				}
			)
		.on
			(
				'show-dialog.selectioner',
				function(event)
				{
					display.element.addClass('select-visible');
				}
			)
		.on
			(
				'hide-dialog.selectioner',
				function(event)
				{
					display.element.removeClass('select-visible');
				}
			);
			
	dialog.initialize(select);
	
	var popup = new Selectioner.Base.Popup();
	popup.initialize(select, this, dialog);
};

Display.prototype.render = function()
{	
	this.element = $('<span />')
		.addClass('select-display')
		.prop('tabindex', this.select.prop('tabindex'));
		
	this.textElement = $('<span />')
		.addClass('select-text');
	
	var button = $('<span />').addClass('select-button');
	
	this.element
		.append(button)
		.append(this.textElement);
};

Display.prototype.update = function()
{	
	var selectedOptions = this.select.find('option:selected');
	this.textElement.removeClass('none');
	
	if (selectedOptions.length == 0)
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
var Dailog = Selectioner.Base.Dialog = function() {};

Dailog.prototype = new Eventable();

Dailog.prototype.initialize = function(select)
{	
	this.select = select;
};

Dailog.prototype.render = function()
{
	var element = $('<ul />')

	var children = this.select.children();
	
	for (var i = 0, length = children.length; i < length; i++)
	{
		var child = $(children[i]);
		if (children[i].tagName === 'OPTION')
		{
			element.append(this.renderOption(child));
		}
		else if (children[i].tagName === 'OPTGROUP')
		{
			element.append(this.renderOptionGroup(child));
		}
	}	

	return element;	
};
var ListBox = Selectioner.Display.ListBox = function() {};

ListBox.prototype = new Selectioner.Base.Display();

ListBox.prototype.render = function()
{	
	this.element = $('<span />')
		.addClass('select-display')
		.prop('tabindex', this.select.prop('tabindex'));
		
	this.textElement = $('<span />')
		.addClass('select-text');
	
	var button = $('<span />').addClass('select-button');
	
	this.element
		.append(button)
		.append(this.textElement);
};

ListBox.prototype.update = function()
{	
	var selectedOptions = this.select.find('option:selected');
	this.textElement.removeClass('none');
	
	if (selectedOptions.length == 0)
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
		.addClass('select-display')
		.prop('tabindex', this.select.prop('tabindex'));
		
	this.textElement
		.addClass('select-text');
	
	var button = $('<span />')
		.addClass('select-button')
		.on('focus', function() {  });
	
	this.element
		.append(button)
		.append(this.textElement);
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
var SingleSelect = Selectioner.Dialog.SingleSelect = function() {};

SingleSelect.prototype = new Selectioner.Base.Dialog();

SingleSelect.prototype.renderOption = function(option)
{
	var select = this.select;

	var selectOption = function(event)
	{
		option[0].selected = true;
		select.trigger('change.selectioner');
	};

	var selectAnchor = $('<a />')
		.attr('href', 'javascript:;')
		.on('click', selectOption)
		.text(option.text());
		
	Selectioner.Utility.copyData(option, selectAnchor);
	Selectioner.Utility.copyCss(option, selectAnchor);

	return $('<li />').append(selectAnchor);
};

SingleSelect.prototype.renderOptionGroup = function(group)
{		
	var groupElement = $('<span />')
			.text(group.attr('label'));

	var options = $('<li />')
		.addClass('select-group-title')
		.append(groupElement);
	
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
	
	Selectioner.Utility.copyData(group, groupElement);
	Selectioner.Utility.copyCss(group, groupElement);

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
				dialog.select.trigger('change.selectioner');
			}
		);
		
	element.append(label);
	
	Selectioner.Utility.copyData(option, element);
	Selectioner.Utility.copyCss(option, element);

	return element;
};

MultiSelect.prototype.renderOptionGroup = function(group)
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
	
	var groupElement = $('<a />')
			.attr('href', 'javascript:;')
			.on('click', toggleGroupSelect)
			.text(group.attr('label'));

	var options = $('<li />')
		.addClass('select-group-title')
		.append(groupElement);
	
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
	
	Selectioner.Utility.copyData(group, groupElement);
	Selectioner.Utility.copyCss(group, groupElement);

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