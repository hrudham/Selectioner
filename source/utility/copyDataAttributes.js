// Copies over all HTML5 data attributes from one element to another.
// Note that we intentionally avoid using jQuery's data() method, 
// as we don't want things like data-attr="[Object object]".
var copyDataAttributes = Selectioner.Utility.copyDataAttributes = function(source, target)
{
	if (Selectioner.Settings.canCopyDataAttributes)
	{
		// Get all of the source element's data-attributes.
		var dataAttributes = {};
		source.each
			(
				function()
				{
					for (var i = 0, length = this.attributes.length; i < length; i++)
					{
						var attr = this.attributes[i];
						if (attr.name.indexOf('data-') === 0)
						{
							dataAttributes[attr.name] = attr.value;
						}
					}
				}
			);
			
		for (var attr in dataAttributes)
		{
			target.attr(attr, dataAttributes[attr]);
		}
	}
};