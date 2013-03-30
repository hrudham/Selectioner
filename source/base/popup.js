var PopupBase = Selectioner.Base.Popup = function() {};

PopupBase.prototype = new Eventable();

PopupBase.prototype.initialize = function(select, display, dialog)
{	
	this.select = select;
	this.display = display;
	this.dialog = dialog;

	this.element = $('<div />')
		.addClass('select-dialog')
		.css
		({
			visibility: 'hidden',
			position: 'absolute',
			zIndex: '-1' 
		});
	
	this.render();
	
	var popup = this;
	
	var toggleDialog = function() 
	{ 
		if (popup.isShown())
		{
			popup.hide();
		}
		else
		{
			popup.show();
		}
	};
	
	this.display
		.element
		.on
		(
			'focusin.selectioner', 
			function(event) 
			{ 
				popup.show();
			}
		)
		.children()
		.on
		(
			'mousedown.selectioner', 
			function(event) 
			{ 
				event.stopPropagation(); 
				toggleDialog(); 
			}
		);
		
	$(document)
		.on
		(
			'mousedown.selectioner focusin.selectioner',
			function(event)
			{
				if (popup.isShown() &&
					event.target !== popup.display.element[0] &&
					!$.contains(popup.display.element[0], event.target) &&
					event.target !== popup.element[0] &&
					!$.contains(popup.element[0], event.target))
				{
					popup.hide();
				}
			}
		);
		
	$(window)
		.on
		(
			'resize.selectioner',
			function()
			{
				popup.hide();
			}
		);
		
	$('body').append(this.element);
};

PopupBase.prototype.reposition = function()
{
	var offset = this.display.element.offset();
	var borderWidth = this.element.outerWidth(false) - this.element.width();		
	var width = this.display.element.outerWidth(false) - borderWidth;
	var top = this.display.element.outerHeight(false) + offset.top;
	
	var scrollTop = $(window).scrollTop();
	var popUpHeight = this.element.outerHeight(true);
	
	this.element
		.removeClass('below')
		.removeClass('above')
		.removeClass('over');
	
	// If this popup would appear off-screen if below the display, then make it appear above it instead.
	if (window.innerHeight + scrollTop < top + popUpHeight)
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

PopupBase.prototype.render = function()
{
	this.element
		.empty()
		.append(this.dialog.render());
};

PopupBase.prototype.show = function()
{
	this.render();
	this.reposition();
	this.element.css({ visibility: 'visible', zIndex: '' });
	this.trigger('show.selectioner');
	this._isVisible = true;
};

PopupBase.prototype.hide = function()
{
	this.element.css({ visibility: 'hidden', zIndex: '-1' });
	this.trigger('hide.selectioner');
	this._isVisible = false;
};

PopupBase.prototype.isShown = function()
{
	return this._isVisible;
};