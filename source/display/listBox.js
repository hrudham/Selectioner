var ListBox = Selectioner.Display.ListBox = function() {};

ListBox.prototype = new Selectioner.Base.Display();

ListBox.prototype.render = function()
{	
	this.element = $('<span />')
		.addClass(settings.cssPrefix + 'display')
		.prop('tabindex', this.select.prop('tabindex'));
		
	this.textElement = $('<span />')
		.addClass(settings.cssPrefix + 'text');
	
	var button = $('<span />').addClass(settings.cssPrefix + 'button');
	
	this.element
		.append(button)
		.append(this.textElement);
};

ListBox.prototype.update = function()
{
	var selectedOptions = this.select.find('option:selected');
	this.textElement.removeClass('none');
	
	if (selectedOptions.length === 0 || selectedOptions.is('option[value=""], option:empty:not([value])'))
	{
		var text = Selectioner.Settings.noSelectionText;
		
		if (!text)
		{
			this.textElement.html('&nbsp;');
		}
		else
		{
			this.textElement.text(text);
		}
		
		this.textElement.addClass('none');
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