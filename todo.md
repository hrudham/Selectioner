# Selectioner To-Do List

## Required Fixes

- Convert component communication to be purely event driven.
	- Start with the "render" and "update" methods.
- When you save an HTML page, you often end up with two display elements after the target select; stop this from happening.
- Build a required CSS file with just the basics that will get the control to work.
	- Add an additional CSS file for cosmetic purposes.
- Stop setting CSS explicitly in JS; use classes instead.
	-  Allow the dialog to animate when opening.
- Make sure that <select /> events (focusin, mouseover, blur, etc.) all fire when triggered on the selectioner as well.

## Required Functionality

- Keyboard navigation.
- Disabled element support.
- Write an auto-complete extension.
- Test and implement with AJAX.

## Nice To Have

- Consider implementing responsive support for mobile.
- Max-height determined by the top X items, rather than hard-coded in CSS.

## Stuff to Remember

- Make sure that zooming works
- Test on Mobile
- Use keyboard naviation
- Make sure that focus highlighting / outlining works.