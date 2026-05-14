/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define([
    'N/record',
    'N/runtime',
    'N/search',
    'N/ui/serverWidget',
    'N/task',
    'N/redirect'
  ]
  /**
   * @param {record} record
   * @param {runtime} runtime
   * @param {search} search
   * @param {serverWidget} serverWidget
   */, function (record, runtime, search, serverWidget, task, redirect) {
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest (context) {
      try {
        if (context.request.method == 'GET') {
          primaryPage(context)
        }
      } catch (er) {
        log.error('ERROR', er.toString())
      }
    }
  
    function primaryPage (context) {
      try {
        var soID = context.request.parameters.custpage_soid
        log.debug('soID', soID)
  
        if (soID) {
          var recObj = record.load({
            type: 'salesorder',
            id: soID
          })
  
          var recClass = recObj.getValue('class')
  
          var customerDtails = recObj.getValue('custbody_shipping_details')
  
          var memo = recObj.getValue('memo')
  
          var PROJECT = recObj.getValue('custbody_project')
  
          var relatedOrder = recObj.getValue('custbody_related_sales_order')
  
          log.debug('relatedOrder', relatedOrder)
  
          if (!relatedOrder) {
            var vendor = recObj.getValue('custbody_vendor')
  
            var loc = recObj.getValue('location')
  
            var delDate = recObj.getValue('custbody_delivery_date')
  
            var poRec = record.create({
              type: 'purchaseorder',
              isDynamic: true,
              defaultValues: {
                customform: '232'
              }
            })
  
            poRec.setValue('entity', vendor)
  
            poRec.setValue('class', recClass)
  
            poRec.setValue('location', loc)
  
            poRec.setValue('approvalstatus', 2)
  
            poRec.setValue('custbody_shipping_details', customerDtails)
  
            poRec.setValue('memo', memo)
  
            poRec.setValue('custbody_delivery_date', delDate)
  
            poRec.setValue('custbody_related_sales_order', recObj.id)
  
            poRec.setValue('custbody_project', PROJECT)
  
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
  
              poRec.selectNewLine({ sublistId: 'item' })
  
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
  
              poRec.commitLine({ sublistId: 'item' })
            }
  
            var poSave = poRec.save({
              enableSourcing: true,
              ignoreMandatoryFields: true
            })
            log.debug('poSave', poSave)
  
            if (poSave) {
              var updateCust = record.submitFields({
                type: 'salesorder',
                id: recObj.id,
                values: {
                  custbody_related_sales_order: poSave
                }
              })
              log.debug('updateCust', updateCust)
  
              redirect.toRecord({
                type: 'purchaseorder',
                id: poSave
              })
            }
          }
        }
  
        //context.response.writePage(rForm);
      } catch (er) {
        log.error('ERROR-primary page', er.toString())
      }
    }
  
    
  
    return {
      onRequest: onRequest
    }
  })