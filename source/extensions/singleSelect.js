$.fn.singleSelect = function ()
{
	this
		.filter('select:not([multiple]):visible')
		.each
		(
			function()
			{
				var listBox = new Selectioner.Display.ListBox();
				listBox.initialize($(this));
				listBox.addDialog(new Selectioner.Dialog.SingleSelect());
			}
		);
};