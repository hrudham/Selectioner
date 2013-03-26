/*!
 * Copyright 2013 Hilton Rudham
 * Released under the MIT license
 * https://github.com/hrudham/Selectioner/blob/master/LICENSE
 */
 
(function ($)
{
Selectioner = 
{
	Core: {},
	Extensions: {},
	Views: 
	{
		Dialogs: {},
		Displays: {}
	}
};
(function(){
	var Dialog = Selectioner.Core.Dialog = function() {};

	Dialog.prototype.initialize = function(select, display, dialogView)
	{	
		this.select = select;
		this.display = display;
		this.dialogView = dialogView;

		this.element = $('<div />')
			.addClass('select-dialog')
			.css
			({
				display: 'none',
				position: 'absolute'
			});
		
		this.render();
		
		var dialog = this;
		
		this.display
			.element
			.on
			(
				'focusin.selectioner', 
				function(event) 
				{ 
					dialog.show();
					
					display.element.on
					(
						'mousedown.hide-select', 
						function(event) 
						{ 
							if (dialog.isShown())
							{
								dialog.hide();
							}
							else
							{
								dialog.show();
							}
						}
					);
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

	Dialog.prototype.reposition = function()
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

	Dialog.prototype.render = function()
	{
		this.element
			.empty()
			.append(this.dialogView.render());
	};

	Dialog.prototype.show = function()
	{
		this.render();
		this.reposition();
		this.element.css('display', '');
		this.select.trigger('show-dialog.selectioner');
	};

	Dialog.prototype.hide = function()
	{
		this.element.css('display', 'none');
		this.select.trigger('hide-dialog.selectioner');
	};

	Dialog.prototype.isShown = function()
	{
		return this.element.is(':visible');
	}
})();
(function(){
	var Display = Selectioner.Core.Display = function() {};

	Display.prototype.initialize = function(select, dialogView)
	{
		this.select = select;
		
		this.render();
		
		this.select
			.css('display', 'none')
			.after(this.element);
			
		var display = this;
		
		// Find any labels associated with this select element,
		// and make them focus on this display instead.
		var selectId = select.attr('id');
		if (selectId !== undefined)
		{
			$('label[for="' + selectId + '"]')
				.on
					(
						'click',
						function (event)
						{
							display.element.focus();
						}
					);
		}
			
		this.select
			.on
				(
					'change.selectioner', 
					function(event)
					{
						display.update();
					}
				)
			.on
				(
					'show-dialog.selectioner',
					function(event)
					{
						display.element.addClass('select-visible');
					}
				)
			.on
				(
					'hide-dialog.selectioner',
					function(event)
					{
						display.element.removeClass('select-visible');
					}
				);
				
		dialogView.initialize(select);
		
		var dialog = new Selectioner.Core.Dialog();
		dialog.initialize(select, this, dialogView);
	};

	Display.prototype.render = function()
	{	
		this.element = $('<span />')
			.prop('tabindex', this.select.prop('tabindex'))
			.addClass('select-display');
			
		this.textElement = $('<span />').addClass('select-text');
		
		this.button = $('<span />').addClass('select-button');
		
		this.element
			.append(this.button)
			.append(this.textElement);
			
		this.update();
	};

	Display.prototype.update = function()
	{	
		var selectedOptions = this.select.find('option:selected');
		this.textElement.removeClass('none');
		
		if (selectedOptions.length == 0)
		{
			this.textElement.text('None');
			this.textElement.addClass('none');
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
			this.textElement.text('Selected ' + selectedOptions.length + ' of ' + this.select.find('option').length);
		}
	};
})();
(function(){
	var DailogBase = Selectioner.Views.Dialogs.Base = function() {};

	DailogBase.prototype.initialize = function(select)
	{	
		this.select = select;
	};

	DailogBase.prototype.render = function()
	{
		var element = $('<ul />')

		var children = this.select.children();
		
		for (var i = 0, length = children.length; i < length; i++)
		{
			var child = $(children[i]);
			if (children[i].tagName === 'OPTION')
			{
				element.append(this.renderOption(child));
			}
			else if (children[i].tagName === 'OPTGROUP')
			{
				element.append(this.renderOptionGroup(child));
			}
		}	

		return element;	
	};
})();
(function(){
	var SingleSelect = Selectioner.Views.Dialogs.SingleSelect = function() {};

	SingleSelect.prototype = new Selectioner.Views.Dialogs.Base();

	SingleSelect.prototype.renderOption = function(option)
	{
		var select = this.select;

		var selectOption = function(event)
		{
			option[0].selected = true;
			select.trigger('change.selectioner');
		};

		var selectAnchor = $('<a />')
			.attr('href', 'javascript:;')
			.on('click', selectOption)
			.text(option.text());

		return $('<li />').append(selectAnchor);
	};

	SingleSelect.prototype.renderOptionGroup = function(group)
	{		
		var groupAnchor = $('<span />')
				.text(group.attr('label'));

		var options = $('<li />')
			.addClass('select-group-title')
			.append(groupAnchor);
		
		var children = group.children();
		for (var i = 0, length = children.length; i < length; i++)
		{
			var child = $(children[i]);
			options = options.add(this.renderOption(child));
		}

		return $('<li />').append
			(
				$('<ul >').append(options)
			);
	};
})();
(function(){
	var inputIdIndex = 0;

	var MultiSelect = Selectioner.Views.Dialogs.MultiSelect = function() {};
					
	MultiSelect.prototype = new Selectioner.Views.Dialogs.Base();

	MultiSelect.prototype.renderOption = function(option)
	{
		var element = $('<li />');
		var checkboxId = 'MultiSelectCheckbox' + inputIdIndex++;
		var checkbox = $('<input type="checkbox" />')
			.attr('id', checkboxId);
						
		if (option[0].selected)
		{
			checkbox.attr('checked', 'checked');
		}
			
		var label = $('<label />')
			.append(checkbox)
			.append($('<span />').text(option.text()))
			.attr('for', checkboxId);
			
		var dialog = this;
			
		checkbox.on
			(
				'change.selectioner', 
				function() 
				{
					option[0].selected = this.checked;
					dialog.select.trigger('change.selectioner');
				}
			);
			
		element.append(label);

		return element;
	};

	MultiSelect.prototype.renderOptionGroup = function(group)
	{
		var dialog = this;
		var toggleGroupSelect = function(event)
		{
			var checkboxes = $(this).closest('ul').find('input:checkbox');
			var checkedCount = checkboxes.filter(':checked').length;
			if (checkedCount > 0 && checkboxes.length === checkedCount)
			{
				checkboxes.prop('checked', false);
			}
			else
			{
				checkboxes.prop('checked', true);
			}
			
			checkboxes.trigger('change.selectioner');
		};
		
		var groupAnchor = $('<a />')
				.attr('href', 'javascript:;')
				.on('click', toggleGroupSelect)
				.text(group.attr('label'));

		var options = $('<li />')
			.addClass('select-group-title')
			.append(groupAnchor);
		
		var children = group.children();
		for (var i = 0, length = children.length; i < length; i++)
		{
			var child = $(children[i]);
			options = options.add(this.renderOption(child));
		}

		return $('<li />').append
			(
				$('<ul >').append(options)
			);
	};
})();
$.fn.select = function ()
{
	this
		.filter('select:not([multiple])')
		.each
		(
			function()
			{
				var display = new Selectioner.Core.Display();
				display.initialize($(this), new Selectioner.Views.Dialogs.SingleSelect());
			}
		);
};
$.fn.multiselect = function ()
{
	this
		.filter('select[multiple]')
		.each
		(
			function()
			{
				var display = new Selectioner.Core.Display();
				display.initialize($(this), new Selectioner.Views.Dialogs.MultiSelect());
			}
		);
};
})(jQuery);