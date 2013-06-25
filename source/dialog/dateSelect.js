var DateSelect = Selectioner.Dialog.DateSelect = function() {};

DateSelect.prototype = new Selectioner.Core.Dialog();

DateSelect.Settings = 
{
	monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
	weekStartIndex: 1
};

DateSelect.Utility = 
{
	isLeapYear: function(year)
	{
		return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
	},
	daysInMonth: function(year, month)
	{
		return [31, (DateSelect.Utility.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
	},
	dateToString: function(date)
	{
		var day = date.getDate().toString();
		var month = (date.getMonth() + 1).toString();
		var year = date.getFullYear().toString();
		
		if (day.length == 1) day = '0' + day;
		if (month.length == 1) month = '0' + month;
		
		return year + '-' + month + '-' + day;
	},
	buildScroller: function(collection)
	{	
		var buildItem = function(i)
		{
			return $('<a />')
				.attr('href', 'javascript:;')
				.append($('<span />').text(collection[i]));
		};
		
		return $('<div />')
			.append($('<a />').attr('href', 'javascript:;').addClass('up'))
			.append(buildItem(0).addClass('previous'))
			.append(buildItem(1).addClass('current'))
			.append(buildItem(2).addClass('next'))
			.append($('<a />').attr('href', 'javascript:;').addClass('down'));
	}
};

DateSelect.prototype.validateTarget = function()
{
	if (!this.selectioner.target.is('input[type="date"]'))
	{
		throw new Error('DateBox expects it\'s underlying target element to to be a <input type="date" /> element');
	}
};

DateSelect.prototype.render = function()
{
	var dateSelect = this;

	this.element = $('<div />')
		.addClass(Selectioner.Settings.cssPrefix + 'date')
		.on
			(
				'mousedown',
				'.days .previous, .days .up',
				function()
				{
					dateSelect.addDays(-1);
				}
			)
		.on
			(
				'click',
				'.days .next, .days .down',
				function()
				{
					dateSelect.addDays(1);
				}
			)
		.on
			(
				'click',
				'.months .previous, .months .up',
				function()
				{
					dateSelect.addMonths(-1);
				}
			)
		.on
			(
				'click',
				'.months .next, .months .down',
				function()
				{
					dateSelect.addMonths(1);
				}
			)
		.on
			(
				'click',
				'.years .previous, .years .up',
				function()
				{
					dateSelect.addYears(-1);
				}
			)
		.on
			(
				'click',
				'.years .next, .years .down',
				function()
				{
					dateSelect.addYears(1);
				}
			)
		.on
			(
				'click',
				'.current',
				function()
				{
					dateSelect.popup.hide();
				}
			);
		
	this.update();
};

DateSelect.prototype.update = function()
{
	var currentDate = this.getCurrentDate();
	
	// Years
	var currentYear = currentDate.getFullYear();
	
	// Months
	var currentMonth = currentDate.getMonth();
	var previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
	var nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
	var months = 
		[
			DateSelect.Settings.monthNames[previousMonth],
			DateSelect.Settings.monthNames[currentMonth],
			DateSelect.Settings.monthNames[nextMonth]
		];
	
	// Days
	var currentDay = currentDate.getDate();
	var previousDate = new Date(currentDate);
	previousDate.setDate(currentDay - 1);
	
	var days = 
		[
			(currentDay === 1 ? previousDate.getDate() : currentDay - 1),
			currentDay,
			(currentDay === DateSelect.Utility.daysInMonth(currentYear, currentMonth)) ? 1 : currentDay + 1
		];	
	
	// Build the control
	this.element
		.empty()
		.append(DateSelect.Utility.buildScroller(days).addClass('days'))
		.append(DateSelect.Utility.buildScroller(months).addClass('months'))
		.append(DateSelect.Utility.buildScroller([currentYear - 1, currentYear, currentYear + 1]).addClass('years'));
};

DateSelect.prototype.addDays = function(day)
{
	var date = this.getCurrentDate();
	date.setDate(date.getDate() + day);
	this.setCurrentDate(date);	
};

DateSelect.prototype.addMonths = function(months)
{
	var date = this.getCurrentDate();
	date.setMonth(date.getMonth() + months);
	this.setCurrentDate(date);	
};

DateSelect.prototype.addYears = function(years)
{
	var date = this.getCurrentDate();
	date.setYear(date.getFullYear() + years);
	this.setCurrentDate(date);	
};

// Get the currently selected date, or today's date if no date is selected.
DateSelect.prototype.getCurrentDate = function()
{
	var dateValue = this.selectioner.target.val();

	if (dateValue !== '')
	{
		var datePart = dateValue.match(/(\d+)/g);
		return new Date(datePart[0], datePart[1] - 1, datePart[2]); // months are zero-based
	}
	
	return this.getToday();
};

DateSelect.prototype.setCurrentDate = function(date)
{
	this.selectioner
		.target
		.val(DateSelect.Utility.dateToString(date))
		.trigger('change.selectioner');
	this.update();
};

// Get today's date.
DateSelect.prototype.getToday = function()
{
	var today = new Date();
	
	today.setHours(0);
	today.setMinutes(0);
	today.setSeconds(0);
	today.setMilliseconds(0);
	
	return today;
};

