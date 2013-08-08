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
				throw new Error('ComboSelect expects it\'s underlying target element to to be a <select /> element without a "multiple" attribute');
			}
		};

		// Render an the equivalent control that represents an 
		// <option /> element for the underlying <select /> element. 
		ComboSelect.prototype.renderOption = function(option)
		{
			if (!option.is('option[value=""], option:empty:not([value])'))
			{
				return Selectioner.Dialog.SingleSelect.prototype.renderOption.call(this, option);
			}
			
			return null;
		};
	});