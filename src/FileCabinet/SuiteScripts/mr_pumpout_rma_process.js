/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define([
    'N/search',
    'N/record',
    'N/log',
    'N/runtime'
], (search, record, log, runtime) => {


    /**************************************************************************
     * GET INPUT DATA -- get all pmp records extra changes additional changes to test workflow -new 
	 test1, test2, test3, test4,test5
     **************************************************************************/
    function getInputData() {

        return search.create({
            type: "customrecord_pmp_package",
            filters: [
                ["custrecord_bol", "startswith", "D"],
                "AND",
                ["custrecord_gallons", "contains", "-"],
                "AND",
                ["internalid", "anyof", "110411"],
                "AND",
                ["custrecord_sales_order.mainline", "is", "T"]
            ],
            columns: [
                search.createColumn({
                    name: "internalid",
                    label: "Internal ID"
                }),
                search.createColumn({
                    name: "entity",
                    join: "CUSTRECORD_SALES_ORDER",
                    label: "Name"
                }),
                search.createColumn({
                    name: "custrecord_gallons",
                    label: "Gallons"
                }),
                search.createColumn({
                    name: "custrecord_producttype",
                    label: "ProductType"
                }),
                search.createColumn({
                    name: "location",
                    join: "CUSTRECORD_SALES_ORDER",
                    label: "Location"
                }),
                search.createColumn({
                    name: "class",
                    join: "CUSTRECORD_SALES_ORDER",
                    label: "Class"
                })
            ]
        });

    }

    /**************************************************************************
     * MAP
     **************************************************************************/
    function map(context) {

        var result = JSON.parse(context.value);

        log.debug('result', result);

        var values = result.values;

        context.write({

            key: result.id,

            value: {

                pmpId: result.id,

                customer: getValue(values['entity.CUSTRECORD_SALES_ORDER']),

                item: getValue(values['custrecord_producttype']),

                location: getValue(values['location.CUSTRECORD_SALES_ORDER']),

                class: getValue(values['class.CUSTRECORD_SALES_ORDER']),

                qty: Math.abs(Number(getValue(values['custrecord_gallons']))),

            }

        });

    }

    /**************************************************************************
     * REDUCE
     **************************************************************************/
    function reduce(context) {

        var data = JSON.parse(context.values[0]);

        log.debug('data', data);

        try {

            var rmaId = createStandaloneRMA(data);

              record.submitFields({
                  type:'customrecord_pmp_package',
                  id: data.pmpId,
                  values: {
                      'custrecord_pmp_rma': rmaId,
                      'custrecord_pmp_error': ''
                  }
              });

            log.audit('RMA Created', {PMP: data.pmpId,RMA: rmaId});

        } catch (e) {

            log.error('PMP ' + data.pmpId, e);

            record.submitFields({
                type: 'customrecord_pmp_package',
                id: data.pmpId,
                values: {
                   'custrecord_pmp_error': e.message || e.toString()
                }

            });

        }

    }

    /**************************************************************************
     * CREATE RMA
     **************************************************************************/
    function createStandaloneRMA(data) {

        var rma = record.create({
            type: record.Type.RETURN_AUTHORIZATION,
            isDynamic: true
        });

        // Customer
        rma.setValue({
            fieldId: 'entity',
            value: data.customer
        });

        // Transaction Date
        rma.setValue({
            fieldId: 'trandate',
            value: new Date()
        });

        rma.setValue({
            fieldId: 'location',
            value: data.location
        });

        rma.setValue({
            fieldId: 'class',
            value: data.class
        });

        rma.setValue({
            fieldId: 'memo',
            value: 'Created automatically from PMP Record #' + data.pmpId
        });

        rma.selectNewLine({
            sublistId: 'item'
        });

        var itemId = findItem(data.item)

        rma.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'item',
            value: itemId
        });

        rma.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'quantity',
            value: data.qty
        });
		
		rma.setCurrentSublistValue({
            sublistId: 'item',
            fieldId: 'rate',
            value: 0
        });

        rma.commitLine({
            sublistId: 'item'
        });

        return rma.save({
            enableSourcing: true,
            ignoreMandatoryFields: false
        });

    }

    /**************************************************************************
     * SUMMARIZE
     **************************************************************************/
    function summarize(summary) {

        log.audit('Usage', summary.usage);

        log.audit('Concurrency', summary.concurrency);

        log.audit('Yields', summary.yields);

    }

    /**************************************************************************
     * HELPER
     **************************************************************************/
    function getValue(value) {

        if (value == null)
            return '';

        if (typeof value === 'object') {

            if (value.value !== undefined)
                return value.value;

            if (value.text !== undefined)
                return value.text;
        }

        return value;

    }

    function findItem(itemName) {
        var itemSearchObj = search.create({
            type: "item",
            filters: [
                ["name", "is", itemName]
            ],
            columns: [
                search.createColumn({
                    name: "internalid",
                    label: "Internal ID"
                })
            ]
        });

        var sResults = itemSearchObj.run().getRange({
            start: 0,
            end: 1000
        });

        log.debug('sResults', sResults);



        if (sResults && sResults.length > 0) {

            var itemID = sResults[0].getValue('internalid')

            return itemID;


        } else {
            return null;
        }



    }

    return {

        getInputData: getInputData,

        map: map,

        reduce: reduce,

        summarize: summarize

    };

});