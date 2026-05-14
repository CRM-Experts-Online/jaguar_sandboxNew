/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
 define(['N/search', 'N/record'], function (search, record) {

    function getInputData() {
        return search.load('customsearch_record_to_remove')
    }

    function map(context) {
        var recid = context.key;
        var ctx = JSON.parse(context.value);
        record.delete({
            type: ctx.recordType,
            id: recid
        });
    }

    function summarize(summary) {
        var mapSummary = summary.mapSummary;

        mapSummary.errors.iterator().each(function (key, value) {
            value = JSON.parse(value);

            log.error('Error for key: ' + key, {title: ' Error Key: ' + key, details: value});
            return true;
        });
    }

    return {
        getInputData: getInputData,
        map: map,
        summarize: summarize
    }
});