define(
	['core/selectioner', 'display/combo-box', 'dialog/combo-select'],
	function()
	{
		$.fn.comboSelect = function ()
		{
			this.each(
				function()
				{
					new Selectioner(
						this, 
						new Selectioner.Display.ComboBox(),
						new Selectioner.Dialog.ComboSelect());
				});
				
			return this;
		};
	});