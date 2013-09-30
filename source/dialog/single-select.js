define(
	['core/dialog'],
	function()
	{
		var SingleSelect = Selectioner.Dialog.SingleSelect = function() {};

		SingleSelect.prototype = new Selectioner.Core.Dialog();

		SingleSelect.prototype.validateTarget = function()
		{
			if (!this.selectioner.target.is('select:not([multiple])'))
			{
				throw new Error('Underlying element is expected to be a <select /> element without a "multiple" attribute');
			}
		};

		SingleSelect.prototype.render = function()
		{
			this.element = $('<ul />');
			this.bindEvents();
		};
		
		SingleSelect.prototype.bindEvents = function()
		{
			var dialog = this;
			var element = this.element
				.on(
					'click', 
					'li a',
					function()
					{
						var option = dialog.selectioner.target[0][this.getAttribute('data-index')];
						
						if (!option.selected)
						{
							option.selected = true;
							dialog.selectioner.target.trigger('change', { source: 'selectioner' });
						}
						
						dialog.popup.hide();
					})
				.on(
					'mouseenter',
					'li',
					function()
					{	
						dialog.highlight(this);
					});
		};
		
		SingleSelect.prototype.isEmpty = function()
		{
			return this.selectioner.target.children().length === 0;
		};

		SingleSelect.prototype.update = function()
		{
			// Only re-render when the target's HTML changes.
			// This allows us to stop re-rendering really large lists.
			var currentTargetHtml = this.selectioner.target.html();
			if (currentTargetHtml !== this._lastRenderedTargetHtml)
			{
				this._lastRenderedTargetHtml = currentTargetHtml;
			
				this.element.empty();
				this._selectableOptions = null;
				
				var results = '';

				if (!this.isEmpty())
				{
					var children = this.selectioner.target.children();
					for (var i = 0, length = children.length; i < length; i++)
					{
						var child = children[i];
						if (child.tagName == 'OPTION')
						{
							results += this.renderOption(child);
						}
						else 
						{
							// We can safely assume that all other elements are 
							// <optgroup /> elements, since the HTML5 specification 
							// only allows these two child elements. 
							// See http://www.w3.org/TR/html-markup/select.html
							results += this.renderGroup(child);
						}
					}
				}
				else
				{
					// Although the single-select itself will never use 
					// an <option /> without a value for it's no-option
					// text, other dialogs that inherit from it often do, 
					// such as in the case of the combo-select.
					var option = this.selectioner
						.target
						.find('option[value=""], option:empty:not([value])');
							
					var text = option.text() || this.selectioner.settings.noOptionText;
					
					var titleAttribute = '';
					if (option.length > 0)
					{
						var title = option[0].getAttribute('title');
						if (title)
						{
							titleAttribute = ' title="' + title.replace(/"/g, '&quot;') + '" ';
						}
					}

					results += '<li class="none"' + titleAttribute + '><span>' + text + '</span></li>';
				}

				this.element.html(results);

				this.scrollToHighlightedOption();
			}
		};

		// Render an the equivalent control that represents an 
		// <option /> element for the underlying <select /> element. 
		SingleSelect.prototype.renderOption = function(option)
		{
			var text = option.text || this.selectioner.settings.emptyOptionText;
			
			var itemHtml;
			
			var cssClass = [];
			if (option.value === null || option.value === '') 
			{
				cssClass.push('none');
			}
			
			if (option.disabled)
			{
				cssClass.push('disabled');
				itemHtml = '<span>' + text + '</span>';
			}
			else
			{
				itemHtml = '<a href="javascript:;" data-index="' + option.index + '">' + text + '</a>';
			}
			
			if (option.selected)
			{
				cssClass.push('highlight');
			}

			var titleAttribute = '';
			var title = option.getAttribute('title');
			if (title)
			{
				titleAttribute = ' title="' + title.replace(/"/g, '&quot;') + '"';
			}

			return '<li class="' + cssClass.join(' ') + '"' + titleAttribute + '>' + itemHtml + '</li>';
		};

		// Render an the equivalent control that represents an 
		// <optgroup /> element for the underlying <select /> element. 
		SingleSelect.prototype.renderGroup = function(group)
		{			
			var titleAttribute = '';
			var title = group.getAttribute('title');
			if (title)
			{
				titleAttribute = ' title="' + title.replace(/"/g, '&quot;') + '"';
			}
		
			var results = '<li class="' + 
				this.selectioner.settings.cssPrefix + 
				'group-title"' + titleAttribute + '><span>' + 
				group.label + 
				'</span></li>';
			
			var children = group.children;
			for (var i = 0, length = children.length; i < length; i++)
			{
				results += this.renderOption(children[i]);
			}
			
			return '<li><ul>' + results + '</ul></li>';
		};

		// Get all options that can potentially be selected.
		SingleSelect.prototype.getSelectableOptions = function()
		{
			if (!this._selectableOptions)
			{
				this._selectableOptions = this.element
					.find('li')
					.filter(
						function()
						{ 
							return $(this)
								.children('a,input,label')
								.filter(':not(.disabled,[disabled])').length > 0; 
						});
			}
			
			return this._selectableOptions;
		};

		SingleSelect.prototype.highlight = function(item)
		{
			var dialog = this;		
			var target = $(item);
						
			if (!target.hasClass('highlight') && 
				dialog.getSelectableOptions().filter(item).length > 0)
			{
				dialog.element.find('li').removeClass('highlight');
				target.addClass('highlight');
			}
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
			
			if (isHighlighted)
			{
				this.scrollToHighlightedOption();
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
					600);
					
				// Find the first option that satisfies   
				// the filter, is not empty (or "none"), 
				// and highlight it.
				var options = this.getSelectableOptions();
				var isSet = false;
				for (var i = 0, length = options.length; i < length; i++)
				{
					var option = $(options[i]);
					if (!option.hasClass('none') &&
						option.text().toUpperCase().indexOf(this.keyPressFilter) === 0)
					{
						options.removeClass('highlight');
						option.addClass('highlight');
						this.scrollToHighlightedOption();
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