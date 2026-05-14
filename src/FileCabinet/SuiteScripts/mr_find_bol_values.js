/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(['N/file', 'N/search', 'N/log'], function (file, search, log) {

const TARGET_VALUE = ['3088577']; // value to search

    function getInputData() {
        // Search for all CSV files in a folder
        return search.create({
            type: 'file',
            filters: [
                ['folder', 'anyof', '3033'], // 🔁 Replace with your folder ID
                'AND',
                ["name","haskeywords","BOL"]
            ],
            columns: ['internalid', 'name']
        });
    }

    function map(context) {
        var searchResult = JSON.parse(context.value);
        var fileId = searchResult.id;

        try {
            var csvFile = file.load({ id: fileId });
            var contents = csvFile.getContents();

            var lines = contents.split('\n');

            for (var i = 0; i < lines.length; i++) {
                var row = lines[i].trim();
                if (!row) continue;

                var columns = row.split(',');

                // Check if any column contains the target value
                for (var j = 0; j < columns.length; j++) {
					
					for(var z = 0; z < TARGET_VALUE.length; z++){
						 if (columns[j] && columns[j].indexOf(TARGET_VALUE[z]) !== -1) {
        context.write({
            key: fileId,
            value: row
        });
        break;
    }
					}
					
                    
                }
            }

        } catch (e) {
            log.error('Error processing file ' + fileId, e);
        }
    }

    function reduce(context) {
        var fileId = context.key;
        var matchedRows = context.values;

        log.audit('Matches in File ' + fileId, matchedRows);
		
		 var fileObj = file.load({
                            id: fileId
                        });
                        fileObj.folder = 2147;
                        var fileId = fileObj.save();
                        log.debug('fileId', fileId);

        // 👉 You can process results here:
        // - Create records
        // - Update data
        // - Save results to another file
    }

    function summarize(summary) {
        log.audit('Summary', {
            totalKeys: summary.inputSummary.totalKeys,
            usage: summary.usage,
            concurrency: summary.concurrency,
            yields: summary.yields
        });

        summary.mapSummary.errors.iterator().each(function (key, error) {
            log.error('Map Error for key: ' + key, error);
            return true;
        });

        summary.reduceSummary.errors.iterator().each(function (key, error) {
            log.error('Reduce Error for key: ' + key, error);
            return true;
        });
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };
});