define(
	['core/selectioner', 'core/popup'],
	function()
	{
		var Display = Selectioner.Core.Display = function() {};

		Display.prototype.initialize = function(selectioner)
		{
			this.selectioner = selectioner;

			this.validateTarget();

			// This selectioner needs to be rendered out.
			this.createDisplay();
			this.createPopup();
		};

		Display.prototype.isDisabled = function()
		{
			return this.selectioner.target.prop('disabled');
		};

		Display.prototype.createDisplay = function()
		{
			var display = this;

			this.render();
			this.update();
			
			this.element
				.addClass(this.selectioner.settings.cssPrefix + 'display');
				
			if (this.cssClass)
			{
				this.element.addClass(this.cssClass);
			}
						
			// Make sure we update when parent forms are reset.
			this.selectioner
				.target
				.closest('form')
				.on(
					'reset', 
					function() 
					{
						// Strangely, this small time-out allows for the 
						// reset to be performed, and only then perform
						// the update required.
						setTimeout(function() { display.update(); }, 1);
					});

			// Make sure the display updates any time
			// it's underlying target element changes.
			this.selectioner
				.target
				.on(
					'change',
					function()
					{
						display.update();
					});
				
			// Find any labels associated with this underlying target
			// element, and make them focus on this display instead.
			var targetId = this.selectioner.target.attr('id');
			if (targetId !== undefined)
			{
				$(document).on(
					'click',
					'label[for="' + targetId + '"]',
					function ()
					{
						display.element.focus();
					});
			}
			
			// Look for any labels that are an ancestor of 
			// the underlying target, yet have no 'for' attribute,
			// but are still targeting our underlying target,
			// and make them focus on the display when clicked.
			var wrappingLabel = this.selectioner
				.target
				.closest('label:not([for])')
				.filter(
					function()
					{
						return this.control === display.selectioner.target[0];
					})
				.on(
					'click',
					function ()
					{
						display.element.focus();
					});	
			
			// Handle the key down event for things like arrows, escape, backspace, etc.
			this.element.on(
				'keydown',
				function(e)
				{
					var key = e.which;
					if (key == 27)
					{
						// Escape key was pressed.
						display.popup.hide();
					}
					else
					{						
						if (display.popup.isShown())
						{
							display.popup
								.keyDown({ 
									key: key, 
									target: e.target, 
									preventDefault: function() { e.preventDefault(); } });
						}
						
						switch (key)
						{
							case 38: // Up arrow
							case 40: // Down arrow
								e.preventDefault();
								display.popup.show();
						}
					}
				});
				
			// Handle key press for things like filtering lists.
			this.element.on(
				'keypress',
				function(e)
				{						
					if (e.charCode)
					{
						var result = display.popup
							.keyPress({ 
								key: e.charCode, 
								target: e.target, 
								preventDefault: function() { e.preventDefault(); } });
					}
				});
		};

		// Create a new dialog for the underlying target element.
		Display.prototype.createPopup = function()
		{
			// Bind this display to a pop-up.
			var dialog = this;
			var popup = this.popup = new Selectioner.Popup();
			popup.initialize(this.selectioner);

			var displayElement = this.selectioner
				.display
				.element;

			// Hide or show the pop-up on mouse-down or focus-in.
			this.element
				.on(
					'focusin',
					function(e)
					{
						var target = $(e.target);
					
						if (e.target === dialog.element ||
							target.prop('tabindex') > -1)
						{
							popup.show();
						}
						else
						{
							dialog.element.focus();
						}					
					})
				.on(
					'mousedown',
					function()
					{
						if (popup.isShown())
						{
							popup.hide();
						}
						else
						{
							popup.show();
						}
					});

			// Hide the pop-up whenever it loses focus to an
			// element that is not part of the pop-up or display.
			$(document)
				.on(
				'mousedown focusin',
				function(e)
				{
					if (popup.isShown() &&
						e.target !== displayElement[0] &&
						!$.contains(displayElement[0], e.target) &&
						e.target !== popup.element[0] &&
						!$.contains(popup.element[0], e.target))
					{
						popup.hide();
					}
				});

			var visibleCssClass = this.selectioner.settings.cssPrefix + 'visible';

			this.selectioner
				.on(
					'show',
					function()
					{
						displayElement.addClass(visibleCssClass);
					})
				.on(
					'hide',
					function()
					{
						displayElement.removeClass(visibleCssClass);
					});
		};

		// Add a dialog to this display.
		Display.prototype.addDialog = function(dialog)
		{
			// Add the dialog to the pop-up.
			this.popup.addDialog(dialog);
		};

		// Render the display. This method should be explicitly
		// overridden by prototypes that inherit from it,
		// and must set this.element to some jQuery object.
		Display.prototype.render = function()
		{
			throw new Error('The render method needs to be explicity overridden, and must set "this.element" to a jQuery object.');
		};

		// Update the display. This is called whenever a significant
		// change occurs, such as when a new option is selected.
		Display.prototype.update = function()
		{
			// This method should be explicitly overridden, but
			// it is not required if it will never be updated.
		};

		Display.prototype.getNoSelectionText = function()
		{
			return (
				this.selectioner.target.data('placeholder') ||
				this.selectioner.settings.noSelectionText);
		};
	});