$.fn.comboSelect = function (textInput)
{
	this
		.each
		(
			function()
			{
				new Selectioner
					(
						this, 
						new Selectioner.Display.ComboBox(textInput),
						new Selectioner.Dialog.ComboSelect()
					);
			}
		);
		
	return this;
};