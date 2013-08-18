define(
	['core/selectioner', 'dialog/single-select'],
	function()
	{
		var FilteredSelect = Selectioner.Dialog.FilteredSelect = function() {};

		FilteredSelect.prototype = new Selectioner.Dialog.SingleSelect();

		FilteredSelect.prototype.validateTarget = function()
		{
			if (!this.selectioner.target.is('select:not([multiple])'))
			{
				throw new Error('Underlying element is expected to be a <select /> element without a "multiple" attribute');
			}
		};

		// Render an the equivalent control that represents an 
		// <option /> element for the underlying <select /> element. 
		FilteredSelect.prototype.render = function()
		{
			this.textElement = this
				.selectioner
				.display
				.element
				.find('input[type="text"]');
						
			Selectioner.Dialog.SingleSelect.prototype.render.apply(this, arguments);
			
			this.update();
		};
		
		FilteredSelect.prototype.bindEvents = function()
		{
			Selectioner.Dialog.SingleSelect.prototype.bindEvents.apply(this, arguments);
			
			var dialog = this;
			
			this.textElement.on(
				'keyup click', 
				function(e, data)
				{
					if ((!data || data.source != 'selectioner') && 
						e.which != 13 &&	// Enter
						e.which !== 27)		// Escape
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
				});
		};

		FilteredSelect.prototype.update = function()
		{		
			// Clear our cached selectable options.
			// If you remove this line, highlighting will break.
			this._selectableOptions = null;

			var filterText = this.textElement.val().toLowerCase();
			var currentTargetHtml = this.selectioner.target.html();
			
			// Don't re-update unless we have to.
			if (filterText !== this._lastFilterText || 
				currentTargetHtml !== this._lastRenderedTargetHtml)
			{			
				this._lastFilterText = filterText;
				this._lastRenderedTargetHtml = currentTargetHtml;
				
				var filteredOptions = '';
				if (filterText.length >= this.selectioner.settings.filteredSelect.minFilterLength)
				{
					filteredOptions = this.getFilteredOptions();
				}
				else
				{
					filteredOptions = this.getEnterCharactersOptions();
				}			
				
				this.element
					.empty()
					.html(filteredOptions)
					.find('li:not(.none,.disabled):first')
					.addClass('highlight');
			}
		};
		
		// Returns the HTML of the list items that notify 
		// the user that they need to enter more characters 
		// before any filtering will be performed.
		FilteredSelect.prototype.getEnterCharactersOptions = function()
		{
			var settings = this.selectioner.settings.filteredSelect;
			var filterText = this.textElement.val().toLowerCase();
			var enterMoreText = settings.enterOneMoreCharacterText;

			if (settings.minFilterLength - filterText.length > 1)
			{
				enterMoreText = settings.enterNumberMoreCharactersText
					.replace(
						/{{number}}/, 
						minFilterLength - filterText.length);
			}
			
			return '<li class="none"><span>' + enterMoreText + '</span></li>';
		};
		
		// Returns the HTML of the list of items that match
		// the filter criteria entered into the auto-completes
		// text input.
		FilteredSelect.prototype.getFilteredOptions = function()
		{
			var filteredOptions = '';
			var count = 0;
		
			var children = this.selectioner.target.find('option');
					
			for (var i = 0, length = children.length; i < length; i++)
			{
				var option = children[i];
				var text = option.text.toLowerCase();
				
				if (text !== '' && text.indexOf(this.textElement.val().toLowerCase()) === 0)
				{
					filteredOptions += this.renderOption(option);
					count++;
					
					var maxItems = this.selectioner.settings.filteredSelect.maxItems;
					if (maxItems && count >= maxItems)
					{
						break;
					}
				}
			}
			
			if (count === 0)
			{
				count++;
				filteredOptions = this.getNoMatchesFound();
			}
			
			return filteredOptions;
		};
		
		FilteredSelect.prototype.getNoMatchesFound = function()
		{
			return '<li class="none"><span>' + 
					this.selectioner.settings.noMatchesFoundText + 
					'</span></li>';
		};
	});