var DateBox = Selectioner.Display.DateBox = function() {};

DateBox.prototype = new Selectioner.Core.Display();

DateBox.prototype.validateTarget = function()
{
	if (!this.selectioner.target.is('input[type="date"]'))
	{
		throw new Error('DateBox expects it\'s underlying target element to to be a <input type="date" /> element');
	}
};

DateBox.prototype.render = function()
{
	this.element = $('<span />');
		
	this.textElement = $('<span />')
		.addClass(Selectioner.Settings.cssPrefix + 'text');
	
	var button = $('<span />').addClass(Selectioner.Settings.cssPrefix + 'button');
	
	this.element
		.append(button)
		.append(this.textElement);
};

DateBox.prototype.update = function()
{
	var dateValue = this.selectioner.target.val();

	if (dateValue !== '')
	{
		var datePart = dateValue.match(/(\d+)/g);
		date = new Date(datePart[0], datePart[1] - 1, datePart[2]); // months are zero-based
		
		var day = date.getDate().toString();
		var month = (date.getMonth() + 1).toString();
		var year = date.getFullYear().toString();
		
		if (day.length == 1)
		{
			day = '0' + day;
		}
		
		if (month.length == 1)
		{
			month = '0' + month;
		}
		
		this.textElement
			.removeClass('none')
			.text(year + '-' + month + '-' + day);
	}
	else
	{
		this.textElement
			.addClass('none')
			.text(this.selectioner.target.attr('placeholder') || 'Select a date');
	}
};