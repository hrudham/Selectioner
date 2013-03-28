(function(){
	var DisplayBase = Selectioner.Display.Base = function() {};

	DisplayBase.prototype.initialize = function(select, dialog)
	{
		this.select = select;
		
		var selectStyle = select.attr('style');
		var selectClasses = (select.attr('class') || '').split(' ');
		var selectData = select.data();
		
		this.render();		
		this.update();
		
		// Copy over the class, style and any data attributes from the select element.
		this.element.attr('style', selectStyle);
		for (var i = 0, length = selectClasses.length; i < length; i++)
		{
			this.element.addClass(selectClasses[i]);
		}
		
		for (var attr in selectData)
		{
			this.element.attr('data-' + attr, selectData[attr]);
		}
					
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
				)
			.on
				(
					'show-dialog.selectioner',
					function(event)
					{
						display.element.addClass('select-visible');
					}
				)
			.on
				(
					'hide-dialog.selectioner',
					function(event)
					{
						display.element.removeClass('select-visible');
					}
				);
				
		dialog.initialize(select);
		
		var popup = new Selectioner.Popup.Base();
		popup.initialize(select, this, dialog);
	};

	DisplayBase.prototype.render = function()
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

	DisplayBase.prototype.update = function()
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
})();