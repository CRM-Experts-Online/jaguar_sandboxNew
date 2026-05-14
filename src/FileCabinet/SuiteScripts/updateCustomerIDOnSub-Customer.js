/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search','N/ui/serverWidget', 'N/runtime'],
/**
 * @param {record} record
 * @param {search} search
 */
function(record, search,serverWidget,runtime) {
   
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

      try{
		  
		 var userObj = runtime.getCurrentUser();

		 var userRoleid = userObj.role;
		 
		 if(userRoleid == 1374 || userRoleid == 3){
			 return;
		 }

        var hideFld = scriptContext.form.addField({
	id:'custpage_hide_subtab',
	label:'hidden',
	type: serverWidget.FieldType.INLINEHTML
});

        var scr = "";
        scr += 'jQuery("#financialtxt").hide();';

        hideFld.defaultValue = "<script>jQuery(function($){require([], function(){" + scr + ";})})</script>"
        
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
    function beforeSubmit(scriptContext) {
		
		try{
			if(scriptContext.type == 'edit'){
				var recObj = scriptContext.newRecord;
			
			var rClass = recObj.getValue('class');
			
			var lineCount = recObj.getLineCount('addressbook'); 
			
			log.debug('COUNT', lineCount);
			
			for (var i = 0; i < lineCount; i++) {
				
					 var objSubRecord = recObj.getSublistSubrecord({
            sublistId: 'addressbook',
            fieldId: 'addressbookaddress',
            line: i
        });
		log.debug('objSubRecord', objSubRecord);
		
        objSubRecord.setValue({
            fieldId : 'override',
            value: false
        });
			
				 
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
       beforeLoad: beforeLoad,
        beforeSubmit: beforeSubmit
       // afterSubmit: afterSubmit
    };
   
});