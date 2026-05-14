/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/record', 'N/search', 'N/currentRecord', 'N/url'], function(record, search, currentRecord, nsUrl) {
    function pageInit(scriptContext) {
        var curRec = scriptContext.currentRecord;
        {
           if(curRec.getValue('class') == 1) {
                curRec.getField({ fieldId: 'location' }).isMandatory = false;
                
            } else {
                curRec.getField({ fieldId: 'location' }).isMandatory = true;
                
            }
        }
    }
    function fieldChanged(scriptContext) {
        var curRec = scriptContext.currentRecord;
       // curRec.getField('entity').isDisplay = false;
        if(scriptContext.fieldId == 'class') {
            if(curRec.getValue('class') == 1) {
                curRec.getField({ fieldId: 'location' }).isMandatory = false;
                
            } else {
                curRec.getField({ fieldId: 'location' }).isMandatory = true;
                
            }
        }
        if(scriptContext.fieldId == 'custpage_customer_field') {
            var entity = curRec.getValue('custpage_customer_field');
            curRec.setValue('entity', entity);
        }
    }
    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
    };
});