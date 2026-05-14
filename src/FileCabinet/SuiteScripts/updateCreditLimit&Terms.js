/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/runtime', 'N/ui/serverWidget'], function (record, runtime, serverWidget) {

    function beforeLoad(context) {
        try {
            if (context.type !== context.UserEventType.CREATE) {
                return; // Only execute on create
            }

            var formObj = context.form;
            var getParentCust = context.request.parameters.parent;

            log.debug({
                title: "formObj",
                details: formObj
            });

            log.debug({
                title: "getParentCust",
                details: getParentCust
            });

            if (getParentCust) {
                var parentCustomer = record.load({
                    type: record.Type.CUSTOMER,
                    id: getParentCust
                });

                log.debug({
                    title: "parentCustomer",
                    details: parentCustomer
                });

                var parentCreditLimit = parentCustomer.getValue({
                    fieldId: 'creditlimit'
                });

                var parentTerms = parentCustomer.getValue({
                    fieldId: 'terms'
                });

                var getChildCredit = parentCustomer.getValue({
                    fieldId: 'custentity_jaguar_children_credit'
                });

                var getCreditIns = parentCustomer.getValue({
                    fieldId: 'custentity_credit_insurance_amt'
                });

                var getHoldVal = parentCustomer.getValue({
                    fieldId: 'creditholdoverride'
                });
                // Populate fields on child customer form
               var creditlimit =  formObj.getField({
                    id: 'creditlimit' // Field ID of credit limit on child form
                }).defaultValue = parentCreditLimit;

                formObj.getField({
                    id: 'terms' // Field ID of terms on child form
                }).defaultValue = parentTerms;

                formObj.getField({
                    id: 'custentity_jaguar_children_credit' // Field ID of terms on child form
                }).defaultValue = getChildCredit;

                formObj.getField({
                    id: 'custentity_credit_insurance_amt' // Field ID of terms on child form
                }).defaultValue = getCreditIns;

                formObj.getField({
                    id: 'creditholdoverride' // Field ID of terms on child form
                }).defaultValue = getHoldVal;

                var userObj = runtime.getCurrentUser();
                log.debug({
                    title: "userObj",
                    details: userObj
                });
              //  if (userObj.role == 1375 || userObj.role == 1365 || userObj.role == 1362 || userObj.role == 1361) {
                    creditlimit.isDisabled = true
           //     }
            }
        } catch (e) {
            log.error({
                title: 'Error loading parent customer',
                details: e
            });
        }
    }

    return {
        beforeLoad: beforeLoad
    };
});
