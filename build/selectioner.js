/*!
 * Selectioner v0.0.1
 * Copyright (c) Hilton Rudham
 * MIT License
 */ 
/*
 * Selectioner is a general purpose jQuery-based enhancement for HTML select boxes.
 * It was written with extensibility in mind, and comes with various pre-built
 * flavours, such as multi-selects and combo-boxes.
 */
;(function(window, document, $){ 


		var Eventable = window.Eventable = function () { };
			
		Eventable.prototype.on = function (name, handler, context)
		{
			var names = name.split(' ');
			if (names.length > 1)
			{
				// Bind a set of space separated events to a single 
				// event handler recursively.
				names.forEach(
					function (item, index, array)
					{
						this.on(item, handler, context);
					},
					this);
			}
			else
			{
				// Bind a single event to an event handler.
				if (!this._eventHandlers) this._eventHandlers = {};
				if (!this._eventHandlers[name]) this._eventHandlers[name] = [];

				this._eventHandlers[name].push(
					{
						handler: handler,
						context: context ? context : this
					});
			}

			return this;
		};

		Eventable.prototype.off = function (name, handler)
		{
			if (!this._eventHandlers) return this;

			// Function that unbinds any occurrences of an event handler from an event.
			var unbindEventHandler = function (eventName, eventHandler)
			{
				for (var i = 0, length = this._eventHandlers[eventName].length; i < length; i++)
				{
					if (this._eventHandlers[eventName][i].handler == eventHandler)
					{
						this._eventHandlers[eventName].splice(i, 1);
					}
				}
			};

			if (!name)
			{
				// Unbind all events from this object.
				delete this._eventHandlers;
			}
			else if (name && !handler)
			{
				if (typeof name != 'function')
				{
					// Name is the name of an event that needs to 
					// have all it's handlers be unbound.
					if (!this._eventHandlers[name]) return this;

					// Setting an Arrays length to zero empties it.
					this._eventHandlers[name].length = 0; 
				}
				else
				{
					// Name is a function, and is therefore the handler 
					// being unbound for events its associated with.
					var eventHandler = name;
					for (var eventName in this._eventHandlers)
					{
						unbindEventHandler.call(this, eventName, eventHandler);
					}
				}
			}
			else
			{
				// Unbind an event handler associated with this event.
				if (!this._eventHandlers[name]) return this;

				unbindEventHandler.call(this, name, handler);
			}

			return this;
		};

		// Triggers an event, passing through data as an optional parameter.
		Eventable.prototype.trigger = function (name, data)
		{
			if (!this._eventHandlers) return;

			var eventHandlers = this._eventHandlers[name];
			if (eventHandlers)
			{
				var target = this;
				for (var i = 0, length = eventHandlers.length; i < length; i++)
				{
					var eventHandler = eventHandlers[i];
					eventHandler.handler.call(
						eventHandler.context,
						{
							target: target,
							name: name,
							data: data
						});
				}
			}

			return this;
		};

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

		var Dialog = Selectioner.Core.Dialog = function() {};

		Dialog.prototype.initialize = function(selectioner)
		{	
			this.selectioner = selectioner;
			this.validateTarget();
		};

		// Render the dialog. This method should be explicitly 
		// overridden by prototypes that inherit from it, 
		// and must set this.element to some jQuery object.
		Dialog.prototype.render = function()
		{
			throw new Error('The render method needs to be explicitly overridden, and must set "this.element" to a jQuery object.');
		};

		// Associates a dialog with a pop-up.
		Dialog.prototype.setPopup = function(popup)
		{
			this.popup = popup;
		};

		// Update the dialog. This is called whenever a significant
		// change occurs, such as when a new option is selected,
		// or the pop-up is displayed.
		Dialog.prototype.update = function()
		{
			// This method should be explicitly overridden, but
			// it is not required if it will never be updated.
		};

		Dialog.prototype.validateTarget = function()
		{
			// This method should be overwritten to validate the expected target of a dialog.
			// If an invalid target element is found, descriptive errors should be thrown.
			// This may be ignored if no validation is required.
		};

		// Override this method to allow for keyboard integration.
		// The method itself can be called manually, although this 
		// is generally not recommended, as this is usually 
		// handled by the pop-up. 
		Dialog.prototype.keyDown = function(simpleEvent)
		{
			var result = { handled: false };
			
			// Escape
			if (simpleEvent.key == 27)
			{
				this.popup.hide();
				simpleEvent.preventDefault();
				result.handled = true;
			}
			
			return result;
		};

		// Override this method to allow for keyboard integration.
		// The method itself can be called manually, although this 
		// is generally not recommended, as this is usually 
		// handled by the pop-up. 
		Dialog.prototype.keyPress = function(simpleEvent)
		{					
			return { handled: false };
		};

		// This will fire every time the dialog loses mouse or keyboard 
		// focus within the keyboard focus within the pop-up.
		Dialog.prototype.lostFocus = function()
		{
		};

		var Popup = window.Selectioner.Popup = function() {};

		Popup.prototype.initialize = function(selectioner)
		{
			var popup = this;

			this.selectioner = selectioner;
			this.dialogs = [];
			
			this._dialogFocusIndex = null;

			this.element = $('<div />')
				.addClass(this.selectioner.settings.cssPrefix + 'popup')
				.css(
					{
						visibility: 'hidden',
						position: 'absolute',
						zIndex: '-1'
					})
				.on(
					'mousedown focusin',
					function(e)
					{
						// The selectioner watches for mouse-down / focusin events outside of 
						// itself in order to know when to close. Sometimes, however, these
						// event will occur insides the pop-up and cause a re-render,
						// and thus the element that caused the event no longer exists.
						// This means we cannot determine if it exists inside or outside
						// the pop-up. Thus, we stop propagation of these events here.
						e.stopPropagation();
					})
				// Allow the pop-up to have a tabindex such that we can detect focusin events.
				// This allows us to redirect focus to the display if anything in the pop-up
				// gains focus (such as a check box), which stops the keyboard integration
				// from breaking.
				.prop('tabindex', selectioner.target.prop('tabindex') + 1)
				.on(
					'focusin',
					function()
					{
						selectioner.display.element.focus();
					});

			this.update();
			
			// If the contents of the pop-up changes while the 
			// pop-up is actually displayed, then make sure it 
			// updates as expected. This is useful when loading
			// up information via AJAX, for example.
			this.selectioner.target.on(
				'change',
				function(e, data)
				{
					if ((!data || data.source !== 'selectioner') && popup.isShown())
					{
						popup.update();
						popup.reposition();
					}
				});
					
			$('body').append(this.element);
		};

		// Add a dialog to this pop-up.
		Popup.prototype.addDialog = function(dialog)
		{
			if (!(dialog instanceof Selectioner.Core.Dialog))
			{
				// This is a static dialog in the form of a CSS selector or vanilla HTML.
				// An example could be buttons added at the end of dialog.
				// We basically wrap this up as a very simple, vanilla dialog.
				var staticDialog = new Selectioner.Core.Dialog();
				var element = $(dialog);
				staticDialog.render = function()
				{
					this.element = element;
				};
				
				dialog = staticDialog;
			}
			
			// Initialize the dialog in order to associated
			// it with the underlying target element.
			dialog.initialize(this.selectioner);
			dialog.setPopup(this);
			dialog.render();
			
			this.element.append(dialog.element);
			
			this.dialogs.push(dialog);
			
			// Create closures for the pop-up and index.
			var index = this.dialogs.length - 1;
			var popup = this;
			
			dialog.element.on(
				'mousemove', 
				function()
				{
					popup.dialogFocusIndex(index);
				});
		};

		// Update all the dialogs that appear on this pop-up.
		Popup.prototype.update = function()
		{
			for (var i = 0, length = this.dialogs.length; i < length; i++)
			{
				this.dialogs[i].update();
			}
		};

		// Refresh the position of the pop-up
		// relative to it's display element.
		Popup.prototype.reposition = function()
		{
			var displayElement = this.selectioner.display.element;
			var offset = displayElement.offset();
			var borderWidth = this.element.outerWidth(false) - this.element.width();
			var width = displayElement.outerWidth(false) - borderWidth;
			var top = displayElement.outerHeight(false) + offset.top;

			var scrollTop = $(window).scrollTop();
			var popUpHeight = this.element.outerHeight(true);
			
			var cssClass = '';

			// If this popup would appear off-screen if below
			// the display, then make it appear above it instead.
			if ($(window).height() + scrollTop < top + popUpHeight)
			{
				top = offset.top - popUpHeight + 1;

				if (top < scrollTop)
				{
					top = scrollTop;
					cssClass = 'over';
				}
				else
				{
					cssClass = 'above';
				}
			}
			else
			{
				cssClass = 'below';
			}
			
			if (!this.element.hasClass(cssClass))
			{
				this.element
					.removeClass('below above over')
					.addClass(cssClass);
			}
			
			this.element.css(
				{
					width: width + 'px',
					left: offset.left + 'px',
					top: top + 'px'
				});
		};

		// Shows the pop-up.
		Popup.prototype.show = function()
		{
			if (!this.selectioner.display.isDisabled() && 
				!this.isShown())
			{
				// Hide the pop-up any time the window resizes.
				var popup = this;
				var displayElement = this.selectioner.display.element[0];
				var id = this.selectioner.id;
				
				$(window)
					.one
					(
						'resize.selectioner_' + id,
						function()
						{
							popup.hide();
						}
					);
					
				// Hide the pop-up whenever it loses focus to an
				// element that is not part of the pop-up or display.
				$(document).on(
					'mousedown.selectioner_' + id + ' focusin.selectioner_' + id,
					function(e)
					{
						if (popup.isShown() &&
							e.target !== displayElement &&
							!$.contains(displayElement, e.target) &&
							e.target !== popup.element &&
							!$.contains(popup.element, e.target))
						{
							popup.hide();
						}
					});
			
				this._isVisible = true;
				this.update();
				
				var popUpHeight = this.element.height();
				
				this.reposition();
				
				this.element.css({ visibility: 'visible', zIndex: '' });

				// This may look odd considering the lines above. However, 
				// height can often only be calculated by jQuery after the 
				// element is visible on the page. If our CSS happens to change
				// the height of the pop-up because of this, we need to 
				// reposition it again.
				if (popUpHeight != this.element.height())
				{
					this.reposition();
				}
				
				this.selectioner
					.trigger('show')
					.target
					.parents()
					.add(window)
					.on(
						'scroll.selectioner_' + id, 
						function() 
						{
							// Hide the pop-up whenever a scroll event
							// on a parent element occurs. It's either 
							// this, or some very complex and expensive  
							// logic to reposition it.
							// Only do this if the pop-up does not appear 
							// over the display.
							if(!popup.element.hasClass('over'))
							{
								popup.hide();
							}
						});
			}
		};

		// Simply hides the pop-up.
		Popup.prototype.hide = function()
		{
			if (this.isShown())
			{
				var id = this.selectioner.id;
			
				$(window).off(
					'resize.selectioner_' + id + ' scroll.selectioner_' + id);
						
				$(document).off(
					'mousedown.selectioner_' + id + ' focusin.selectioner_' + id);
			
				this._isVisible = false;
				this.element.css(
					{ 
						visibility: 'hidden', 
						zIndex: '-1',
						top: 0,
						left: 0
					});
				this.selectioner.trigger('hide');
				this._dialogFocusIndex = null;
			}
		};

		// Works out which dialog to focus on. This is mostly used
		// in order to work out which dialog to feed keystrokes to.
		Popup.prototype.changeDialogFocus = function(moveUp)
		{
			var offset = null;

			if (moveUp)
			{
				if (this._dialogFocusIndex > 0)
				{
					offset = this._dialogFocusIndex - 1;
				}
				else
				{
					offset = this.dialogs.length - 1;
				}
			}
			else
			{
				if (this._dialogFocusIndex < this.dialogs.length - 1 &&
					this._dialogFocusIndex !== null)
				{
					offset = this._dialogFocusIndex + 1;
				}
				else
				{
					offset = 0;
				}
			}
			
			return this.dialogFocusIndex(offset);
		};

		Popup.prototype.dialogFocusIndex = function(index)
		{
			if (index !== undefined && 
				index !== null && 
				this._dialogFocusIndex !== index)
			{
				if (this._dialogFocusIndex !== null)
				{
					this.dialogs[this._dialogFocusIndex].lostFocus();
				}
				
				this._dialogFocusIndex = index;
			}
			
			return this._dialogFocusIndex;
		};

		// Simply indicates whether the pop-up is shown to the user currently.
		Popup.prototype.isShown = function()
		{
			return this._isVisible;
		};

		// Handles key down events. This is called via the Display, 
		// and probably should not be called manually else where.
		// It works out which dialog to feed the key to, and 
		// passes it along.
		Popup.prototype.keyDown = function (simpleEvent)
		{
			var result = null;

			var moveUp = 
				simpleEvent.key == 38 ||	// Up arrow
				simpleEvent.key == 37 ||	// Left Arrow
				simpleEvent.key == 8;		// Backspace
			
			var index = this.dialogFocusIndex();
			
			if (index === null)
			{
				index = this.changeDialogFocus(moveUp);
			}
			
			var coveredDialogs = {};	
			while (!coveredDialogs[index])
			{
				// Keep track of what dialogs we've attempted to hand 
				// this keystroke down to, so that we do not end up in 
				// an infinite loop.
				coveredDialogs[index] = true;
				
				result = this.dialogs[index].keyDown(simpleEvent);
				
				// If the pop-up is still visible, but the dialog indicates that it 
				// wants to hand off keyboard focus, then move to the next dialog.
				if (!result.handled)
				{
					index = this.changeDialogFocus(moveUp);
				}
			}
			
			return result;
		};

		// Handles key press events. This is called via the Display, 
		// and probably should not be called manually else where.
		// It works out which dialog to feed the key to, and 
		// passes it along.
		Popup.prototype.keyPress = function (simpleEvent)
		{	
			var result = null;
			var moveUp = this.element.hasClass('above');

			var index = this.dialogFocusIndex();
			
			if (index === null)
			{
				index = this.changeDialogFocus(moveUp);
			}
			
			var coveredDialogs = {};	
			while (!coveredDialogs[index])
			{
				// Keep track of what dialogs we've attempted to hand 
				// this keystroke down to, so that we do not end up in 
				// an infinite loop.
				coveredDialogs[index] = true;
				
				result = this.dialogs[index].keyPress(simpleEvent);
				
				// If the pop-up is still visible, but the dialog indicates that it 
				// wants to hand off keyboard focus, then move to the next dialog.
				if (!result.handled)
				{
					index = this.changeDialogFocus(moveUp);
				}
			}
			
			return result; 
		};

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
				var eventName = 'click.' + targetId;
			
				$(document)
					.off(eventName)
					.on(
						eventName,
						'label[for="' + targetId + '"]',
						function ()
						{
							display.focus();
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
						display.focus();
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
		
		// Focus on the relevant control instead of the 
		// underlying target element. This is often
		// called when a label is clicked on.
		Display.prototype.focus = function()
		{
			this.element.focus();
		};

		Display.prototype.getNoSelectionText = function()
		{
			return (
				this.selectioner.target.data('placeholder') ||
				this.selectioner.settings.noSelectionText);
		};

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
				.prop('title', this.selectioner.target.prop('title'))
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

		var SingleSelect = Selectioner.Dialog.SingleSelect = function() {};

		SingleSelect.prototype = new Selectioner.Core.Dialog();

		SingleSelect.prototype.validateTarget = function()
		{
			if (!this.selectioner.target.is('select:not([multiple])'))
			{
				throw new Error('Underlying element is expected to be a <select /> element without a "multiple" attribute');
			}
		};

		SingleSelect.prototype.render = function()
		{
			this.element = $('<ul />');
			this.bindEvents();
		};
		
		SingleSelect.prototype.bindEvents = function()
		{
			var dialog = this;
			var lastScrollTop = null;
			var element = this.element
				.on(
					'click', 
					'li a',
					function()
					{
						var option = dialog.selectioner.target[0][this.getAttribute('data-index')];
						
						if (!option.selected)
						{
							option.selected = true;
							dialog.selectioner.target.trigger('change', { source: 'selectioner' });
						}
						
						dialog.popup.hide();
					})
				.on(
					'mousemove',
					'li',
					function()
					{	
						var scrollTop = dialog.popup.element.scrollTop();
						if (scrollTop === lastScrollTop)
						{
							dialog.highlight(this);
						}
						lastScrollTop = scrollTop;
					});
		};
		
		SingleSelect.prototype.isEmpty = function()
		{
			return this.selectioner.target.children().length === 0;
		};

		SingleSelect.prototype.update = function()
		{
			// Only re-render when the target's HTML changes.
			// This allows us to stop re-rendering really large lists.
			var currentTargetHtml = this.selectioner.target.html();
			if (currentTargetHtml !== this._lastRenderedTargetHtml)
			{
				this._lastRenderedTargetHtml = currentTargetHtml;
			
				this.element.empty();
				this._selectableOptions = null;
				
				var results = '';

				if (!this.isEmpty())
				{
					var children = this.selectioner.target.children();
					for (var i = 0, length = children.length; i < length; i++)
					{
						var child = children[i];
						if (child.tagName == 'OPTION')
						{
							results += this.renderOption(child);
						}
						else 
						{
							// We can safely assume that all other elements are 
							// <optgroup /> elements, since the HTML5 specification 
							// only allows these two child elements. 
							// See http://www.w3.org/TR/html-markup/select.html
							results += this.renderGroup(child);
						}
					}
				}
				else
				{
					// Although the single-select itself will never use 
					// an <option /> without a value for it's no-option
					// text, other dialogs that inherit from it often do, 
					// such as in the case of the combo-select.
					var option = this.selectioner
						.target
						.find('option[value=""], option:empty:not([value])');
							
					var text = option.text() || this.selectioner.settings.noOptionText;
					
					var titleAttribute = '';
					if (option.length > 0)
					{
						var title = option[0].getAttribute('title');
						if (title)
						{
							titleAttribute = ' title="' + title.replace(/"/g, '&quot;') + '" ';
						}
					}

					results += '<li class="none"' + titleAttribute + '><span>' + text + '</span></li>';
				}

				this.element.html(results);

				this.scrollToHighlightedOption();
			}
		};

		// Render an the equivalent control that represents an 
		// <option /> element for the underlying <select /> element. 
		SingleSelect.prototype.renderOption = function(option)
		{
			var text = option.text || this.selectioner.settings.emptyOptionText;
			
			var itemHtml;
			
			var cssClass = [];
			if (option.value === null || option.value === '') 
			{
				cssClass.push('none');
			}
			
			if (option.disabled)
			{
				cssClass.push('disabled');
				itemHtml = '<span>' + text + '</span>';
			}
			else
			{
				itemHtml = '<a href="javascript:;" data-index="' + option.index + '">' + text + '</a>';
			}
			
			if (option.selected)
			{
				cssClass.push('highlight');
			}

			var titleAttribute = '';
			var title = option.getAttribute('title');
			if (title)
			{
				titleAttribute = ' title="' + title.replace(/"/g, '&quot;') + '"';
			}

			return '<li class="' + cssClass.join(' ') + '"' + titleAttribute + '>' + itemHtml + '</li>';
		};

		// Render an the equivalent control that represents an 
		// <optgroup /> element for the underlying <select /> element. 
		SingleSelect.prototype.renderGroup = function(group)
		{			
			var titleAttribute = '';
			var title = group.getAttribute('title');
			if (title)
			{
				titleAttribute = ' title="' + title.replace(/"/g, '&quot;') + '"';
			}
		
			var results = '<li class="' + 
				this.selectioner.settings.cssPrefix + 
				'group-title"' + titleAttribute + '><span>' + 
				group.label + 
				'</span></li>';
			
			var children = group.children;
			for (var i = 0, length = children.length; i < length; i++)
			{
				results += this.renderOption(children[i]);
			}
			
			return '<li><ul>' + results + '</ul></li>';
		};

		// Get all options that can potentially be selected.
		SingleSelect.prototype.getSelectableOptions = function()
		{
			if (!this._selectableOptions)
			{
				this._selectableOptions = this.element
					.find('li')
					.filter(
						function()
						{ 
							return $(this)
								.children('a,input,label')
								.filter(':not(.disabled,[disabled])').length > 0; 
						});
			}
			
			return this._selectableOptions;
		};

		SingleSelect.prototype.highlight = function(item)
		{						
			if ((' ' + item.className + ' ').indexOf(' highlight ') === -1 && 
				this.getSelectableOptions().filter(item).length > 0)
			{
				this.element.find('li').removeClass('highlight');
				$(item).addClass('highlight');
			}
		};
		
		// Highlight the next or previous item.
		SingleSelect.prototype.highlightAdjacentOption = function(isNext)
		{		
			var isHighlighted = false;
			var items = this.getSelectableOptions();
			
			if (items.filter('.highlight').length === 0)
			{
				(isNext ? items.first() : items.last()).addClass('highlight');
				isHighlighted = true;
			}
			else
			{
				for (var i = 0, length = items.length; i < length; i++)
				{
					var item = $(items[i]);
										
					if (item.hasClass('highlight'))
					{
						item.removeClass('highlight');
						
						if (isNext)
						{
							if (i < length - 1)
							{
								$(items[i + 1]).addClass('highlight');					
								isHighlighted = true;
								break;
							}
						}
						else if (i > 0)
						{
							$(items[i - 1]).addClass('highlight');
							isHighlighted = true;
							break;
						}
					}
				}
			}
			
			if (isHighlighted)
			{
				this.scrollToHighlightedOption();
			}
			
			return isHighlighted;
		};

		// Scroll to the highlighted option.
		SingleSelect.prototype.scrollToHighlightedOption = function()
		{
			var option = this.getSelectableOptions().filter('.highlight');
			
			if (option.length > 0)
			{
				var optionTop = option.position().top;
				var popupElement = this.popup.element;
					
				if (optionTop < 0)
				{
					popupElement.scrollTop(popupElement.scrollTop() + optionTop);
				}
				else
				{
					var popupHeight = popupElement.height();
					optionTop += option.height();
					
					if (optionTop > popupHeight)
					{
						popupElement.scrollTop(popupElement.scrollTop() + optionTop - popupHeight);
					}
				}
			}
		};

		// Select the highlighted option.
		SingleSelect.prototype.selectHighlightedOption = function()
		{
			this.getSelectableOptions()
				.filter('.highlight')
				.find('a,label')
				.click();
		};

		// Clear the selected item(s) if possible.
		SingleSelect.prototype.clearSelection = function()
		{
			this.getSelectableOptions()
				.filter('.none:first')
				.find('a,label')
				.click();
		};

		// Handle key-down events. This method is called by the pop-up, and
		// thus usually should not be called manually elsewhere.
		SingleSelect.prototype.keyDown = function (simpleEvent)
		{			
			var result = Selectioner.Core.Dialog.prototype.keyDown.call(this, simpleEvent.key);

			if (!result.handled)
			{
				switch(simpleEvent.key)
				{				
					case 38: // Up arrow
						if (this.highlightAdjacentOption(false))
						{
							simpleEvent.preventDefault();
							result.handled = true;
						}
						break;
						
					case 40: // Down arrow
						if (this.highlightAdjacentOption(true))
						{
							simpleEvent.preventDefault();
							result.handled = true;
						}
						break;
						
					case 8: // Backspace
						if (simpleEvent.target === this.selectioner.display.element[0])
						{
							this.clearSelection();
							this.popup.hide();
							simpleEvent.preventDefault();
							result.handled = true;
						}
						break;
						
					case 32: // Space
						if (!this.keyPressFilter && 
							simpleEvent.target === this.selectioner.display.element[0])
						{
							this.selectHighlightedOption();
							simpleEvent.preventDefault();
							result.handled = true;
						}
						break;
						 
					case 9:  // Tab
						if (!this.selectioner.target.is('[multiple]'))
						{
							this.selectHighlightedOption();
							result.handled = true;
						}
						break;
					
					case 13: // Enter / Return
						this.selectHighlightedOption();
						simpleEvent.preventDefault();
						result.handled = true;
						break;
				}
			}
			
			return result;
		};

		// Handle key-press events. This method is called by the pop-up, and
		// thus usually should not be called manually elsewhere.
		SingleSelect.prototype.keyPress = function(simpleEvent)
		{
			var result = { handled: false };

			// Do not filter on enter / return or tab.
			if (simpleEvent.key != 13 && simpleEvent.key != 9)
			{
				var dialog = this;
				
				clearTimeout(this.keyPressFilterTimeout);
			
				this.keyPressFilter = (this.keyPressFilter || '') + String.fromCharCode(simpleEvent.key).toUpperCase();
								
				this.keyPressFilterTimeout = setTimeout(
					function()
					{
						dialog.keyPressFilter = '';
					},
					600);
					
				// Find the first option that satisfies   
				// the filter, is not empty (or "none"), 
				// and highlight it.
				var options = this.getSelectableOptions();
				var isSet = false;
				for (var i = 0, length = options.length; i < length; i++)
				{
					var option = $(options[i]);
					if (!option.hasClass('none') &&
						option.text().toUpperCase().indexOf(this.keyPressFilter) === 0)
					{
						options.removeClass('highlight');
						option.addClass('highlight');
						this.scrollToHighlightedOption();
						isSet = true;
						break;
					}
				}
				
				if (!isSet)
				{
					clearTimeout(this.keyPressFilterTimeout);
					this.keyPressFilter = '';
				}
				
				if (simpleEvent.target == this.selectioner.display.element[0])
				{
					simpleEvent.preventDefault();
				}
				
				result.handled = true;
			}
			
			return result;
		};

		SingleSelect.prototype.lostFocus = function()
		{
			this.element.find('li').removeClass('highlight');
		};

		$.fn.singleSelect = function ()
		{
			this.each(
				function()
				{
					new Selectioner(
						this, 
						new Selectioner.Display.ListBox(),
						new Selectioner.Dialog.SingleSelect());
				});
			
			return this;
		};

		var MultiSelect = Selectioner.Dialog.MultiSelect = function() {};

		MultiSelect._inputIdIndex = 0;

		MultiSelect.prototype = new Selectioner.Dialog.SingleSelect();

		MultiSelect.prototype.validateTarget = function()
		{
			if (!this.selectioner.target.is('select[multiple]'))
			{
				throw new Error('Underlying element is expected to be a <select /> element with a "multiple" attribute');
			}
		};
		
		MultiSelect.prototype.bindEvents = function()
		{
			var dialog = this;
			var target = dialog.selectioner.target;
		
			var element = this.element
				.on(
					'change', 
					'input[type="checkbox"]',
					function()
					{
						target[0][this.getAttribute('data-index')].selected = this.checked;
						target.trigger('change', { source: 'selectioner' });
					})
				.on(
					'click',
					'li a',
					function()
					{
						// Allow group titles to toggle the check-boxes of all their child items.
						var checkboxes = $(this).closest('ul').find('input:checkbox:not(:disabled)');
						var checkedCount = checkboxes.filter(':checked').length;
						
						checkboxes
							.prop('checked', checkedCount != checkboxes.length || checkedCount === 0)
							.each(
								function()
								{
									target[0][this.getAttribute('data-index')].selected = this.checked;
								});
						
						target.trigger('change', { source: 'selectioner' });
					})
				.on(
					'mouseenter',
					'li',
					function()
					{	
						dialog.highlight(this);
					});
		};
		
		// Render an the equivalent control that represents an
		// <option /> element for the underlying <select /> element. 
		// This overrides the SingleSelect version of this method.
		MultiSelect.prototype.renderOption = function(option)
		{
			var checkboxId = 'MultiSelectCheckbox' + MultiSelect._inputIdIndex++;
			var checkbox = '<input type="checkbox" id="' + checkboxId + 
				'" data-index="' + option.index + '" ' + 
				(option.selected ? 'checked="checked" ' : '') + 
				(option.disabled ? 'disabled="disabled" ' : '') + '/>';
				
			var titleAttribute = '';
			var title = option.getAttribute('title');
			if (title)
			{
				titleAttribute = ' title="' + title.replace(/"/g, '&quot;') + '"';
			}
				
			return '<li' + titleAttribute + '><label for="' + checkboxId + '" ' + (option.disabled ? 'class="disabled"' : '') + '>' + 
				checkbox + 
				'<span>' + option.text + '</span>' + 
				'</label></li>';
		};

		// Render an the equivalent control that represents an 
		// <optgroup /> element for the underlying <select /> element. 
		// This overrides the SingleSelect version of this method.
		MultiSelect.prototype.renderGroup = function(group)
		{	
			var groupTitle = '<li class="' + this.selectioner.settings.cssPrefix + 'group-title' + '"><a href="javascript:;">' + group.label + '</a></li>';
			var options = '';
			
			for (var i = 0, length = group.children.length; i < length; i++)
			{
				options += this.renderOption(group.children[i]);
			}
				
			return '<li><ul>' + groupTitle + options + '</ul></li>';
		};

		MultiSelect.prototype.clearSelection = function()
		{
			this.getSelectableOptions()
				.find('input:checkbox:checked')
				.click();
		};

		$.fn.multiSelect = function ()
		{
			this.each(
				function()
				{
					new Selectioner(
						this, 
						new Selectioner.Display.ListBox(),
						new Selectioner.Dialog.MultiSelect());
				});
				
			return this;
		};

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
				
			this.textElement
				.on(
					'focus',
					function(ev)
					{
						dateBox.textElement.one(
							'click', 
							function(e)
							{
								dateBox.textElement.select();
							});
					});
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
// Note that you may optionally include the excellent Globalize library in order 
// to get culturally formatted dates. See https://github.com/jquery/globalize


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

		$.fn.dateSelect = function ()
		{
			this.each(
				function()
				{
					new Selectioner(
						this, 
						new Selectioner.Display.DateBox(),
						new Selectioner.Dialog.DateSelect());
				});
			
			return this;
		};

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
				.prop('title', this.selectioner.target.prop('title'))
				.append(button)
				.append(this.textElement);
				
			comboBox.textElement
				.on(
					'focus',
					function(ev)
					{
						comboBox.textElement.one(
							'click keyup', 
							function(e)
							{
								comboBox.textElement.select();
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

		var ComboSelect = Selectioner.Dialog.ComboSelect = function() {};

		ComboSelect.prototype = new Selectioner.Dialog.SingleSelect();

		ComboSelect.prototype.validateTarget = function()
		{
			if (!this.selectioner.target.is('select:not([multiple])'))
			{
				throw new Error('Underlying element is expected to be a <select /> element without a "multiple" attribute');
			}
		};
		
		ComboSelect.prototype.isEmpty = function()
		{
			return this.selectioner
				.target
				.children()
				.not('option[value=""], option:empty:not([value])')
				.length === 0;
		};

		// Render an the equivalent control that represents an 
		// <option /> element for the underlying <select /> element. 
		ComboSelect.prototype.renderOption = function(option)
		{
			if (option.value)
			{
				return Selectioner.Dialog.SingleSelect.prototype.renderOption.call(this, option);
			}
			
			return '';
		};
		
		ComboSelect.prototype.keyPress = function(simpleEvent)
		{
			var result = { handled: false };

			// Do not filter on enter / return or tab.
			if (simpleEvent.key != 13 && simpleEvent.key != 9)
			{
				this.popup.show();
			
				var filter = this.selectioner.display.textElement.val().toUpperCase() + 
					String.fromCharCode(simpleEvent.key).toUpperCase();
					
				var options = this.getSelectableOptions();
				for (var i = 0, length = options.length; i < length; i++)
				{
					var option = $(options[i]);
					if (option.text().toUpperCase().indexOf(filter) === 0)
					{
						options.removeClass('highlight');
						option.addClass('highlight');
						this.scrollToHighlightedOption();
						break;
					}
				}
			}
			
			return result;
		};

		$.fn.comboSelect = function ()
		{
			this.each(
				function()
				{
					new Selectioner(
						this, 
						new Selectioner.Display.ComboBox(),
						new Selectioner.Dialog.ComboSelect());
				});
				
			return this;
		};

		var AutoComplete = Selectioner.Display.AutoComplete = function() {};

		AutoComplete.prototype = new Selectioner.Display.ComboBox();
		
		AutoComplete.prototype.render = function()
		{
			Selectioner.Display.ComboBox.prototype.render.apply(this);
			
			this.cssClass = this.selectioner.settings.cssPrefix  + 'auto-complete';
		};
		
		AutoComplete.prototype.getNoSelectionText = function()
		{
			return (
				this.selectioner.target.data('placeholder') ||
				this.textElement.attr('placeholder') ||
				this.selectioner.settings.typeToSearchText);
		};

		var FilteredSelect = Selectioner.Dialog.FilteredSelect = function() {};

		FilteredSelect.prototype = new Selectioner.Dialog.SingleSelect();

		FilteredSelect.prototype.validateTarget = function()
		{
			if (!this.selectioner.target.is('select:not([multiple])'))
			{
				throw new Error('Underlying element is expected to be a <select /> element without a "multiple" attribute');
			}
		};

		// Render an the equivalent control that represents an 
		// <option /> element for the underlying <select /> element. 
		FilteredSelect.prototype.render = function()
		{
			this.textElement = this
				.selectioner
				.display
				.element
				.find('input[type="text"]');
						
			Selectioner.Dialog.SingleSelect.prototype.render.apply(this, arguments);
			
			this.update();
		};
		
		FilteredSelect.prototype.bindEvents = function()
		{
			Selectioner.Dialog.SingleSelect.prototype.bindEvents.apply(this, arguments);
			
			var dialog = this;
			
			this.textElement.on(
				'keyup click', 
				function(e, data)
				{
					if ((!data || data.source != 'selectioner') && 
						e.which != 13 &&	// Enter
						e.which !== 27)		// Escape
					{
						dialog.update();
						if (!dialog.popup.isShown())
						{
							dialog.popup.show();
						}
						else
						{
							dialog.popup.reposition();
						}
					}
				});
		};

		FilteredSelect.prototype.update = function()
		{		
			// Clear our cached selectable options.
			// If you remove this line, highlighting will break.
			this._selectableOptions = null;

			var filterText = this.textElement.val().toLowerCase();
			var currentTargetHtml = this.selectioner.target.html();
			
			// Don't re-update unless we have to.
			if (filterText !== this._lastFilterText || 
				currentTargetHtml !== this._lastRenderedTargetHtml)
			{			
				this._lastFilterText = filterText;
				this._lastRenderedTargetHtml = currentTargetHtml;
				
				var filteredOptions = '';
				if (filterText.length >= this.selectioner.settings.filteredSelect.minFilterLength)
				{
					filteredOptions = this.getFilteredOptions();
				}
				else
				{
					filteredOptions = this.getEnterCharactersOptions();
				}			
				
				this.element
					.empty()
					.html(filteredOptions)
					.find('li:not(.none,.disabled):first')
					.addClass('highlight');
			}
		};
		
		// Returns the HTML of the list items that notify 
		// the user that they need to enter more characters 
		// before any filtering will be performed.
		FilteredSelect.prototype.getEnterCharactersOptions = function()
		{
			var settings = this.selectioner.settings.filteredSelect;
			var filterText = this.textElement.val().toLowerCase();
			var enterMoreText = settings.enterOneMoreCharacterText;

			if (settings.minFilterLength - filterText.length > 1)
			{
				enterMoreText = settings.enterNumberMoreCharactersText
					.replace(
						/{{number}}/, 
						minFilterLength - filterText.length);
			}
			
			return '<li class="none"><span>' + enterMoreText + '</span></li>';
		};
		
		// Returns the HTML of the list of items that match
		// the filter criteria entered into the auto-completes
		// text input.
		FilteredSelect.prototype.getFilteredOptions = function()
		{
			var filteredOptions = '';
			var filterText = this.textElement.val().toLowerCase();
			var count = 0;
		
			var children = this.selectioner.target.find('option');
					
			var wordFilter = function(text)
			{ 
				return text !== '' && text.indexOf(filterText) === 0;
			};
					
			for (var i = 0, length = children.length; i < length; i++)
			{
				var option = children[i];
				
				// Split the text on spaces, so that we can match on 
				// any word that starts with the filter criteria.
				var optionText = option.text.toLowerCase();
				var textParts = [];
				var spaceIndex = 0;
				
				while(spaceIndex > -1)
				{
					textParts.push(optionText.substring(spaceIndex === 0 ? 0 : spaceIndex + 1));
					spaceIndex = optionText.indexOf(' ', spaceIndex + 1);
				}
			
				if (textParts.filter(wordFilter).length > 0)
				{
					filteredOptions += this.renderOption(option);
					count++;
					
					var maxItems = this.selectioner.settings.filteredSelect.maxItems;
					if (maxItems && count >= maxItems)
					{
						break;
					}
				}
			}
			
			if (count === 0)
			{
				count++;
				filteredOptions = this.getNoMatchesFound();
			}
			
			return filteredOptions;
		};
		
		FilteredSelect.prototype.getNoMatchesFound = function()
		{
			return '<li class="none"><span>' + 
					this.selectioner.settings.noMatchesFoundText + 
					'</span></li>';
		};

		$.fn.autoComplete = function ()
		{
			this.each(
				function()
				{
					new Selectioner(
						this, 
						new Selectioner.Display.AutoComplete(),
						new Selectioner.Dialog.FilteredSelect());
				});
				
			return this;
		};

	if (typeof define === 'function' && define.amd)
	{
		define('selectioner', [], function () { return Selectioner; });
	}

})(this, document, jQuery);