var SingleSelect = Selectioner.Dialog.SingleSelect = function() {};

SingleSelect.prototype = new Selectioner.Base.Dialog();

SingleSelect.prototype.render = function()
{
	this.element = $('<ul />');

	var children = this.select.children();
	
	for (var i = 0, length = children.length; i < length; i++)
	{
		var child = $(children[i]);
		if (children[i].tagName == 'OPTION')
		{
			this.element.append(this.renderOption(child));
		}
		else if (children[i].tagName == 'OPTGROUP')
		{
			this.element.append(this.renderGroup(child));
		}
	}
};

// Render an the equivilant control that represents an 
// <option /> element for the underlying <select /> element. 
SingleSelect.prototype.renderOption = function(option)
{
	var select = this.select;

	var selectOption = function(event)
	{
		option[0].selected = true;
		select.trigger('change');
	};
	
	var text = option.text();

	var selectAnchor = $('<a />')
		.attr('href', 'javascript:;')
		.on('click', selectOption)
		.text(text || Selectioner.Settings.emptyOptionText);
	
	var listItem = $('<li />');
	
	if (!text)
	{
		listItem.addClass('none');
	}

	return listItem.append(selectAnchor);
};

// Render an the equivilant control that represents an 
// <optgroup /> element for the underlying <select /> element. 
SingleSelect.prototype.renderGroup = function(group)
{		
	var groupTitle = $('<span />')
			.text(group.attr('label'));

	var options = $('<li />')
		.addClass(settings.cssPrefix + 'group-title')
		.append(groupTitle);
	
	var children = group.children();
	for (var i = 0, length = children.length; i < length; i++)
	{
		var child = $(children[i]);
		options = options.add(this.renderOption(child));
	}
	
	var groupElement = $('<li />').append
		(
			$('<ul >').append(options)
		);

	return groupElement;
};