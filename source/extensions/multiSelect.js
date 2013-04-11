$.fn.multiSelect = function ()
{
	this
		.filter('select[multiple]')
		.each
		(
			function()
			{
				var listBox = new Selectioner.Display.ListBox();
				listBox.initialize($(this));
				listBox.addDialog(new Selectioner.Dialog.MultiSelect());
			}
		);
		
	return this;
};