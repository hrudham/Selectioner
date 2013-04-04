// Copy over the class attributes from the source element to the target element.
// Also removes those that had been copied previously but no longer exist on the source element.
var copyCssClasses = Selectioner.Utility.copyCssClasses = function(source, target)
{
	if (Selectioner.Settings.canCopyCssClasses)
	{
		// Get all the classes on the source element.
		var classes = (source.attr('class') || '').split(' ');
	
		var dataAttributeName = Selectioner.Settings.dataAttributePrefix + 'parent-css-class';
		
		// Remove any old classes on the target that no longer exist 
		// on the source element that were originally copied from it.
		var oldClasses = target.data(dataAttributeName) || [];
		for (var i = 0, length = oldClasses.length; i < length; i++)
		{
			var oldClass = oldClasses[i];
			if (classes.indexOf(oldClass) < 0)
			{
				target.removeClass(oldClass);
			}
		}
		
		// Save all the classes that belonged to the parent as a data attribute.
		target.data(dataAttributeName, classes);
		
		// Add the source's classes to the target element.
		for (var j = 0, classLength = classes.length; j < classLength; j++)
		{
			target.addClass(classes[j]);
		}
	}
};