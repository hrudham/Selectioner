var Dailog = Selectioner.Base.Dialog = function() {};

Dailog.prototype = new Eventable();

Dailog.prototype.initialize = function(select)
{	
	this.select = select;
};

Dailog.prototype.render = function()
{
	var element = $('<ul />');

	var children = this.select.children();
	
	for (var i = 0, length = children.length; i < length; i++)
	{
		var child = $(children[i]);
		if (children[i].tagName === 'OPTION')
		{
			element.append(this.renderOption(child));
		}
		else if (children[i].tagName === 'OPTGROUP')
		{
			element.append(this.renderGroup(child));
		}
	}	

	return element;	
};