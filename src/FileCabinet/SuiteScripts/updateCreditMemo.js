/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(['N/search', 'N/record', 'N/log'], function(search, record, log) {

    function getInputData() {
        return search.create({
            type: "creditmemo",
            filters: [
                ["type", "anyof", "CustCred"]
            ],
            columns: [
                search.createColumn({name: "internalid", label: "Internal ID"}),
                search.createColumn({name: "custbody_related_sales_order", label: "Related Order"})
            ]
        });
    }

    function map(context) {
        var searchResult = JSON.parse(context.value);
        var creditMemoId = searchResult.id;
        var relatedOrder = searchResult.values.custbody_related_sales_order;
        var relatedOrderId = relatedOrder ? relatedOrder.value : null;

        if (relatedOrderId) {
            try {
                // Load the related sales order record
                var relatedOrderRecord = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: relatedOrderId
                });

                // Get the entity value from the related sales order
                var entityValue = relatedOrderRecord.getValue({ fieldId: 'entity' });
                var getProject = relatedOrderRecord.getValue({
                    fieldId: 'custbody_project'
                });

                // Load the credit memo record
                var creditMemoRecord = record.load({
                    type: record.Type.CREDIT_MEMO,
                    id: creditMemoId
                });

                // Set the entity value in a custom field on the credit memo
                creditMemoRecord.setValue({
                    fieldId: 'custbody88',
                    value: entityValue
                });

                creditMemoRecord.setValue({
                    fieldId: 'custbody_project',
                    value: getProject,
                });

               var saveCreditMemo = creditMemoRecord.save({
                enableSourcing: true,
                ignoreMandatoryFields: false
               });

               log.debug({
                title: 'saveCreditMemo',
                details: saveCreditMemo
               });

            } catch (e) {
                log.error('Error processing Credit Memo ID: ' + creditMemoId, e);
            }
        } else {
            log.debug("Credit Memo ID " + creditMemoId, "No Related Order ID found");
        }
    }

    return {
        getInputData: getInputData,
        map: map
    };
});
