var AutoComplete = Selectioner.Dialog.AutoComplete = function() {};

AutoComplete.prototype = new Selectioner.Dialog.SingleSelect();

AutoComplete.prototype.validateTarget = function()
{
	if (!this.selectioner.target.is('select:not([multiple])'))
	{
		throw new Error('ComboSelect expects it\'s underlying target element to to be a <select /> element without a "multiple" attribute');
	}
};

// Render an the equivilant control that represents an 
// <option /> element for the underlying <select /> element. 
AutoComplete.prototype.render = function()
{
	SingleSelect.prototype.render.apply(this, arguments);

	this.textElement = this
		.selectioner
		.display
		.element
		.find('input[type="text"]');
	
	if (this.textElement.length === 0)
	{
		throw new Error('AutoComplete expects the Display to contain an <input type="text" /> element');
	}
	
	this.update();
	this._textValue = this.textElement.val();
	
	var dialog = this;
	
	this.textElement.on
		(
			'keyup change', 
			function(event)
			{
				if (dialog._textValue !== dialog.textElement.val())
				{
					dialog.update();
					if (!dialog.popup.isShown())
					{
						dialog.popup.show();
					}
					else
					{
						dialog.popup.reposition();
					}
					
					dialog._textValue = dialog.textElement.val();
				}
			}
		);
	
	this.update();
};

AutoComplete.prototype.update = function()
{
	var dialog = this;

	var buildOption = function(option)
	{
		var selectAnchor = $('<a />')
			.attr('href', 'javascript:;')
			.text(option.text())
			.on
				(
					'click', 
					function(event)
					{
						option[0].selected = true;
						dialog.popup.hide();
						dialog.selectioner.target.trigger('change');
					}
				);
		
		return $('<li />').append(selectAnchor);
	};

	var filterText = this.textElement.val().toLowerCase();
	
	var children = this.selectioner.target.find('option');
	var filteredOptions = $();
	
	for (var i = 0, length = children.length; i < length; i++)
	{
		var option = $(children[i]);
		var text = option.text().toLowerCase();
		
		if (text !== '' && text.indexOf(filterText) === 0)
		{
			filteredOptions = filteredOptions.add(buildOption(option));
			
			if (filteredOptions.length > Selectioner.Settings.maxAutoCompleteItems)
			{
				break;
			}
		}
	}
	
	if (filteredOptions.length === 0)
	{
		filteredOptions = $('<li />')
			.addClass('none')
			.append
				(
					$('<span />').text(Selectioner.Settings.noOptionText)
				);
	}
	
	this.element
		.empty()
		.append(filteredOptions);
};