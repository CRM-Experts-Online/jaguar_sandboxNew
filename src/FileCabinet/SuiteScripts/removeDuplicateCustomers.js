/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search'], function (record, search) {

    var internalIds = []; // Array to store internal IDs
    function getInputData() {
        var customerSearchObj = search.create({
            type: "customer",
            filters:
            [
               ["datecreated","within","05/17/2024 12:00 am","05/17/2024 11:59 pm"], 
               "AND", 
               ["systemnotes.context","anyof","CSV"], 
               "AND", 
               ["systemnotes.name","anyof","9361"]
            ],
            columns: [search.createColumn({ name: "internalid", label: "Internal ID" })],
        });
    
        // Run the search in pages
        var searchPagedData = customerSearchObj.runPaged({ pageSize: 1000 }); // Adjust pageSize as needed
    
        // Process each page of results
        searchPagedData.pageRanges.forEach(function (pageRange) {
            var page = searchPagedData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                var internalId = result.getValue({ name: 'internalid' });
                internalIds.push(internalId);
            });
        });
    
        return internalIds;
    }

    function map(context) {
        var internalId = context.value;
        log.debug("Internal ID in map function:", internalId);

      var deleteRec = record.delete({
        type: record.Type.CUSTOMER,
        id: internalId
      });

      log.debug({
        title: "Record Deleted",
        details: deleteRec
      });

    }
    return {
        getInputData: getInputData,
        map: map
    };
});


