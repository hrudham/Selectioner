$.fn.select = function ()
{
	this
		.filter('select')
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