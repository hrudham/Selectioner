define(
	['core/selectioner', 'core/display'],
	function()
	{
		var AutoComplete = Selectioner.Display.AutoComplete = function() {};

		AutoComplete.prototype = new Selectioner.Display.ComboBox();
		
		AutoComplete.prototype.render = function()
		{
			Selectioner.Display.ComboBox.prototype.render.apply(this);
			
			this.cssClass = this.selectioner.settings.cssPrefix  + 'auto-complete';
		};
		
		AutoComplete.prototype.getNoSelectionText = function()
		{
			var text = this.selectioner
				.target
				.data('placeholder');

			if (!text)
			{
				text = this.selectioner.settings.typeToSearchText;
			}
			
			return text;	
		};
	}
);