define(
	['core/selectioner', 'display/combo-box', 'dialog/auto-complete'],
	function()
	{
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
	}
);