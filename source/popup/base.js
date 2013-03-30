(function(){
	var PopupBase = Selectioner.Popup.Base = function() {};

	PopupBase.prototype.initialize = function(select, display, dialog)
	{	
		this.select = select;
		this.display = display;
		this.dialog = dialog;

		this.element = $('<div />')
			.addClass('select-dialog')
			.css
			({
				display: 'none',
				position: 'absolute'
			});
		
		this.render();
		
		var dialog = this;
		
		var toggleDialog = function() 
		{ 
			if (dialog.isShown())
			{
				dialog.hide();
			}
			else
			{
				dialog.show();
			}
		};
		
		var display = this.display;
		
		this.display
			.element
			.on
			(
				'focusin.selectioner', 
				function(event) 
				{ 
					dialog.show();
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
					if (dialog.isShown() &&
						event.target !== dialog.display.element[0] &&
						!$.contains(dialog.display.element[0], event.target) &&
						event.target !== dialog.element[0] &&
						!$.contains(dialog.element[0], event.target))
					{
						display.element.off('mousedown.hide-select');
						dialog.hide();
					}
				}
			);
			
		$('body').append(this.element);
	};

	PopupBase.prototype.reposition = function()
	{
		var offset = this.display.element.offset();
		var borderWidth = this.element.outerWidth(false) - this.element.width();
		this.element.css
		({
			width: this.display.element.outerWidth(false) - borderWidth + 'px',
			left: offset.left + 'px',
			top: this.display.element.outerHeight(false) + offset.top + 'px'
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
		this.element.css('display', '');
		this.select.trigger('show-dialog.selectioner');
	};

	PopupBase.prototype.hide = function()
	{
		this.element.css('display', 'none');
		this.select.trigger('hide-dialog.selectioner');
	};

	PopupBase.prototype.isShown = function()
	{
		return this.element.is(':visible');
	}
})();