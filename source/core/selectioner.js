define(
	['core/eventable'],
	function() 
	{
		var Selectioner = window.Selectioner = function(target, display, dialogs, options)
		{
			this.settings = $.extend(
				true, 
				$.extend(
					true, 
					{}, 
					Selectioner.DefaultSettings), 
				options);
			
			this.id = Selectioner._idSeed++;
			
			// Convert dialogs to an array if it isn't one already.
			if (!(dialogs instanceof Array))
			{
				dialogs = [ dialogs ];
			}

			// Associate the underlying target element, display and dialog with this selectioner object.
			this.target = target = $(target);
			this.display = display;
			this.dialogs = dialogs;

			if (target.data('selectioner'))
			{
				// This occurs if we attempt to provide more than one Selectioner on a single element.
				throw new Error('The target element has already has a Selectioner associated with it.');
			}
			else if (target.next().hasClass(this.settings.cssPrefix + 'display'))
			{
				// Remove any old Displays that may already have been rendered.
				// This can occur if someone saves a web page as-is to their PC, 
				// and then opens it in their browser from their file-system.
				// This will unfortunately break for any control that "steals" 
				// elements from elsewhere on the page, such as the ComboBox,
				// but at least it won't be rendered twice.
				target.next().remove();
			}	

			// Initialize the display;
			display.initialize(this);

			// Add each dialog to the display.
			for (var i = 0, length = dialogs.length; i < length; i++)
			{
				display.addDialog(dialogs[i]);
			}

			// Store a reference to the selectioner object on the underlying 
			// target element, and render the display element after it.
			target
				.data('selectioner', this)
				.css('display', 'none')
				.after(this.display.element);
		};
		
		Selectioner.prototype = new Eventable();

		Selectioner._idSeed = 0;

		Selectioner.Core = {};

		Selectioner.Dialog = {};

		Selectioner.Display = {};

		Selectioner.Extensions = {};

		Selectioner.Popup = {};

		Selectioner.DefaultSettings =
		{
			cssPrefix: 'select-',
			noSelectionText: 'Select an option',
			emptyOptionText: 'None',
			noOptionText: 'No options available',
			noMatchesFoundText: 'No matches found',
			typeToSearchText: 'Type to search',
			filteredSelect:
				{
					maxItems: null,
					minFilterLength: 1,
					enterOneMoreCharacterText: 'Enter 1 more character',
					enterNumberMoreCharactersText: 'Enter {{number}} more characters',
				}
		};
	});