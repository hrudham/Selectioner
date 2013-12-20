requirejs.config(
	{
		baseUrl: '../../source',
		paths: 
		{
			jquery: '../libraries/jquery-1.10.2.min',
			globalize: '../libraries/Globalize/globalize',
			initdemo: '../demos/initdemo'
		}
	});
	
require(
	[
		'jquery', 
		'globalize',
		/*'../libraries/Globalize/cultures/globalize.culture.en-US',
		'../libraries/Globalize/cultures/globalize.culture.en-ZA',
		'../libraries/Globalize/cultures/globalize.culture.it-IT',
		'../libraries/Globalize/cultures/globalize.culture.de-DE',*/
		'extensions/single-select', 
		'extensions/multi-select',
		'extensions/date-select',
		'extensions/combo-select',
		'extensions/auto-complete',
		'initdemo'
	], 
	function()
	{
		$(initdemo);
	});