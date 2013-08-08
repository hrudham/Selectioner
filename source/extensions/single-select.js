define(
	['core/selectioner', 'display/list-box', 'dialog/single-select'],
	function()
	{
		$.fn.singleSelect = function ()
		{
			this.each(
				function()
				{
					new Selectioner(
						this, 
						new Selectioner.Display.ListBox(),
						new Selectioner.Dialog.SingleSelect());
				});
			
			return this;
		};
	});