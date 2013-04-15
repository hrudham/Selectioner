# Selectioner To-Do List

## Required Fixes

- Build a required CSS file with just the basics that will get the control to work.
	- Add an additional CSS file for cosmetic purposes.

## Required Functionality

- Keyboard navigation.
- Disabled element support.
- Test and implement with AJAX.

## Nice To Have

- Consider implementing responsive support for mobile.
- jQuery validation support.
- dir="rtl" support.
- Manual refresh call via JS.

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
- Convert everything to CommonJS / RequireJS, and use Google Closure Compiler to compile out the final, non-AMD JS.
	- http://www.nonblocking.io/2011/12/experimental-support-for-common-js-and.html