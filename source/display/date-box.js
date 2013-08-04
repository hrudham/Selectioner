define(
	['core/selectioner', 'core/display'],
	function()
	{
		var DateBox = Selectioner.Display.DateBox = function() {};

		DateBox.prototype = new Selectioner.Core.Display();

		DateBox.prototype.validateTarget = function()
		{
			if (!this.selectioner.target.is('input[type="date"]'))
			{
				throw new Error('DateBox expects it\'s underlying target element to to be a <input type="date" /> element');
			}
		};

		DateBox.prototype.isReadOnly = function()
		{
			return this.selectioner.target.is('[readonly]');
		};

		DateBox.prototype.render = function()
		{
			this.element = $('<span />');
				
			this.textElement = $('<span />')
				.addClass(this.selectioner.settings.cssPrefix + 'text');
			
			var button = $('<span />').addClass(this.selectioner.settings.cssPrefix + 'button');
			
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
				var date = new Date(datePart[0], datePart[1] - 1, datePart[2]); // months are zero-based
				var dateText = this.getDateText(date);
				
				this.textElement
					.removeClass('none')
					.text(dateText);
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
	}
);