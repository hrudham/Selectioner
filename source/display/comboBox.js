var ComboBox = Selectioner.Display.ComboBox = function() {};

ComboBox.prototype = new Selectioner.Core.Display();

ComboBox.prototype.validateTarget = function()
{
	if (!this.selectioner.target.is('select:not([multiple])'))
	{
		throw new Error('ComboBox expects it\'s underlying target element to to be a <select /> element without a "multiple" attribute');
	}
};
	
ComboBox.prototype.render = function()
{
	this.textElement = this.selectioner.target.next();
	
	if (!this.textElement.is('input[type="text"]'))
	{
		throw new Error('ComboBox expects the element to follow it\'s target <select /> to be an <input type="text" />');
	}
	
	var noSelectionText = this.getNoSelectionText();
	
	if (noSelectionText !== null)
	{
		this.textElement.attr('placeholder', this.getNoSelectionText());
	}
		
	// Turn off auto-completion on the text box.
	this.textElement.attr('autocomplete', 'off');

	// Make sure we have an empty option, otherwise throw an error.
	var emptyOptions = this.getEmptyOptions();
	if (emptyOptions.length === 0)
	{
		// We require an <option></option> element in the underlying select.
		throw new Error('ComboBox elements require an empty and value-less <option></option> in their underlying <select /> elements.');
	}

	this.element = $('<span />');
		
	var comboBox = this;
		
	this.textElement
		.addClass(Selectioner.Settings.cssPrefix + 'text')
		.on('change.selectioner', function() { comboBox.textChanged(); });
	
	var button = $('<span />')
		.addClass(Selectioner.Settings.cssPrefix + 'button');
	
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
	var option = this.selectioner.target.find('option')
		.filter(function() { return $(this).text().toUpperCase() == text; });
	
	if (option.length != 1)
	{
		option = this.getEmptyOptions();
	}
	
	option[0].selected = true;
	this.selectioner.target.trigger('change');
};

ComboBox.prototype.update = function()
{
	var selectedOption = this.selectioner.target.find('option:selected');
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
	return this.selectioner
		.target
		.find('option[value=""], option:empty:not([value])');
};

ComboBox.prototype.remove = function()
{
	this.selectioner
		.target
		.after(this.textElement);
		
	Selectioner.Core.Display.prototype.remove.call(this);
};

Display.prototype.getNoSelectionText = function()
{
	var text = this.selectioner
		.target
		.data('placeholder');
		
	if (!text)
	{
		text = this.textElement.attr('placeholder');
	}

	if (!text)
	{
		text = Selectioner.Settings.noSelectionText;
	}
	
	return text;	
};