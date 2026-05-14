/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/log'], function (search, record, log) {
    function getInputData() {
        var internalIds = [];
        var customerSearch = search.create({
            type: "customer",
            filters:
            [
               ["systemnotes.context","anyof","CSV"], 
               "AND", 
               ["systemnotes.name","anyof","9361"], 
               "AND", 
               ["datecreated","within","05/01/2024 12:0 am","05/20/2024 11:59 pm"]
            ],
            columns: [search.createColumn({ name: "internalid", label: "Internal ID" })],
        });

        var searchObj = customerSearch.run();
        var startIndex = 0;
        var pageSize = 1000; 

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

        var numLines = customerRecord.getLineCount({ sublistId: 'addressbook' });
        for (var line = numLines - 1; line >= 0; line--) {
            var isDefaultShipping = customerRecord.getSublistValue({
                sublistId: 'addressbook',
                fieldId: 'defaultshipping',
                line: line
            });
            var isDefaultBilling = customerRecord.getSublistValue({
                sublistId: 'addressbook',
                fieldId: 'defaultbilling',
                line: line
            });

            if (isDefaultShipping === false && isDefaultBilling === false) {
                log.debug("Removing address line:", line);
                customerRecord.removeLine({
                    sublistId: 'addressbook',
                    line: line
                });
            }
          
        }
        var recordId = customerRecord.save();
        log.debug("Updated Customer Record ID:", recordId);
    }
    return {
        getInputData: getInputData,
        map: map
    };
});
