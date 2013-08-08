define(
	['core/selectioner', 'display/combo-box', 'dialog/combo-select'],
	function()
	{
		$.fn.comboSelect = function (textInput)
		{
			this.each(
				function()
				{
					new Selectioner(
						this, 
						new Selectioner.Display.ComboBox(textInput),
						new Selectioner.Dialog.ComboSelect());
				});
				
			return this;
		};
	});