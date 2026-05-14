/**
 * @NApiVersion 2.1
 * @NScriptType WorkflowActionScript
 */

define(['N',
    './SP_Helper.js',
    './SP_LIB_Constants.js',
    './SP_LIB_CommonDefaults.js',
    './SP_scriptsManager.js'
], function(N, helper, libConstants, commonDef, scriptManager) {

    const
        _CUSTOMIZATIONS = libConstants._CUSTOMIZATIONS,
        _WORKFLOWACTIONSCRIPT = libConstants._WORKFLOWACTIONSCRIPT;
    
    return {
        onAction: (ctx) => {
            try{
                let 
                    resp,
                    SP_CUSTOMIZATION  = helper.getScriptParamData(_WORKFLOWACTIONSCRIPT.parameters.SP_CUSTOMIZATION);
                    
                
                // if(!scriptManager.automateJE.inActive && SP_CUSTOMIZATION == _CUSTOMIZATIONS.AUTOMATE_JOURNAL_ENTRY) 
                //     resp = automateJE.hanledNameIssue({N, helper, commonDef, ctx}); //UAC_ReverseJournals_WhenCSVoids.js

                if(!!resp?._ERR) throw resp._ERR;
                else return resp?.toReturn;
            }
            catch(err){
                log.debug('Error Found in onAction()', err);
            }
        }
    }
});