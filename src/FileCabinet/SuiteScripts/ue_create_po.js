/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define(['N/runtime', 'N/log', 'N/ui/serverWidget', 'N/ui/message'], (runtime, log, ui, message) => {
    function beforeLoad(scriptContext) {
        try {
			var rType = scriptContext.type;
			const recCurrent = scriptContext.newRecord;
			log.debug('rType', recCurrent.type);
			if(recCurrent.type == 'salesorder'){
				
            const objForm = scriptContext.form;
            const recClass = recCurrent.getValue({
                fieldId: 'class'
            });
          const relatedOrder = recCurrent.getValue({
                fieldId: 'custbody_related_sales_order'
            });
            const stSuiteletLinkParam = runtime.getCurrentScript().getParameter({
                name: 'custscript_suitelet_link'
            });
			
			const CopyParam = runtime.getCurrentScript().getParameter({
                name: 'custscript_copy_suitelet'
            });
            const suiteletURL = '\"' + stSuiteletLinkParam +'&custpage_soid='+recCurrent.id+ '\"';
			log.debug('suiteletURL', suiteletURL);
            if ((recClass === '2') && !relatedOrder) {
                objForm.addButton({
                    id: 'custpage_suiteletbutton',
                    label: 'Create PO',
                    functionName : "window.open(" + suiteletURL + ", '_self')",
                });
            }
			
			const coptSuiteletURL = '\"' + CopyParam +'&custpage_soid='+recCurrent.id+ '\"';
			 const copied = recCurrent.getValue({
                fieldId: 'custbody_make_copy'
            });

              var userObj = runtime.getCurrentUser();

              var roleId = userObj.roleId;

              log.debug('roleId', roleId);

              if(copied != true && (roleId == '3' || roleId == '1390')){
                objForm.addButton({
                    id: 'custpage_suiteletbutton',
                    label: 'MAKE COPY',
                    functionName : "window.open(" + coptSuiteletURL + ", '_self')",
                });
              }
			
			
			}else if(recCurrent.type == 'purchaseorder'){
				
				const objForm = scriptContext.form;
				const eSent = recCurrent.getValue({
                fieldId: 'custbody_email_sent'
            });
			log.debug('eSent', eSent);
			const stSuiteletLinkParam = runtime.getCurrentScript().getParameter({
                name: 'custscript_suitelet_link'
            });
            const suiteletURL = '\"' + stSuiteletLinkParam +'&custpage_soid='+recCurrent.id+ '\"';
			log.debug('suiteletURL', suiteletURL);
			if(eSent == 'F' || eSent == false){


              
				 objForm.addButton({
                    id: 'custpage_suiteletbutton',
                    label: 'SEND EMAIL',
                    functionName : "window.open(" + suiteletURL + ", '_self')",
                });

              if(scriptContext.type === 'view'){
                 objForm.addPageInitMessage({type: message.Type.INFORMATION, message: 'PO has not sent to vendor'});
              }
       
			}
			}
            
        } catch(error) {
            log.error({
                title: 'beforeLoad_addButton',
                details: error.message
            });
        }
    }
    return {
        beforeLoad: beforeLoad
    };
});