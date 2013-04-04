var ComboBox = Selectioner.Display.ComboBox = function(textElement) 
{
	this.textElement = $(textElement);
};

ComboBox.prototype = new Selectioner.Base.Display();
	
ComboBox.prototype.render = function()
{	
	this.element = $('<span />')
		.addClass(settings.cssPrefix + 'display')
		.prop('tabindex', this.select.prop('tabindex'));
		
	this.textElement
		.addClass(settings.cssPrefix + 'text');
	
	var button = $('<span />')
		.addClass(settings.cssPrefix + 'button')
		.on('focus', function() {  });
	
	this.element
		.append(button)
		.append(this.textElement);
};

ComboBox.prototype.update = function()
{
	this.updateAttributes();

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