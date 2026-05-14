/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/record', 'N/log'], function (serverWidget, record, log) {

    const onRequest = (context) => {
        try {
            if (context.request.method === 'GET') {
                handleGet(context);
            } else {
                handlePost(context);
            }
        } catch (e) {
            log.error('Suitelet Error', e);
        }
    };

    /**
     * Handles GET request: creates the form and pre-fills existing comment if any
     */
    function handleGet(context) {
        var params = context.request.parameters;
        var approverType = params.approver; // 'first' or 'second'

        var label =
            approverType === 'second'
                ? 'Second Approval Rejection Comment'
                : 'First Approval Rejection Comment';

        var fieldId =
            approverType === 'second'
                ? 'custbodysecond_approval_rejection_comm'
                : 'custbodyfirst_approval_rejection_comme';

        var form = serverWidget.createForm({
            title: 'Add Approval / Reject Reason'
        });

        // Load record to get existing value
        var existingValue = '';
        if (params.recid && params.rectype) {
            try {
                var rec = record.load({
                    type: params.rectype,
                    id: params.recid,
                    isDynamic: false
                });

                existingValue = rec.getValue({ fieldId: fieldId }) || '';
            } catch (e) {
                log.error('Error loading record for default value', e);
            }
        }

        // Add comment field (pre-filled)
        var commentField = form.addField({
            id: 'custpage_comment_reason',
            type: serverWidget.FieldType.LONGTEXT,
            label: label
        });
        commentField.defaultValue = existingValue;
        commentField.isMandatory = true;

        // Hidden fields
        addHiddenField(form, 'custpage_record_id', params.recid);
        addHiddenField(form, 'custpage_record_type', params.rectype);
        addHiddenField(form, 'custpage_approver_type', approverType);

        // Submit button
        form.addSubmitButton({ label: 'Save' });

        context.response.writePage(form);
    }

    /**
     * Handles POST request: saves the comment into the correct field
     */
    function handlePost(context) {
        var params = context.request.parameters;

        var recordId = params.custpage_record_id;
        var recordType = params.custpage_record_type;
        var approverType = params.custpage_approver_type;
        var reason = params.custpage_comment_reason;

        if (!recordId || !recordType || !approverType) {
            log.error('Suitelet POST Error', 'Missing recordId, recordType, or approverType');
            context.response.write('Missing required parameters.');
            return;
        }

        var fieldId =
            approverType === 'second'
                ? 'custbodysecond_approval_rejection_comm'
                : 'custbodyfirst_approval_rejection_comme';

        try {
            var rec = record.load({
                type: recordType,
                id: recordId,
                isDynamic: true
            });

            rec.setValue({
                fieldId: fieldId,
                value: reason
            });

            rec.save({ enableSourcing: true });

            // Close the popup and refresh the parent
            context.response.write(`
                <script>
                    window.opener.location.reload();
                    window.close();
                </script>
            `);
        } catch (e) {
            log.error('Suitelet POST Save Error', e);
            context.response.write('Error saving record: ' + e.message);
        }
    }

    /**
     * Adds a hidden field to the form
     */
    function addHiddenField(form, id, value) {
        form.addField({
            id: id,
            type: serverWidget.FieldType.TEXT,
            label: id
        }).updateDisplayType({
            displayType: serverWidget.FieldDisplayType.HIDDEN
        }).defaultValue = value || '';
    }

    return { onRequest };
});
