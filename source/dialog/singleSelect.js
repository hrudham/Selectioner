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
	
	var popup = this;
	
	var element = this.element
		.on
			(
				'mouseover',
				'li',
				function(event)
				{
					var target = popup.getSelectableOptions().filter(this);
					
					if (target.length > 0)
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