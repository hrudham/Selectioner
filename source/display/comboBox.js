(function(){
	var ComboBox = Selectioner.Display.ComboBox = function() {};
	
	ComboBox.prototype = new Selectioner.Display.Base();
	
	ComboBox.prototype.render = function()
	{	
		var element = $('<span />')
			.prop('tabindex', this.select.prop('tabindex'))
			.addClass('select-display');
			
		this.inputElement = $('<input type="text" />')
			.attr('placeholder', 'None')
			.addClass('select-text');
		
		var button = $('<span />').addClass('select-button');
		
		element
			.append(button)
			.append(this.inputElement);
			
		this.update();
		
		return element;
	};
	
	ComboBox.prototype.update = function()
	{	
		var selectedOption = this.select.find('option:selected');
		this.inputElement
			.removeAttr('placeholder')
			.removeClass('none');
			
		var value = '';
		
		if (selectedOption.length === 0)
		{
			this.inputElement.addClass('none');
		}
		else 
		{
			this.inputElement.val(selectedOption.text());
		}
	};
})();