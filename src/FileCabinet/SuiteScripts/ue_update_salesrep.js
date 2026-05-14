/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/runtime', 'N/task'],
    /**
     * @param {record} record
     * @param {search} search
     */
    function(record, search, runtime, task) {

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type
         * @param {Form} scriptContext.form - Current form
         * @Since 2015.2
         */
        function beforeLoad(scriptContext) {

        }

        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */


        /**
         * Function definition to be triggered before record is loaded.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type
         * @Since 2015.2
         */
        function beforeSubmit(scriptContext) {

            try {

                var recObj = scriptContext.newRecord;

                var oldRecObj = scriptContext.oldRecord;

                var newList = recObj.getLineCount('salesteam');

                var oldList = oldRecObj.getLineCount('salesteam');
				
				var secondarySalesrep;

                log.debug('newList', newList);

                log.debug('oldList', oldList);

                var salesrepChanges = false;

                var salesrepArr = [];

                for (var i = 0; i < newList; i++) {

                    var salesrepnotFound = false;

                    var newsalesRep = recObj.getSublistValue({
                        sublistId: 'salesteam',
                        fieldId: 'employee',
                        line: i
                    });

                    var contribution = recObj.getSublistValue({
                        sublistId: 'salesteam',
                        fieldId: 'contribution',
                        line: i
                    });

                    var isPrimary = recObj.getSublistValue({
                        sublistId: 'salesteam',
                        fieldId: 'isprimary',
                        line: i
                    });

                    var salesRole = recObj.getSublistValue({
                        sublistId: 'salesteam',
                        fieldId: 'salesrole',
                        line: i
                    });
					
					if(isPrimary == false || isPrimary == 'F'){
						
						secondarySalesrep = newsalesRep;
					}

                    var obj = {};

                    obj.newsalesRep = newsalesRep;

                    obj.contribution = contribution;

                    obj.isPrimary = isPrimary;

                    obj.salesRole = salesRole;

                    salesrepArr.push(obj);

                    for (var k = 0; k < oldList; k++) {

                        var oldsalesRep = oldRecObj.getSublistValue({
                            sublistId: 'salesteam',
                            fieldId: 'employee',
                            line: k
                        });

                        if (oldsalesRep == newsalesRep) {
                            salesrepnotFound = true;
                            continue;
                        }
                    }

                    if (salesrepnotFound == false) {
                        salesrepChanges = true;
                    }


                }

                var recId = recObj.id;
				
				if(secondarySalesrep){
									recObj.setValue('custentity_secondary_salesrep', secondarySalesrep);
				}
				

                if (salesrepChanges == true) {

                    log.debug('salesrepChanges', salesrepChanges);

                    var customerSearchObj = search.create({
                        type: "customer",
                        filters: [
                            ["parentcustomer.internalid", "anyof", recId]
                        ],
                        columns: [
                            search.createColumn({
                                name: "entityid",
                                sort: search.Sort.ASC,
                                label: "ID"
                            })
                        ]
                    });
                    var results = customerSearchObj.run().getRange({
                        start: 0,
                        end: 1000
                    });

                    if (results && results.length > 0) {

                        log.debug('results', results.length);

                        if (results.length < 20) {

                            for (var i = 0; i < results.length; i++) {

                                var childId = results[i].id;

                                var loadcust = record.load({
                                    type: 'customer',
                                    id: childId

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

                            }


                        } else {

                            //call map/reduce

                            var scriptObj = runtime.getCurrentScript();

                            var mapReduceScriptId = scriptObj.getParameter({
                                name: 'custscript_scriptid'
                            });

                            var depId = scriptObj.getParameter({
                                name: 'custscript_deploymentid'
                            });



                            var valueObj = {};

                            valueObj.parentId = recObj.id;

                            valueObj.salesArr = salesrepArr;

                            if (salesrepArr && salesrepArr.length > 0) {
                                var mrTask = task.create({
                                    taskType: task.TaskType.MAP_REDUCE
                                });
                                mrTask.scriptId = mapReduceScriptId;
                                mrTask.deploymentId = depId;
                                mrTask.params = {
                                    'custscript_value_object': valueObj
                                };
                                var mrTaskId = mrTask.submit();
                            }


                        }

                    }
                }



            } catch (er) {

                log.error('ERROR', er.toString());

            }

        }


        function getChildRecords() {



        }

        return {
            // beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit
            //afterSubmit: afterSubmit
        };

    });