# Selectioner To-Do List

## Required Tasks

- Test and implement with AJAX.
- Expose hide and show functions on the root Selectioner object.
- Overridable options / settings.
- Build a required CSS file with just the basics that will get the control to work.
	- Add an additional CSS file for cosmetic purposes.

## Nice To Have

- Consider implementing responsive support for mobile.
- jQuery validation support.
- dir="rtl" support.

## Stuff to Remember / Think about

- Make sure that zooming works
- Work out how to handle "hidden" selects (both those with "display: none", and those in hidden elements.
- Work out how to handle removing selectioner items.
- Work out how to handle re-parsing the HTML, such as after dynamically generated <select /> elements are added to the DOM via AJAX or other JS calls.
- Test on Mobile
- Test with keyboard naviation
- Make sure that focus highlighting / outlining works.
- Provide easier access to the Selectioner object on the <select /> element. 
	- Something like $('select').selectioner() instead of $('select').data('selectioner').
	- Calling this method could automatically attempt to work out what the best selectioner to
	  convert this <select /> to would be, and do so.

## Things to test

- Really long items in a list, and when they are selected, such as:
	- "Thisisaverylongoptionwithoutanyspaces"
	- "This is a very long option that will definitely wrap".
- Really huge collections of <option /> elements.
	- Can we render async? Are we adding elements as a block of elements or individually?

## Pipe dreams

- Remove jQuery as a dependency.