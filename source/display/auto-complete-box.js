define(
	['core/selectioner', 'core/display'],
	function()
	{
		var AutoCompleteBox = Selectioner.Display.AutoCompleteBox = function() {};

		AutoCompleteBox.prototype = new Selectioner.Display.ComboBox();
		
		AutoCompleteBox.prototype.render = function()
		{
			Selectioner.Display.ComboBox.prototype.render.apply(this);
			
			this.element.addClass(this.selectioner.settings.cssPrefix + 'auto-complete');
		};
		
		AutoCompleteBox.prototype.getNoSelectionText = function()
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