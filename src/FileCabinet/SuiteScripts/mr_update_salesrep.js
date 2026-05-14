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

                var scriptObj = runtime.getCurrentScript();

                var scriptPram = JSON.parse(scriptObj.getParameter({
                    name: 'custscript_value_object'
                }));

                log.debug('scriptPram', scriptPram);

                var customerSearchObj = search.create({
                    type: "customer",
                    filters: [
                        ["parentcustomer.internalid", "anyof", scriptPram.parentId]
                    ],
                    columns: [
                        search.createColumn({
                            name: "entityid",
                            sort: search.Sort.ASC,
                            label: "ID"
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

                var custId = mapObj.id;
				
				  var scriptObj = runtime.getCurrentScript();

                var scriptPram = JSON.parse(scriptObj.getParameter({
                    name: 'custscript_value_object'
                }));
				
				log.debug('scriptPram', scriptPram);

                var salesrepArr = scriptPram.salesArr;

                log.debug('salesrepArr', salesrepArr);

                var loadcust = record.load({
                    type: 'customer',
                    id: custId

                });

                var cusList = loadcust.getLineCount('salesteam');

                log.debug('cusList', cusList);

                if (cusList && cusList > 0) {

                    for (var j = cusList; j > 0; j--) {

                        log.debug('j', j);

                        loadcust.removeLine({
                            sublistId: 'salesteam',
                            line: j
                        })

                    }
                }


                if (salesrepArr && salesrepArr.length > 0) {

                    for (var l = 0; l < salesrepArr.length; l++) {



                        loadcust.setSublistValue({
                            sublistId: 'salesteam',
                            fieldId: 'employee',
                            line: l,
                            value: salesrepArr[l].newsalesRep
                        })
                        loadcust.setSublistValue({
                            sublistId: 'salesteam',
                            fieldId: 'contribution',
                            line: l,
                            value: salesrepArr[l].contribution
                        })

                        if (salesrepArr[l].isPrimary == 'T') {
                            loadcust.setSublistValue({
                                sublistId: 'salesteam',
                                fieldId: 'isprimary',
                                line: l,
                                value: true
                            })
                        }

                        if (salesrepArr[l].salesRole) {

                            loadcust.setSublistValue({
                                sublistId: 'salesteam',
                                fieldId: 'salesrole',
                                line: l,
                                value: salesrepArr[l].salesRole
                            })
                        }


                    }
                }
                var saveCust = loadcust.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });

                log.debug('saveCust', saveCust);



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
            //reduce: reduce,
            summarize: summarize
        };

    });