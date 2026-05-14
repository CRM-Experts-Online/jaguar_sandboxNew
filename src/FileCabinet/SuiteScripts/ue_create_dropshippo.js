/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
    /**
     * @param {record} record
     * @param {search} search
     */
    function(record, search) {

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(context) {
            try {
            const form = context.form;
            const type = context.type;

            // Only hide when viewing or editing
            if (type === context.UserEventType.VIEW || type === context.UserEventType.EDIT || type === context.UserEventType.CREATE) {
                const opportunityField = form.getField('opportunity');
                if (opportunityField) {
                    opportunityField.updateDisplayType({
                        displayType: 'hidden'
                    });
                  //  log.debug('Field Hidden', 'Opportunity field has been hidden.');
                }
            }


            
        } catch (e) {
            log.error('Error hiding opportunity field', e);
        }

        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function beforeSubmit(scriptContext) {

        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function afterSubmit(scriptContext) {

            try {
                if (scriptContext.type != 'create') {
                    return;
                }

                var recObj = scriptContext.newRecord;

                var recClass = recObj.getValue('class');

                var thirdID = record.submitFields({
                    type: record.Type.SALES_ORDER,
                    id: recObj.id,
                    values: {
                        'custbody_linked_transaction': recObj.id,
                    }
                });

                // if (recClass != 2) {
                //     return;
                // }

                log.debug('id', recObj.id);




                var vendor = recObj.getValue('custbody_vendor')
                var customer = recObj.getValue('entity')
                var po_params = {
                    'recordmode': 'dynamic',
                  'customform':258,
                    'soid': recObj.id,
                    'poentity': vendor,
                    'shipgroup': 1,
                    'dropship': 'T',
                    'custid': customer,
                    'entity': vendor
                }

                var poRec = record.create({
                    type: record.Type.PURCHASE_ORDER,
                    isDynamic: true,
                    defaultValues: po_params
                })


                //  poRec.setValue('entity', vendor)



                var customerDtails = recObj.getValue('custbody_shipping_details')

                var memo = recObj.getValue('memo')

                var loc = recObj.getValue('location')

                var delDate = recObj.getValue('custbody_delivery_date')

                poRec.setValue('class', recClass)

                poRec.setValue('createdfrom', recObj.id)

                poRec.setValue('location', loc)

                poRec.setValue('approvalstatus', 2)

                poRec.setValue('custbody_shipping_details', customerDtails)

                poRec.setValue('memo', memo)

                poRec.setValue('custbody_delivery_date', delDate)

                poRec.setValue('custbody_related_sales_order', recObj.id)


                // poRec.setValue('custbody_project', PROJECT)

                poRec.setValue(
                    'custbody_site_contact_name',
                    recObj.getValue('custbody_site_contact_name')
                )
                poRec.setValue(
                    'custbody_gate_code',
                    recObj.getValue('custbody_gate_code')
                )
                poRec.setValue(
                    'custbody_site_contact_number',
                    recObj.getValue('custbody_site_contact_number')
                )
                poRec.setValue('custbody1', recObj.getValue('custbody1'))
                poRec.setValue(
                    'custbody_additional_notes',
                    recObj.getValue('custbody_additional_notes')
                )

                poRec.setValue('custbody_underground_storage_exp_date', recObj.getValue('custbody_underground_storage_exp_date'))
                poRec.setValue('custbody_underground_storage_exp_tank2', recObj.getValue('custbody_underground_storage_exp_tank2'))
                poRec.setValue('custbody_underground_storage_exp_tank3', recObj.getValue('custbody_underground_storage_exp_tank3'))



                var lineCount = recObj.getLineCount('item')

                log.debug('lineCount', lineCount)

                 for (var i = 0; i < lineCount; i++) {
                     var soItem = recObj.getSublistValue({
                         sublistId: 'item',
                         fieldId: 'item',
                         line: i
                     })

                     var solOC = recObj.getSublistValue({
                         sublistId: 'item',
                         fieldId: 'location',
                         line: i
                     })

                     var soClass = recObj.getSublistValue({
                         sublistId: 'item',
                         fieldId: 'class',
                         line: i
                     })

                     log.debug('soItem', soItem)

                     var qty = recObj.getSublistValue({
                         sublistId: 'item',
                         fieldId: 'quantity',
                         line: i
                     })

                     var soDescription = recObj.getSublistValue({
                         sublistId: 'item',
                         fieldId: 'description',
                         line: i
                     })

                     poRec.selectNewLine({
                         sublistId: 'item'
                     })

                     poRec.setCurrentSublistValue({
                         sublistId: 'item',
                         fieldId: 'item',
                         value: soItem
                     })
                     poRec.setCurrentSublistValue({
                         sublistId: 'item',
                         fieldId: 'quantity',
                         value: qty
                     })

                     poRec.setCurrentSublistValue({
                         sublistId: 'item',
                         fieldId: 'location',
                         value: solOC
                     })

                     poRec.setCurrentSublistValue({
                         sublistId: 'item',
                         fieldId: 'class',
                         value: soClass
                     })

                     poRec.setCurrentSublistValue({
                         sublistId: 'item',
                         fieldId: 'description',
                         value: soDescription
                     })

                     poRec.commitLine({
                         sublistId: 'item'
                     })
                 }

                var newPo = poRec.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                })
                log.debug('newPo', newPo);
            } catch (er) {
                log.error('error', er.toString());
            }



        }

        return {
             beforeLoad: beforeLoad,
            // beforeSubmit: beforeSubmit,
          //  afterSubmit: afterSubmit
        };

    });