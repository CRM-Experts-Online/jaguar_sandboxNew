/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record'], function(record) {
    function afterSubmit(context) {
        log.debug({
            title: "context",
            details: context
        });
        if (context.type === context.UserEventType.CREATE) {
            var newRecord = context.newRecord.id;
            log.debug({
                title: "newRecord",
                details: newRecord
            });

            var loadrec = record.load({
                type: record.Type.CUSTOMER,
                id: newRecord,
                isDynamic: true,
            });

            var getCustID = loadrec.getValue({
                fieldId: 'entityid'
            });

            var updateExternalId = loadrec.setValue({
                fieldId: 'externalid',
                value: getCustID,
            });

            log.debug({
                title: "updateExternalId",
                details: updateExternalId
            });

            var saveRec = loadrec.save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });

            log.debug({
                title: 'saveRec',
                details: saveRec
            });
        }

    }

    return {
        afterSubmit: afterSubmit
    }
});
