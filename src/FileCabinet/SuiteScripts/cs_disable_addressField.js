/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/currentRecord'], function(currentRecord) {

    function fieldChanged(context) {
        var rec = context.currentRecord;
        var fieldId = context.fieldId;

        // Run logic when "status" field changes
        if (fieldId === 'custentity_federal_exempt') {
            var statusVal = rec.getValue({ fieldId: 'custentity_federal_exempt' });

            if (statusVal === '1') {
                // Hide comments field
              var field1 =  rec.getField('custentity26');
			  field1.isDisplay = true;
               
            } else {
                // Show comments field again
                var field1 =  rec.getField('custentity26');
			  field1.isDisplay = false;
                
            }
        }
		
		if (fieldId === 'custentity25') {
            var statusVal = rec.getValue({ fieldId: 'custentity25' });

            if (statusVal === '1') {
                // Hide comments field
				 var field2 =  rec.getField('custentity_texas_exempt_reasons');
			  field2.isDisplay = true;
               
               
            } else {
                // Show comments field again
               var field2 =  rec.getField('custentity_texas_exempt_reasons');
			  field2.isDisplay = false;
                
            }
        }
    }

  function pageInit(context) {
        try {
            var rec = currentRecord.get();

            // Example: Hide the "phone" field on the Customer record
            // Replace 'phone' with your actual field ID (e.g., 'custentity_custom_field')

          var isParent = rec.getValue('hasparent');
         log.debug('isParent', isParent);
          alert(isParent)
          if(isParent == false || isParent == 'F'){
           
            var equipmentOnly = rec.getField('custentity_equipment_only');
              var bondedUser = rec.getField('custentity_bonded_user_license');
              var dyed = rec.getField('custentity_dyed_diesel_permit_number');

           
                equipmentOnly.isDisplay = false;
               bondedUser.isDisplay = false;
               dyed.isDisplay = false;
               
           
          }
            

        } catch (e) {
          log.debug('ERROR', e.toString());
        }
    }

    return {
     // pageInit: pageInit,
        fieldChanged: fieldChanged
    };
});
