/**
* @author xxxxxx
* @NApiVersion 2.1
* @NScriptType UserEventScript
*/

define(["N/log",'N/record'], function (log, record) {

    function beforeLoad(context) {

        try {

            log.debug({
                title: "Enter Into before load:",
                details: JSON.stringify(context)
            });

            var recMode = context.type;
            var formObj = context.form;
            var recObj = context.newRecord;
            var recType = recObj.type;
            var recId = recObj.id;
            var recLoadObj = record.load({
                type: recType,
                id: recId,
                isDynamic: false,
            });
            var status = recLoadObj.getValue({
                fieldId: "status"
            });
            formObj.clientScriptFileId = 12860;

            log.debug({
                title: "RecType || RecId || recMode || status:  ",
                details: recType+" || "+recId+" || "+recMode+" || "+status
            });

            if (recMode == context.UserEventType.VIEW ) {

                if(recType == "salesorder"){

                    log.debug({
                        title: "Enter Into Sales Order Condition : ",
                        details: "Enter Into Sales Order Condition : "
                    });

                    formObj.addButton({
                        id : 'custpage_updateProject',
                        label : 'Update Project',
                        functionName : 'updateProject'
                    });
                }

            }
        }
        catch (ex) {
            log.debug("Error", ex);
        }
    }

    return {
        beforeLoad: beforeLoad,
    }
});