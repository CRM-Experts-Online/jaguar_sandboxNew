/**
 * @NApiVersion 2.x
 * @NScriptType customglplugin
 */
define(['N/record', 'N/log', 'N/plugin'], function(record, log, plugin) {
    var exports = {};

    exports.customizeGlImpact = function(transactionRecord, standardLines, customLines, book) {
        
		for (var i = 0; i < standardLines.count; i++)
   {
      var currLine = standardLines.getLine(i);
	  
	 log.debug('currLine', currLine);
      
   }
       
    };

    return exports;
});