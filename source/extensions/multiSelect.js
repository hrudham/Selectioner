$.fn.multiSelect = function ()
{
	this
		.each
		(
			function()
			{
				new Selectioner
					(
						this, 
						new Selectioner.Display.ListBox(),
						new Selectioner.Dialog.MultiSelect()
					);
			}
		);
		
	return this;
};