(function ($)
{
var Dialog = function() {};

Dialog.prototype.initialize = function(select, display)
{	
	this.select = select;
	this.display = display;

	this.element = $('<div />')
		.addClass('select-dialog')
		.css
		({
			display: 'none',
			position: 'absolute'
		});
		
	this.options = $('<ul />');
	
	this.element.append(this.options);
	
	this.refreshOptions();
	
	var dialog = this;
	
	this.display
		.element
		.on
		(
			'focusin.select', 
			function(event) 
			{ 
				dialog.show();
				
				display.element.on
				(
					'mousedown.hide-select', 
					function(event) 
					{ 
						if (dialog.isShown())
						{
							dialog.hide();
						}
						else
						{
							dialog.show();
						}
					}
				);
			}
		);
		
	$(document)
		.on
		(
			'mousedown.select focusin.select',
			function(event)
			{
				if (dialog.isShown() &&
					event.target !== dialog.display.element[0] &&
					!$.contains(dialog.display.element[0], event.target) &&
					event.target !== dialog.element[0] &&
					!$.contains(dialog.element[0], event.target))
				{
					display.element.off('mousedown.hide-select');
					dialog.hide();
				}
			}
		);
		
	$('body').append(this.element);
};

Dialog.prototype.refreshPosition = function()
{
	var offset = this.display.element.offset();
	var borderWidth = this.element.outerWidth(false) - this.element.width();
	this.element.css
	({
		width: this.display.element.outerWidth(false) - borderWidth + 'px',
		left: offset.left + 'px',
		top: this.display.element.outerHeight(false) + offset.top + 'px'
	});
};

Dialog.prototype.refreshOptions = function()
{
	this.options.empty();

	var children = this.select.children();
	
	for (var i = 0, length = children.length; i < length; i++)
	{
		var child = $(children[i]);
		if (children[i].tagName === 'OPTION')
		{
			this.options.append(this.renderOption(child));
		}
		else if (children[i].tagName === 'OPTGROUP')
		{
			this.options.append(this.renderOptionGroup(child));
		}
	}		
};

Dialog.prototype.renderOption = function(option)
{
	var dialog = this;

	var selectOption = function(event)
	{
		option[0].selected = true;
		dialog.select.trigger('change');
		dialog.hide();
	};

	var selectAnchor = $('<a />')
		.attr('href', 'javascript:;')
		.on('click', selectOption)
		.text(option.text());

	return $('<li />').append(selectAnchor);
};

Dialog.prototype.renderOptionGroup = function(group)
{		
	var groupAnchor = $('<span />')
			.text(group.attr('label'));

	var options = $('<li />')
		.addClass('title')
		.append(groupAnchor);
	
	var children = group.children();
	for (var i = 0, length = children.length; i < length; i++)
	{
		var child = $(children[i]);
		options = options.add(this.renderOption(child));
	}

	return $('<li />').append
		(
			$('<ul >').append(options)
		);
};

Dialog.prototype.show = function()
{
	this.refreshOptions();
	this.refreshPosition();
	this.element.css('display', '');
	this.select.trigger('show-dialog.select');
};

Dialog.prototype.hide = function()
{
	this.element.css('display', 'none');
	this.select.trigger('hide-dialog.select');
};

Dialog.prototype.isShown = function()
{
	return this.element.is(':visible');
}

var inputIdIndex = 0;

var MultiSelectDialog = function() {};
				
MultiSelectDialog.prototype = new Dialog();

MultiSelectDialog.prototype.renderOption = function(option)
{
	var element = $('<li />');
	var checkboxId = 'MultiSelectCheckbox' + inputIdIndex++;
	var checkbox = $('<input type="checkbox" />')
		.attr('id', checkboxId);
					
	if (option[0].selected)
	{
		checkbox.attr('checked', 'checked');
	}
		
	var label = $('<label />')
		.text(option.text())
		.attr('for', checkboxId);
		
	var dialog = this;
		
	checkbox.on
		(
			'change.select', 
			function() 
			{
				option[0].selected = this.checked;
				dialog.select.trigger('change');
			}
		);
		
	element.append(checkbox).append(label);

	return element;
};

MultiSelectDialog.prototype.renderOptionGroup = function(group)
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
		
		checkboxes.trigger('change.select');
	};
	
	var groupAnchor = $('<a />')
			.attr('href', 'javascript:;')
			.on('click', toggleGroupSelect)
			.text(group.attr('label'));

	var options = $('<li />')
		.addClass('select-group-title')
		.append(groupAnchor);
	
	var children = group.children();
	for (var i = 0, length = children.length; i < length; i++)
	{
		var child = $(children[i]);
		options = options.add(this.renderOption(child));
	}

	return $('<li />').append
		(
			$('<ul >').append(options)
		);
};
var Display = function() {};

Display.prototype.initialize = function(select)
{
	this.select = select;
	
	this.render();
	
	this.select
		.css('display', 'none')
		.after(this.element);
		
	var display = this;
		
	this.select
		.on
			(
				'change.select', 
				function(event)
				{
					display.update();
				}
			)
		.on
			(
				'show-dialog.select',
				function(event)
				{
					display.element.addClass('select-visible');
				}
			)
		.on
			(
				'hide-dialog.select',
				function(event)
				{
					display.element.removeClass('select-visible');
				}
			);
};

Display.prototype.render = function()
{	
	this.element = $('<span />')
		.prop('tabindex', this.select.prop('tabindex'))
		.addClass('select-display');
		
	this.textElement = $('<span />').addClass('select-text');
	
	this.button = $('<span />').addClass('select-button');
	
	this.element
		.append(this.button)
		.append(this.textElement);
		
	this.update();
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
			displayText += selectedOptions[i].innerText;
			
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

$.fn.select = function ()
{
	this
		.filter('select')
		.each
		(
			function()
			{
				var select = $(this);
				var display = new Display();
				display.initialize(select);
				var dialog = new Dialog();
				dialog.initialize(select, display);
			}
		);
};
$.fn.multiselect = function ()
{
	this
		.filter('select')
		.each
		(
			function()
			{
				var select = $(this);
				var display = new Display();
				display.initialize(select);
				var dialog = new MultiSelectDialog();
				dialog.initialize(select, display);
			}
		);
};
})(jQuery);