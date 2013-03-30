// Copy over the class and style attributes from the source element to the target element.
var copyCss = Selectioner.Utility.copyCss = function(source, target)
{
	// Copy over the class and styleattributes from the source element to the target element.
	target.attr('style', source.attr('style'));
	
	var classes = (source.attr('class') || '').split(' ');

	for (var i = 0, length = classes.length; i < length; i++)
	{
		target.addClass(classes[i]);
	}
};