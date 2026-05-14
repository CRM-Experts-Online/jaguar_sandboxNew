/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
 define(['N/search','N/record'], function(search,record) {

    function getInputData() {
        // Create the search object for sales orders
        var salesorderSearchObj = search.create({
            type: "salesorder",
            filters: [
                ["type", "anyof", "SalesOrd"], 
                "AND", 
                ["status", "anyof", "SalesOrd:H"], 
                "AND", 
                ["mainline", "is", "T"]
            ],
            columns: [
                search.createColumn({name: "internalid", label: "Internal ID"})
            ]
        });
        
        // Run the search and return the results
        return salesorderSearchObj;
    }

    function map(context) {
        var searchResult = JSON.parse(context.value);
        
        var internalId = searchResult.id;
        
        log.debug('Processing Sales Order Internal ID', internalId);

        var loadSO = record.load({
            type: record.Type.SALES_ORDER,
            id: internalId,
            isDynamic: true,
        });

        log.debug({
            title: "loadSO",
            details: loadSO
        });


        var getEntity = loadSO.getValue({
            fieldId: 'entity'
        });
        log.debug({
            title: "getEntity",
            details: getEntity
        });


        var loadCust = record.load({
            type: record.Type.JOB,
            id: getEntity,
            isDynamic: true,
        });
        log.debug({
            title: "loadCust",
            details: loadCust
        });

        var updateStatus  = loadCust.setValue({
            fieldId: 'entitystatus',
            value: 1,
        });
        log.debug({
            title: "updateStatus",
            details: updateStatus
        });

        var recSave = loadCust.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
        });

        log.debug({
            title: "recSave",
            details: recSave
        });
        
    }

    return {
        getInputData: getInputData,
        map: map
    }
});
