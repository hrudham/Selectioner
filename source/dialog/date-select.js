// Note that you may optionally include the excellent Globalize library in order 
// to get culturally formatted dates. See https://github.com/jquery/globalize

define(
	['core/dialog'],
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
				throw new Error('Underlying element is expected to be an <input type="date" /> element');
			}
		};

		DateSelect.prototype.render = function()
		{
			var dateSelect = this;
			
			var handleWheelChange = function(e)
			{
				e.preventDefault();
				
				var delta = 0;
				if (e.originalEvent.wheelDelta)
				{
					delta = e.originalEvent.wheelDelta;
				}
				else
				{
					delta = -1 * e.originalEvent.deltaY;
				}
				
				return delta < 0 ? 1 : -1;
			};

			this.element = $('<div />')
				.on
					(
						'mousewheel wheel', 
						function(e) 
						{ 
							// Stop the mouse wheel being picked up outside of this 
							// control, even when it's contents are being re-rendered.
							e.preventDefault();
						}
					)
				.addClass(this.selectioner.settings.cssPrefix + 'date')
				.on(
					'mousewheel wheel',
					'.days',
					function(e)
					{
						dateSelect.addDays(handleWheelChange(e));
					})
				.on(
					'mousewheel wheel',
					'.months',
					function(e)
					{
						dateSelect.addMonths(handleWheelChange(e));
					})
				.on(
					'mousewheel wheel',
					'.years',
					function(e)
					{
						dateSelect.addYears(handleWheelChange(e));
					})
				.on(
					'click',
					'.days .previous,.days .up,.days .next,.days .down',
					function()
					{
						dateSelect.addDays(
							$(this).is('.previous, .up') ? -1 : 1);
					})
				.on(
					'click',
					'.months .previous,.months .up,.months .next,.months .down',
					function()
					{
						dateSelect.addMonths(
							$(this).is('.previous, .up') ? -1 : 1);
					})
				.on(
					'click',
					'.years .previous,.years .up,.years .next,.years .down',
					function()
					{
						dateSelect.addYears(
							$(this).is('.previous, .up') ? -1 : 1);
					})
				.on(
					'click',
					'.selected, .confirm-date',
					function()
					{
						dateSelect.setCurrentDate(dateSelect.getCurrentDate());
						dateSelect.popup.hide();
					})
				.on(
					'click',
					'.today-date',
					function()
					{
						// Always set the date, in case it's been 
						// cleared, and we want to set it to today.
						dateSelect.setCurrentDate(new Date());
						dateSelect.popup.hide();
					})
				.on(
					'click',
					'.clear-date',
					function()
					{
						dateSelect.setCurrentDate(null);
						dateSelect.popup.hide();
					});
				
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
			
			var createButton = function(text, cssClass)
			{
				return $('<a />')
					.attr('href', 'javascript:;')
					.addClass(cssClass)
					.append($('<span />').text(text));
			};
							
			// Build the control
			this.element
				.empty()
				.append(createButton('Clear', 'clear-date'))
				.append(createButton('Today', 'today-date'));
				
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
				
			this.element.append(createButton('OK', 'confirm-date'));
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
				.trigger('change');
			this.update();
		};

		// Handle key-down events. This method is called by the pop-up, and
		// thus usually should not be called manually elsewhere.
		DateSelect.prototype.keyDown = function (simpleEvent)
		{
			var result = Selectioner.Core.Dialog.prototype.keyDown.call(this, simpleEvent.key);
				
			if (!result.handled)
			{
				result.handled = true;
			
				switch(simpleEvent.key)
				{
					case 38: // Up arrow
						this.addDays(-1);
						simpleEvent.preventDefault();
						break;
						
					case 40:  // Down arrow
						this.addDays(1);
						simpleEvent.preventDefault();
						break;
											
					case 32: // Space
					case 13: // Enter / Return
						this.setCurrentDate(this.getCurrentDate());
						this.popup.hide();
						simpleEvent.preventDefault();
						break;
						
					default:
						result.handled = false;
				}
			}
				
			return result;
		};
	});