#Selectioner

A light-weight jQuery replacement for HTML select boxes.

## Introduction

### What it is

- Single-select
- Multi-select
- Combo-box

### What it does

- It has basic keyboard support; you can use most of it's functionality without a mouse.
- It automatically copies over styles, classes and data attributes from it's underlying `select` element.
- The pop-up always attempts to make sure it appears on the screen; it will try not to cause any overflow.
- Preserves element IDs, so the correct information is sent when a POST occurs.

### How it's built

- Built in a modular pattern with prototyping in mind.
- The build process uses [NodeJS](http://nodejs.org/) and [Jake](https://github.com/mde/jake) to mash, minify and validate everything.
- It has [JSHint](http://www.jshint.com/) implemented, and has been written in [strict mode](http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/).

## Usage

See the [demo](demo/index.html) page for a more in-depth examples.

### Single-select

This will create a control that will allow you to select a single item. 

```html
<select id="MySingleSelect"> ... </select>
<script>
	$('#MySingleSelect').singleSelect();
&gt;/script&lt;
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

## Development

### Solution Building Dependencies

#### NodeJS

You can obtain this from [nodejs.org](http://nodejs.org/). 

#### Node Package Manager (NPM)

NodeJs usually comes bundled with the NPM, but you can also obtain this from [npmjs.org](https://npmjs.org/).

The following global NPM packages are also required:

##### Jake

[Jake](https://github.com/mde/jake) is a Rake port for NodeJS. You can this with the [NPM](http://github.com/isaacs/npm).

		$ npm install jake -g

To build the solution from the `[ProjectPath]\Build` directory: 

		$ jake