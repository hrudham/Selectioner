define(
	['core/selectioner', 'dialog/single-select'],
	function()
	{
		var AutoComplete = Selectioner.Dialog.AutoComplete = function() {};

		AutoComplete.prototype = new Selectioner.Dialog.SingleSelect();

		AutoComplete.prototype.validateTarget = function()
		{
			if (!this.selectioner.target.is('select:not([multiple])'))
			{
				throw new Error('ComboSelect expects it\'s underlying target element to to be a <select /> element without a "multiple" attribute');
			}
		};

		// Render an the equivilant control that represents an 
		// <option /> element for the underlying <select /> element. 
		AutoComplete.prototype.render = function()
		{
			Selectioner.Dialog.SingleSelect.prototype.render.apply(this, arguments);

			this.textElement = this
				.selectioner
				.display
				.element
				.find('input[type="text"]');
			
			if (this.textElement.length === 0)
			{
				throw new Error('AutoComplete expects the Display to contain an <input type="text" /> element');
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

		AutoComplete.prototype.update = function()
		{
			var dialog = this;

			var filterText = this.textElement.val().toLowerCase();
			
			var children = this.selectioner.target.find('option');
			var filteredOptions = $();
			
			for (var i = 0, length = children.length; i < length; i++)
			{
				var option = $(children[i]);
				var text = option.text().toLowerCase();
				
				if (text !== '' && text.indexOf(filterText) === 0)
				{
					filteredOptions = filteredOptions.add(this.renderOption(option));
					
					if (filteredOptions.length > this.selectioner.settings.maxAutoCompleteItems)
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
							$('<span />').text(this.selectioner.settings.noOptionText)
						);
			}
			
			this.element
				.empty()
				.append(filteredOptions);
		};
	}
);