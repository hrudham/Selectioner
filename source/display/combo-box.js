define(
	['core/selectioner', 'core/display'],
	function()
	{
		var ComboBox = Selectioner.Display.ComboBox = function() {};

		ComboBox.prototype = new Selectioner.Core.Display();

		ComboBox.prototype.validateTarget = function()
		{
			if (!this.selectioner.target.is('select:not([multiple])'))
			{
				throw new Error('Underlying element is expected to be a <select /> element without a "multiple" attribute');
			}
			
			if (!this.selectioner.target.next().is('input[type="text"]'))
			{
				throw new Error('The element to follow the underlying <select /> is expected to be an <input type="text" />');
			}
		};
		
		ComboBox.prototype.render = function()
		{
			this.cssClass = this.selectioner.settings.cssPrefix  + 'combo-box';
		
			this.textElement = this.selectioner.target.next();
						
			var noSelectionText = this.getNoSelectionText();
			
			if (noSelectionText !== null)
			{
				this.textElement.attr('placeholder', noSelectionText);
			}
				
			// Turn off auto-completion on the text box.
			this.textElement.attr('autocomplete', 'off');

			// Make sure we have an empty option, otherwise throw an error.
			if (this.getEmptyOptions().length === 0)
			{
				// We require an <option></option> element in the underlying select.
				throw new Error('ComboBox elements require an empty and value-less <option></option> in their underlying <select /> elements.');
			}

			var comboBox = this;
			
			this.textElement
				.addClass(this.selectioner.settings.cssPrefix + 'text')
				.on(
					'change', 
					function(e, data) 
					{			
						if (!data || data.source != 'selectioner')
						{
							comboBox.textChanged();
						}
					});
			
			var button = $('<span />')
				.addClass(this.selectioner.settings.cssPrefix + 'button');
				
			this.element = $('<span />')
				.append(button)
				.append(this.textElement);
				
			comboBox.element
				.on(
					'focus',
					function(ev)
					{
						comboBox.element.one(
							'click keyup', 
							function(e)
							{
								if (e.which !== 9 || !e.shiftKey)
								{
									// If we are not navigating backwards via 
									// SHIFT+TAB, then select the text in this 
									// combo-box's text element.
									comboBox.textElement.select();
								}
							});
					});
		};

		ComboBox.prototype.textChanged = function()
		{
			// Find out if the text matches an item in 
			// the drop-down, and select it if it does.
			// If it doesn't match an option, select the 
			// option with no value.
			var filterText = this.textElement.val().toUpperCase();
			
			var option = this.selectioner
				.target
				.find('option')
				.filter(
					function() 
					{ 
						return this.text.toUpperCase() === filterText; 
					});
			
			if (option.length != 1)
			{
				option = this.getEmptyOptions();
			}
			
			if (!option[0].selected)
			{
				option[0].selected = true;
				this.selectioner.target.trigger('change', { source: 'selectioner' });
			}
		};

		ComboBox.prototype.update = function()
		{
			var value = this.selectioner.target.find('option:selected').text();
			
			if (value !== '')
			{
				this.textElement
					.val(value)
					.trigger(
						'change',
						{ source: 'selectioner' });
			}
		};

		ComboBox.prototype.getEmptyOptions = function()
		{
			// Find all options that either have an 
			// empty value, or have no value and no text.
			return this.selectioner
				.target
				.find('option[value=""], option:empty:not([value])');
		};

		ComboBox.prototype.getNoSelectionText = function()
		{
			return (
				this.selectioner.target.data('placeholder') ||
				this.textElement.attr('placeholder') ||
				this.selectioner.settings.noSelectionText);
		};
		
		ComboBox.prototype.focus = function()
		{
			this.textElement.focus();
		};
	});