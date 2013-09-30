define(
	['display/combo-box'],
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
			return (
				this.selectioner.target.data('placeholder') ||
				this.textElement.attr('placeholder') ||
				this.selectioner.settings.typeToSearchText);
		};
	});