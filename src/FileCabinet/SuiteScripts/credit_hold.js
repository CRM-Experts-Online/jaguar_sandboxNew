/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
define(['N/error', 'N/search', 'N/record', 'N/runtime'], function(error, search, record, runtime) {



    function onSave(context) {

        var recObj = context.currentRecord;

      log.debug('type', recObj.type);
	  
	  var overRide = recObj.getValue('custbody_over_ride');
		
		if(overRide == true){
			 return true;
		}
	  
	 
      var  entityType = recObj.getValue('custbody_entity_type');

      if(entityType == 'Project'){

         var  entityId = recObj.getValue('entity');

        log.debug('entityId', entityId);

        recObj.setValue('custbody_project', entityId);
      }

        var customer = recObj.getValue('custbody5');
		
		var createdFrom = recObj.getValue('createdfrom');
				
		var recTotal = recObj.getValue('total');
		 log.debug('mode', recObj.id)
		 if(recObj.id && recObj.type == 'salesorder') {
			  
		 var loadExisting = record.load({
            type: recObj.type,
            id: recObj.id,
            isDynamic: true,
        });
		
		var oldTotal = loadExisting.getValue('total');
		
		 log.debug('oldTotal', oldTotal)
		log.debug('recTotal', recTotal);
		if(oldTotal != recTotal){
			recTotal = parseFloat(oldTotal) - parseFloat(recTotal);
		}else{
			recTotal = 0;
		}
	  }
	  
	  if(recObj.type == 'itemfulfillment' || recObj.type == 'invoice'){
		  recTotal = 0;
	  }
	  
	  if(recObj.type == 'invoice' && createdFrom){
		  recTotal = recObj.getValue('total');
	  }
		      
		
        if (customer) {

          var hold =  getdueInvoice(customer, recTotal)
		  
		  log.debug('hold', hold);
		  
		  if(hold){
			  alert('CUSTOMER CROSSED CREDIT LIMIT RECORD CAN NOT BE SAVED');
			  log.debug('customer is on hold');
			  return false
		  }else{
			   log.debug('NO HOLD');
			  return true
		  }
			
			
        } else {
            return true
        }




    }



    function getdueInvoice(customerId, recTotal) {

        var customerSearchObj = search.create({
   type: "customer",
   filters:
   [
      ["internalid","anyof",customerId]
   ],
   columns:
   [
      search.createColumn({name: "consolunbilledorders", label: "Consolidated Unbilled Orders"}),
	  search.createColumn({name: "creditlimit", label: "Credit Limit"})
   ]
});

        var results = customerSearchObj.run().getRange({
            start: 0,
            end: 1000
        });

        log.debug('results', results);

        if (results && results.length > 0) {

            var creditLimit = 0;

            var totalSo = 0;

            for (var i = 0; i < results.length; i++) {
				
				creditLimit = results[i].getValue('creditlimit');

                totalSo = results[i].getValue('consolunbilledorders');

            }
			
			totalSo = parseFloat(totalSo) + parseFloat(recTotal);
			
			log.debug('totalSo', totalSo);
			
			log.debug('creditLimit', creditLimit);
			
			if(totalSo > creditLimit){
				
				return true;
			}else{
				return false
			}

    } else {
        return false
    }
}

   function fieldChanged(context) {
        var rec = context.currentRecord;
        var fieldId = context.fieldId;
     

        // Replace with the field you want to track
        if (fieldId === 'custbody_emailed_out') {

          var fieldValue = rec.getValue('custbody_emailed_out');

          alert(fieldValue)

          if(fieldValue == true){
             var today = new Date();
            
            // Update the date field
            rec.setValue({
                fieldId: 'custbody89',
                value: today
            });
          }
           
        }
    }

   function saveRecord(context) {
        try {
            var rec = context.currentRecord;

           var fieldValue = rec.getValue('custbody_emailed_out');

            if(fieldValue == true){
             var today = new Date();
            
            // Update the date field
            rec.setValue({
                fieldId: 'custbody89',
                value: today
            });
          }
            return true;

        } catch (e) {
            console.log("Error in saveRecord: " + e.message);
            return true; // return false if you want to prevent save
        }
    }


return {
    //pageInit: pageInit
  //fieldChanged: fieldChanged
    saveRecord: saveRecord
};
});