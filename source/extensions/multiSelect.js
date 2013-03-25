$.fn.multiselect = function ()
{
	this
		.filter('select[multiple]')
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