/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/ui/serverWidget', 'N/search'], function (record, serverWidget, search) {

    function beforeLoad(context) {
        if (context.type === context.UserEventType.VIEW) {
            var formObj = context.form;

            var memID = context.request.parameters.id;

            var loadrec = record.load({
                type: record.Type.MEM_DOC,
                id: memID,
                isDynamic: true,
            });

            var getEntityID = loadrec.getValue({
                fieldId: 'name'
            });

            formObj.addButton({
                id: 'custpage_my_button',
                label: 'Update Memorised SalesOrder',
                functionName: 'onButtonClick("' + getEntityID + '", "' + memID + '")'
            });

            formObj.clientScriptFileId = 12822; 

        }
    }

    return {
        beforeLoad: beforeLoad
    }
});
