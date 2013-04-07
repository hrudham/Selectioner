var ComboBox = Selectioner.Display.ComboBox = function(textElement) 
{
	this.textElement = $(textElement);
};

ComboBox.prototype = new Selectioner.Base.Display();
	
ComboBox.prototype.render = function()
{
	// If the select element does not already 
	// have an option without a value, then add one.
	var emptyOption = this.getEmptyOptions();
	if (emptyOption.length === 0)
	{
		this.select.prepend($('<option />'));
	}

	this.element = $('<span />')
		.addClass(settings.cssPrefix + 'display')
		.prop('tabindex', this.select.prop('tabindex'));
		
	var comboBox = this;
		
	this.textElement
		.addClass(settings.cssPrefix + 'text')
		.on('change.selectioner', function() { comboBox.textChanged(); });
	
	var button = $('<span />')
		.addClass(settings.cssPrefix + 'button');
	
	this.element
		.append(button)
		.append(this.textElement);
};

ComboBox.prototype.textChanged = function()
{
	// Find out if the text matches an item in 
	// the drop-down, and select it if it does.
	// If it doesn't match an option, select the 
	// option with no value.
	var text = this.textElement.val().toUpperCase();
	var option = this.select.find('option')
		.filter(function() { return $(this).text().toUpperCase() == text; });
	
	if (option.length != 1)
	{
		option = this.getEmptyOptions();
	}
	
	option[0].selected = true;
	this.select.trigger('change');
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

ComboBox.prototype.getEmptyOptions = function()
{
	// Find all options that either have an 
	// empty value, or have no value and no text.
	return this.select
		.find('option[value=""], option:empty:not([value])');
};