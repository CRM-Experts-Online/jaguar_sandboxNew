/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/log'], function(search, record, log) {

    function getInputData() {
        var internalIds = [];
        var customerSearch = search.create({
            type: "customer",
            filters:
            [
                ["externalidstring","isempty",""], 
                "AND", 
                ["isjob","is","F"]

            ],
            columns: [search.createColumn({ name: "internalid", label: "Internal ID" })],
        });

        var searchObj = customerSearch.run();
        var startIndex = 0;
        var pageSize = 1000; // Adjust as needed based on your requirements

        var searchResults = getResultsPage(searchObj, startIndex, pageSize);
        while (searchResults.length > 0) {
            searchResults.forEach(function (result) {
                internalIds.push(result.getValue({ name: 'internalid' }));
            });
            startIndex += pageSize;
            searchResults = getResultsPage(searchObj, startIndex, pageSize);
        }

        return internalIds;
    }

    function getResultsPage(searchObj, startIndex, pageSize) {
        return searchObj.getRange({ start: startIndex, end: startIndex + pageSize });
    }

    function map(context) {
        var internalId = context.value;
        log.debug("Internal ID in map function:", internalId);

        var customerRecord = record.load({
            type: record.Type.CUSTOMER,
            id: internalId,
            isDynamic: true,
        });

        log.debug({
            title: "customerRecord",
            details: customerRecord
        });

        var getCustID = customerRecord.getValue({
            fieldId: 'entityid'
        });

        var updateExternalId = customerRecord.setValue({
            fieldId: 'externalid',
            value: getCustID,
        });

        log.debug({
            title: "updateExternalId",
            details: updateExternalId
        });

        var saveRec = customerRecord.save();

        log.debug({
            title: 'saveRec',
            details: saveRec
        });

    }

   

    return {
        getInputData: getInputData,
        map: map
    }
});
