/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define(['N/record', 'N/runtime', 'N/format'], (record, runtime, format) => {

    const afterSubmit = (context) => {
        // Run only when Vendor Bill is created
        log.debug('Script Triggered', `Type: ${context.type}`);
        //  if (context.type !== context.UserEventType.CREATE) return;

        try {
            const vendorBill = context.newRecord;
            const tranId = vendorBill.getValue('tranid');
            const createdDateRaw = vendorBill.getValue('createddate');
            const project = vendorBill.getValue('custbody_project');
            const linkedSOId = vendorBill.getValue('custbody_linked_transaction');
            const linkedSO = vendorBill.getText('custbody_linked_transaction');

            // Handle empty linked Sales Order
            const Sonumber = linkedSO ? linkedSO : '';

            // Get current Chicago date and time
            const nowChicago = new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' });

            // Optional: split into date and time if you want separate formatting
            const nowChicagoObj = new Date();
            const formattedDate = nowChicagoObj.toLocaleDateString('en-US', { timeZone: 'America/Chicago' });
            const formattedTime = nowChicagoObj.toLocaleTimeString('en-US', {
                timeZone: 'America/Chicago',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            // Combine date and time into one readable string
            const createdDate = `${formattedDate} ${formattedTime}`;

            log.debug('Current Chicago Time', createdDate);


            // Get customer from first line item (if present)
            const lineCount = vendorBill.getLineCount({ sublistId: 'item' });
            let customer = '';
            if (lineCount > 0) {
                customer = vendorBill.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'customer',
                    line: 0
                }) || '';
            }


            log.debug('Vendor Bill Info', `Tran ID: ${tranId}, Created Date: ${createdDate}, Customer: ${customer}, Project: ${project}`);

            // Format today’s date for Start/Due Date
            const today = format.format({
                value: new Date(),
                type: format.Type.DATE
            });

            // Create a new Task record
            const task = record.create({
                type: record.Type.TASK,
                isDynamic: true
            });

            // Set Task fields
            task.setValue({
                fieldId: 'title',
                value: `${Sonumber} – Sales Order: Create an Invoice for this Sales Order – ${createdDate}`
            });

            // Use memo field for message (no 'message' field exists on Task)
            task.setValue({
                fieldId: 'message',
                value: `A bill has been created. Please create the invoice for the following ${Sonumber}`
            });

            // Set standard Task fields
            task.setValue({ fieldId: 'status', value: 'NOTSTART' }); // Not Started
            task.setValue({ fieldId: 'priority', value: 'HIGH' });   // High


            // Set custom fields
            task.setValue({ fieldId: 'custevent_assigned_role', value: 1379 }); // Assigned Role
            task.setValue({ fieldId: 'custevent_customer_temp', value: customer }); // Customer from line item
            //  task.setValue({ fieldId: 'custevent_project', value: project }); // Project
            task.setValue({ fieldId: 'company', value: customer });
            if (customer) task.setValue({ fieldId: 'transaction', value: linkedSOId }); // Lin
            // Save the Task record
            const taskId = task.save();
            log.audit('Task Created', `Task ID: ${taskId} created for Vendor Bill: ${tranId}`);

        } catch (e) {
            log.error('Error creating Task', e);
        }
    };

    return { afterSubmit };
});
