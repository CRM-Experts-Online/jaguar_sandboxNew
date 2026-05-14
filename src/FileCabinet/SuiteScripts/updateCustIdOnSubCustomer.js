/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/log'], function (record, search, log) {

    function afterSubmit(context) {
        log.debug({
            title: "context",
            details: context
        });
        if (context.type === context.UserEventType.CREATE) {
            var custId = context.newRecord.id;

            var loadcust = record.load({
                type: record.Type.CUSTOMER,
                id: custId,
                isDynamic: true
            });

            var getParentCust = loadcust.getValue({
                fieldId: 'hasparent'
            });

            log.debug({
                title: "getParentCust",
                details: getParentCust
            });

            if (getParentCust == "F") {
                var getCustomerID = loadcust.getValue({
                    fieldId: 'entityid'
                });

                var newCustIDParent = (Number(getCustomerID) ).toString(); 
                log.debug({
                    title: "newCustIDParent before",
                    details: newCustIDParent
                });

                if (newCustIDParent.length === 7) {
                    newCustIDParent = newCustIDParent.slice(0, 6); 
                }

                log.debug({
                    title: "newCustIDParent after",
                    details: newCustIDParent
                });

                var updateCustId  =  loadcust.setValue({
                    fieldId: 'entityid',
                    value: newCustIDParent
                });

                var recordSave = loadcust.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: false
                });
            } else {
                var getParentCustId = loadcust.getValue({
                    fieldId: "parent"
                });

                var loadParentCust = record.load({
                    type: record.Type.CUSTOMER,
                    id: getParentCustId,
                    isDynamic: true
                })
                var getCustIDFromParent = loadParentCust.getValue({
                    fieldId: "entityid"
                });


                var customerSearchObj = search.create({
                    type: "customer",
                    filters:
                        [
                            ["internalid", "anyof", getParentCustId]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "internalid",
                                join: "subCustomer",
                                label: "Internal ID"
                            })
                        ]
                });
                var searchResultCount = customerSearchObj.runPaged().count;
                log.debug("customerSearchObj result count", searchResultCount);
                customerSearchObj.run().each(function (result) {
                    return true;
                });

                var updatedCustId = getCustIDFromParent + "-" + (searchResultCount + 100);

                log.debug({
                    title: "updatedCustId",
                    details: updatedCustId
                });

                var updateIdField = loadcust.setValue({
                    fieldId: 'entityid',
                    value: updatedCustId,
                });

                var saveRec = loadcust.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: false
                });

                log.debug({
                    title: "saveRec",
                    details: saveRec
                });
            }
        }


    }

    return {
        afterSubmit: afterSubmit
    };
});