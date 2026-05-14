/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/log'], (record, log) => {

    const afterSubmit = (context) => {
        try {
            const soID = context.newRecord.id;

            const loadSO = record.load({
                type: record.Type.SALES_ORDER,
                id: soID,
                isDynamic: true,
            });

            const getLocation = loadSO.getValue({
                fieldId: "location"
            });

            const lineCount = loadSO.getLineCount({
                sublistId: "item"
            });

            for (let i = 0; i < lineCount; i++) {
                // Select each line item
                loadSO.selectLine({
                    sublistId: 'item',
                    line: i
                });

                loadSO.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'location',
                    value: getLocation
                });

                loadSO.commitLine({
                    sublistId: 'item'
                });
            }

            const saveRec = loadSO.save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });

            log.debug({
                title: "Record Saved",
                details: `Sales Order ID: ${saveRec}`
            });
        } catch (error) {
            log.error({
                title: 'Error in afterSubmit function',
                details: error.message
            });
        }
    };

    return {
        afterSubmit
    };
});
