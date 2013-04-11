$.fn.autoComplete = function (textInput)
{
	this
		.filter('select:not([multiple])')
		.each
		(
			function()
			{
				var comboBox = new Selectioner.Display.ComboBox(textInput);
				comboBox.initialize($(this));
				comboBox.addDialog(new Selectioner.Dialog.AutoComplete());
			}
		);
		
	return this;
};