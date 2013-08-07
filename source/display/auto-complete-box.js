define(
	['core/selectioner', 'core/display'],
	function()
	{
		var AutoCompleteBox = Selectioner.Display.AutoCompleteBox = function() {};

		AutoCompleteBox.prototype = new Selectioner.Display.ComboBox();
		
		AutoCompleteBox.prototype.render = function()
		{
			Selectioner.Display.ComboBox.prototype.render.apply(this, arguments);
			
			this.element.addClass(this.selectioner.settings.cssPrefix + 'auto-complete');
		};
	}
);