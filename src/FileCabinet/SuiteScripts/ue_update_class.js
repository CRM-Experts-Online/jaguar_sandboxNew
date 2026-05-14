/**
 * @NApiVersion 2.x
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
    function beforeLoad(scriptContext) {

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
		
		try{
			
			var recObj = scriptContext.newRecord;
			
			var rClass = recObj.getValue('class');
			
			var lineCount = recObj.getLineCount('item'); 
			
			for (var i = 0; i < lineCount; i++) {
				if(rClass){
					 recObj.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'class',
                                    value: rClass,
                                    line: i
                                });
				}
				 
			}
			
			if(recObj.type == 'purchaseorder' && scriptContext.type == 'edit'){
				
				var getLoc = recObj.getValue('location');
				log.debug('getLoc', getLoc);
				
				var locationSearchObj = search.create({
   type: "location",
   filters:
   [
      ["internalid","anyof",getLoc]
   ],
   columns:
   [
      search.createColumn({name: "address1", label: "Address 1"}),
      search.createColumn({name: "address2", label: "Address 2"}),
      search.createColumn({name: "address3", label: "Address 3"}),
      search.createColumn({name: "phone", label: "Phone"}),
      search.createColumn({name: "city", label: "City"}),
      search.createColumn({name: "state", label: "State/Province"}),
      search.createColumn({name: "zip", label: "Zip"}),
      search.createColumn({name: "country", label: "Country"})
   ]
});

var results = locationSearchObj.run().getRange({
                    start: 0,
                    end: 1000
                });
				log.debug('results', results);
				if(results && results.length > 0){
					
					 var subrec = recObj.getSubrecord({
            fieldId: 'shippingaddress'
        });
		log.debug('address1', results[0].getValue('address1'));
		if(results[0].getValue('address1')){
			subrec.setValue({
            fieldId: 'country',
            value: 'US'
        });
		
		 subrec.setValue({
            fieldId: 'city',
            value: results[0].getValue('city')
        });

        subrec.setValue({
            fieldId: 'state',
            value: results[0].getValue('state')
        });

        subrec.setValue({
            fieldId: 'zip',
            value: results[0].getValue('zip')
        });

        subrec.setValue({
            fieldId: 'addr1',
            value: results[0].getValue('address1')
        });
		subrec.setValue({
            fieldId: 'addr2',
            value: results[0].getValue('address2')
        });

		}
					
				}
			}
			
		}catch(er){
			log.error('ERROR', er.toString());
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
    function afterSubmit(scriptContext) {

    }

    return {
       // beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit
       // afterSubmit: afterSubmit
    };
   
});