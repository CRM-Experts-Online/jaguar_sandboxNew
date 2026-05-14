/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 * @description Sets a timestamp field with the current date/time before a record is saved
 * Works with both entity records (customer, vendor) and transaction records (sales order, invoice)
 */
define(['N/log', 'N/runtime', 'N/record'], function(log, runtime, record) {
    
    /**
     * Function that runs before the record is saved
     * @param {Object} context - The context object
     * @param {Record} context.newRecord - The new record being saved
     * @param {Record} context.oldRecord - The old record (only available on edit)
     * @param {String} context.type - The type of operation (create, edit, etc.)
     */
    function beforeSubmit(context) {
        try {
            // Get the current record
            var currentRecord = context.newRecord;
            var recordType = currentRecord.type;
            
            log.debug('beforeSubmit', 'Starting to set modification timestamp for record type: ' + recordType);
            
            // Get the current date/time
            var now = new Date();
            
            // Determine the appropriate field ID based on record type
            var timestampFieldId;
            
            // Entity records (customer, lead, prospect)
            if (recordType === 'customer' || recordType === 'lead' || recordType === 'prospect') {
                timestampFieldId = 'custentity_modification_timestamp';
                log.debug('beforeSubmit', 'Entity record detected: ' + recordType);
            }
            // Transaction records (sales order, invoice, etc.)
            else if (recordType.includes('salesorder') || recordType.includes('invoice') || recordType.includes('vendorbill') || 
                     recordType.includes('estimate') || recordType.includes('purchaseorder')) {
                timestampFieldId = 'custbody_modification_timestamp_inv';
            }
            // Other record types
            else {
                // Default to custbody for most record types
                timestampFieldId = 'custbody_modification_timestamp_inv';
                log.debug('beforeSubmit', 'Using default field ID for record type: ' + recordType);
            }
            
            log.debug('beforeSubmit', 'Using field ID: ' + timestampFieldId + ' for record type: ' + recordType);
            
            // Set the timestamp field
            currentRecord.setValue({
                fieldId: timestampFieldId,
                value: now
            });
            
            log.debug('beforeSubmit', 'Modification timestamp set to: ' + now);
            
        } catch (e) {
            log.error('Error in beforeSubmit', e);
        }
    }
    
    return {
        beforeSubmit: beforeSubmit
    };
});
