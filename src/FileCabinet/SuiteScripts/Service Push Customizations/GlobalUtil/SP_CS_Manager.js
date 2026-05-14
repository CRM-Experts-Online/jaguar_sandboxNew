/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * Objective: Manage All Defined ClientScript Operations
 * Date: 01 Feburary 2025
*/
 define([
    'N',
    './ID_LIB_Constants.js',
    './ID_Helper.js',
    './ID_LIB_CommonDefaults.js',
    './ID_scriptsManager.js'
],

    function(N, constants, helper, commonDefaults, scriptManager) {

        const
            _SCRIPT          = commonDefaults._SCRIPT,
            _URL             = _SCRIPT.URL,
            _BUTTONS         = _SCRIPT.BUTTONS,
            _CLIENTSCRIPT    = constants._CLIENTSCRIPT,
            _SUITELETSCRIPT  = constants._SUITELETSCRIPT,
            _CUSTOMIZATIONS  = constants._CUSTOMIZATIONS;
            
        // function lineInit(ctx) {}
        
        // function pageInit(ctx) {}
        
        // function postSourcing(ctx) {}
        
        function saveRecord(ctx) {
            try{
                
                let 
                    SP_CUSTOMIZATION = helper.getScriptParamData(_CLIENTSCRIPT.parameters.SP_CUSTOMIZATION);

                log.debug('{SP_CUSTOMIZATION, _CUSTOMIZATIONS}', {SP_CUSTOMIZATION, _CUSTOMIZATIONS});

                retunn = true;

                // if(!scriptManager.automateNValidateVendBill.inActive && SP_CUSTOMIZATION == _CUSTOMIZATIONS.AUTOMATE_N_VALIDATE_VENDOR_BILL) 
                //     automateNValidateVendBill.validateStandAloneBill({ctx, N, helper});

                return retunn;
            }
            catch(err){
                console.log('ERR! Found In saveRecord()', err);
                log.debug('ERR! Found In saveRecord()', err);

                return true;
            }
        }
        
        // function sublistChanged(ctx) {}
        
        // function validateDelete(ctx) {}
        
        function validateField(ctx) {
            try{
                
                let 
                    SP_CUSTOMIZATION = helper.getScriptParamData(_CLIENTSCRIPT.parameters.SP_CUSTOMIZATION);

                log.debug('{SP_CUSTOMIZATION, _CUSTOMIZATIONS}', {SP_CUSTOMIZATION, _CUSTOMIZATIONS});

                retunn = true;

                return retunn;
            }
            catch(err){
                console.log('ERR! Found In validateField', err);
                log.debug('ERR! Found In ValidateField', err);

                return true;
            }
        }
        
        // function validateInsert(ctx) {}
        
        // function validateLine(ctx) {}
        
        // function fieldChanged(ctx) {}

        return {
                // lineInit: lineInit,
                // pageInit: pageInit,
                // postSourcing : postSourcing,
                saveRecord : saveRecord,
                // sublistChanged : sublistChanged,
                // validateDelete : validateDelete,
                validateField : validateField,
                // validateInsert : validateInsert,
                // validateLine : validateLine,
                // fieldChanged : fieldChanged
            };
     }
);
