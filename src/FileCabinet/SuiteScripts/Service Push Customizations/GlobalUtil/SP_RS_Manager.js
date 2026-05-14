/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define([
    'N',
    './SP_LIB_Constants.js',
    './SP_Helper.js',
    './SP_LIB_CommonDefaults.js',
    './SP_scriptsManager.js'
], function(N, constants, helper, commonDefaults, scriptManager) {

    const
        _RESTLETSCRIPT  = constants._RESTLETSCRIPT,
        _CUSTOMIZATIONS = constants._CUSTOMIZATIONS; 

    function _get(ctx) {
        try{
            log.debug('getRequest', 'getRequest');
            log.debug('ctx', ctx);
            log.audit('governance at start', helper.getGovernanceUsage());
            
            const
                SP_CUSTOMIZATON = helper.getScriptParamData(_RESTLETSCRIPT.parameters.SP_CUSTOMIZATION);
            
                log.debug('SP_CUSTOMIZATON', SP_CUSTOMIZATON);

            let
                response = {
                    netsuiteData: new Object()
                };

            //!Below Code will define for which customization this script should be running
            //!For each customization script has its own validation mentioned below

            return response;
        }
        catch(err){
            log.debug('ERR! Found In _get()', err);
            response = {
                statusCode: 500,
                statusMessage: 'Internal Server Error | ' + JSON.stringify(err)
            }
            return response;
        }
    }

    function _post(ctx) {
        try{
            log.debug('postRequest', 'postRequest');
            log.debug('ctx', ctx);
            log.audit('governance at start', helper.getGovernanceUsage());
            
            const
                SP_CUSTOMIZATON = helper.getScriptParamData(_RESTLETSCRIPT.parameters.SP_CUSTOMIZATION);
            
            let
                response = {
                    netsuiteData: new Object()
                };

            //!Below Code will define for which customization this script should be running
            //!For each customization script has its own validation mentioned below

            // if ( !scriptManager.zohoIntegHandler.inActive && ID_CUSTOMIZATON == _CUSTOMIZATIONS.ZOHO_INTEGRATION )
            //     response = zohoIntegHandler.executePostHandler({N, helper, ctx});

            return response;
        }
        catch(err){
            log.debug('ERR! Found In _get()', err);
            response = {
                statusCode: 500,
                statusMessage: 'Internal Server Error | ' + JSON.stringify(err)
            }
            return response;
        }
    }

    function _put(ctx) {
        
    }

    function _delete(ctx) {
        
    }

    return {
        get: _get,
        post: _post,
        put: _put,
        delete: _delete
    }
});
