/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search'], function (record, search) {

    function getInputData() {
        var data = [];
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
      ["systemnotes.date","within","04/30/2024 12:00 am","04/30/2024 11:59 pm"]
   ],
            columns: [
                search.createColumn({ name: "internalid", label: "Internal ID" }),
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

        customerSearchObj.run().each(function (result) {
            var internalId = result.getValue({
                name: "internalid",
                label: "Internal ID"
            });
            var oldValue = result.getValue({
                name: "oldvalue",
                join: "systemNotes",
                label: "Old Value"
            });

            // Collect necessary data
            data.push({
                internalId: internalId,
                oldValue: oldValue
            });

            return true;
        });

        return data;
    }

    function map(context) {
        var data = JSON.parse(context.value);
        var internalId = data.internalId;
        var oldValue = data.oldValue;

        // Use internalId and oldValue as needed in your map logic
        log.debug("Internal ID", internalId);
        log.debug("Old Value", oldValue);

        var loadCust = record.load({
            type: record.Type.CUSTOMER,
            id: internalId,
            isDynamic: true,
        });

        var getCustID = loadCust.setValue({
            fieldId: 'entityid',
            value: oldValue,
        });

        var saveRec = loadCust.save({
            enableSourcing: true,
            ignoreMandatoryFields: false
        });

        log.debug({
            title: "saveRec",
            details: saveRec
        });

        // Perform further processing as needed
    }

    return {
        getInputData: getInputData,
        map: map
    };
});
