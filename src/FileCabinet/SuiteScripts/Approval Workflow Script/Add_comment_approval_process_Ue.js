/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/runtime'], function (runtime) {

    function beforeLoad(context) {

        if (context.type !== context.UserEventType.VIEW) return;

        var rec = context.newRecord;
        var form = context.form;

        var recId = rec.id;
        var role = runtime.getCurrentUser().role; // number

        var firstApproveFlag = rec.getValue({ fieldId: 'custbodyready_to_approve_first_pprove' });
        var firstApprovalStatus = rec.getValue({ fieldId: 'custbody_custom_approval_status' });

        var secondApproveFlag = rec.getValue({ fieldId: 'custbodyready_to_approve_second_approv' });
        var secondApprovalStatus = rec.getValue({ fieldId: 'custbody_secondary_approval_status' });

        // Allowed roles
        var allowedRoles = [1364, 1367, 3,1363,1366];
        if (allowedRoles.indexOf(role) === -1) return;

        // Attach client script ONCE
        form.clientScriptModulePath = './Add_comment_approval_process_CS.js';

        // 1st Approver Comment Button
        if (firstApproveFlag && firstApprovalStatus !== "2") {
            form.addButton({
                id: 'custpage_1st_approver_comment',
                label: '1st Approver Comment',
                functionName: 'print_bill("' + recId + '")'
            });
        }

        // 2nd Approver Comment Button
        if (secondApproveFlag && secondApprovalStatus !== "2") {
            form.addButton({
                id: 'custpage_2nd_approver_comment',
                label: '2nd Approver Comment',
                functionName: 'print_bill_2nd("' + recId + '")'
            });
        }
    }

    return {
        beforeLoad: beforeLoad
    };
});
