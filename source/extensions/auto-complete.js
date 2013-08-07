define(
	['core/selectioner', 'display/auto-complete', 'dialog/filtered-select'],
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
								new Selectioner.Display.AutoComplete(),
								new Selectioner.Dialog.FilteredSelect()
							);
					}
				);
				
			return this;
		};
	}
);