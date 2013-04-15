$.fn.autoComplete = function ()
{
	this
		.each
		(
			function()
			{
				new Selectioner
					(
						this, 
						new Selectioner.Display.ComboBox(),
						new Selectioner.Dialog.AutoComplete()
					);
			}
		);
		
	return this;
};