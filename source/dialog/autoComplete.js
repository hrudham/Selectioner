var AutoComplete = Selectioner.Dialog.AutoComplete = function(textElement) 
{
	var dialog = this;
	
	this.textElement = $(textElement);
	
	this.textElement.on
		(
			'keyup', 
			function(event)
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
			}
		);
};

AutoComplete.prototype = new Selectioner.Base.Dialog();

// Render an the equivilant control that represents an 
// <option /> element for the underlying <select /> element. 
AutoComplete.prototype.render = function()
{
	this.element = $('<ul />');
	this.update();
	
	var dialog = this;
	var select = this.select;
	var children = this.select.find('option');
	
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
						select.trigger('change');
					}
				);
		
		return $('<li />').append(selectAnchor);
	};
	
	for (var i = 0, length = children.length; i < length; i++)
	{
		var option = $(children[i]);
		this.element.append(buildOption(option));
	}
	
	this.update();
};

AutoComplete.prototype.update = function()
{
	var filterText = this.textElement.val().toLowerCase();

	var children = this.element.find('li');
	
	var visibleChildren = children
		.filter
		(
			function() 
			{ 
				var text = $(this).text().toLowerCase();
				return text !== '' && text.indexOf(filterText) === 0; 
			}
		)
		.filter
		(
			function(index)
			{
				return index < Selectioner.Settings.maxAutoCompleteItems;
			}
		);
			
	children.not(visibleChildren).css('display', 'none');
	visibleChildren.css('display', '');
};