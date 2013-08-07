// Note that you may optionally include the excellent Globalize library in order 
// to get culturally formatted dates. See https://github.com/jquery/globalize
define(
	['core/selectioner', 'core/dialog'],
	function()
	{
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
				if (!date)
				{
					return null;
				}
			
				var day = date.getDate().toString();
				var month = (date.getMonth() + 1).toString();
				var year = date.getFullYear().toString();
				
				if (day.length == 1) day = '0' + day;
				if (month.length == 1) month = '0' + month;
				
				return year + '-' + month + '-' + day;
			},
			stringToTitleCase: function(input)
			{
				return input.replace
					(
						/\w\S*/g, 
						function (txt)
						{
							return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
						}
					);
			},
			buildScroller: function(collection, currentValue)
			{	
				var buildItem = function(i)
				{
					var item = $('<a />')
						.attr('href', 'javascript:;')
						.append($('<span />').text(collection[i]));
						
					if (currentValue === collection[i])
					{
						item.addClass('current');
					}
						
					return item;
				};
				
				return $('<span />')
					.addClass('scroller')
					.append($('<a />').attr('href', 'javascript:;').addClass('up'))
					.append(buildItem(0).addClass('previous'))
					.append(buildItem(1).addClass('selected'))
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
			
			var handleWheelChange = function(event)
			{
				event.preventDefault();
				
				var delta = 0;
				if (event.originalEvent.wheelDelta)
				{
					delta = event.originalEvent.wheelDelta;
				}
				else
				{
					delta = -1 * event.originalEvent.deltaY;
				}
				
				return delta < 0 ? 1 : -1;
			};

			this.element = $('<div />')
				.on
					(
						'mousewheel wheel', 
						function(event) 
						{ 
							// Stop the mouse wheel being picked up outside of this 
							// control, even when it's contents are being re-rendered.
							event.preventDefault();
						}
					)
				.addClass(this.selectioner.settings.cssPrefix + 'date')
				.on
					(
						'mousewheel wheel',
						'.days',
						function(event)
						{
							dateSelect.addDays(handleWheelChange(event));
						}
					)
				.on
					(
						'mousewheel wheel',
						'.months',
						function(event)
						{
							dateSelect.addMonths(handleWheelChange(event));
						}
					)
				.on
					(
						'mousewheel wheel',
						'.years',
						function(event)
						{
							dateSelect.addYears(handleWheelChange(event));
						}
					)
				.on
					(
						'click',
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
						'.selected',
						function()
						{
							dateSelect.setCurrentDate(dateSelect.getCurrentDate());
							dateSelect.popup.hide();
						}
					)
				.on
					(
						'click',
						'.today',
						function()
						{
							// Always set the date, in case it's been 
							// cleared, and we want to set it to today.
							dateSelect.setCurrentDate(new Date());
							dateSelect.popup.hide();
						}
					)
				.on
					(
						'click',
						'.clear',
						function()
						{
							dateSelect.setCurrentDate(null);
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
			var monthNames = DateSelect.Settings.monthNames;
			
			if (window.Globalize)
			{
				monthNames = Globalize.culture().calendars.standard.months.namesAbbr;
			}
			
			var currentMonth = currentDate.getMonth();
			var previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
			var nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
			var months = 
				[
					DateSelect.Utility.stringToTitleCase(monthNames[previousMonth]),
					DateSelect.Utility.stringToTitleCase(monthNames[currentMonth]),
					DateSelect.Utility.stringToTitleCase(monthNames[nextMonth])
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
				
			var today = new Date();
			
			var todayButton = $('<a />').attr('href', 'javascript:;')
				.addClass('today')
				.append($('<span />').text('Today'));
				
			var clearButton = $('<a />')
				.attr('href', 'javascript:;')
				.addClass('clear')
				.append($('<span />').text('Clear'));
			
			// Build the control
			this.element
				.empty()
				.append(todayButton);
				
			// Attempt to define the order of the scrollers
			// based upon the user's culture settings.
			var diviningDate = new Date(1999, 7, 4);
			var dateString = diviningDate.toLocaleDateString();
			if (window.Globalize)
			{
				dateString = Globalize.format(diviningDate, 'd');
			}
			
			var monthIndex = dateString.indexOf('8');
			if (monthIndex === -1)
			{
				monthIndex = dateString.search(/[^\d ]/i);
			}
			
			var scrollers = 
				[  
					{
						index: dateString.indexOf('99'),
						element: DateSelect.Utility.buildScroller([currentYear - 1, currentYear, currentYear + 1], today.getFullYear()).addClass('years')
					},
					{
						index: monthIndex, // Month is zero-based, hence we add one.
						element: DateSelect.Utility.buildScroller(months, monthNames[today.getMonth()]).addClass('months')
					},
					{
						index: dateString.indexOf('4'),
						element: DateSelect.Utility.buildScroller(days, today.getDate()).addClass('days')
					}
				];
				
			scrollers.sort
					(
						function(a, b)
						{
							return a.index > b.index;
						}
					);
			
			for (var i = 0; i < 3; i++)
			{
				this.element.append(scrollers[i].element);
			}
				
			this.element.append(clearButton);
		};

		DateSelect.prototype.addDays = function(day)
		{
			// zero is "falsy", so do nothing for it.
			if (day)
			{
				var date = this.getCurrentDate();
				date.setDate(date.getDate() + day);
				this.setCurrentDate(date);	
			}
		};

		DateSelect.prototype.addMonths = function(months)
		{
			// zero is "falsy", so do nothing for it.
			if (months)
			{
				var date = this.getCurrentDate();
				date.setMonth(date.getMonth() + months);
				this.setCurrentDate(date);	
			}
		};

		DateSelect.prototype.addYears = function(years)
		{
			// zero is "falsy", so do nothing for it.
			if (years)
			{
				var date = this.getCurrentDate();
				date.setYear(date.getFullYear() + years);
				this.setCurrentDate(date);	
			}
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
			
			return new Date();
		};

		DateSelect.prototype.setCurrentDate = function(date)
		{
			this.selectioner
				.target
				.val(DateSelect.Utility.dateToString(date))
				.trigger('change.selectioner');
			this.update();
		};

		// Handle key-down events. This method is called by the pop-up, and
		// thus usually should not be called manually elsewhere.
		DateSelect.prototype.keyDown = function (key)
		{
			var result = Selectioner.Core.Dialog.prototype.keyDown.call(this, key);
				
			if (!result.handled)
			{
				switch(key)
				{				
					// Up arrow
					case 38: 
						this.addDays(-1);
						result.handled = true;
						result.preventDefault = true;
						break;
						
					// Down arrow
					case 40: 
						this.addDays(1);
						result.handled = true;
						result.preventDefault = true;
						break;
					
					// Backspace			
					case 8: 
						this.setCurrentDate(null);
						this.popup.hide();
						result.handled = true;
						result.preventDefault = true;
						break;
						
					// Space
					case 32:
					// Enter / Return
					case 13:
						this.setCurrentDate(this.getCurrentDate());
						this.popup.hide();
						result.handled = true;
						result.preventDefault = true;
						break;
				}
			}
				
			return result;
		};
	}
);