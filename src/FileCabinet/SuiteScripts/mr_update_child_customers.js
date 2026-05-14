/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/email', 'N/record', 'N/runtime', 'N/search', 'N/file'],
    /**
     * @param {email} email
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     */
    function(email, record, runtime, search, file) {

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

            try {



                var customerSearchObj = search.create({
                    type: "customer",
                    filters: 
                        [
      ["parentcustomer.custentity_update_child_customer","is","T"], 
      "AND", 
      ["stage","anyof","CUSTOMER"]
    //  "AND", 
     // ["internalid","anyof","4660"]
   ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "custentity_commission_percent",
                            join: "parentCustomer",
                            label: "Commission%"
                        }),
                        search.createColumn({
                            name: "creditlimit",
                            join: "parentCustomer",
                            label: "Credit Limit"
                        }),
                        search.createColumn({
                            name: "internalid",
                            join: "parentCustomer",
                            label: "Internal ID"
                        })
                    ]
                });

                return customerSearchObj;

            } catch (e) {
                log.error('ERROR', e.toString());
            }

        }

        /**
         * Executes when the map entry point is triggered and applies to each key/value pair.
         *
         * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
         * @since 2015.1
         */
        function map(context) {

            var responseObj = {};

            try {

                var mapObj = JSON.parse(context.value);

                log.debug('mapObj', mapObj);

                var childId = mapObj.id;

                var comm = mapObj.values["custentity_commission_percent.parentCustomer"];

                var climit = parseFloat(mapObj.values["creditlimit.parentCustomer"]);

                var parentId = mapObj.values["internalid.parentCustomer"].value;

              if(!climit || climit == 'NaN'){
                climit = 0;
              }

                log.debug('climit', climit);
				
				if(comm.indexOf('%')){
					comm = comm.replace('%', '');
				}
				
				  log.debug('comm', comm);


                try {
                    var childsubmit = record.submitFields({
                        type: 'customer',
                        id: childId,
                        values: {
                            'custentity_commission_percent': parseFloat(comm),
                            'creditlimit': climit
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
					
					log.debug('childsubmit', childsubmit);

                    var parentsubmit = record.submitFields({
                        type: 'customer',
                        id: parentId,
                        values: {
                            'custentity_update_child_customer': false
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
					log.debug('parentsubmit', parentsubmit);
                } catch (er) {
					
					 log.error('ERROR', er.toString());
					 

                    var otherId = record.submitFields({
                        type: 'customer',
                        id: parentId,
                        values: {
                            'custentity_update_child_customer': true
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                }




            } catch (er) {
                log.error('ERROR', er.toString());

            }


        }




        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(summary) {

            log.debug('summary', summary);

        }

        return {
            getInputData: getInputData,
            map: map,
            // reduce: reduce,
            summarize: summarize
        };

    });