/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search'],
    /**
     * @param {record} record
     * @param {search} search
     */
    function(record, search) {

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
        function beforeSubmit(scriptContext) {

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
        function afterSubmit(scriptContext) {

            try {

                var recObj = scriptContext.newRecord;

                var createdFrom = recObj.getValue('createdfrom');

                var customrecord_pmp_packageSearchObj = search.create({
                    type: "customrecord_pmp_package",
                    filters: [
                        ["custrecord_sales_order", "anyof", createdFrom]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        })
                    ]
                });

                var sResults = customrecord_pmp_packageSearchObj.run().getRange({
                    start: 0,
                    end: 1000
                });

                log.debug('sResults', sResults);

                if (sResults && sResults.length > 0) {

                    for (var j = 0; j < sResults.length; j++) {

                        var newFeatureRecord = record.load({
                            type: 'customrecord_pmp_package',
                            id: sResults[j].id
                        });
                        newFeatureRecord.setValue('custrecord_item_fulfillment', recObj.id);

                        newFeatureRecord.save();

                    }
                }



            } catch (er) {
                log.error('ERROR', er.toString());
            }

        }

        return {
            //beforeLoad: beforeLoad,
           // beforeSubmit: beforeSubmit
            afterSubmit: afterSubmit
        };

    });