/*!
 * Copyright 2013 Hilton Rudham
 * Released under the MIT license
 * https://github.com/hrudham/Selectioner/blob/master/LICENSE
 */
 
(function ($)
{
Selectioner = 
{
	Extensions: {},
	Dialog: {},
	Display: {},
	Popup: {}
};
(function(){
	var PopupBase = Selectioner.Popup.Base = function() {};

	PopupBase.prototype.initialize = function(select, display, dialogView)
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
			.append(this.dialogView.render());
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
(function(){
	var DisplayBase = Selectioner.Display.Base = function() {};

	DisplayBase.prototype.initialize = function(select, dialogView)
	{
		this.select = select;
		
		this.element = this.render();
		
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
		
		var dialog = new Selectioner.Popup.Base();
		dialog.initialize(select, this, dialogView);
	};

	DisplayBase.prototype.render = function()
	{	
		this.element = $('<span />')
			.prop('tabindex', this.select.prop('tabindex'))
			.addClass('select-display');
			
		this.textElement = $('<span />').addClass('select-text');
		
		var button = $('<span />').addClass('select-button');
		
		this.element
			.append(button)
			.append(this.textElement);
			
		this.update();
	};

	DisplayBase.prototype.update = function()
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
	var ListBox = Selectioner.Display.ListBox = function() {};
	
	ListBox.prototype = new Selectioner.Display.Base();
	
	ListBox.prototype.render = function()
	{	
		var element = $('<span />')
			.prop('tabindex', this.select.prop('tabindex'))
			.addClass('select-display');
			
		this.textElement = $('<span />').addClass('select-text');
		
		var button = $('<span />').addClass('select-button');
		
		element
			.append(button)
			.append(this.textElement);
			
		this.update();
		
		return element;
	};

	ListBox.prototype.update = function()
	{	
		var selectedOptions = this.select.find('option:selected');
		this.textElement.removeClass('none');
		
		if (selectedOptions.length == 0)
		{
			this.textElement
				.text('None')
				.addClass('none');
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
	var ComboBox = Selectioner.Display.ComboBox = function() {};
	
	ComboBox.prototype = new Selectioner.Display.Base();
	
	ComboBox.prototype.render = function()
	{	
		var element = $('<span />')
			.prop('tabindex', this.select.prop('tabindex'))
			.addClass('select-display');
			
		this.inputElement = $('<input type="text" />')
			.attr('placeholder', 'None')
			.addClass('select-text');
		
		var button = $('<span />').addClass('select-button');
		
		element
			.append(button)
			.append(this.inputElement);
			
		this.update();
		
		return element;
	};
	
	ComboBox.prototype.update = function()
	{	
		var selectedOption = this.select.find('option:selected');
		this.inputElement
			.removeAttr('placeholder')
			.removeClass('none');
			
		var value = '';
		
		if (selectedOption.length === 0)
		{
			this.inputElement.addClass('none');
		}
		else 
		{
			this.inputElement.val(selectedOption.text());
		}
	};
})();
(function(){
	var DailogBase = Selectioner.Dialog.Base = function() {};

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
	var SingleSelect = Selectioner.Dialog.SingleSelect = function() {};

	SingleSelect.prototype = new Selectioner.Dialog.Base();

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

	var MultiSelect = Selectioner.Dialog.MultiSelect = function() {};
					
	MultiSelect.prototype = new Selectioner.Dialog.Base();

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
$.fn.singleSelect = function ()
{
	this
		.filter('select:not([multiple])')
		.each
		(
			function()
			{
				var listBox = new Selectioner.Display.ListBox();
				listBox.initialize($(this), new Selectioner.Dialog.SingleSelect());
			}
		);
};
$.fn.multiSelect = function ()
{
	this
		.filter('select[multiple]')
		.each
		(
			function()
			{
				var listBox = new Selectioner.Display.ListBox();
				listBox.initialize($(this), new Selectioner.Dialog.MultiSelect());
			}
		);
};
$.fn.comboSelect = function ()
{
	this
		.filter('select:not([multiple])')
		.each
		(
			function()
			{
				var comboBox = new Selectioner.Display.ComboBox();
				comboBox.initialize($(this), new Selectioner.Dialog.SingleSelect());
			}
		);
};
})(jQuery);