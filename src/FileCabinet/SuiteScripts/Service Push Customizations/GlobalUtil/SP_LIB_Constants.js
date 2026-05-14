define(['./SP_LIB_CommonDefaults.js'], function(commonDefaults) {
    
    const
        _SCRIPT = commonDefaults._SCRIPT,
        _URL    = _SCRIPT.URL;

    const 
        _USEREVENTSCRIPT = {
            parameters:{
                SP_CUSTOMIZATION:  'custscript_sp_customization',
                SP_CUSTOMIZATION1: 'custscript_sp_customization1',
                ADVANCE_HTML_PDF_LAYOUT: 'custscript_sp_advanced_html_pdf_layout'
            },
            uiButtonsDetail:{ 
                // UNIT_ACCEPTANCE: { 
                //     LABEL: 'Unit Acceptance', 
                //     BUTTON_ID: 'custpage_print_unit_acceptance' 
                // },
            }
        },
        _CLIENTSCRIPT = {
            parameters:{
                SP_CUSTOMIZATION:  'custscript_sp_cs_customization',
                labelFuncAOObj: [
                    { labelId: '',  funcId: '', advancedPDFHTMLTemplate: ''  }
                ]
            }
        },
        _RESTLETSCRIPT = {
            id: 'customscript_sp_rs_manager',
            deploymentId: 'customdeploy_sp_rs_manager',
            parameters:{
                SP_CUSTOMIZATION: 'custscript_sp_rs_customization'
            },
        },
        _SUITELETSCRIPT = {
            id: 'customscript_sp_sl_manager',
            deploymentId: 'customdeploy_sl_advance_html_pdf_manager',
            returnExternalUrl: false,
            defaultFields:{
                spCustomization: {
                    id:     'custpage_sp_customnization',
                    type:   'select',
                    label:  'SP Customization',
                    source: 'customlist_sp_customizations',
                    displayType: 'HIDDEN'
                },
                advancedPDFHTMLTemplate: {
                    id:     'custpage_advancedpdf_html_template',
                    type:   'integer',
                    label:  'Advanced PDF Template',
                    displayType: 'HIDDEN'
                },
            },
            parameters:{
                SP_CUSTOMIZATION: 'custscript_sp_sl_customization',
                ADVANCE_HTML_PDF_LAYOUT: 'custscript_sp_sl_advanced_html_pdf'
            },
            clientScript:{
                path: 'SuiteScripts/DigitalGravity Customizations/GlobalUtil/SP_CS_Manager.js'
            }
        },
        _WORKFLOWACTIONSCRIPT = {
            parameters: {
                SP_CUSTOMIZATION: 'custscript_wfa_sp_customization'
            }
        },
        
        _SCHEDULEDSCRIPT = {
            parameters: {
                SP_CUSTOMIZATION: 'custscript_ss_sp_customization'
            }
        },

        _MAPREDUCESCRIPT = {
            parameters: {
                SP_CUSTOMIZATION: 'custscript_sp_mr_customization'
            }
        },

        _CUSTOMIZATIONS = {
            AUTOMATE_N_VALIDATE_TASK: 1
        },

        _ADVANCE_HTML_PDF_LAYOUTS = {
            // UNIT_ACCEPTANCE: 123
        }

    return { _USEREVENTSCRIPT, _CLIENTSCRIPT, _RESTLETSCRIPT, _SUITELETSCRIPT, _WORKFLOWACTIONSCRIPT, _SCHEDULEDSCRIPT, _MAPREDUCESCRIPT, _CUSTOMIZATIONS, _ADVANCE_HTML_PDF_LAYOUTS }
});