define(
	['core/selectioner', 'core/display'],
	function()
	{
		var ListBox = Selectioner.Display.ListBox = function() {};

		ListBox.prototype = new Selectioner.Core.Display();

		ListBox.prototype.validateTarget = function()
		{
			if (!this.selectioner.target.is('select'))
			{
				throw new Error('Underlying target element is expected to be a <select /> element');
			}
		};

		ListBox.prototype.render = function()
		{
			var display = this;
			
			this.cssClass = this.selectioner.settings.cssPrefix  + 'list-box';
			
			this.textElement = $('<span />')
				.addClass(this.selectioner.settings.cssPrefix + 'text');
			
			var button = $('<span />').addClass(this.selectioner.settings.cssPrefix + 'button');
					
			this.element = $('<span />')
				.prop('tabindex', this.selectioner.target.prop('tabindex')) // Allow for tabbing and keyboard-related events to work.
				.append(button)
				.append(this.textElement);
		};

		ListBox.prototype.update = function()
		{
			var selectedOptions = this.selectioner.target.find('option:selected');
			
			var isEmpty = false;
			
			if (selectedOptions.length === 0 ||
				selectedOptions.is('option[value=""], option:empty:not([value])'))
			{
				var text = this.getNoSelectionText();
				
				if (!text)
				{
					this.textElement.html('&nbsp;');
				}
				else
				{
					this.textElement.text(text);
				}
				
				isEmpty = true;
			}
			else if (selectedOptions.length <= 2)
			{
				var displayText = '';
				
				for (var i = 0, length = selectedOptions.length; i < length; i++)
				{
					displayText += selectedOptions[i].text;
					
					if (i < length - 1)
					{
						displayText += ', ';
					}
				}
				
				this.textElement.text(displayText);
			}
			else
			{
				this.textElement.text(
					'Selected ' + selectedOptions.length + ' of ' + this.selectioner.target.find('option').length);
			}
			
			this.textElement.toggleClass('none', isEmpty);
		};
	});