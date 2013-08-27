define(
	['core/selectioner', 'dialog/single-select'],
	function()
	{
		var MultiSelect = Selectioner.Dialog.MultiSelect = function() {};

		MultiSelect._inputIdIndex = 0;

		MultiSelect.prototype = new Selectioner.Dialog.SingleSelect();

		MultiSelect.prototype.validateTarget = function()
		{
			if (!this.selectioner.target.is('select[multiple]'))
			{
				throw new Error('Underlying element is expected to be a <select /> element with a "multiple" attribute');
			}
		};
		
		MultiSelect.prototype.bindEvents = function()
		{
			var dialog = this;
			var target = dialog.selectioner.target;
		
			var element = this.element
				.on(
					'change', 
					'input[type="checkbox"]',
					function()
					{
						target[0][this.getAttribute('data-index')].selected = this.checked;
						target.trigger('change', { source: 'selectioner' });
					})
				.on(
					'click',
					'li a',
					function()
					{
						// Allow group titles to toggle the check-boxes of all their child items.
						var checkboxes = $(this).closest('ul').find('input:checkbox:not(:disabled)');
						var checkedCount = checkboxes.filter(':checked').length;
						
						checkboxes
							.prop('checked', checkedCount != checkboxes.length || checkedCount === 0)
							.each(
								function()
								{
									target[0][this.getAttribute('data-index')].selected = this.checked;
								});
						
						target.trigger('change', { source: 'selectioner' });
					})
				.on(
					'mouseenter',
					'li',
					function()
					{	
						dialog.highlight(this);
					});
		};
		
		// Render an the equivalent control that represents an
		// <option /> element for the underlying <select /> element. 
		// This overrides the SingleSelect version of this method.
		MultiSelect.prototype.renderOption = function(option)
		{
			var checkboxId = 'MultiSelectCheckbox' + MultiSelect._inputIdIndex++;
			var checkbox = '<input type="checkbox" id="' + checkboxId + 
				'" data-index="' + option.index + '" ' + 
				(option.selected ? 'checked="checked" ' : '') + 
				(option.disabled ? 'disabled="disabled" ' : '') + '/>';
				
			var titleAttribute = '';
			var title = option.getAttribute('title');
			if (title)
			{
				titleAttribute = ' title="' + title.replace(/"/g, '&quot;') + '"';
			}
				
			return '<li' + titleAttribute + '><label for="' + checkboxId + '" ' + (option.disabled ? 'class="disabled"' : '') + '>' + 
				checkbox + 
				'<span>' + option.text + '</span>' + 
				'</label></li>';
		};

		// Render an the equivalent control that represents an 
		// <optgroup /> element for the underlying <select /> element. 
		// This overrides the SingleSelect version of this method.
		MultiSelect.prototype.renderGroup = function(group)
		{	
			var groupTitle = '<li class="' + this.selectioner.settings.cssPrefix + 'group-title' + '"><a href="javascript:;">' + group.label + '</a></li>';
			var options = '';
			
			for (var i = 0, length = group.children.length; i < length; i++)
			{
				options += this.renderOption(group.children[i]);
			}
				
			return '<li><ul>' + groupTitle + options + '</ul></li>';
		};

		MultiSelect.prototype.clearSelection = function()
		{
			this.getSelectableOptions()
				.find('input:checkbox:checked')
				.click();
		};
	});