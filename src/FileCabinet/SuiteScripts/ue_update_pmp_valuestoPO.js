/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/record', 'N/search', 'N/log'], (record, search, log) => {

    const afterSubmit = (context) => {

        try {

            if (
                context.type !== context.UserEventType.CREATE &&
                context.type !== context.UserEventType.EDIT
            ) {
                return;
            }

            const newRec = context.newRecord;

            // Current record internal ID
            const recId = newRec.id;
			
			const bolId = newRec.getValue('custrecord_linked_bol');
			
			log.debug('bolId', bolId);

            // -------------------------------------------------
            // OPTION 1 : LOOKUP FIELDS (Recommended)
            // -------------------------------------------------

            const lookupData = search.lookupFields({
                type: 'customrecord_transaction_report', // CHANGE RECORD TYPE
                id: bolId,
                columns: [
                    'custrecord_related_po'                
                ]
            });

            log.debug('Lookup Data', lookupData);

            // Get PO Internal ID
            let poId = '';

            if (
                lookupData.custrecord_related_po &&
                lookupData.custrecord_related_po.length > 0
            ) {
                poId = lookupData.custrecord_related_po[0].value;
            }

            // Get Rate
            const newRate = newRec.getValue('custrecord_blucost');
			
			const product = newRec.getValue('custrecord_producttype'); 

            if (!poId) {
                log.debug('No PO Found');
                return;
            }

            // -------------------------------------------------
            // LOAD PURCHASE ORDER
            // -------------------------------------------------

            const poRec = record.load({
                type: record.Type.PURCHASE_ORDER,
                id: poId,
                isDynamic: false
            });

            const lineCount = poRec.getLineCount({
                sublistId: 'item'
            });

            // Update all lines
            for (let i = 0; i < lineCount; i++) {
				
				var itemN = poRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item_display',
                    line: i,                    
                });
				
				log.debug('itemN', itemN);
				
				var itemR = poRec.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    line: i,                    
                });
				
				log.debug('itemR', itemR);
				
				log.debug('itemN--', itemN.toLowerCase());
				
				log.debug('product--', product.toLowerCase());

              if(Number(itemR) > 0){
					continue;
				}
				
				if(itemN.toLowerCase() == product.toLowerCase()){
					 poRec.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'rate',
                    line: i,
                    value: Number(newRate)
                });

                  log.debug('itemR-updated', itemR);
				}

               
            }

            const poSaved = poRec.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });

            log.audit('PO Updated', poSaved);
			
			
            record.submitFields({
                type: 'customrecord_pmp_package',
                id: recId,
                values: {
                    custrecord_pmp_purchaseorder: poId
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            });

        } catch (e) {

            log.error('SCRIPT ERROR', e);

        }
    };

    return {
        afterSubmit
    };

});