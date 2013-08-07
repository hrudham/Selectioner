define(
	['core/selectioner', 'core/dialog'],
	function()
	{
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
						'mousemove',
						'li',
						function()
						{	
							var target = $(this);
							
							if (!target.hasClass('highlight') && 
								dialog.getSelectableOptions().filter(this).length > 0)
							{
								element.find('li').removeClass('highlight');
								target.addClass('highlight');
							}
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
										$('<span />').text(this.selectioner.settings.noOptionText)
									)
						);
			}
		};

		// Render an the equivalent control that represents an 
		// <option /> element for the underlying <select /> element. 
		SingleSelect.prototype.renderOption = function(option)
		{
			var dialog = this;

			var text = option.text();
			
			var selectElement;
			
			if (option.is(':disabled'))
			{
				selectElement = $('<span />')
					.addClass('disabled');
			}
			else
			{
				selectElement = $('<a />')
					.attr('href', 'javascript:;')
					.on('click', function(){ dialog.selectOption(option); });
			}
			
			selectElement.text(text || this.selectioner.settings.emptyOptionText);
			
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

		// Render an the equivalent control that represents an 
		// <optgroup /> element for the underlying <select /> element. 
		SingleSelect.prototype.renderGroup = function(group)
		{		
			var groupTitle = $('<span />')
					.text(group.attr('label'));

			var options = $('<li />')
				.addClass(this.selectioner.settings.cssPrefix + 'group-title')
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

		// Highlight the next or previous item.
		SingleSelect.prototype.highlightAdjacentOption = function(isNext)
		{
			var items = this.getSelectableOptions();
			
			if (items.filter('.highlight').length === 0)
			{
				(isNext ? items.first() : items.last()).addClass('highlight');
				return true;
			}
			else
			{
				for (var i = 0, length = items.length; i < length; i++)
				{
					var item = $(items[i]);
					
					var highlightItem;
					
					if (item.hasClass('highlight'))
					{
						if (isNext)
						{
							if (i < length - 1)
							{
								item.removeClass('highlight');
								highlightItem = $(items[i + 1]).addClass('highlight');
								this.scrollToHighlightedOption();					
								return true;
							}
						}
						else
						{
							if (i > 0)
							{
								item.removeClass('highlight');
								highlightItem = $(items[i - 1]).addClass('highlight');
								this.scrollToHighlightedOption();
								return true;
							}
						}
						
						items.removeClass('highlight');
						
						return false;
					}
				}
			}
		};

		// Scroll to the highlighted option.
		SingleSelect.prototype.scrollToHighlightedOption = function()
		{
			var option = this.getSelectableOptions().filter('.highlight');
			
			if (option.length > 0)
			{
				var optionTop = option.position().top;
					
				if (optionTop < 0)
				{
					this.popup.element.scrollTop(this.popup.element.scrollTop() + optionTop);
				}
				else
				{
					var popupHeight = this.popup.element.height();
					optionTop += option.height();
					
					if (optionTop > popupHeight)
					{
						this.popup.element.scrollTop(this.popup.element.scrollTop() + optionTop - popupHeight);
					}
				}
			}
		};

		// Select the highlighted option.
		SingleSelect.prototype.selectHighlightedOption = function()
		{
			this.getSelectableOptions()
				.filter('.highlight')
				.find('a,label')
				.trigger('click');
		};

		// Clear the selected item(s) if possible.
		SingleSelect.prototype.clearSelection = function()
		{
			this.getSelectableOptions()
				.filter('.none:first')
				.find('a,label')
				.trigger('click');
		};

		// Handle key-down events. This method is called by the pop-up, and
		// thus usually should not be called manually elsewhere.
		SingleSelect.prototype.keyDown = function (key)
		{
			var result = Selectioner.Core.Dialog.prototype.keyDown.call(this, key);

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
						
					// Backspace
					case 8: 
						this.clearSelection();
						this.popup.hide();
						result.handled = true;
						result.preventDefault = true;
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
			
			this.scrollToHighlightedOption();
			
			return result;
		};

		// Handle key-press events. This method is called by the pop-up, and
		// thus usually should not be called manually elsewhere.
		SingleSelect.prototype.keyPress = function(key)
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
						options.removeClass('highlight');
						option.addClass('highlight');
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

		SingleSelect.prototype.lostFocus = function()
		{
			this.element.find('li').removeClass('highlight');
		};
	}
);