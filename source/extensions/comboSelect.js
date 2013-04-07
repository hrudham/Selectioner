$.fn.comboSelect = function (textInput)
{
	this
		.filter('select:not([multiple]):visible')
		.each
		(
			function()
			{
				var comboBox = new Selectioner.Display.ComboBox(textInput);
				comboBox.initialize($(this));
				comboBox.addDialog(new Selectioner.Dialog.ComboSelect());
			}
		);
};