// Copies over all data attributes from one element to another.
var copyData = Selectioner.Utility.copyData = function(source, target)
{
	var data = source.data();
	for (var attr in data)
	{
		target.attr('data-' + attr, data[attr]);
	}
};