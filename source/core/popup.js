define(
	['core/selectioner', 'core/dialog'],
	function()
	{
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
	});