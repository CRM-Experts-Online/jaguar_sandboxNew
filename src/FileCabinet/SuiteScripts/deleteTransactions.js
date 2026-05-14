/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 * 
 * Delete payment records 
 */
define(['N/email', 'N/error', 'N/runtime', 'N/search', 'N/record'],
/**
 * @param {email} email
 * @param {error} error
 * @param {runtime} runtime
 * @param {search} search
 */
function(email, error, runtime, search, record) {
   
    /**
     * Marks the beginning of the Map/Reduce process and generates input data.
     *
     * @typedef {Object} ObjectRef
     * @property {number} id - Internal ID of the record instance
     * @property {string} type - Record type id
     *
     * @return {Array|Object|Search|RecordRef} inputSummary
     * @since 2015.1
     */
    function getInputData() {
    	
    	var searchObj = search.load({
                    id: '2824'
                });
    	
    	return searchObj;

    }

    /**
     * Executes when the map entry point is triggered and applies to each key/value pair.
     *
     * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
     * @since 2015.1
     */
    function map(context) {
    	
    	// var creditValues = JSON.parse(context.value);
    	
    	// log.debug('creditValues', creditValues);
        log.debug({
            title: "context",
            details: context
        });

        var parseJSON = JSON.parse(context.value);

      log.debug('parseJSON', parseJSON);
    	
    	try{
    		//var recId = creditValues.values["internalid.transaction"].value;
     //   	var recId =creditValues.id;
 var recId = parseJSON.id;
   //var recId = parseJSON.values["GROUP(internalid)"].value;
           log.debug('recId', recId);
       	 var deleteItem = record.delete({ 
          		type:'customrecord_transaction_report', 
          		id: recId
          		});    

          	
          	log.debug('deleteCreditRec', deleteItem);
    	}catch(e){
    		log.error('ERROR', e.toString());
    	}
  
    }

    /**
     * Executes when the reduce entry point is triggered and applies to each group.
     *
     * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
     * @since 2015.1
     */
    function reduce(context) {

    }


    /**
     * Executes when the summarize entry point is triggered and applies to the result set.
     *
     * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
     * @since 2015.1
     */
    function summarize(summary) {
    	 log.debug('context summarize', summary);

    }

    return {
        getInputData: getInputData,
        map: map,
        //reduce: reduce,
        summarize: summarize
    };
    
});