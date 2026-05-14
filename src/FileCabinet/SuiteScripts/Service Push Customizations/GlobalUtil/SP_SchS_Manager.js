/**
 *@NApiVersion 2.1
 *@NScriptType ScheduledScript
 */
define([
    'N',
    './SP_LIB_Constants.js',
    './SP_Helper.js',
    './SP_LIB_CommonDefaults.js',
    './SP_scriptsManager.js'
], function(N, constants, helper, commonDef, scriptManager) {
    
    const
        _SCHEDULEDSCRIPT = constants._SCHEDULEDSCRIPT,
        _CUSTOMIZATIONS = constants._CUSTOMIZATIONS;

    function execute(ctx) {
        try{
            let 
                SP_CUSTOMIZATION = helper.getScriptParamData(_SCHEDULEDSCRIPT.parameters.SP_CUSTOMIZATION);

            // if(!scriptManager.autoCreateExpenseReport.inActive && SP_CUSTOMIZATION == _CUSTOMIZATIONS.AUTO_CREATE_EXPENSE_REPORT) autoCreateExpenseReport.create({ctx, N, helper}) //DG_Lead_Assignment_Manager.js
            // if(!scriptManager.alertForPaymentOrder.inActive && SP_CUSTOMIZATION == _CUSTOMIZATIONS.ALERT_FOR_PAYMENT_ORDER) paymentOrdAlertSchs.run({ctx, N, helper}) //DG_Lead_Assignment_Manager.js
        }
        catch(err){
            log.debug('Error Found in afterSubmit()', err);
        }
    }

    return {
        execute: execute
    }
});
