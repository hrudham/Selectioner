var Popup = function() {};

Popup.prototype.initialize = function(selectioner)
{
	var popup = this;

	this.selectioner = selectioner;
	this.dialogs = [];

	this.element = $('<div />')
		.addClass(Selectioner.Settings.cssPrefix + 'popup')
		.css
			({
				visibility: 'hidden',
				position: 'absolute',
				zIndex: '-1'
			})
		.on
			(
				'mousedown focusin',
				function(event)
				{
					// The selectioner watches for mouse-down / focusin events outside of 
					// itself in order to know when to close. Sometimes, however, these
					// event will occur insides the popup and cause a re-render,
					// and thus the element that caused the event no longer exists.
					// This means we cannot determine if it exists inside or outside
					// the popup. Thus, we stop propagation of these events here.
					event.stopPropagation();
				}
			);

	this.update();
	
	// If the contents of the pop-up changes while the 
	// pop-up is actually displayed, then make sure it 
	// updates as expected. This is useful when loading
	// up information via AJAX, for example.
	this.selectioner
		.target
		.on
		(
			'change',
			function(event, data)
			{
				if (!data || data.source !== 'selectioner')
				{
					if (popup.isShown())
					{
						popup.update();
						popup.reposition();
					}
				}
			}
		);
			
	$('body').append(this.element);
};

// Add a dialog to this popup.
Popup.prototype.addDialog = function(dialog)
{
	// Initialize the dialog in order to associated
	// it with the underlying target element.
	var dialogElement;
	
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
		
	dialog.initialize(this.selectioner);
	dialog.setPopup(this);
	dialog.render();
	dialogElement = dialog.element;
		
	this.element.append(dialogElement);
	
	this.dialogs.push(dialog);
};

// Update all the dialogs that appear on this popup.
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

	this.element
		.removeClass('below')
		.removeClass('above')
		.removeClass('over');

	// If this popup would appear off-screen if below
	// the display, then make it appear above it instead.
	if ($(window).height() + scrollTop < top + popUpHeight)
	{
		top = offset.top - popUpHeight + 1;

		if (top < scrollTop)
		{
			top = scrollTop;
			this.element.addClass('over');
		}
		else
		{
			this.element.addClass('above');
		}
	}
	else
	{
		this.element.addClass('below');
	}
	
	this.element.css
	({
		width: width + 'px',
		left: offset.left + 'px',
		top: top + 'px'
	});
};

// Shows the pop-up.
Popup.prototype.show = function()
{
	if (!this.selectioner.display.isDisabled() && 
		!this.selectioner.display.isReadOnly() && 
		!this.isShown())
	{
		// Hide the popup any time the window resizes.
		var popup = this;
		$(window)
			.one
			(
				'resize.selectioner',
				function()
				{
					popup.hide();
				}
			);

		if (!this.isShown())
		{
			this._isVisible = true;
			this.update();
			
			var popUpHeight = this.element.height();
			
			this.reposition();
			
			this.element.css({ visibility: 'visible', zIndex: '' });
			
			if (popUpHeight != this.element.height())
			{
				// Height can often only be calculated by jQuery after the 
				// element is visible on the page. If our CSS happens to change
				// the height of the pop-up because of this, reposition it again.
				this.reposition();
			}
			
			if (this.element.hasClass('above'))
			{
				this.previous();
			}
			else
			{
				this.next();
			}
						
			this.selectioner.trigger('show.selectioner');
		}
	}
};

// Simply hides the pop-up.
Popup.prototype.hide = function()
{
	$(window).off('resize.selectioner');

	if (this.isShown())
	{
		this._isVisible = false;
		this.element.css({ visibility: 'hidden', zIndex: '-1' });
		this.selectioner.trigger('hide.selectioner');
	}
};

// Simply indicates whether the popup is shown to the user currently.
Popup.prototype.isShown = function()
{
	return this._isVisible;
};

Popup.prototype.next = function()
{
	var canMove = false;
	
	if (!this.currentDialogIndex)
	{
		this.currentDialogIndex = 0;
	}
		
	while (!canMove)
	{
		canMove = this.dialogs[this.currentDialogIndex].next();
		
		if (!canMove)
		{
			if (this.currentDialogIndex < this.dialogs.length - 1)
			{
				this.currentDialogIndex++;
			}
			else
			{				
				return false;
			}
		}
	}
	
	return true;
};

Popup.prototype.previous = function()
{
	var canMove = false;
	
	if (!this.currentDialogIndex)
	{
		this.currentDialogIndex = this.dialogs.length - 1;
	}
		
	while (!canMove)
	{
		canMove = this.dialogs[this.currentDialogIndex].previous();
		
		if (!canMove)
		{
			if (this.currentDialogIndex > 0)
			{
				this.currentDialogIndex--;
			}
			else
			{				
				return false;
			}
		}
	}
	
	return true;
};

Popup.prototype.select = function()
{
	if (!this.currentDialogIndex)
	{
		this.currentDialogIndex = this.dialogs.length - 1;
	}
	
	this.dialogs[this.currentDialogIndex].select();
};

Popup.prototype.onKeyDown = function(key, event)
{
	// Keyboard integration
	if (this.isShown() && event.target === this.selectioner.display.element[0])
	{
		switch(key)
		{
			// Escape
			case 27:
				this.hide();
				break;
				
			// Up arrow
			case 38: 
				event.preventDefault();
				this.previous();
				break;
				
			// Down arrow
			case 40: 
				event.preventDefault();
				this.next();			
				break;
				
			// Space
			case 32:
			// Enter / Return
			case 13:
				event.preventDefault();
				this.select();
				break;
		}
	}
};