/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
/*

   Name               Date         Version    
   Salman Habib      12/12/2025     1.0       Auto populate fields on Drop Ship PO from linked Sales Order 
   Salman Habib      22/12/2025     1.1       Added afterSubmit to populate Secondary Sales Rep field
   Salman Habib      23/12/2025     1.2       Added beforeLoad logic to populate Secondary Sales Rep for Drop Ship
   ------------------------------------------------------
*/

define(['N/record', 'N/search', 'N/log', 'N/format', 'N/redirect'],
    (record, search, log, format, redirect) => {

        const populateSecondarySalesRep = (newRecord) => {
            var classValue = newRecord.getValue({ fieldId: 'class' });
            var secondarySalesRep;

            var sourceId;
            if (classValue == "1") { // Local
                sourceId = newRecord.getValue({ fieldId: 'custbody_linked_transaction' });
            } else if (classValue == "2") { // National
                sourceId = newRecord.getValue({ fieldId: 'createdfrom' });
            }

            if (sourceId) {
                var sourceRec;

                // Try loading as Sales Order first
                try {
                    sourceRec = record.load({ type: record.Type.SALES_ORDER, id: sourceId });
                } catch (e) {
                    // If fails, try loading as Purchase Order
                    try {
                        sourceRec = record.load({ type: record.Type.PURCHASE_ORDER, id: sourceId });
                    } catch (err) {
                        log.error('Cannot load linked record', 'ID: ' + sourceId + ' | Error: ' + err.message);
                    }
                }

                if (sourceRec) {
                    secondarySalesRep = sourceRec.getValue({ fieldId: 'custbody_secondary_sales_rep' }); 
                    date = sourceRec.getValue({ fieldId: 'trandate' }); 
                }
            }

            return {secondarySalesRep, date};
        };

        const beforeLoad = (context) => {
            try {
                log.debug('Context Type', context.type);
                if (context.type !== context.UserEventType.VIEW) return;

                const newRecord = context.newRecord;
                const recordId = newRecord.id;

                // Check if script already ran
                const isScriptRun = newRecord.getValue('custbody_is_script_run');
                if (isScriptRun) return;

                // Check if Drop Ship PO
                const isDropShip = newRecord.getValue({ fieldId: 'dropshipso' });
                const createdFrom = newRecord.getValue({ fieldId: 'createdfrom' });
                if (!isDropShip || !createdFrom) return;

                // Lookup Sales Order fields
                const soFields = search.lookupFields({
                    type: search.Type.SALES_ORDER,
                    id: createdFrom,
                    columns: [
                        'custbody1',
                        'custbody_site_contact_number',
                        'custbody_site_code',
                        'trandate'
                    ]
                });

                const soDate = soFields.trandate
                    ? format.parse({ value: soFields.trandate, type: format.Type.DATE })
                    : null;

                // Load PO record to update fields
                const loadedRecord = record.load({
                    type: newRecord.type,
                    id: recordId,
                    isDynamic: true
                });

                loadedRecord.setValue({ fieldId: 'customform', value: 258 });
                loadedRecord.setValue({ fieldId: 'custbody1', value: soFields.custbody1 || '' });
                loadedRecord.setValue({ fieldId: 'custbody_site_contact_number', value: soFields.custbody_site_contact_number || '' });
                loadedRecord.setValue({ fieldId: 'custbody_site_code', value: soFields.custbody_site_code || '' });

                if (soDate) loadedRecord.setValue({ fieldId: 'trandate', value: soDate });

                // Populate Secondary Sales Rep
                const Sovalues = populateSecondarySalesRep(newRecord);
                const secondarySalesRepValue = Sovalues ? Sovalues.secondarySalesRep : null;
                const soDateValue = Sovalues ? Sovalues.date : null;
                if (Sovalues && secondarySalesRepValue) {
                    loadedRecord.setValue({
                        fieldId: 'custbody_secondary_sales_rep',
                        value: secondarySalesRepValue
                    });
                }
                if (Sovalues && soDateValue) {
                    loadedRecord.setValue({
                        fieldId: 'trandate',
                        value: soDateValue
                    });
                }

                loadedRecord.setValue({ fieldId: 'custbody_is_script_run', value: true });

                // Save the record
                loadedRecord.save({ enableSourcing: true, ignoreMandatoryFields: true });

                // Redirect to reload the record view
                redirect.toRecord({ type: newRecord.type, id: recordId, isEditMode: false });

            } catch (e) {
                log.error('Error in Drop Ship PO beforeLoad', e);
            }
        };

        const afterSubmit = (context) => {
            try {
                if (context.type !== context.UserEventType.CREATE && context.type !== context.UserEventType.EDIT) return;

                const newRecord = context.newRecord;
                const recId = newRecord.id;
                const recType = newRecord.type;

                const SOValues = populateSecondarySalesRep(newRecord);
                const secondarySalesRep = SOValues ? SOValues.secondarySalesRep : null;
                const soDate = SOValues ? SOValues.date : null;     

                if (SOValues && SOValues.secondarySalesRep) {
                    record.submitFields({
                        type: recType,
                        id: recId,
                        values: {
                            custbody_secondary_sales_rep: secondarySalesRep,
                            trandate: soDate
                        },
                        options: {
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        }
                    });
                }

            } catch (e) {
                log.error('AfterSubmit Error', e);
            }
        };

        return { beforeLoad, afterSubmit };
    });
