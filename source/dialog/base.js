(function(){
	var DailogBase = Selectioner.Dialog.Base = function() {};

	DailogBase.prototype.initialize = function(select)
	{	
		this.select = select;
	};

	DailogBase.prototype.render = function()
	{
		var element = $('<ul />')

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
				element.append(this.renderOptionGroup(child));
			}
		}	

		return element;	
	};
	
	//Copies over all data attributes from one element to another.
	DailogBase.prototype.copyData = function(source, target)
	{
		var data = source.data();
		for (var attr in data)
		{
			target.attr('data-' + attr, data[attr]);
		}
	};
	
	DailogBase.prototype.copyCss = function(source, target)
	{
		// Copy over the class and styleattributes from the source element to the target element.
		target.attr('style', source.attr('style'));
		
		var classes = (source.attr('class') || '').split(' ');
	
		for (var i = 0, length = classes.length; i < length; i++)
		{
			target.addClass(classes[i]);
		}
	};
})();