var Dialog = Selectioner.Base.Dialog = function() {};

Dialog.prototype = new Eventable();

Dialog.prototype.initialize = function(select)
{	
	this.select = select;
};

// Render the dialog. This method should be explicity 
// overridden by prototypes that inherit from it, 
// and must set this.element to some jQuery object.
Dialog.prototype.render = function()
{
	throw new Error('The render method needs to be explicity overridden, and must set "this.element" to a jQuery object.');
};

// Associates a dialog with a popup.
Dialog.prototype.setPopup = function(popup)
{
	this.popup = popup;
};