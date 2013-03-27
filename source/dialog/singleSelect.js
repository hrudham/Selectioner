(function(){
	var SingleSelect = Selectioner.Dialog.SingleSelect = function() {};

	SingleSelect.prototype = new Selectioner.Dialog.Base();

	SingleSelect.prototype.renderOption = function(option)
	{
		var select = this.select;

		var selectOption = function(event)
		{
			option[0].selected = true;
			select.trigger('change.selectioner');
		};

		var selectAnchor = $('<a />')
			.attr('href', 'javascript:;')
			.on('click', selectOption)
			.text(option.text());

		return $('<li />').append(selectAnchor);
	};

	SingleSelect.prototype.renderOptionGroup = function(group)
	{		
		var groupElement = $('<span />')
				.text(group.attr('label'));

		var options = $('<li />')
			.addClass('select-group-title')
			.append(groupElement);
		
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