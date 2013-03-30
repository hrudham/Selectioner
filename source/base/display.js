var Display = Selectioner.Base.Display = function() {};

Display.prototype = new Eventable();

Display.prototype.initialize = function(select, dialog)
{
	this.select = select;
		
	this.render();		
	this.update();
		
	Selectioner.Utility.copyData(select, this.element);
	Selectioner.Utility.copyCss(select, this.element);
	
	this.select
		.css('display', 'none')
		.after(this.element);
	
	var display = this;
	
	// Find any labels associated with this select element,
	// and make them focus on this display instead.
	var selectId = select.attr('id');
	if (selectId !== undefined)
	{
		this.labels = $(document)
			.on
				(
					'click.selectioner',
					'label[for="' + selectId + '"]',
					function (event)
					{
						display.element.focus();
					}
				);
	}
	
	this.select
		.on
			(
				'change.selectioner', 
				function(event)
				{
					display.update();
				}
			);
	
	dialog.initialize(select);
			
	var popup = new Selectioner.Base.Popup();
	popup.initialize(select, this, dialog);
			
	popup
		.on
			(
				'show.selectioner',
				function(event)
				{
					display.element.addClass('select-visible');
				}
			)
		.on
			(
				'hide.selectioner',
				function(event)
				{
					display.element.removeClass('select-visible');
				}
			);
};

Display.prototype.render = function()
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
};

Display.prototype.update = function()
{	
	var selectedOptions = this.select.find('option:selected');
	this.textElement.removeClass('none');
	
	if (selectedOptions.length === 0)
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