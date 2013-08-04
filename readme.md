#Selectioner

A jQuery-based enhancement for HTML select boxes.

You can view the live demo here: [http://hrudham.github.io/](http://hrudham.github.io/)

## Introduction

### What it works in

Tested in Google Chrome, Firefox, Safari (for Windows), Opera 12, Internet Explorer 8, 9 and 10.

### How to use it

Make sure that you've included the following in your project:

- [jQuery](http://www.jquery.com/)
- [selectioner.min.js](selectioner.min.js) (or the [development](selectioner.js) version)
- [selectioner.css](selectioner.css) 
	- You'll probably want to edit this to suit your website's look and feel.

### What features it has

- The pop-up always attempts to make sure it appears on the screen; it will try (but not guarantee) not to cause any overflow.
- It stays in sync with it's underlying element and preserves element IDs, so the correct information is sent when a POST occurs.

### Single-select

This will create a control that will allow you to select a single item. 

```html
<select id="MySingleSelect"> ... </select>
<script>
	$('#MySingleSelect').singleSelect();
</script>
```

### Multi-select

This will create a control that will allow you to select multiple items.

```html
<select id="MyMultiSelect" multiple="multiple"> ... </select>
<script>
	$('#MyMultiSelect').multiSelect();
</script>
```

### Combo-select

This will create a control that will allow you to select a single item, or enter your own text. 

It assumes that you have a `select` element followed by an `input type="text"` element.

```html
<select id="MyComboSelect">
	<option></option> <!-- an empty option is required -->
	...
</select>
<input type="text" id="MyComboText" placeholder="Select an option" />
<script>
	$('#MyComboSelect').comboSelect();
</script>
```

### Auto-complete

This will create a control that will allow to select an item, or enter your own. The items displayed will be filtered based upon what you type, and limited to a maximum of five items. 

It assumes that you have a `select` element followed by an `input type="text"` element.

Please note that this does not support `optgroup` elements in the underlying `select` element. 

```html
<select id="MyAutoCompleteSelect">
	<option></option> <!-- an empty option is required -->
	...
</select>
<input type="text" id="MyAutoCompleteText" placeholder="Select an option" />
<script>
	$('#MyAutoCompleteSelect').autoComplete();
</script>
```

### Date-select

This is a very basic date select control, and was created purely to illustrate the versatility of the Selectioner. Most modern browsers have solved this problem already.

Notice that it targets an `input type="date"` instead of a `select` element this time.

```html
<input type="date" id="DateInput" placeholder="Choose a date"/>
<script>
	$(function(){
		$('#DateInput').dateSelect();
	});
</script>
```

### Build your own!

You can write custom Selectioner controls quite easily, and even chop-and-change what parts are shown. You are not limited to targetting just `select` elements either, as the Date-select illustrates. For example:

```html
<select id="CustomSelect">
	...
</select>
<span id="CustomButtons" style="border-top: 1px dotted #CCC; text-align: right; display: block;">
	<a href="javascript:;" class="button">Close</a>
</span>
<script>
	$(function(){
		var staticDialogCss = 'font-style: italic; color: #999; text-align: center; margin-top: 4px; border-bottom: 1px dotted #CCC;'
		var staticDialogHtml = '<div style="' + staticDialogCss + '">Base Colour</div>';
	
		// Build the custom selectioner.
		var customSelectioner = new Selectioner
			(
				// This is the obect that the Selectioner will target as it's 
				// underlying element. This is usually an input, select or textarea.
				$('#CustomSelect'), 	
				
				// This is what displays what is currently selected to the user. 
				// You can make your own by inheriting from Selectioner.Core.Display.
				new Selectioner.Display.ListBox(),	
				
				// This is either a single Dialog, or an array of them. Dialogs are what
				// appear in the popup. You can either create static dialogs that are
				// unaware of the rest of the Selectioner, or add objects that inherit from
				// Selectioner.Core.Dialog that will update whenever the selected value 
				// changes. In this example, only the SingleSelect() dialog does this.
				[
					staticDialogHtml,
					new Selectioner.Dialog.SingleSelect(),
					'#CustomButtons'
				],
				{	
					// Add custom options here. This overrides Selectioner.Settings.
				}
			);
		
		// Hook up an event handler to the button's click event.
		// To clarify, events that are set up before the selectioner 
		// is created will continue to work in cases like this as well.
		$('#CustomButtons .button').on('click', function() { customSelectioner.display.popup.hide(); });
	});
</script>
```

## General Settings

The following global settings will affect all Selectioners on your page. These are their defaults:

```javascript
Selectioner.Settings =
{
	cssPrefix: 'select-',
	noSelectionText: 'Select an option',
	emptyOptionText: 'None',
	maxAutoCompleteItems: 5
};
```

Some of these are editable per-control with the following overrides:

### Selectioner.Settings.noSelectionText

Add a `data-placeholder` attribute to the underlying `select` element. 

Alternatively, in the case of Combo-selects and other controls that support it, you can set the `placeholder` attribute on that control instead. This can be overridden by a `data-placeholder` attribute however.

## Development

### How it's built

- Built in a modular pattern with prototyping in mind.
- The build process uses [NodeJS](http://nodejs.org/) and [Grunt](http://gruntjs.com/) to mash, minify and validate everything.
- It has [JSHint](http://www.jshint.com/) implemented, and has been written in [strict mode](http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/).
- It uses [LESS](http://lesscss.org/) to build it's CSS files.

### How you can build it

If you've never built the project before, download [nodejs.org](http://nodejs.org/), and make sure that you have the [Node Packet Manager (NPM)](https://npmjs.org/) installed (this usually comes bundled with Node). 

Once that's done, you're going to need [Grunt](http://gruntjs.com/). You can obtain this with NPM via the following command:

		$ npm install -g grunt-cli

Thereafter, build the solution from the project's root directory with the following command: 

		$ grunt