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
				function()
				{
					var target = dialog.getSelectableOptions().filter(this);
					if (target.length > 0 && !target.hasClass('current'))
					{
						element.find('li').removeClass('current');
						target.addClass('current');
					}
				}
			)
		.on
			(
				'mouseleave',
				function()
				{
					$(this).find('li').removeClass('current');
				}
			);
};

SingleSelect.prototype.update = function()
{
	this.element.empty();

	var children = this.selectioner.target.children();
	if (children.length > 0)
	{
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
	}
	else
	{
		this.element
			.append
				(
					$('<li />')
						.addClass('none')
						.append
							(
								$('<span />').text(Selectioner.Settings.noOptionText)
							)
				);
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

// Get all options that can potentially be selected.
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

// Hightlight the next or previous item.
SingleSelect.prototype.highlightAdjacentOption = function(isNext)
{
	var items = this.getSelectableOptions();
	
	if (items.filter('.current').length === 0)
	{
		(isNext ? items.first() : items.last()).addClass('current');
		return true;
	}
	else
	{
		for (var i = 0, length = items.length; i < length; i++)
		{
			var item = $(items[i]);
			
			var currentItem;
			
			if (item.hasClass('current'))
			{
				if (isNext)
				{
					if (i < length - 1)
					{
						item.removeClass('current');
						currentItem = $(items[i + 1]).addClass('current');
						
						var maxScrollTop = currentItem.position().top + currentItem.height();
						var height = this.popup.element.height();
												
						if (maxScrollTop > height)
						{
							this.popup.element.scrollTop(this.popup.element.scrollTop() + maxScrollTop - height);
						}
						
						return true;
					}
				}
				else
				{
					if (i > 0)
					{
						item.removeClass('current');
						currentItem = $(items[i - 1]).addClass('current');
						
						var minScrollTop = currentItem.position().top;
											
						if (minScrollTop < 0)
						{
							this.popup.element.scrollTop(this.popup.element.scrollTop() + minScrollTop);
						}
						
						return true;
					}
				}
				
				items.removeClass('current');
				
				return false;
			}
		}
	}
};

// Select the currently highlighted option.
Dialog.prototype.selectHighlightedOption = function()
{
	this.getSelectableOptions()
		.filter('.current')
		.find('a,label')
		.trigger('click');
};

// Handle key-down events. This method is called by the pop-up, and
// thus usually should not be called manually elsewhere.
SingleSelect.prototype.keydown = function (key)
{
	var result = Dialog.prototype.keydown.call(this, key);

	if (!result.handled)
	{
		switch(key)
		{				
			// Up arrow
			case 38: 
				if (this.highlightAdjacentOption(false))
				{
					result.handled = true;
					result.preventDefault = true;
				}
				break;
				
			// Down arrow
			case 40: 
				if (this.highlightAdjacentOption(true))
				{
					result.handled = true;
					result.preventDefault = true;
				}
				break;
				
			// Space
			case 32:
				if (!this.keyPressFilter)
				{
					this.selectHighlightedOption();
					result.handled = true;
					result.preventDefault = true;
				}
				break;
				 
			// Enter / Return
			case 13:
				this.selectHighlightedOption();
				result.handled = true;
				result.preventDefault = true;
				break;
		}
	}
	
	return result;
};

Dialog.prototype.keyPress = function(key)
{
	var result = 
		{
			preventDefault: false,
			handled: false
		};

	// Do not filter on enter / return or tab.
	if (key != 13 && key != 9)
	{
		var dialog = this;
		
		clearTimeout(this.keyPressFilterTimeout);
	
		this.keyPressFilter = (this.keyPressFilter || '') + String.fromCharCode(key).toUpperCase();
						
		this.keyPressFilterTimeout = setTimeout
			(
				function()
				{  
					dialog.keyPressFilter = '';
				},
				400
			);
			
		// Find the first option that satisfies the filter, 
		// and highlight and select it.
		var options = this.getSelectableOptions();
		var isSet = false;
		for (var i = 0, length = options.length; i < length; i++)
		{
			var option = $(options[i]);
			if (option.text().toUpperCase().indexOf(this.keyPressFilter) > -1)
			{
				options.removeClass('current');
				option.addClass('current');
				isSet = true;
				break;
			}
		}
		
		if (!isSet)
		{
			clearTimeout(this.keyPressFilterTimeout);
			this.keyPressFilter = '';
		}
		
		result.preventDefault = true;
		result.handled = true;
	}
	
	return result;
};