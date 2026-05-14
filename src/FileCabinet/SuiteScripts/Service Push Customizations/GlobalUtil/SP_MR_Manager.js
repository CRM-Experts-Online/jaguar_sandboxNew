/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * Task                    Date                Author                                                         Remarks
 * Manage Map Reduce       01/Feburary/2025          
*/
define([
    'N',
    './SP_LIB_Constants.js',
    './SP_Helper.js',
    './SP_LIB_CommonDefaults.js',
    './SP_scriptsManager.js'
], function(N, constants, helper, commonDef, scriptManager) {
    
    const
        _MAPREDUCESCRIPT = constants._MAPREDUCESCRIPT,
        _CUSTOMIZATIONS = constants._CUSTOMIZATIONS;

    function run(){
        try{

            // if (
            //     !scriptManager.dailyExchangeRatesFetcher.inActive && 
            //     helper.getScriptParamData(_MAPREDUCESCRIPT.parameters.SP_CUSTOMIZATION) == _CUSTOMIZATIONS.CURRENCIES_EXCHANGE_RATE_FETCHER && 
            //     dailyExchangeRatesFetcher
            // )
            //     return dailyExchangeRatesFetcher?.run({N, helper}) || {
            //         getInputData: (() => {log.debug('Some Issue With main file', 'Please check main MR Manager file, there\'s some issue!')}),
            //         map: (() => {log.debug('No Customization Matched', 'Please select the active customization first!')}),
            //         reduce: (() => {log.debug('No Customization Matched', 'Please select the active customization first!')})
            //     }
            // else
            //     return {
            //         getInputData: (() => {log.debug('No Customization Matched', 'Please select the active customization first!')}),
            //         map: (() => {log.debug('No Customization Matched', 'Please select the active customization first!')}),
            //         reduce: (() => {log.debug('No Customization Matched', 'Please select the active customization first!')})
            //     }
            return {
                getInputData: (() => {log.debug('No Customization Matched', 'Please select the active customization first!')}),
                map: (() => {log.debug('No Customization Matched', 'Please select the active customization first!')}),
                reduce: (() => {log.debug('No Customization Matched', 'Please select the active customization first!')})
            }
        }
        catch(err){
            log.debug('ERR! Found In run()', err)
            
            return {
                getInputData: (() => {log.debug('No Customization Matched', 'Please select the active customization first!')}),
                map: (() => {log.debug('No Customization Matched', 'Please select the active customization first!')}),
                reduce: (() => {log.debug('No Customization Matched', 'Please select the active customization first!')})
            }
        }
    }

    return run();
});