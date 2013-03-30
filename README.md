#Selectioner

A light-weight jQuery replacement for HTML select boxes.

### What it is

- Single-select
- Multi-select
- Combo-box

### What it does

- It has basic keyboard support; you can use most of it's functionality without a mouse.
- It automatically copies over styles, classes and data attributes from it's underlying `select` element.
- The pop-up always attempts to make sure it appears on the screen; it will try not to cause any overflow.

### How it's built

- Built in a modular pattern with prototyping in mind.
- The build process uses [NodeJS](http://nodejs.org/) and [Jake](https://github.com/mde/jake) to mash, minify and validate everything.
- It has [JSHint](http://www.jshint.com/) implemented, and has been written in [strict mode](http://ejohn.org/blog/ecmascript-5-strict-mode-json-and-more/).