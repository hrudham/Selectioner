#Selectioner

A light-weight jQuery replacement for HTML select boxes.

## Introduction

### What it is

- Single-select
- Multi-select
- Combo-box
- Auto-complete

### What it works in

Tested in Google Chrome 26, Firefox 19, Safari 5, Opera 12, Internet Explorer 8, 9 and 10.

It's actually functional in Internet Explorer 6 and 7, although there are numerous cosmetic bugs. These could be corrected if you are willing to write your own CSS, but they are not going to be officially supported by this project. 

### How to use it

Make sure that you've included the following in your project:

- [jQuery](http://www.jquery.com/) v1.9.1+
- [selectioner.min.js](selectioner.min.js) (or the [development](selectioner.js) version)
- [selectioner.css](selectioner.css) 
	- You'll probably want to edit this to suit your website's look and feel.

See the [demo](demo/index.html) page for a more in-depth examples.

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

Please note that this does not support `optgroup` elements. 

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

```html
<input type="date" id="DateInput" placeholder="Choose a date"/>
<script>
	$(function(){
		$('#DateInput').dateSelect();
	});
</script>
```

### Build your own!

You can write custom Selectioner controls quite easily, and even chop-and-change what parts are shown. For example:

```html
<select id="CustomSelect">
	...
</select>
<div id="CustomButtons" style="border-top: 1px dotted #CCC; text-align: right;">
	<a href="javascript:;" class="button">Close</a>
</div>
<script>
	$(function(){
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
					'<div style="font-style: italic; color: #999; text-align: center; margin-top: 4px; border-bottom: 1px dotted #CCC;">Base Colour</div>',
					new Selectioner.Dialog.SingleSelect(),
					'#CustomButtons'
				]
			);
	});
</script>
```

### What features it has

- The pop-up always attempts to make sure it appears on the screen; it will try not to cause any overflow.
- It stays in sync with it's underlying element and preserves element IDs, so the correct information is sent when a POST occurs.

## Development

### How it's built

- Built in a modular pattern with prototyping in mind.
- The build process uses [NodeJS](http://nodejs.org/) and [Jake](https://github.com/mde/jake) to mash, minify and validate everything.
- It has [JSHint](http://www.jshint.com/) implemented, and has been written in [strict mode](http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/).
- It uses [LESS](http://lesscss.org/) to build it's CSS files.

### How you can build it

If you've never built the project before, download [nodejs.org](http://nodejs.org/), and make sure that you have the [Node Packet Manager (NPM)](https://npmjs.org/) installed (this usually comes bundled with Node). 

Once that's done, you're going to need [Jake](https://github.com/mde/jake). This is a Rake port for NodeJS. You can obtain this with NPM via the following command:

		$ npm install jake -g

Thereafter, build the solution from the `[ProjectPath]\Build` directory with the following command: 

		$ jake