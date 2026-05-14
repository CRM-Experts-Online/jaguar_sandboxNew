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

        try {

            var recObj = scriptContext.newRecord;

            var rClass = recObj.getValue('class');

            var relatedOrder = recObj.getValue('createdfrom');
			
			log.debug('relatedOrder', relatedOrder);

            if (rClass == 2) {

                var billId = getBillID(relatedOrder);

                log.debug('billId', billId);
				
				if(billId && billId.length > 0){
					for(var x = 0; x < billId.length; x++){
						
						// if (billId) {

                    var billRec = record.load({
                        type: 'vendorbill',
                        id: billId[x]

                    });

                    var billlineCount = billRec.getLineCount('item');

                    var invlineCount = recObj.getLineCount('item');

                    log.debug('billlineCount', billlineCount);

                    var updatedItems = [];

                    for (var i = 0; i < billlineCount; i++) {



                        var billItem = billRec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: i
                        });
                        var billRate = billRec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            line: i
                        });
						log.debug('billRate', billRate);
                        var roundbillRate = (parseFloat(billRate)).toFixed(5);
						log.debug('roundbillRate', roundbillRate);

                        for (var j = 0; j < invlineCount; j++) {
							var invItem = recObj.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'item',
                                line: j
                            });
                            if (updatedItems.indexOf(invItem) > -1) {
                                continue;
                            }
                            

                            var qty = recObj.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                line: j
                            });

                            if (billItem == invItem) {

                                recObj.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol2',
                                    value: roundbillRate,
                                    line: j
                                });

                                var tCost = parseFloat(billRate) * parseFloat(qty)

                                tCost = tCost.toFixed(5)
                                recObj.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol3',
                                    value: tCost,
                                    line: j
                                });
								
								 updatedItems.push(invItem)

                            }

                           
                        }




                    }

              //  }
						
					}
				}

               


            }


        } catch (er) {
            log.error('ERROR', er.toString());
        }

    }


    function getBillID(relatedOrder) {

        var vendorbillSearchObj = search.create({
                type: "vendorbill",
                filters: [
                    ["type", "anyof", "VendBill"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["custbody_related_sales_order", "anyof", relatedOrder]
                ],
                columns:[
				      search.createColumn({name: "internalid", label: "Internal ID"})
				]          
        });

    var results = vendorbillSearchObj.run().getRange({
        start: 0,
        end: 1000
    });
    log.debug('DEBUG', results)

      var billIds = [];

    if (results && results.length > 0) {
		for(var j = 0; j < results.length; j++){
			billIds.push(results[j].getValue('internalid'))
		}
       
    }
	
	 return billIds;
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
    //beforeLoad: beforeLoad,
    beforeSubmit: beforeSubmit
    //afterSubmit: afterSubmit
};

});