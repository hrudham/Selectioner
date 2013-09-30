define(
	['core/display'],
	function()
	{
		var DateBox = Selectioner.Display.DateBox = function() {};

		DateBox.prototype = new Selectioner.Core.Display();
		
		DateBox.Utility = 
		{
			dateStringToDate: function(dateString)
			{
				if (dateString !== '')
				{
					var dateParts = dateString.match(/(\d+)/g);
					
					if (dateParts &&
						dateParts.length === 3 &&
						dateParts[0].length === 4 &&
						dateParts[1].length === 2 &&
						dateParts[2].length === 2)
					{
						return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
					}
				}
				
				return null;
			},
			
			dateStringToValue: function(dateString)
			{
				if (dateString !== '')
				{
					var date = DateBox.Utility.dateStringToDate(dateString);
				
					if (window.Globalize)
					{
						var globalizeDate = Globalize.parseDate(dateString);
						
						if (globalizeDate)
						{
							date = globalizeDate;
						}
					}
					
					return DateBox.Utility.dateToString(date);
				}
				
				return '';
			},
			
			dateToString: function(date)
			{
				if (date)
				{
					var day = date.getDate().toString();
					var month = (date.getMonth() + 1).toString();
					var year = date.getFullYear().toString();
					
					if (day.length == 1) day = '0' + day;
					if (month.length == 1) month = '0' + month;
					
					return year + '-' + month + '-' + day;
				}
				
				return '';
			},
			
			// Obtains the the string representation of the date provided.
			dateToLocaleString: function(date)
			{
				if (!date)
				{
					return '';
				}
			
				if (window.Globalize)
				{
					// Globalize is defined, so use it to output a 
					// short-date in the culturally correct format.
					// https://github.com/jquery/globalize
					return Globalize.format(date, 'd');
				}
				
				return DateBox.Utility.dateToString(date);
			}
		};

		DateBox.prototype.validateTarget = function()
		{
			if (!this.selectioner.target.is('input[type="date"]'))
			{
				throw new Error('Underlying target element is expected to be a <input type="date" /> element');
			}
		};

		DateBox.prototype.isReadOnly = function()
		{
			return this.selectioner.target.is('[readonly]');
		};

		DateBox.prototype.render = function()
		{
			var dateBox = this;
		
			this.cssClass = this.selectioner.settings.cssPrefix  + 'date-box';
		
			this.textElement = $('<input type="text" />')
				.addClass(this.selectioner.settings.cssPrefix + 'text')
				.attr('placeholder', this.selectioner.target.attr('placeholder') || 'Select a date')
				.on(
					'change', 
					function() 
					{ 
						dateBox.selectioner.target.val(
							DateBox.Utility.dateStringToValue(
								this.value))
							.trigger('change');
					})
				.on(
					'keyup',
					function()
					{
						var dateValue = DateBox.Utility.dateStringToValue(this.value);
						
						if (dateValue && 
							this.value.length === 10)
						{
							dateBox.selectioner.target.val(dateValue).trigger('change');
						}
					});
			
			var button = $('<span />').addClass(this.selectioner.settings.cssPrefix + 'button');
			
			this.element = $('<span />')
				.prop('title', this.selectioner.target.prop('title'))
				.prop('tabindex', this.selectioner.target.prop('tabindex')) // Allow for tabbing and keyboard-related events to work.
				.append(button)
				.append(this.textElement);
		};

		DateBox.prototype.update = function()
		{
			var value = DateBox.Utility.dateToLocaleString(
				DateBox.Utility.dateStringToDate(
					this.selectioner.target.val()));
		
			// Stop resetting the cursor position when 
			// entering a date via the keyboard.
			if (this.textElement.val() !== value)
			{
				this.textElement.val(value);
			}
		};
	});