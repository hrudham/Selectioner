$.fn.comboSelect = function ()
{
	this
		.filter('select:not([multiple])')
		.each
		(
			function()
			{
				var comboBox = new Selectioner.Display.ComboBox();
				comboBox.initialize($(this), new Selectioner.Dialog.SingleSelect());
			}
		);
};