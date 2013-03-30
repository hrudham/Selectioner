var SingleSelect = Selectioner.Dialog.SingleSelect = function() {};

SingleSelect.prototype = new Selectioner.Base.Dialog();

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
		
	Selectioner.Utility.copyData(option, selectAnchor);
	Selectioner.Utility.copyCss(option, selectAnchor);

	return $('<li />').append(selectAnchor);
};

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
	
	Selectioner.Utility.copyData(group, groupElement);
	Selectioner.Utility.copyCss(group, groupElement);

	return groupElement;
};