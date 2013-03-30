var MultiSelect = Selectioner.Dialog.MultiSelect = function() {};

MultiSelect._inputIdIndex = 0;
				
MultiSelect.prototype = new Selectioner.Base.Dialog();

MultiSelect.prototype.renderOption = function(option)
{
	var element = $('<li />');
	var checkboxId = 'MultiSelectCheckbox' + MultiSelect._inputIdIndex++;
	var checkbox = $('<input type="checkbox" />')
		.attr('id', checkboxId);
					
	if (option[0].selected)
	{
		checkbox.attr('checked', 'checked');
	}
		
	var label = $('<label />')
		.append(checkbox)
		.append($('<span />').text(option.text()))
		.attr('for', checkboxId);
		
	var dialog = this;
		
	checkbox.on
		(
			'change.selectioner', 
			function() 
			{
				option[0].selected = this.checked;
				dialog.select.trigger('change.selectioner');
			}
		);
		
	element.append(label);
	
	Selectioner.Utility.copyData(option, element);
	Selectioner.Utility.copyCss(option, element);

	return element;
};

MultiSelect.prototype.renderGroup = function(group)
{
	var dialog = this;
	var toggleGroupSelect = function(event)
	{
		var checkboxes = $(this).closest('ul').find('input:checkbox');
		var checkedCount = checkboxes.filter(':checked').length;
		if (checkedCount > 0 && checkboxes.length === checkedCount)
		{
			checkboxes.prop('checked', false);
		}
		else
		{
			checkboxes.prop('checked', true);
		}
		
		checkboxes.trigger('change.selectioner');
	};
	
	var groupTitle = $('<a />')
			.attr('href', 'javascript:;')
			.on('click', toggleGroupSelect)
			.text(group.attr('label'));

	var options = $('<li />')
		.addClass('select-group-title')
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
	
	Selectioner.Utility.copyData(group, groupElement);
	Selectioner.Utility.copyCss(group, groupElement);

	return groupElement;
};