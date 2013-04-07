var ComboSelect = Selectioner.Dialog.ComboSelect = function() {};

ComboSelect.prototype = new Selectioner.Dialog.SingleSelect();

// Render an the equivilant control that represents an 
// <option /> element for the underlying <select /> element. 
ComboSelect.prototype.renderOption = function(option)
{
	if (!option.is('option[value=""], option:empty:not([value])'))
	{
		return Selectioner.Dialog.SingleSelect.prototype.renderOption.call(this, option);
	}
	
	return null;
};