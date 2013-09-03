var initdemo = window.initdemo = function()
{
	//Globalize.culture('en-US');
	//Globalize.culture('en-ZA');
	Globalize.culture('de-DE');
	//Globalize.culture('it-IT');

	var resetForm = function()
	{
		$('form')[0].reset();
	};

	var toggleDisable = function()
	{
		var button = $(this);
		var isDisabled = !button.data('disabled');
		button.data('disabled', isDisabled);

		// Select elements don't get moved, 
		// but input[type="text"] elements
		// often do, hence no label sibling
		// search for them.
		$('form label + select, form input')
			.prop('disabled', isDisabled);
		
		if (!isDisabled)
		{
			$(this).text('Disable');
		}						
		else
		{
			$(this).text('Enable');
		}
	};

	var toggleReadOnly = function()
	{
		var button = $(this);
		var isReadOnly = !button.data('readonly');
		button.data('readonly', isReadOnly);

		// Select elements don't get moved, 
		// but input[type="text"] elements
		// often do, hence no label sibling
		// search for them.
		$('form input')
			.prop('readonly', isReadOnly);
		
		if (!isReadOnly)
		{
			$(this).text('Read Only');
		}						
		else
		{
			$(this).text('Editable');
		}
	};

	$('#ResetButton').click(resetForm);
	$('#ToggleDisableButton').click(toggleDisable);
	$('#ToggleReadonlyButton').click(toggleReadOnly);

	$('.empty').singleSelect();
	$('.basic').singleSelect();
	$('#BasicSingle').singleSelect();
	$('#OptGroupSingle').singleSelect();
	$('#BasicSingleLotsOfItems').append(
		(function(){
			var html = '';
			for (var i = 0; i <= 10000; i++)
			{
				html += '<option value="' + i + '">Item ' + i + '</option>';
			}
			return html;
		})())
		.singleSelect();

	$('#BasicMultiple').multiSelect();
	$('#OptGroupMultiple').multiSelect();

	$('#EmptyComboSelect').comboSelect();
	$('#BasicComboSelect').comboSelect();				
	$('#OptGroupComboSelect').comboSelect();
	$('#BasicAutoCompleteSelect').autoComplete();

	$('#DateInput').dateSelect();

	var staticDialogCss = 'font-style: italic; color: #999; text-align: center; margin-top: 4px; border-bottom: 1px dotted #CCC;'
	var staticDialogHtml = '<div style="' + staticDialogCss + '">Base Colour</div>';

	// Build the custom selectioner.
	var customSelectioner = new Selectioner
		(
			// This is the object that the Selectioner will target as it's 
			// underlying element. This is usually an input, select or text area.
			$('#CustomSelect1'), 	
			
			// This is what displays what is currently selected to the user. 
			// You can make your own by inheriting from Selectioner.Core.Display.
			new Selectioner.Display.ListBox(),	
			
			// This is either a single Dialog, or an array of them. Dialogs are what
			// appear in the pop-up. You can either create static dialogs that are
			// unaware of the rest of the Selectioner, or add objects that inherit from
			// Selectioner.Core.Dialog that will update whenever the selected value 
			// changes. In this example, only the SingleSelect() dialog does this.
			[
				staticDialogHtml,
				new Selectioner.Dialog.SingleSelect(),
				'#CustomButtons'
			]
		);

	// Hook up an event handler to the button's click event.
	// To clarify, events that are set up before the selectioner 
	// is created will continue to work in cases like this as well.
	$('#CustomButtons .button')
		.on
			(
				'click', 
				function() 
				{ 
					customSelectioner.display.popup.hide(); 
				}
			);
			
	var customSelectioner2 = new Selectioner
		(
			// Target control
			$('#CustomSelect2'), 
			
			// Display:
			new Selectioner.Display.ListBox(),	
			
			// Dialogs
			[
				new Selectioner.Dialog.SingleSelect(),
				new Selectioner.Dialog.SingleSelect(),
				new Selectioner.Dialog.SingleSelect(),
				new Selectioner.Dialog.SingleSelect()
			],
			
			// Settings to override
			{
				noSelectionText: 'No selection',
				emptyOptionText: 'Empty',
			} 
		);
};

if (typeof define === "function" && define.amd ) 
{
	define(
		"initdemo", 
		[], 
		function () 
		{ 
			return initdemo; 
		});
}