(function(){
	var ComboBox = Selectioner.Display.ComboBox = function(textElement) 
	{
		this.textElement = $(textElement);
	};
	
	ComboBox.prototype = new Selectioner.Display.Base();
		
	ComboBox.prototype.render = function()
	{	
		this.element = $('<span />')
			.addClass('select-display');
			
		this.textElement
			.addClass('select-text')
			.prop('tabindex', this.select.prop('tabindex'));
		
		var button = $('<span />')
			.addClass('select-button')
			.on('focus', function() {  });
		
		this.element
			.append(button)
			.append(this.textElement);
		
		this.select
			.css('display', 'none')
			.after(this.element);
	};
	
	ComboBox.prototype.update = function()
	{	
		var selectedOption = this.select.find('option:selected');
		this.textElement.removeClass('none');
			
		var value = selectedOption.text();
			
		if (selectedOption.length === 0)
		{
			this.textElement.addClass('none');
		}
		else if (value !== '')
		{
			this.textElement.val(value);
		}
	};
})();