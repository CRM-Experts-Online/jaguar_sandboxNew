/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/ui/serverWidget', 'N/search'], function (record, serverWidget, search) {

    function beforeLoad(context) {
        if (context.type === context.UserEventType.VIEW) {
            var formObj = context.form;

            var poID = context.request.parameters.id;

            var loadrec = record.load({
                type: record.Type.PURCHASE_ORDER,
                id: poID,
                isDynamic: true,
            });

            var getVendorID = loadrec.getValue({
                fieldId: 'entity'
            });

            formObj.addButton({
                id: 'custpage_my_button',
                label: 'Update Address',
                functionName: 'onButtonClick("' + getVendorID + '")'
            });

            formObj.clientScriptFileId = 12851; 

        }
    }

    return {
        beforeLoad: beforeLoad
    }
});
