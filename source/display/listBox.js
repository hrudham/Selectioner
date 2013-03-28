(function(){
	var ListBox = Selectioner.Display.ListBox = function() {};
	
	ListBox.prototype = new Selectioner.Display.Base();
	
	ListBox.prototype.render = function()
	{	
		this.element = $('<span />')
			.addClass('select-display')
			.prop('tabindex', this.select.prop('tabindex'));
			
		this.textElement = $('<span />')
			.addClass('select-text');
		
		var button = $('<span />').addClass('select-button');
		
		this.element
			.append(button)
			.append(this.textElement);
		
		this.select
			.css('display', 'none')
			.after(this.element);
	};

	ListBox.prototype.update = function()
	{	
		var selectedOptions = this.select.find('option:selected');
		this.textElement.removeClass('none');
		
		if (selectedOptions.length == 0)
		{
			this.textElement
				.text('None')
				.addClass('none');
		}
		else if (selectedOptions.length <= 2)
		{
			var displayText = '';
			for (var i = 0, length = selectedOptions.length; i < length; i++)
			{
				displayText += selectedOptions[i].text;
				
				if (i < length - 1)
				{
					displayText += ', ';
				}
			}
			this.textElement.text(displayText);
		}
		else
		{
			this.textElement.text('Selected ' + selectedOptions.length + ' of ' + this.select.find('option').length);
		}
	};
})();