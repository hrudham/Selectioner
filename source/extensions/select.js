$.fn.select = function ()
{
	this
		.filter('select:not([multiple])')
		.each
		(
			function()
			{
				var display = new Selectioner.Core.Display();
				display.initialize($(this), new Selectioner.Views.Dialogs.SingleSelect());
			}
		);
};