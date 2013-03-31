#Selectioner

A light-weight jQuery replacement for HTML select boxes.

## Introduction

### What it is

- Single-select
- Multi-select
- Combo-box

### What it works in

Tested in Google Chrome 26, Firefox 19, Safari 5, Opera 12, Internet Explorer 9 and Internet Explorer 8.

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

```html
<input type="text" id="MyComboText" placeholder="Select an option" />
<select id="MyComboSelect" multiple="multiple"> ... </select>
<script>
	$('#MyComboSelect').comboSelect('#MyComboText');
</script>
```

### What features it has

- It has basic keyboard support; you can use most of it's functionality without a mouse.
- It automatically copies over styles, classes and data attributes from it's underlying `select` element.
- The pop-up always attempts to make sure it appears on the screen; it will try not to cause any overflow.
- It stays in sync with it's underlying `<select />` element and preserves element IDs, so the correct information is sent when a POST occurs.

## Development

### How it's built

- Built in a modular pattern with prototyping in mind.
- The build process uses [NodeJS](http://nodejs.org/) and [Jake](https://github.com/mde/jake) to mash, minify and validate everything.
- It has [JSHint](http://www.jshint.com/) implemented, and has been written in [strict mode](http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/).

### How you can build it

If you've never built the project before, download [nodejs.org](http://nodejs.org/), and make sure that you have the [Node Packet Manager (NPM)](https://npmjs.org/) installed (this usually comes bundled with Node). 

Once that's done, you're going to need [Jake](https://github.com/mde/jake). This is a Rake port for NodeJS. You can obtain this with NPM via the following command:

		$ npm install jake -g

Thereafter, build the solution from the `[ProjectPath]\Build` directory with the following command: 

		$ jake