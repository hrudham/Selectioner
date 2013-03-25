$.fn.select = function ()
{
	this
		.filter('select:not([multiple])')
		.each
		(
			function()
			{
				var select = $(this);
				var display = new Display();
				display.initialize(select);
				var dialog = new Dialog();
				dialog.initialize(select, display);
			}
		);
};