define(
	['core/selectioner', 'dialog/single-select'],
	function()
	{
		var MultiSelect = Selectioner.Dialog.MultiSelect = function() {};

		MultiSelect._inputIdIndex = 0;

		// Inherit from the SingleSelect dialog, not the core dialog.
		MultiSelect.prototype = new Selectioner.Dialog.SingleSelect();

		MultiSelect.prototype.validateTarget = function()
		{
			if (!this.selectioner.target.is('select[multiple]'))
			{
				throw new Error('MultiSelect expects it\'s underlying target element to to be a <select /> element with a "multiple" attribute');
			}
		};

		// Render an the equivalent control that represents an
		// <option /> element for the underlying <select /> element. 
		// This overrides the SingleSelect version of this method.
		MultiSelect.prototype.renderOption = function(option)
		{
			var element = $('<li />');
			var checkboxId = 'MultiSelectCheckbox' + MultiSelect._inputIdIndex++;
			var checkbox = $('<input type="checkbox" />')
				.data('option', option)
				.attr('id', checkboxId);
							
			if (option[0].selected)
			{
				checkbox.attr('checked', 'checked');
			}
			
			var label = $('<label />')
				.append(checkbox)
				.append($('<span />').text(option.text()))
				.attr('for', checkboxId);
				
			var selectioner = this.selectioner;
				
			checkbox.on
				(
					'change.selectioner', 
					function() 
					{
						option[0].selected = this.checked;
						selectioner.target.trigger('change', { source: 'selectioner' });
					}
				);
				
			if (option.is(':disabled'))
			{
				label.addClass('disabled');
				checkbox.prop('disabled', true);
			}
				
			element.append(label);

			return element;
		};

		// Render an the equivalent control that represents an 
		// <optgroup /> element for the underlying <select /> element. 
		// This overrides the SingleSelect version of this method.
		MultiSelect.prototype.renderGroup = function(group)
		{
			var dialog = this;
			
			var toggleGroupSelect = function(event)
			{
				var checkboxes = $(this).closest('ul').find('input:checkbox:not(:disabled)');
				var checkedCount = checkboxes.filter(':checked').length;
				
				checkboxes
					.prop('checked', checkedCount != checkboxes.length || checkedCount === 0)
					.each
						(
							function()
							{
								$(this).data('option')[0].selected = this.checked;
							}
						);
				
				dialog.selectioner.target.trigger('change', { source: 'selectioner' });
			};
			
			var groupTitle = $('<a />')
					.attr('href', 'javascript:;')
					.on('click', toggleGroupSelect)
					.text(group.attr('label'));

			var options = $('<li />')
				.addClass(this.selectioner.settings.cssPrefix + 'group-title')
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

		MultiSelect.prototype.clearSelection = function()
		{
			this.getSelectableOptions()
				.find('input:checkbox:checked')
				.trigger('click');
		};
	}
);