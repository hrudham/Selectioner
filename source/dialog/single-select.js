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
				.on(
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
					});
		};
		
		SingleSelect.prototype.isEmpty = function()
		{
			return this.selectioner.target.children().length > 0;
		};

		SingleSelect.prototype.update = function()
		{
			this.element.empty();

			if (this.isEmpty())
			{
				var children = this.selectioner.target.children();
				for (var i = 0, length = children.length; i < length; i++)
				{
					var child = $(children[i]);
					if (children[i].tagName == 'OPTION')
					{
						this.element.append(this.renderOption(child));
					}
					else 
					{
						// We can safely assume that all other elements are 
						// optgroups, since the HTML5 spec only allows these 
						// two child elements. 
						// See http://www.w3.org/TR/html-markup/select.html
						this.element.append(this.renderGroup(child));
					}
				}
			}
			else
			{
				// Although the single-select itself will never use 
				// an <option /> without a value for it's no-option
				// text, other dialogs that inherit from it often do, 
				// such as in the case of the combo-select.
				var noOptionText = this.selectioner
					.target
					.find('option[value=""], option:empty:not([value])')
					.text();
			
				this.element
					.append(
						$('<li />')
							.addClass('none')
							.append(
								$('<span />').text(
									noOptionText || this.selectioner.settings.noOptionText)));
			}
		};

		// Render an the equivalent control that represents an 
		// <option /> element for the underlying <select /> element. 
		SingleSelect.prototype.renderOption = function(option)
		{
			var selectElement;
			
			if (option.is(':disabled'))
			{
				selectElement = $('<span />')
					.addClass('disabled');
			}
			else
			{
				var dialog = this;
				selectElement = $('<a />')
					.attr('href', 'javascript:;')
					.on('click', function(){ dialog.selectOption(option); });
			}
			
			selectElement.text(option.text() || this.selectioner.settings.emptyOptionText);
			
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
			var options = $('<li />')
				.addClass(this.selectioner.settings.cssPrefix + 'group-title')
				.append(
					$('<span />').text(group.attr('label')));
			
			var children = group.children();
			for (var i = 0, length = children.length; i < length; i++)
			{
				options = options.add(
					this.renderOption(
						$(children[i])));
			}
			
			var groupElement = $('<li />').append($('<ul >').append(options));

			return groupElement;
		};

		// Get all options that can potentially be selected.
		SingleSelect.prototype.getSelectableOptions = function()
		{
			return this.element
				.find('li')
				.filter(
					function()
					{ 
						return $(this)
							.children('a,input,label')
							.filter(':not(.disabled,[disabled])').length > 0; 
					});
		};

		// Highlight the next or previous item.
		SingleSelect.prototype.highlightAdjacentOption = function(isNext)
		{
			var isHighlighted = false;
			var items = this.getSelectableOptions();
			
			if (items.filter('.highlight').length === 0)
			{
				(isNext ? items.first() : items.last()).addClass('highlight');
				isHighlighted = true;
			}
			else
			{
				for (var i = 0, length = items.length; i < length; i++)
				{
					var item = $(items[i]);
										
					if (item.hasClass('highlight'))
					{
						item.removeClass('highlight');
						
						if (isNext)
						{
							if (i < length - 1)
							{
								$(items[i + 1]).addClass('highlight');					
								isHighlighted = true;
								break;
							}
						}
						else if (i > 0)
						{
							$(items[i - 1]).addClass('highlight');
							isHighlighted = true;
							break;
						}
					}
				}
			}
			
			return isHighlighted;
		};

		// Scroll to the highlighted option.
		SingleSelect.prototype.scrollToHighlightedOption = function()
		{
			var option = this.getSelectableOptions().filter('.highlight');
			
			if (option.length > 0)
			{
				var optionTop = option.position().top;
				var popupElement = this.popup.element;
					
				if (optionTop < 0)
				{
					popupElement.scrollTop(popupElement.scrollTop() + optionTop);
				}
				else
				{
					var popupHeight = popupElement.height();
					optionTop += option.height();
					
					if (optionTop > popupHeight)
					{
						popupElement.scrollTop(popupElement.scrollTop() + optionTop - popupHeight);
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
				.click();
		};

		// Clear the selected item(s) if possible.
		SingleSelect.prototype.clearSelection = function()
		{
			this.getSelectableOptions()
				.filter('.none:first')
				.find('a,label')
				.click();
		};

		// Handle key-down events. This method is called by the pop-up, and
		// thus usually should not be called manually elsewhere.
		SingleSelect.prototype.keyDown = function (simpleEvent)
		{			
			var result = Selectioner.Core.Dialog.prototype.keyDown.call(this, simpleEvent.key);

			if (!result.handled)
			{
				switch(simpleEvent.key)
				{				
					case 38: // Up arrow
						if (this.highlightAdjacentOption(false))
						{
							simpleEvent.preventDefault();
							result.handled = true;
						}
						break;
						
					case 40: // Down arrow
						if (this.highlightAdjacentOption(true))
						{
							simpleEvent.preventDefault();
							result.handled = true;
						}
						break;
						
					case 8: // Backspace
						if (simpleEvent.target === this.selectioner.display.element[0])
						{
							this.clearSelection();
							this.popup.hide();
							simpleEvent.preventDefault();
							result.handled = true;
						}
						break;
						
					case 32: // Space
						if (!this.keyPressFilter && simpleEvent.target === this.selectioner.display.element[0])
						{
							this.selectHighlightedOption();
							simpleEvent.preventDefault();
							result.handled = true;
						}
						break;
						 
					case 13: // Enter / Return
						this.selectHighlightedOption();
						simpleEvent.preventDefault();
						result.handled = true;
						break;
				}
			}
			
			this.scrollToHighlightedOption();
			
			return result;
		};

		// Handle key-press events. This method is called by the pop-up, and
		// thus usually should not be called manually elsewhere.
		SingleSelect.prototype.keyPress = function(simpleEvent)
		{
			var result = { handled: false };

			// Do not filter on enter / return or tab.
			if (simpleEvent.key != 13 && simpleEvent.key != 9)
			{
				var dialog = this;
				
				clearTimeout(this.keyPressFilterTimeout);
			
				this.keyPressFilter = (this.keyPressFilter || '') + String.fromCharCode(simpleEvent.key).toUpperCase();
								
				this.keyPressFilterTimeout = setTimeout(
					function()
					{  
						dialog.keyPressFilter = '';
					},
					400);
					
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
				
				if (simpleEvent.target == this.selectioner.display.element[0])
				{
					simpleEvent.preventDefault();
				}
				
				result.handled = true;
			}
			
			return result;
		};

		SingleSelect.prototype.lostFocus = function()
		{
			this.element.find('li').removeClass('highlight');
		};
	});