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
