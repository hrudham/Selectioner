define(
	['core/display'],
	function()
	{
		var DateBox = Selectioner.Display.DateBox = function() {};

		DateBox.prototype = new Selectioner.Core.Display();

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
			this.cssClass = this.selectioner.settings.cssPrefix  + 'date-box';
		
			this.textElement = $('<span />')
				.addClass(this.selectioner.settings.cssPrefix + 'text');
			
			var button = $('<span />').addClass(this.selectioner.settings.cssPrefix + 'button');
			
			this.element = $('<span />')
				.prop('title', this.selectioner.target.prop('title'))
				.prop('tabindex', this.selectioner.target.prop('tabindex')) // Allow for tabbing and keyboard-related events to work.
				.append(button)
				.append(this.textElement);
		};

		DateBox.prototype.update = function()
		{
			var dateValue = this.selectioner.target.val();

			if (dateValue !== '')
			{
				var datePart = dateValue.match(/(\d+)/g);
				
				// Remember that months are zero-based
				this.textElement
					.removeClass('none')
					.text(
						this.getDateText(
							new Date(datePart[0], datePart[1] - 1, datePart[2])));
			}
			else
			{
				this.textElement
					.addClass('none')
					.text(this.selectioner.target.attr('placeholder') || 'Select a date');
			}
		};

		// Obtains the the string representation of the date provided.
		DateBox.prototype.getDateText = function(date)
		{
			if (window.Globalize)
			{
				// Globalize is defined, so use it to output a 
				// short-date in the culturally correct format.
				// https://github.com/jquery/globalize
				return Globalize.format(date, 'd');
			}
			else
			{
				return date.toLocaleDateString();
			}
		};
	});