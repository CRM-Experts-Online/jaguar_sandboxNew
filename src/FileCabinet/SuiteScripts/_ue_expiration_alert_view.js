/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/ui/message', 'N/log','N/search'], function(message, log,search) {

    /**
     * Helper function to check expiration date and display appropriate message
     * @param {Object} record - The record being loaded
     * @param {Object} form - The form object
     * @param {String} fieldId - The field ID to check for expiration date
     * @param {String} displayName - The display name to use in the message
     * @returns {Object|null} Returns message info if a message should be shown, null otherwise
     */
    function checkExpirationDate(record, form, fieldId, displayName) {
        const expDateStr = record.getValue({ fieldId: fieldId });
        
        if (!expDateStr) return null;
        
        const expirationDate = new Date(expDateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        expirationDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24));
        
        let msgType = null;
        let msgTitle = null;
        
        if (daysDiff <= 0) {
            msgType = message.Type.ERROR;
            msgTitle = displayName + ' has expired.';
        } else if (daysDiff <= 5) {
            msgType = message.Type.WARNING;
            msgTitle = displayName + ' is approaching expiration.';
        }
 
        if (msgType && msgTitle) {
            return {
                type: msgType,
                title: msgTitle,
                fieldId: fieldId
            };
        }
        
        return null;
    }

    function beforeLoad(context) {

        const record = context.newRecord;
            const form = context.form;
            const recordType = record.type;
        // Allow script to run in both VIEW and EDIT modes
        if (context.type !== context.UserEventType.VIEW && 
            context.type !== context.UserEventType.EDIT) return;

        try {
            
            
            // Define entity fields (these will be checked for all record types)
            const entityFields = [
                { id: 'custentity_underground_storage_exp_date', name: 'Underground Storage Tank 1 Expiration Date' },
                { id: 'custentity_underground_storage_exp_tank2', name: 'Underground Storage Tank 2 Expiration Date' },
                { id: 'custentity_underground_storage_exp_tank3', name: 'Underground Storage Tank 3 Expiration Date' }
            ];
            
            // Define transaction body fields (these will be checked conditionally based on record type)
            const bodyFields = [
                { id: 'custbody_underground_storage_exp_date', name: 'Underground Storage Tank 1 Expiration Date' },
                { id: 'custbody_underground_storage_exp_tank2', name: 'Underground Storage Tank 2 Expiration Date' },
                { id: 'custbody_underground_storage_exp_tank3', name: 'Underground Storage Tank 3 Expiration Date' }
            ];
            
            // Collect all messages that should be shown
            const messages = [];
            
            // Always check entity fields regardless of record type
            entityFields.forEach(field => {
                const message = checkExpirationDate(record, form, field.id, field.name);
                if (message) {
                    messages.push(message);
                }
            });
            
            // For body fields, apply conditional logic based on record type
            let shouldCheckBodyFields = true;
             
            
            // For purchase orders and vendor bills, only check if custbody_related_sales_order is not empty
            if (recordType === 'purchaseorder' || recordType === 'vendorbill') {
                const relatedSalesOrder = record.getValue({ fieldId: 'custbody_related_sales_order' });
                shouldCheckBodyFields = !!relatedSalesOrder; // Convert to boolean
                log.debug('PO/VendorBill condition', 'Related SO: ' + relatedSalesOrder + ', Should check: ' + shouldCheckBodyFields);
            }
            // For item receipts, only check if createdfrom is not empty
            else if (recordType === 'itemreceipt') {
                const createdFrom = record.getValue({ fieldId: 'createdfrom' });
                shouldCheckBodyFields = !!createdFrom; // Convert to boolean
                log.debug('ItemReceipt condition', 'Created from: ' + createdFrom + ', Should check: ' + shouldCheckBodyFields);
            }
            
            // Check body fields if conditions are met or for other record types
            if (shouldCheckBodyFields) {
                bodyFields.forEach(field => {
                    const message = checkExpirationDate(record, form, field.id, field.name);
                    if (message) {
                        messages.push(message);
                    }
                });
            }
            
          // Display all collected messages
          messages.forEach(msg => {
            // form.addPageInitMessage({
            //     type: msg.type,
            //     title: msg.title,
            //     message: ' ',
            //     duration: 10000

            // });
            // log.debug('Message shown', msg.title + ' for field ' + msg.fieldId);
            var messageObj = message.create({
                type: msg.type,
                title: msg.title,
                message: ' ',
                duration: 10000
            }); form.addPageInitMessage({message: messageObj});
        });
        
        log.debug('Total messages shown', messages.length);
		
		var creditCheck = false;
		
		if(recordType == 'customer'){
			
			var creditHold = record.getValue('creditholdoverride');
			
			if(creditHold == 'OFF'){
				creditCheck = true;
			}
			
	}else if(recordType == 'salesorder' || recordType == 'invoice' ){
			
			var custId = record.getValue('entity');
			
			var fieldLookUp = search.lookupFields({
    type: 'customer',
    id: custId,
    columns: ['creditholdoverride']
});

 if(fieldLookUp.creditholdoverride == 'OFF'){
	 creditCheck = true;
 }
						
		}else{
			creditCheck = false
		}
		
		log.debug('creditCheck', creditCheck);
            if(creditCheck == true){
			 var messageObj =	message.create({
                type: message.Type.WARNING,
                title: 'CREDIT HOLD',
                message: 'THIS CUSTOMER IS ON TEMPORARAY CREDIT HOLD OFF',
                duration: 10000
            }); form.addPageInitMessage({message: messageObj});
      
			}
        
     } 
     catch (e) {
            log.error('Error in beforeLoad', e);
        }
    }

    return {
        beforeLoad: beforeLoad
    };
});