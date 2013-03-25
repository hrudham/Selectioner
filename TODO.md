# Selectioner To-Do

- Convert component communication to be purely event driven.
- Allow for CSS class prefixes
- Stop setting CSS explicitly in JS; use classes instead.
- Build a required CSS file with just the basics that will get the control to work. Add an additional CSS file for cosmetic purposes.
- Allow the dialog to animate when opening.
- Review how the open / close eventing works.
- Add highlighting / outlining back again.
- Fix the issue where clicking on a label open the dialog, then clicking on the display itself, results in the dialog not closing.
- Write an auto-complete extension.
- Test / implement with AJAX.
- Consider implementing responsive support for mobile.
- Add .gitignore and attributes files.
- Dialog needs to be able to determine where it should position itself depending on what is available within the viewport (IE: do not overflow at the bottom of the page).
- If the viewport ends up off of the viewport, it's size is incorrectly calculated.
- Dialog needs to reposition itself when the viewport resizes. Might be better just to close it when this happens.