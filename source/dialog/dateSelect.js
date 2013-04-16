/*
	Soem of this code was inspired by the DatePicker for Bootstrap plugin,
	which can be found here: http://www.eyecon.ro/bootstrap-datepicker/
*/

var DateSelect = Selectioner.Dialog.DateSelect = function() {};

DateSelect.prototype = new Selectioner.Core.Dialog();

DateSelect.Settings = 
{
	dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
	shortDayNames: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
	monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
	shortMonthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'],
	weekStartIndex: 1
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
	this.element = $('<div />')
		.addClass(Selectioner.Settings.cssPrefix + 'date');
		
	this.renderDays(this.getDate());
};

DateSelect.prototype.update = function()
{
	this.renderDays(this.getDate());
};

DateSelect.prototype.renderDays = function(date)
{
	var dateSelect = this;
	
	var weekStartIndex = DateSelect.Settings.weekStartIndex;
	
	var isLeapYear = function (year) 
	{
		return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
	};
	
	var getDaysInMonth = function (year, month) 
	{
		return [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
	};
	
	var prevMonthDate = new Date(date.getFullYear(), date.getMonth() - 1, 28, 0, 0, 0, 0);
	var day = getDaysInMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth());
	prevMonthDate.setDate(day);
	prevMonthDate.setDate(day - (prevMonthDate.getDay() - weekStartIndex + 7) % 7);
	
	var nextMonthDate = new Date(prevMonthDate);
	nextMonthDate.setDate(nextMonthDate.getDate() + 42);
	nextMonthDate = nextMonthDate;
	
	// Header
	var renderHeader = function()
	{
		var currentMonth = $('<span />')
			.text(DateSelect.Settings.shortMonthNames[date.getMonth()] + ' ' + date.getFullYear());
		
		var nextMonth = $('<a />')
			.attr('href', 'javascript:;')
			.addClass('next')
			.text('›')
			.on
				(
					'click', 
					function()
					{
						dateSelect.renderDays(nextMonthDate);
					}
				);
		
		var previousMonth = $('<a />')
			.attr('href', 'javascript:;')
			.addClass('prev')
			.text('‹')
			.on
				(
					'click', 
					function()
					{
						dateSelect.renderDays(prevMonthDate);
					}
				);
		
		return $('<div />')
			.append(previousMonth)
			.append(currentMonth)
			.append(nextMonth);
	};
		
	// Body
	var renderBody = function()
	{
		var thead = $('<thead />');
		var headRow = $('<tr />');
		
		var dayNames = DateSelect.Settings.shortDayNames;
		
		for (var dayNameIndex = 0, dayNamesLength = dayNames.length; dayNameIndex < dayNamesLength; dayNameIndex++)
		{
			headRow.append($('<th />').text(dayNames[(dayNameIndex + weekStartIndex) % 7]));
		}
		thead.append(headRow);
	
		var tbody = $('<tbody />');
	
		// Find out what days we need to display.
		var days = [];
		var recursiveDate = new Date(prevMonthDate.valueOf());
		var currentMonth = date.getMonth();
		var today = dateSelect.getToday().valueOf();
		var selectedDate = new Date(dateSelect.getDate().valueOf());
		selectedDate.setHours(0);
		selectedDate.setMinutes(0);
		selectedDate.setSeconds(0);
		selectedDate.setMilliseconds(0);
		var selectedDateValue = selectedDate.valueOf();
		
		while (recursiveDate.valueOf() < nextMonthDate.valueOf()) 
		{
			var dateValue = recursiveDate.valueOf();
			var dateOfMonth = recursiveDate.getDate();
			var dayOfWeek = recursiveDate.getDay();
			
			days.push
				({
					name: dateOfMonth,
					isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
					isNextMonth: recursiveDate.getMonth() > currentMonth,
					isPrevMonth: recursiveDate.getMonth() < currentMonth,
					isToday: today === dateValue,
					isSelected: selectedDateValue === dateValue,
					dateValue: dateValue
				});
				
			recursiveDate.setDate(dateOfMonth + 1);
		}
		
		var dateToString = function(date)
		{
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
			
			return year + '-' + month + '-' + day;
		};
		
		var buildDateCell = function(day)
		{
			var dayDate = new Date(day.dateValue);
			var cell = $('<td />')
				.text(day.name)
				.on 
					(
						'click',
						function()
						{
							dateSelect
								.selectioner
								.target
								.val(dateToString(dayDate))
								.trigger('change.selectioner');
								
							dateSelect.renderDays(dateSelect.getDate());
						}
					);
			
			if (day.isWeekend)
			{
				cell.addClass('weekend');
			}
			
			if (day.isNextMonth)
			{
				cell.addClass('next-month');
			}
			
			if (day.isPrevMonth)
			{
				cell.addClass('prev-month');
			}
			
			if (day.isToday)
			{
				cell.addClass('today');
			}
			
			if (day.isSelected)
			{
				cell.addClass('selected');
			}
			
			return cell;
		};
		
		// Render out each individual day. We make the assumption here that 
		// there will be exactly seven items per row, and that the total number 
		// of days we found is evenly divisible by seven as well.
		for (var i = 0, length = days.length / 7; i < length; i++)
		{
			var weekRow = $('<tr />');
			for (var j = 0; j < 7; j++)
			{
				weekRow.append(buildDateCell(days[i * 7 + j]));
			}
			tbody.append(weekRow);
		}
		
		return $('<table />')
			.append(thead)
			.append(tbody);
	};
	
	this.element
		.empty()
		.append(renderHeader())
		.append(renderBody());
};

// Get the currently selected date, or today's date if no date is selected.
DateSelect.prototype.getDate = function()
{
	var dateValue = this.selectioner.target.val();

	if (dateValue !== '')
	{
		return new Date(dateValue);
	}
	
	return this.getToday();
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

