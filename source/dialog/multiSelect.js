(function(){
	var inputIdIndex = 0;

	var MultiSelect = Selectioner.Dialog.MultiSelect = function() {};
					
	MultiSelect.prototype = new Selectioner.Dialog.Base();

	MultiSelect.prototype.renderOption = function(option)
	{
		var element = $('<li />');
		var checkboxId = 'MultiSelectCheckbox' + inputIdIndex++;
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

		return element;
	};

	MultiSelect.prototype.renderOptionGroup = function(group)
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
		
		var groupAnchor = $('<a />')
				.attr('href', 'javascript:;')
				.on('click', toggleGroupSelect)
				.text(group.attr('label'));

		var options = $('<li />')
			.addClass('select-group-title')
			.append(groupAnchor);
		
		var children = group.children();
		for (var i = 0, length = children.length; i < length; i++)
		{
			var child = $(children[i]);
			options = options.add(this.renderOption(child));
		}

		return $('<li />').append
			(
				$('<ul >').append(options)
			);
	};
})();