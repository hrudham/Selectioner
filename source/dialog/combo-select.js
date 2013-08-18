define(
	['core/selectioner', 'dialog/single-select'],
	function()
	{
		var ComboSelect = Selectioner.Dialog.ComboSelect = function() {};

		ComboSelect.prototype = new Selectioner.Dialog.SingleSelect();

		ComboSelect.prototype.validateTarget = function()
		{
			if (!this.selectioner.target.is('select:not([multiple])'))
			{
				throw new Error('Underlying element is expected to be a <select /> element without a "multiple" attribute');
			}
		};
		
		ComboSelect.prototype.isEmpty = function()
		{
			return this.selectioner
				.target
				.children()
				.not('option[value=""], option:empty:not([value])')
				.length === 0;
		};

		// Render an the equivalent control that represents an 
		// <option /> element for the underlying <select /> element. 
		ComboSelect.prototype.renderOption = function(option)
		{
			if (option.value)
			{
				return Selectioner.Dialog.SingleSelect.prototype.renderOption.call(this, option);
			}
			
			return '';
		};
		
		ComboSelect.prototype.keyPress = function(simpleEvent)
		{
			var result = { handled: false };

			// Do not filter on enter / return or tab.
			if (simpleEvent.key != 13 && simpleEvent.key != 9)
			{
				this.popup.show();
			
				var filter = this.selectioner.display.textElement.val().toUpperCase() + 
					String.fromCharCode(simpleEvent.key).toUpperCase();
					
				var options = this.getSelectableOptions();
				for (var i = 0, length = options.length; i < length; i++)
				{
					var option = $(options[i]);
					if (option.text().toUpperCase().indexOf(filter) === 0)
					{
						options.removeClass('highlight');
						option.addClass('highlight');
						this.scrollToHighlightedOption();
						break;
					}
				}
			}
			
			return result;
		};
	});