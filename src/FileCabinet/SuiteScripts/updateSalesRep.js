/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/record'], function (record) {

   function beforeLoad(context) {
    
    try{
      var type = context.type;

      var newRec =  context.newRecord;

      var type = newRec.type;

      log.debug('type', type);

      if(type == 'employee'){
        var expenseSublist = context.form.getSublist({‌id:'payroll'});
      log.debug('expenseSublist', expenseSublist);
		expenseSublist.setDisplayType = 'hidden';
      }

	//if (expenseForm == 103) {‌ //change this to an internal id of the custom form you want to hide the expense subtab.
		
	//}
    }catch(er){
      log.error('ERROR', er.toString());
    }
	
}
 

    function beforeSubmit(context) {
        try {

         var newRec =  context.newRecord
			
			if(context.type == 'edit'){
				
				
				
				var oldRec = context.oldRecord;
              var type = newRec.type;
				 if(type == 'employee'){return;}
				
				var commissionNew = newRec.getValue('custentity_commission_percent');
				
				var commissionOld = oldRec.getValue('custentity_commission_percent');
				
				var creditLimitNew = newRec.getValue('creditlimit');
				
				var creditLimitOld = oldRec.getValue('creditlimit');
				
				if(commissionNew && commissionNew != commissionOld){
					newRec.setValue('custentity_update_child_customer', true);
				}
				
				if(creditLimitNew && creditLimitNew != creditLimitOld){
										newRec.setValue('custentity_update_child_customer', true);
				}
				
				
			}
          var isParent = newRec.getValue('hasparent');

          log.debug('isParent', isParent);
          if(isParent == 'F'|| isParent == false){
              newRec.setValue('custentity_tax_id', newRec.getValue('vatregnumber'));
          }
         
						
            log.debug({
                title: "context",
                details: context
            });

            var recObj = context.newRecord;
            log.debug({
                title: 'recObj',
                details: recObj
            });

            // Get the current value of the 'salesrep' field
            var getvalue = recObj.getValue({
                fieldId: 'salesrep'
            });

            log.debug({
                title: "getvalue",
                details: getvalue
            });

            // Set the 'salesrep' field to an empty string
            recObj.setValue({
                fieldId: 'salesrep',
                value: ""
            });

            log.debug({
                title: "setValue",
                details: "Salesrep field set to an empty string"
            });
        } catch (e) {
            log.error({
                title: "Error in beforeSubmit",
                details: e
            });
        }
    }

    return {
      beforeLoad:beforeLoad,
        beforeSubmit: beforeSubmit
    };
});