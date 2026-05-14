/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * Objective: Manage All Defined UserEvent Operations
 * Date: 01 Feburary 2025
 * Remarks:
*/
define(['N',
    './SP_LIB_Constants.js',
    './SP_Helper.js',
    './SP_LIB_CommonDefaults.js',
    './SP_scriptsManager.js',
    '../Task Automation & Validation/SS2.1/SP_Automate_Task.js'
],

    function(N, constants, helper, commonDef, scriptManager, automateNValidatTask) {

        const
            _SCRIPT          = commonDef._SCRIPT,
            _URL             = _SCRIPT.URL,
            _BUTTONS         = _SCRIPT.BUTTONS,
            _SUITELETSCRIPT  = constants._SUITELETSCRIPT,
            _USEREVENTSCRIPT = constants._USEREVENTSCRIPT,
            _CUSTOMIZATIONS  = constants._CUSTOMIZATIONS;

        return {
            beforeSubmit: (ctx) => {
                try{
                    log.debug('BeforeSubmit EntryPoint Excution', 'BeforeSubmit EntryPoint Excution');
                    // let resp = new Object();
                    
                    let 
                        SP_CUSTOMIZATION = helper.getScriptParamData(_USEREVENTSCRIPT.parameters.SP_CUSTOMIZATION);

                        log.debug('{SP_CUSTOMIZATION}', {SP_CUSTOMIZATION});
                        
                    // if(!!resp && !!resp._ERR) throw resp._ERR;
                }
                catch(err){
                    log.debug('Error Found in beforeSubmit()', err);
                    if(err.name == 'ERROR|WRONG_INPUT_FOR_COMPANY_REGISTRATION_NUMBER')
                        throw err;
                    // if(err.name == ''){
                    //     throw N.error.create(err);
                    // }
                }
            },
            
            afterSubmit: (ctx) => {
                try{

                    log.debug('AfterSubmit EntryPoint Excution', 'AfterSubmit EntryPoint Excution');

                    let 
                        SP_CUSTOMIZATION  = helper.getScriptParamData(_USEREVENTSCRIPT.parameters.SP_CUSTOMIZATION);

                    log.debug('{SP_CUSTOMIZATION, _CUSTOMIZATIONS}', {SP_CUSTOMIZATION, _CUSTOMIZATIONS});
                    log.debug('_CUSTOMIZATIONS', _CUSTOMIZATIONS);

                    if(!scriptManager.automateNValidateTask.inActive && SP_CUSTOMIZATION == _CUSTOMIZATIONS.AUTOMATE_N_VALIDATE_TASK) 
                        automateNValidatTask.sendEmailsToAssignedRoleEmployees({ctx, N, helper});
                }
                catch(err){
                    log.debug('Error Found in afterSubmit()', err);
                }
            },
        
            beforeLoad: (ctx) => {
                try{
                    

                    log.debug('BeforeLoad EntryPoint Excution', 'BeforeLoad EntryPoint Excution');

                    helper.setForm(ctx.form);

                    let 
                        newRecord         = ctx.newRecord,
                        SP_CUSTOMIZATION = helper.getScriptParamData(_USEREVENTSCRIPT.parameters.SP_CUSTOMIZATION),
                        SP_CUSTOMIZATION1 = helper.getScriptParamData(_USEREVENTSCRIPT.parameters.SP_CUSTOMIZATION1);

                        log.debug('{SP_CUSTOMIZATION, _CUSTOMIZATIONS}', {SP_CUSTOMIZATION, _CUSTOMIZATIONS});

                    // if(!scriptManager.autoPopulateICOContractList.inActive && SP_CUSTOMIZATION1 == _CUSTOMIZATIONS.AUTOMATE_ICO_CONTRACT_LIST_ADVINTERCOJOURNAL) 
                    //     automateAdvInterCoJournal.populateICOContractList({ctx, N, helper}) //ID_Auto_Create_Expense_Report.js.js
                    // if(!scriptManager.automateNValidatePaymentOrdr.inActive && SP_CUSTOMIZATION == _CUSTOMIZATIONS.AUTOMATE_N_VALIDATE_PAYMENT_ORDER) 
                    //     automateNValidatePaymentOrdr.runBeforeLoad({ctx, N, helper})

                    
                    //     log.debug('{DG_CUSTOMIZATON}', {DG_CUSTOMIZATON});
                        
                    //     if(!scriptManager.advancedHtmlPdfLayout.inActive && DG_CUSTOMIZATON == _CUSTOMIZATIONS.ADVANCE_HTML_PDF_LAYOUT){
                        
                    //         if(ctx.type != 'view') return;
    
                    //         let 
                    //             buttonMeta = new Object(),
                    //             ADVANCE_HTML_PDF_LAYOUT = helper.getScriptParamData(_USEREVENTSCRIPT.parameters.ADVANCE_HTML_PDF_LAYOUT);
    
                    //         if(ADVANCE_HTML_PDF_LAYOUT == _ADVANCE_HTML_PDF_LAYOUTS.UNIT_ACCEPTANCE){
    
                    //             buttonMeta = {
                    //                 id:    _USEREVENTSCRIPT.uiButtonsDetail.UNIT_ACCEPTANCE.BUTTON_ID,
                    //                 label: _USEREVENTSCRIPT.uiButtonsDetail.UNIT_ACCEPTANCE.LABEL
                    //             };
                    //         }
                    //         else if(ADVANCE_HTML_PDF_LAYOUT == _ADVANCE_HTML_PDF_LAYOUTS.RHA_SERVICE_INVOICE){
    
                    //             buttonMeta = {
                    //                 id:    _USEREVENTSCRIPT.uiButtonsDetail.RHA_SERVICE_INVOICE_PDF.BUTTON_ID,
                    //                 label: _USEREVENTSCRIPT.uiButtonsDetail.RHA_SERVICE_INVOICE_PDF.LABEL
                    //             };
                    //         }
                    //         else if(ADVANCE_HTML_PDF_LAYOUT == _ADVANCE_HTML_PDF_LAYOUTS.RESERVATION_FORM){
    
                    //             buttonMeta = {
                    //                 id:    _USEREVENTSCRIPT.uiButtonsDetail.RESERVATION_FORM_PDF.BUTTON_ID,
                    //                 label: _USEREVENTSCRIPT.uiButtonsDetail.RESERVATION_FORM_PDF.LABEL
                    //             };
                    //         }
                            
                    //         helper.showButton({
                    //             buttonMeta, 
                    //             func: helper.buttonListeners({ suiteletMeta: _SUITELETSCRIPT, params: {
                    //                 [_URL.params.transactionId]:   newRecord.id,
                    //                 [_URL.params.transactionType]: newRecord.type,
                    //                 [_URL.params.advancedPDFHTMLTemplate]: ADVANCE_HTML_PDF_LAYOUT
                    //             } }).redirectToSuitelet
                    //         });
                    //     }
                }
                catch(err){
                    log.debug('Error Found in beforeLoad()', err);
                }
            }
        }
})