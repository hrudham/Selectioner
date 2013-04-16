$.fn.dateSelect = function ()
{
	this
		.each
		(
			function()
			{
				new Selectioner
					(
						this, 
						new Selectioner.Display.DateBox(),
						new Selectioner.Dialog.DateSelect()
					);
			}
		);
	
	return this;
};