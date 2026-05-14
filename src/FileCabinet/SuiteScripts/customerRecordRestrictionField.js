/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/runtime', 'N/ui/serverWidget'], function (record, runtime, serverWidget) {

    function beforeLoad(context) {
        try {
            var formObj = context.form;
            var getParentCust = context.request.parameters.parent;
            
            log.debug({ title: 'Parent Customer ID', details: getParentCust });

            // Disable fields based on user role
            var userObj = runtime.getCurrentUser();
            if (userObj.role != 1374 && userObj.role != 1375 && userObj.role != 1363 && userObj.role != 1361 && userObj.role != 1365 && userObj.role != 1362 && userObj.role != 1390 && userObj.role != 1400 && userObj.role != 3) {
                disableFields(formObj);
            }

            if (getParentCust) {
                var parentCustomer = record.load({
                    type: record.Type.CUSTOMER,
                    id: getParentCust
                });

                var isChild = parentCustomer.getValue({
                    fieldId: 'isperson'
                });

                // Check if it's a child customer
                if (isChild) {
                    // Populate fields for child customer
                    populateFields(formObj, parentCustomer);
                } else {
                    // Populate fields for parent customer
                    populateFields(formObj, parentCustomer);
                }
            }
        } catch (e) {
            log.error({
                title: 'Error loading customer',
                details: e
            });
        }
    }

    // Function to populate fields based on customer type
   function populateFields(formObj, customerRecord) {

    var fieldsToSet = [
        { id: 'creditlimit', value: customerRecord.getValue('creditlimit') },
        { id: 'terms', value: customerRecord.getValue('terms') },
        { id: 'custentity_jaguar_children_credit', value: customerRecord.getValue('custentity_jaguar_children_credit') },
        { id: 'custentity_credit_insurance_amt', value: customerRecord.getValue('custentity_credit_insurance_amt') },
        { id: 'creditholdoverride', value: customerRecord.getValue('creditholdoverride') },
      { id: 'custentity_credit_insurance_type', value: customerRecord.getValue('custentity_credit_insurance_type') },
      { id: 'custentity24', value: customerRecord.getValue('custentity24') }
    ];

    fieldsToSet.forEach(function(f) {
        var fieldObj = formObj.getField({ id: f.id });
        if (fieldObj) {
            fieldObj.defaultValue = f.value;
        }
    });
}


    // Function to disable fields
    function disableFields(formObj) {
        formObj.getField({ id: 'creditlimit' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
        formObj.getField({ id: 'creditholdoverride' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
        formObj.getField({ id: 'custentity_jaguar_children_credit' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
        formObj.getField({ id: 'custentity_credit_insurance_amt' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
        formObj.getField({ id: 'terms' }).updateDisplayType({ displayType: serverWidget.FieldDisplayType.DISABLED });
    }

    return {
        beforeLoad: beforeLoad
    };
});
