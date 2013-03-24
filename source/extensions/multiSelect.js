$.fn.multiselect = function ()
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
				var dialog = new MultiSelectDialog();
				dialog.initialize(select, display);
			}
		);
};