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
				throw new Error('ComboSelect expects it\'s underlying target element to to be a <select /> element without a "multiple" attribute');
			}
		};

		// Render an the equivalent control that represents an 
		// <option /> element for the underlying <select /> element. 
		FilteredSelect.prototype.render = function()
		{
			Selectioner.Dialog.SingleSelect.prototype.render.apply(this, arguments);

			this.textElement = this
				.selectioner
				.display
				.element
				.find('input[type="text"]');
			
			if (this.textElement.length === 0)
			{
				throw new Error('FilteredSelect expects the Display to contain an <input type="text" /> element');
			}
			
			this.update();
			
			var dialog = this;
			
			this.textElement.on
				(
					'keyup click', 
					function(e, data)
					{
						if ((!data || data.source != 'selectioner') && 
							e.which !== 27) // e.which == 27 == Escape key pressed.
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
					}
				);
			
			this.update();
		};

		FilteredSelect.prototype.update = function()
		{		
			var dialog = this;

			var filterText = this.textElement.val().toLowerCase();
			
			var settings = this.selectioner.settings;
			
			// Don't re-update unless we have to.
			if (filterText !== this._lastFilterText)
			{
				this._lastFilterText = filterText;
			
				var filteredOptions = $();
				var minFilterLength = settings.filteredSelect.minFilterLength || 1;
				
				if (filterText.length >= minFilterLength)
				{
					var children = this.selectioner.target.find('option');
					
					for (var i = 0, length = children.length; i < length; i++)
					{
						var option = $(children[i]);
						var text = option.text().toLowerCase();
						
						if (text !== '' && text.indexOf(filterText) === 0)
						{
							filteredOptions = filteredOptions.add(this.renderOption(option));
							
							if (filteredOptions.length > settings.filteredSelect.maxItems)
							{
								break;
							}
						}
					}
					
					if (filteredOptions.length === 0)
					{
						filteredOptions = $('<li />')
							.addClass('none')
							.append
								(
									$('<span />').text(settings.noMatchesFoundText)
								);
					}
				}
				else
				{
					var enterMoreText = settings.filteredSelect.enterOneMoreCharacterText;
					
					if (minFilterLength - filterText.length > 1)
					{
						enterMoreText = settings.filteredSelect.enterNumberMoreCharactersText
							.replace(
								/{{number}}/, 
								minFilterLength - filterText.length);
					}
				
					filteredOptions = $('<li />')
						.addClass('none')
						.append(
							$('<span />').text(enterMoreText));
				}			
				
				this.element
					.empty()
					.append(filteredOptions);
			}
		};
	});