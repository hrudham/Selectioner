var Display = function() {};

Display.prototype.initialize = function(select)
{
	this.select = select;
	
	this.render();
	
	this.select
		.css('display', 'none')
		.after(this.element);
		
	var display = this;
	
	// Find any labels associated with this select element,
	// and make them focus on this display instead.
	var selectId = select.attr('id');
	if (selectId !== undefined)
	{
		$('label[for="' + selectId + '"]')
			.on
				(
					'click',
					function (event)
					{
						display.element.trigger('focusin.select');
					}
				);
	}
		
	this.select
		.on
			(
				'change.select', 
				function(event)
				{
					display.update();
				}
			)
		.on
			(
				'show-dialog.select',
				function(event)
				{
					display.element.addClass('select-visible');
				}
			)
		.on
			(
				'hide-dialog.select',
				function(event)
				{
					display.element.removeClass('select-visible');
				}
			);
};

Display.prototype.render = function()
{	
	this.element = $('<span />')
		.prop('tabindex', this.select.prop('tabindex'))
		.addClass('select-display');
		
	this.textElement = $('<span />').addClass('select-text');
	
	this.button = $('<span />').addClass('select-button');
	
	this.element
		.append(this.button)
		.append(this.textElement);
		
	this.update();
};

Display.prototype.update = function()
{	
	var selectedOptions = this.select.find('option:selected');
	this.textElement.removeClass('none');
	
	if (selectedOptions.length == 0)
	{
		this.textElement.text('None');
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
