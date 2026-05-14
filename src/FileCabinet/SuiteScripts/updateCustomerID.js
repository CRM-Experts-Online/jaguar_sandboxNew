/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
define(['N/record', 'N/search'], function (record, search) {

    function getInputData() {
        var custIDs = [];
        var customerSearchObj = search.create({
            type: "customer",
            filters:
            [
               ["systemnotes.name","anyof","-4"], 
               "AND", 
               ["entityid","contains","mozilla"], 
               "AND", 
               ["systemnotes.field","anyof","ENTITY.SNAME"], 
               "AND", 
               ["systemnotes.date","within","04/30/2024 12:00 am","04/30/2024 11:59 pm"], 
               "AND", 
               ["internalid","anyof","3958"]
            ],
            columns:
            [
               search.createColumn({name: "internalid", label: "Internal ID"}),
               search.createColumn({
                  name: "oldvalue",
                  join: "systemNotes",
                  label: "Old Value"
               }),
               search.createColumn({
                  name: "newvalue",
                  join: "systemNotes",
                  label: "New Value"
               })
            ]
         });
         var searchResultCount = customerSearchObj.runPaged().count;
         log.debug("customerSearchObj result count",searchResultCount);
         customerSearchObj.run().each(function(result){
            // .run().each has a limit of 4,000 results
            return true;
         });
        return custIDs;
    }

    function map(context) {
        var customerRecord = record.load({
            type: record.Type.CUSTOMER,
            id: context.value
        });

        log.debug({
            title: 'customerRecord',
            details: customerRecord
        });

        var getCustID = customerRecord.getValue({
            fieldId: 'entityid'
        });
        log.debug({
            title: "getCustID",
            details: getCustID
        });
        var extractedInt = getCustID.match(/\d+/);
        var newCustID = extractedInt ? extractedInt[0] : null;

        log.debug({
            title: "extractedInt",
            details: newCustID 
        });
        if (newCustID) {
            customerRecord.setValue({
                fieldId: 'entityid',
                value: extractedInt
            });

            // Save the customer record
            var recordId = customerRecord.save();
            log.debug('Updated Customer Record ID', recordId);
        } else {
            log.debug('Error', 'Integer value not found in getCustID field.');
        }
    }

 
    return {
        getInputData: getInputData,
        map: map
    }
});
