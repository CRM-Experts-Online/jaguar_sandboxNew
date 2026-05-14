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

            var poId = '';

            var soId = '';

            try {

                var recObj = scriptContext.newRecord;

                var soId = recObj.getValue('createdfrom')

                var lineCount = recObj.getLineCount('item');
                var newArray = [];
                for (var i = 0; i < lineCount; i++) {

                    var subrec = recObj.getSublistSubrecord({
                        sublistId: 'item',
                        fieldId: 'inventorydetail',
                        line: i
                    });

                    if (subrec) {
                        log.debug('subrec', subrec);

                        var subCount = subrec.getLineCount('inventoryassignment');

                        log.debug('subCount', subCount);

                        var newObj = {};

                        newObj.item = recObj.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: i
                        });

                        newObj.quantity = recObj.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            line: i
                        });

                        newObj.solinenumber = recObj.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'orderline',
                            line: i
                        });

                        newObj.lineNumber = i;

                        var dArray = [];

                        var qArr = [];

                        var larray = [];

                        for (var j = 0; j < subCount; j++) {



                            var detailId = subrec.getSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'issueinventorynumber',
                                line: j
                            });

                            var lotQuantity = subrec.getSublistValue({
                                sublistId: 'inventoryassignment',
                                fieldId: 'quantity',
                                line: j
                            });

                            //var getLotName = lotname(detailId)

                            //larray.push(getLotName)



                            dArray.push(detailId)
                            qArr.push(lotQuantity);
                        }

                        newObj.detailArr = dArray;
                        newObj.qArr = qArr;
                        //newObj.larray = larray;
                    }

                    newArray.push(newObj)

                }

                log.debug('newArray', newArray);

                if (newArray.length > 0) {

                    var lineArr = [];

                    var l = 0;

                    for (var k = 0; k < newArray.length; k++) {

                        var debitObj = {}
                        var creditObj = {}

                        var detailArr = newArray[k].detailArr;
                        if (detailArr.length > 0) {
                            var itemreceiptSearchObj = search.create({
                                type: "itemreceipt",
                                filters: [
                                    ["type", "anyof", "ItemRcpt"],
                                    "AND",
                                    ["mainline", "is", "F"],
                                    "AND",
                                    ["inventorydetail.inventorynumber", "anyof", detailArr],
                                    "AND",
                                    ["item", "anyof", newArray[k].item]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "item",
                                        label: "Item"
                                    }),
                                    search.createColumn({
                                        name: "quantity",
                                        label: "Quantity"
                                    }),
                                    search.createColumn({
                                        name: "inventorynumber",
                                        join: "inventoryDetail",
                                        label: " Number"
                                    }),
                                    search.createColumn({
                                        name: "formulanumeric",
                                        formula: "{amount}/{quantity}",
                                        label: "Formula (Numeric)"
                                    }),
                                    search.createColumn({
                                        name: "amount",
                                        label: "Amount"
                                    }),
                                    search.createColumn({
                                        name: "internalid",
                                        join: "createdFrom",
                                        label: "Internal ID"
                                    })
                                ]
                            });


                            var pResults = itemreceiptSearchObj.run().getRange({
                                start: 0,
                                end: 1000
                            });

                            log.debug('pResults', pResults);



                            if (pResults && pResults.length > 0) {

                                var totalCost = 0;

                                for (var a = 0; a < pResults.length; a++) {

                                    var lcost = pResults[a].getValue({
                                        name: "formulanumeric",
                                        formula: "{amount}/{quantity}",
                                        label: "Formula (Numeric)"
                                    });

                                    var lotNumber = pResults[a].getValue({
                                        name: "inventorynumber",
                                        join: "inventoryDetail",
                                        label: " Number"
                                    });

                                    poId = pResults[a].getValue({
                                        name: "internalid",
                                        join: "createdFrom",
                                        label: "Internal ID"
                                    });

                                    log.debug('lotNumber', lotNumber);

                                    var ifLotnames = newArray[k].detailArr;

                                    var ifQty = newArray[k].qArr;

                                    var findLot = ifLotnames.indexOf(lotNumber);
                                    log.debug('findLot', findLot);

                                    var lQty = ifQty[findLot]
                                    log.debug('lQty', lQty);

                                    var totalQty = newArray[k].quantity;

                                    var percentage = (Number(lQty) / Number(totalQty));

                                    log.debug('percentage', percentage);

                                    var calCost = percentage * Number(lcost);

                                    log.debug('calCost', calCost);

                                    totalCost = Number(totalCost) + Number(calCost)




                                }

                                log.debug('totalCost', totalCost);

                                var fieldLookUp = search.lookupFields({
                                    type: 'lotnumberedinventoryitem',
                                    id: newArray[k].item,
                                    columns: ['assetaccount', 'expenseaccount']
                                });

                                log.debug('fieldLookUp', fieldLookUp);

                                var aAccount = fieldLookUp.assetaccount[0].value
                                var iAccount = fieldLookUp.expenseaccount[0].value

                                log.debug('aAccount', aAccount);
                                log.debug('iAccount', iAccount);

                                //cost = Number(cost) * Number(newArray[k].quantity);

                                if (newArray[k].lineNumber == 0) {

                                    debitObj.cost = totalCost;
                                    debitObj.line = newArray[k].lineNumber;
                                    debitObj.soline = newArray[k].solinenumber;
                                    lineArr.push(debitObj)

                                } else {
                                    debitObj.cost = totalCost;
                                    debitObj.line = newArray[k].lineNumber;
                                    debitObj.soline = newArray[k].solinenumber;

                                    lineArr.push(debitObj)
                                }
                            }



                        }

                        log.debug('lineArr', lineArr);

                        if (lineArr.length > 0) {
                            recObj.setValue('custbody_cost_object', JSON.stringify(lineArr));
                        }




                    }

                }

            } catch (er) {
                log.error('ERROR', er.toString());
            }

            if (poId) {
                var so = record.submitFields({
                    type: record.Type.SALES_ORDER,
                    id: soId,
                    values: {
                        'custbody_related_sales_order': poId
                    }
                });

                var po = record.submitFields({
                    type: 'purchaseorder',
                    id: poId,
                    values: {
                        'custbody_related_sales_order': soId,
                        'custbody_linked_transaction': soId
                    }
                });
            }

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
				
			if(scriptContext.type != 'create'){
					return;
				}

                var recObj = scriptContext.newRecord;

                var Soid = recObj.getValue('createdfrom');


                var customrecord_pmp_packageSearchObj = search.create({
                    type: "customrecord_pmp_package",
                    filters: [
                        ["custrecord_sales_order", "anyof", Soid]
                    ],
                    columns: [
                        search.createColumn({
                            name: "custrecord_bol",
                            label: "BOL"
                        })
                    ]
                });

                var bolRes = customrecord_pmp_packageSearchObj.run().getRange({
                    start: 0,
                    end: 1000
                });

                log.debug('bolRes', bolRes);


                if (bolRes && bolRes.length > 0) {

                    var Bolheader = bolRes[0].getValue('custrecord_bol');

                    if (Bolheader) {



                        var lineCount = recObj.getLineCount('item');

                        for (var i = 0; i < lineCount; i++) {

                            var itemName = recObj.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'itemname',
                                line: i
                            });

                            log.debug('itemName', itemName.toLowerCase());

                            var quantity = recObj.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                line: i
                            });


                            var customrecord_bol_childSearchObj = search.create({
                                type: "customrecord_bol_child",
                                filters: [
                                    ["custrecord_bol_header.name", "is", Bolheader]
                                ],
                                columns: [
                                    search.createColumn({
                                        name: "custrecord_net_gallons_delivered",
                                        label: "Net Gallons Delivered"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_remaining_quantity",
                                        label: "Remaining Quantity"
                                    }),
                                    search.createColumn({
                                        name: "custrecord_sold_as_product_id",
                                        label: "Sold As Product ID"
                                    })
                                ]
                            });

                            var ifBol = customrecord_bol_childSearchObj.run().getRange({
                                start: 0,
                                end: 1000
                            });

                            log.debug('ifBol', ifBol);

                            if (ifBol && ifBol.length > 0) {
                                for (var k = 0; k < ifBol.length; k++) {

                                    var getProduct = ifBol[k].getValue('custrecord_sold_as_product_id');

                                    var netGallons = ifBol[k].getValue('custrecord_net_gallons_delivered');

                                    var remaining = ifBol[k].getValue('custrecord_remaining_quantity');

                                   

                                    log.debug('getProduct', getProduct.toLowerCase());

                                    if (getProduct.toLowerCase() == itemName.toLowerCase()) {
										log.debug('quantity', quantity);
										
										if(quantity > 0){
											
										}else{
											continue;
										}

                                        var childrecord = record.create({
                                            type: 'customrecord_bol_fulfillment',
                                        });
										
										 if (!remaining) {
                                        remaining = Number(netGallons) - Number(quantity)
										 childrecord.setValue('custrecord_quantity', quantity);
                                    } else {
										if(Number(remaining) < Number(quantity)){
											 childrecord.setValue('custrecord_quantity', remaining);											 
											 quantity = Number(quantity) < Number(remaining);
											 remaining = 0;
										}else{
											 remaining = Number(remaining) - Number(quantity)
											 childrecord.setValue('custrecord_quantity', quantity);
										}
                                       
                                    }

                                    log.debug('remaining', remaining);

                                        childrecord.setValue('custrecord_bol_child', ifBol[k].id);
                                        childrecord.setValue('custrecord_sales_order_if', Soid);
                                        childrecord.setValue('custrecord_item', itemName);
                                       
                                        childrecord.setText('custrecord_bolheader', Bolheader);
                                        var saveChild = childrecord.save({
                                            enableSourcing: true,
                                            ignoreMandatoryFields: true
                                        });

                                        var submitChild = record.submitFields({
                                            type: 'customrecord_bol_child',
                                            id: ifBol[k].id,
                                            values: {
                                                'custrecord_remaining_quantity': remaining,

                                            }
                                        });

                                        log.debug('submitChild', submitChild);

                                    }
                                }
                            }




                        }

                    }

                }




            } catch (er) {
                log.error('ERROR', er.toString());
            }

        }

        function lotname(detailId) {
            var inventorynumberSearchObj = search.create({
                type: "inventorynumber",
                filters: [
                    ["internalid", "anyof", detailId]
                ],
                columns: [
                    search.createColumn({
                        name: "inventorynumber",
                        label: "Number"
                    })
                ]
            });

            var pResults = inventorynumberSearchObj.run().getRange({
                start: 0,
                end: 1000
            });

            log.debug('pResults', pResults);

            if (pResults && pResults.length > 0) {
                return pResults[0].getValue('inventorynumber')
            }


        }

        return {
            // beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });