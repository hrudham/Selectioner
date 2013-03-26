$.fn.multiselect = function ()
{
	this
		.filter('select[multiple]')
		.each
		(
			function()
			{
				var display = new Selectioner.Core.Display();
				display.initialize($(this), new Selectioner.Views.Dialogs.MultiSelect());
			}
		);
};