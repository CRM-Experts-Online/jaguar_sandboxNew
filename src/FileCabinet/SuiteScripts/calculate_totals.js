/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/error'], function(error) {

  function lineInit(context) {
        var currentRecord = context.currentRecord;
		var loc = currentRecord.getValue('location');
        var sublistName = context.sublistId;
        if (sublistName === 'item')
            currentRecord.setCurrentSublistValue({
                sublistId: sublistName,
                fieldId: 'location',
                value: loc
            });
    }
    
    function fieldChanged(context) {
        var currentRecord = context.currentRecord;
        var sublistName = context.sublistId;
        var sublistFieldName = context.fieldId;
        var line = context.line;
        if (sublistName === 'item' && (sublistFieldName === 'custcol_vendor_quantity' || sublistFieldName == 'custcol_vendor_cost')){
			
		var qty = currentRecord.getCurrentSublistValue({
				sublistId:sublistName,
				fieldId: 'custcol_vendor_quantity'
			})
			log.debug('qty', qty);
			var cost = currentRecord.getCurrentSublistValue({
				sublistId:sublistName,
				fieldId: 'custcol_vendor_cost'
			})
			log.debug('cost', cost);
			
			if(qty && cost){
				
			
			var total = parseFloat(qty)*parseFloat(cost);
			
			currentRecord.setCurrentSublistValue({
				sublistId:sublistName,
				fieldId: 'custcol_vendor_total',
				value:total
			})
			}
			
			
		}
		
		if(context.fieldId == 'entity' && currentRecord.type == 'estimate'){
			
			log.debug('type', currentRecord.type);
			
			var pro = currentRecord.getValue('entity');
			
			currentRecord.setValue('custbody_project', pro);
		}
            
    }
    
    
    return {       
        fieldChanged: fieldChanged,
      lineInit: lineInit
    };
}); 