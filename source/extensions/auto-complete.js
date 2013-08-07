define(
	['core/selectioner', 'display/auto-complete-box', 'dialog/auto-complete'],
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
								new Selectioner.Display.AutoCompleteBox(),
								new Selectioner.Dialog.AutoComplete()
							);
					}
				);
				
			return this;
		};
	}
);