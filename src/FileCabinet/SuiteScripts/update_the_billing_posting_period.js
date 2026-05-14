/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/log'], function (search, record, log) {

    function getInputData() {
        log.audit('START', 'Loading saved search customsearch2815');

        return search.load({
            id: 'customsearch2817'
        });
    }

    function map(context) {
        var result = JSON.parse(context.value);

        var recId = result.id;
        var recType = result.recordType;

        // 🔹 Log 1: Before update
        log.debug('Processing Record', 'Type: ' + recType + ' | ID: ' + recId);

        try {
            record.submitFields({
                type: recType,
                id: recId,
                values: {
                    postingperiod: 92
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            });

            // 🔹 Log 2: Success
            log.audit('Updated Successfully', 'ID: ' + recId);

        } catch (e) {
            // 🔹 Log 3: Error
            log.error('Update Failed', 'ID: ' + recId + ' | Error: ' + e.message);
        }
    }

    function summarize(summary) {

        log.audit('SUMMARY', 'Script Execution Completed');

        summary.mapSummary.errors.iterator().each(function (key, error) {
            log.error('Map Error for Key: ' + key, error);
            return true;
        });
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    };
});