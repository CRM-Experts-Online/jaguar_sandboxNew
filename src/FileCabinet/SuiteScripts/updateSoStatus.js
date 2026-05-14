/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/ui/serverWidget', 'N/search'], function(record, ui, search) {

  function beforeLoad(scriptContext) {
			
			try{
				
				if(scriptContext.type == 'create' || scriptContext.type == 'edit'){
					
					
				var cForm = scriptContext.form;
				
				var field = cForm.addField({
    id : 'custpage_vendor',
	 label : 'Vendor',
    type : ui.FieldType.SELECT
	//container:'primaryinformation'
});
				log.debug('field', field);
				
				field.addSelectOption({
							value: '0',
							text: ''
						});
			var vendorSearchObj =  search.load({
    id: 'customsearch_vendor_list'
});

var searchResultCount = vendorSearchObj.runPaged().count;
log.debug("vendorSearchObj result count",searchResultCount);
vendorSearchObj.run().each(function(result){
	
	var id = result.id;
	
	var vName = result.getValue('altname');
	
	//log.debug(vName, id);
	
	field.addSelectOption({
							value: id,
							text: vName
						});
   // .run().each has a limit of 4,000 results
   return true;
});

if(scriptContext.type == 'edit'){
	var vId = scriptContext.newRecord.getValue('custbody_vendor');
	field.defaultValue = vId;
}
				}
				
			}catch(er){
				log.error('ERROR', er.toString());
			}

        }

    function afterSubmit(context) {
        log.debug({
            title: 'context',
            details: context
        });

      
            var soId = context.newRecord.id;
            log.debug({
                title: 'soId',
                details: soId
            })
        if(soId){
            var loadrec = record.load({
                type: record.Type.SALES_ORDER,
                id: soId,
                isDynamic: true,
            });
    
            var getOrderStatus = loadrec.setText({
                fieldId: 'orderstatus',
                text: 'Pending Fulfillment'
            });
    
            var saveRec = loadrec.save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });
       }
        else{
            return;
        }

        
    }

    return {
     // beforeLoad: beforeLoad,
        afterSubmit: afterSubmit
    }
});