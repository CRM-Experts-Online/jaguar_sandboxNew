/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 *
 * Purpose: Set Credit Hold = Off on new customer
 */

define(['N/record', 'N/log'], (record, log) => {

    const afterSubmit = (context) => {
        try {
            if (context.type !== context.UserEventType.CREATE) return;

            const newRecord = context.newRecord;
            const recId = newRecord.id;

            // Load the record
            const custRecord = record.load({
                type: record.Type.CUSTOMER,
                id: recId,
                isDynamic: true
            });

            // Set Credit Hold = Off
            custRecord.setValue({
                fieldId: 'creditholdoverride',
                value: 'OFF'
            });

            // Save the record
            custRecord.save({ enableSourcing: true, ignoreMandatoryFields: true });

            log.debug('Customer Updated', `Credit Hold set to OFF for Customer ID: ${recId}`);

        } catch (e) {
            log.error('Error in afterSubmit', e);
        }
    };

    return { afterSubmit };
});
