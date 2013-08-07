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
						if (!data || data.source != 'selectioner')
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
			var filteredOptions = $();
			
			if (filterText.length >= (this.selectioner.settings.filteredSelect.minFilterLength || 1))
			{
				var children = this.selectioner.target.find('option');
				
				for (var i = 0, length = children.length; i < length; i++)
				{
					var option = $(children[i]);
					var text = option.text().toLowerCase();
					
					if (text !== '' && text.indexOf(filterText) === 0)
					{
						filteredOptions = filteredOptions.add(this.renderOption(option));
						
						if (filteredOptions.length > this.selectioner.settings.filteredSelect.maxItems)
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
								$('<span />').text(this.selectioner.settings.noMatchesFoundText)
							);
				}
			}
			else
			{
				filteredOptions = $('<li />')
					.addClass('none')
					.append
						(
							$('<span />').text(
								this.selectioner
									.settings
									.filteredSelect
									.minFilterText
									.replace(
										/{{number}}/, 
										filterText.length + 1))
						);
			}			
			
			this.element
				.empty()
				.append(filteredOptions);
		};
	}
);