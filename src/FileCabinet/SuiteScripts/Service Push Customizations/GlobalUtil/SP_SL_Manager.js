/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */

 /**
 *! Created By: point-star pte. ltd.
 *! Author: Dev "Muhammad Kamran"
 *! Date Creation: "16/01/2024"
 *! Date Updated: "16/01/2024"
 *! Company: "point-star"
 *! Version: 1
 */

define(
    [
        './SP_LIB_Constants.js', './SP_Helper.js', './SP_LIB_CommonDefaults.js', './moment.js'
    ], function(constants, helper, commonDefaults, moment) {

    const
        _SCRIPT         = commonDefaults._SCRIPT,
        _URL            = _SCRIPT.URL,
        _ENTRYPOINTS    = _SCRIPT.SUITELETSCRIPT.ENTRYPOINTS,
        _SUITELETSCRIPT = constants._SUITELETSCRIPT,
        _CUSTOMIZATIONS = constants._CUSTOMIZATIONS,
        _ADVANCE_HTML_PDF_LAYOUTS = constants._ADVANCE_HTML_PDF_LAYOUTS;

    function onRequest(ctx) {   
        
        try{
            log.debug('_URL.params', _URL.params);
            
            const 
                onRequestEP = _ENTRYPOINTS.onRequest;

            helper.setContext({ctx, ep:onRequestEP.string});
            
            log.audit('governance at start', helper.getGovernanceUsage());
            
            const
                SP_CUSTOMIZATON = helper.getScriptParamData(_SUITELETSCRIPT.parameters.SP_CUSTOMIZATION);

            log.debug('SP_CUSTOMIZATON', SP_CUSTOMIZATON);
            
            //!Below Code will define for which customization this script should be running
            //!For each customization script has its own validation mentioned below
            
            // if ( SP_CUSTOMIZATON == _CUSTOMIZATIONS.ADVANCE_HTML_PDF_LAYOUT ){
                
            //     let
            //         recordObj             = new Object(),
            //         recordsToRender       = new Array(),
            //         searchesToRender      = new Array(),
            //         transactionId         = helper.getUrlParamData(_URL.params.transactionId),
            //         transactionType       = helper.getUrlParamData(_URL.params.transactionType),
            //         advancedHtmlPdfLayout = helper.getUrlParamData(_URL.params.advancedPDFHTMLTemplate);

            //     helper.setRecord({ id: transactionId, recType: transactionType });
            //     recordObj = helper.findRecord({ id: transactionId, recType: transactionType });

            //     if(advancedHtmlPdfLayout == _ADVANCE_HTML_PDF_LAYOUTS.UNIT_ACCEPTANCE)
            //         automateHandoverMoveIn.renderRecordsToAdvancedPDF({ recordObj, recordsToRender, searchesToRender, helper })

            //     helper.renderAdvPDFOnResponse(
            //         helper.getAdvancedPdfHtmlLayout({
            //             advancedPdfHtmlTempId: advancedHtmlPdfLayout,
            //             records: recordsToRender,
            //             searches: searchesToRender
            //         })
            //     );
            // }
            // else if( SP_CUSTOMIZATON == _CUSTOMIZATIONS.BANK_REGISTER_REPORT ){
            //     log.debug('BRR_App_Producer',BRR_App_Producer)
            //     BRR_App_Producer.run(helper, ctx)
            // }

            log.debug('helper.form', helper.getForm());

            // if(ctx.request.method == "GET" && !!Object.keys(helper.getForm()).length)
            //     helper.setFields(_SUITELETSCRIPT.defaultFields, ctx.request.parameters);
            
            log.audit('governance at end', helper.getGovernanceUsage());
        }
        catch(err){
            log.debug('Error', 'Error Found In onRequest');
            log.debug('Error', err);
        }


    }

    return {
        onRequest: onRequest
    }
});
