requirejs.config(
	{
		baseUrl: '../../source',
		paths: 
		{
			jquery: '../libraries/jquery-1.10.2.min',
			initdemo: '../demo/initdemo'
		}
	});
	
require(
	[
		'jquery', 
		'extensions/single-select', 
		'extensions/multi-select',
		'extensions/date-select',
		'extensions/combo-select',
		'extensions/auto-complete',
		'initdemo'
	], 
	function()
	{
		initdemo();
	});