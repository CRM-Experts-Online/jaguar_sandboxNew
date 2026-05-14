/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/search', 'N/ui/serverWidget'],
    /**
     * @param {record} record
     * @param {search} search
     */
    function(record, search, ui) {

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

            try {

                var cForm = scriptContext.form;

                var field = cForm.addField({
                    id: 'custpage_vendor',
                    label: 'Vendor',
                    type: ui.FieldType.LONGTEXT
                    //source:'customsearch_vendor_list'
                });
                log.debug('field', field);


            } catch (er) {
                log.error('ERROR', er.toString());
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
        function beforeSubmit(scriptContext) {
            var rec = scriptContext.newRecord;
            if (rec.type == 'invoice' || rec.type == 'creditmemo') {
                updateDeinedCost(scriptContext);
            }

            if (rec.type == 'salesorder') {
                var customeriD = rec.getValue('entity');
                log.debug('customeriD', customeriD);
                var eType = rec.getValue('custbody_entity_type');

                if (eType == 'Project') {
                    rec.setValue('custbody_project', customeriD);
                }

                if (customeriD) {
                    var getParent = search.lookupFields({
                        type: 'customer',
                        id: customeriD,
                        columns: ['parent']
                    });

                    log.debug('getParent', getParent);

                    if (getParent.parent.length > 0) {
                        var parentId = getParent.parent[0].value
                        log.debug('parentId', parentId);

                        rec.setValue('custbody5', parentId);
                    }
                }

                var Scount = rec.getLineCount('salesteam');
                log.debug('Scount', Scount);

                for (var y = 0; y < Scount; y++) {

                    var slaesRep = rec.getSublistValue({
                        sublistId: 'salesteam',
                        fieldId: 'employee',
                        line: y
                    });


                    var isprimary = rec.getSublistValue({
                        sublistId: 'salesteam',
                        fieldId: 'isprimary',
                        line: y
                    });

                    if (isprimary == false || isprimary == 'F') {
                        log.debug('sales rep2', slaesRep);
                        rec.setValue('custbody_secondary_sales_rep', slaesRep);
                    }



                }



            }


            if (rec.type == 'invoice' || rec.type == 'creditmemo') {

                try {

                    var ccChecked = rec.getValue('custbody86');

                    var sclass = rec.getValue('class');

                    var commPercent = rec.getValue('custbody_commission_header') || 10;

                    var count = rec.getLineCount('item')

                    var totalEstProfit = 0;

                    var totalcost = 0;

                    var totalCommission = 0;

                    var totalCCfee = 0;

                    var totalrev = 0;

                    var cost = rec.getValue('total');

                    var custiD = rec.getValue('entity');

                    var getParent = search.lookupFields({
                        type: 'customer',
                        id: custiD,
                        columns: ['parent']
                    });

                    log.debug('getParent', getParent);

                    if (getParent.parent.length > 0) {
                        var parentId = getParent.parent[0].value
                        log.debug('parentId', parentId);

                        rec.setValue('custbody5', parentId);
                    }




                    for (var x = 0; x < count; x++) {

                        var amountRev = rec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            line: x
                        })

                        var aRate = rec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'rate',
                            line: x
                        })
                        rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_custom_rate',
                            value: aRate,
                            line: x
                        })

                        rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'class',
                            value: sclass,
                            line: x
                        })

                        rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_invoice_amount',
                            value: amountRev,
                            line: x
                        })

                        var itemType = rec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'itemtype',
                            line: x
                        })

                        var qty = rec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            line: x
                        })

                        var costRate = rec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'costestimaterate',
                            line: x
                        })

                        var customCostRate = rec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol2',
                            line: x
                        })

                        log.debug('customCostRate', customCostRate);

                        if (!customCostRate) {

                            customCostRate = costRate;
                            /* rec.setSublistValue({
                                 sublistId: 'item',
                                 fieldId: 'custcol2',
                                 value: costRate,
                                 line: x
                             })*/

                        }


                        /*rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol3',
                            value: parseFloat(customCostRate) * qty,
                            line: x
                        })*/

                        var grofit = (parseFloat(customCostRate) * qty);

                        grofit = amountRev - grofit;

                        rec.setSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_gross_profit',
                            value: grofit.toFixed(2),
                            line: x
                        })

                        if (itemType == 'OthCharge') {
                            log.debug('othercharge');
                            continue;
                        }


                        var amountRev = rec.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            line: x
                        })

                        totalrev = totalrev + amountRev;




                        if (commPercent) {

                            var amt = rec.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'amount',
                                line: x
                            })
                            log.debug('amt', amt);

                            var cost = rec.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol3',
                                line: x
                            }) || 0;
                            log.debug('cost', cost);

                            var estProfit = parseFloat(amt) - parseFloat(cost);

                            totalcost = parseFloat(totalcost) + parseFloat(cost);

                            log.debug('estProfit', estProfit);


                            if (estProfit && commPercent) {




                                var total = parseFloat(estProfit) * parseFloat(commPercent);

                                totalEstProfit = parseFloat(totalEstProfit) + estProfit;

                                var totalAmt = total / 100;

                                log.debug('total', total);

                                log.debug('totalAmt', totalAmt);

                                rec.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol_commission_amount',
                                    value: totalAmt,
                                    line: x
                                })

                                totalCommission = parseFloat(totalCommission) + totalAmt;
                            }
                        }


                    }



                    rec.setValue('custbody_total_cost', totalcost);

                    rec.setValue('custbody_total_revenue', totalrev);

                    var dDiff = parseFloat(rec.getValue('custbody_total_revenue')) - parseFloat(totalcost);

                    log.debug('dDiff', dDiff);

                    rec.setValue('custbody_dollar_diffrence', dDiff);




                    if (ccChecked) {
                        var getfee = rec.getValue('custbody87');

                        var ccCalculated = parseFloat(rec.getValue('custbody_total_revenue')) * parseFloat(0.024);

                        rec.setValue('custbody87', 0.024);

                        rec.setValue('custbody_total_cc_fee', ccCalculated);

                        if (rec.type == 'creditmemo') {
                            rec.setValue('custbody_estimated_profit', parseFloat(totalEstProfit));

                            rec.setValue('custbody_dollar_diffrence', parseFloat(dDiff) - parseFloat(ccCalculated));
                        } else {
                            rec.setValue('custbody_estimated_profit', parseFloat(totalEstProfit) - parseFloat(ccCalculated));

                            rec.setValue('custbody_dollar_diffrence', parseFloat(dDiff) - parseFloat(ccCalculated));
                        }




                    } else {
                        rec.setValue('custbody_total_cc_fee', 0);

                        rec.setValue('custbody_estimated_profit', totalEstProfit);
                    }

                    var nCommission = rec.getValue('custbody_dollar_diffrence') * commPercent;

                    nCommission = nCommission / 100;

                    log.debug('nCommission', nCommission);

                    if (rec.type == 'creditmemo') {
                        rec.setValue('custbody_total_commission', (nCommission * -1));
                    } else {
                        rec.setValue('custbody_total_commission', nCommission);

                    }




                    var getProject = searchProject(rec.getValue('entity'));


                    var Scount = rec.getLineCount('salesteam');
                    log.debug('Scount', Scount);
                    if (getProject.length == 1) {
                        var sComm = nCommission / 1;

                        if (rec.type == 'creditmemo') {
                            rec.setValue('custbody_sales_rep_commission', (sComm * -1));
                        } else {
                            rec.setValue('custbody_sales_rep_commission', sComm);
                        }


                    } else if (getProject.length == 2) {
                        var sComm = nCommission / 2;

                        if (rec.type == 'creditmemo') {
                            rec.setValue('custbody_sales_rep_commission', (sComm * -1));
                        } else {
                            rec.setValue('custbody_sales_rep_commission', sComm);
                        }
                    } else {

                    }

                    if (getProject.length > 0) {

                        var salesreplist = [];

                        var secondaryRep = '';

                        for (var y = 0; y < Scount; y++) {

                            var slaesRep = rec.getSublistValue({
                                sublistId: 'salesteam',
                                fieldId: 'employee',
                                line: y
                            });


                            var isprimary = rec.getSublistValue({
                                sublistId: 'salesteam',
                                fieldId: 'isprimary',
                                line: y
                            });
                            if (isprimary == true || isprimary == 'T') {

                                for (var x = 0; x < getProject.length; x++) {

                                    var sales1 = getProject[x];

                                    if (sales1 == slaesRep) {

                                        var objs = {};

                                        objs.id = sales1;

                                        objs.primary = true;

                                        objs.contribution = 50;


                                        salesreplist.push(objs)

                                    } else {
                                        log.debug('sales1', sales1);
                                        secondaryRep = sales1;
                                        var objs = {};
                                        objs.id = sales1;

                                        objs.primary = false;

                                        objs.contribution = 50;


                                        salesreplist.push(objs)
                                    }
                                }


                            } else {
                                secondaryRep = rec.getSublistValue({
                                    sublistId: 'salesteam',
                                    fieldId: 'employee',
                                    line: y
                                });

                                break;
                            }

                        }

                        rec.setValue('custbody_secondary_sales_rep', secondaryRep);
                    }




                    log.debug('salesreplist', salesreplist);

                    log.debug('Scount', Scount);

                    if (Scount == 1) {
                        var contribution = 100;
                        if (salesreplist && salesreplist.length == 1) {
                            contribution = 100
                        } else if (salesreplist && salesreplist.length == 2) {
                            contribution = 50
                        }
                        log.debug('contribution', contribution);

                        if (salesreplist && salesreplist.length > 0) {
                            for (var l = 0; l < salesreplist.length; l++) {




                                if (salesreplist[l].primary == true) {

                                    rec.setSublistValue({
                                        sublistId: 'salesteam',
                                        fieldId: 'employee',
                                        line: l,
                                        value: salesreplist[l].id
                                    })

                                    rec.setSublistValue({
                                        sublistId: 'salesteam',
                                        fieldId: 'contribution',
                                        line: l,
                                        value: contribution
                                    })

                                    rec.setSublistValue({
                                        sublistId: 'salesteam',
                                        fieldId: 'isprimary',
                                        line: l,
                                        value: true
                                    })
                                    rec.setSublistValue({
                                        sublistId: 'salesteam',
                                        fieldId: 'salesrole',
                                        line: l,
                                        value: -2
                                    })

                                } else {
                                    rec.setSublistValue({
                                        sublistId: 'salesteam',
                                        fieldId: 'employee',
                                        line: l,
                                        value: salesreplist[l].id
                                    })
                                    rec.setSublistValue({
                                        sublistId: 'salesteam',
                                        fieldId: 'contribution',
                                        line: l,
                                        value: contribution
                                    })

                                    rec.setSublistValue({
                                        sublistId: 'salesteam',
                                        fieldId: 'salesrole',
                                        line: l,
                                        value: -2
                                    })
                                }

                            }
                        }


                    }




                } catch (er) {

                    log.error('ERROR', er.toString());
                }
            } else {
                if (rec.type == 'salesorder') {
                    try {
                        var sclass = rec.getValue('class');
                        var count = rec.getLineCount('item');

                        var entityId = rec.getValue('entity');


                        var custObj = record.load({
                            type: 'customer',
                            id: entityId
                        });



                        var sList = rec.getLineCount('salesteam');

                        log.debug('sList', sList);



                        var cSlist = custObj.getLineCount('salesteam');

                        log.debug('cSlist', cSlist);

                        if (cSlist && cSlist > 0) {

                            for (var y = 0; y < cSlist; y++) {

                                var eId = custObj.getSublistValue({
                                    sublistId: 'salesteam',
                                    fieldId: 'employee',
                                    line: y
                                });

                                var isPrimary = custObj.getSublistValue({
                                    sublistId: 'salesteam',
                                    fieldId: 'isprimary',
                                    line: y
                                });

                                var contribution = custObj.getSublistValue({
                                    sublistId: 'salesteam',
                                    fieldId: 'contribution',
                                    line: y
                                });

                                var salesRole = custObj.getSublistValue({
                                    sublistId: 'salesteam',
                                    fieldId: 'salesrole',
                                    line: y
                                });

                                rec.setSublistValue({
                                    sublistId: 'salesteam',
                                    fieldId: 'employee',
                                    line: y,
                                    value: eId
                                })
                                rec.setSublistValue({
                                    sublistId: 'salesteam',
                                    fieldId: 'contribution',
                                    line: y,
                                    value: contribution
                                })

                                if (isPrimary == 'T' || isPrimary == true) {
                                    rec.setSublistValue({
                                        sublistId: 'salesteam',
                                        fieldId: 'isprimary',
                                        line: y,
                                        value: true
                                    })
                                }

                                if (salesRole) {

                                    rec.setSublistValue({
                                        sublistId: 'salesteam',
                                        fieldId: 'salesrole',
                                        line: y,
                                        value: salesRole
                                    })
                                }


                            }
                        }


                        for (var x = 0; x < count; x++) {

                            var amountRev = rec.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'amount',
                                line: x
                            })
                            rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'class',
                                value: sclass,
                                line: x
                            });

                            rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_bill_amount',
                                value: amountRev,
                                line: x
                            });


                            var qty = rec.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                line: x
                            })


                            var costRate = rec.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'rate',
                                line: x
                            })

                            var customCostRate = rec.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol2',
                                line: x
                            })

                            if (!customCostRate) {

                                customCostRate = costRate;
                                rec.setSublistValue({
                                    sublistId: 'item',
                                    fieldId: 'custcol2',
                                    value: costRate,
                                    line: x
                                })

                            }


                            rec.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol3',
                                value: parseFloat(customCostRate) * qty,
                                line: x
                            })

                        }



                    } catch (er) {

                        log.error('error', er.toString());
                    }
                }

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

                var recObj = scriptContext.newRecord;

                var soId = recObj.getValue('custbody_linked_transaction');

                if (recObj.type != 'invoice' && recObj.type != 'creditmemo') {
                    return;
                }

                if (recObj.type == 'invoice') {

                    var transactionSearchObj = search.create({
                        type: "transaction",
                        filters: [
                            ["mainline", "is", "F"],
                            "AND",
                            ["custbody_linked_transaction", "anyof", soId],
                            "AND",
                            ["type", "anyof", "VendBill", "CustCred", "CustInvc"],
                            "AND",
                            ["item.type", "noneof", "OthCharge"],
                            "AND",
                            ["taxline", "is", "F"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "type",
                                summary: "GROUP",
                                label: "Type"
                            }),
                            search.createColumn({
                                name: "netamount",
                                summary: "SUM",
                                label: "Amount (Net)"
                            })
                        ]
                    });

                    var runSearch = transactionSearchObj.run().getRange(0, 100);

                    var invTotal = 0;

                    var billTotal = 0;
                    log.debug('runSearch', runSearch);
                    if (runSearch && runSearch.length > 0) {
                        for (var x = 0; x < runSearch.length; x++) {

                            var rType = runSearch[x].getText({
                                name: "type",
                                summary: "GROUP",
                                label: "Type"
                            })

                            log.debug('rType', rType)

                            var amt = runSearch[x].getValue({
                                name: "netamount",
                                summary: "SUM",
                                label: "Amount (Net)"
                            })

                            amt = Math.abs(amt);

                            log.debug('amt', amt);

                            if (rType == 'Invoice') {
                                invTotal = invTotal + Number(amt)
                            }

                            if (rType == 'Bill') {
                                billTotal = billTotal + Number(amt)
                            }


                        }
                        log.debug('invTotal', invTotal);
                        log.debug('billTotal', billTotal);

                        var diff = invTotal - billTotal;
                        log.debug('diff', diff);

                        // Submit a new value for a sales order's memo field.
                        var id = record.submitFields({
                            type: 'invoice',
                            id: recObj.id,
                            values: {
                                'custbody_dollar_diffrence': diff
                            }
                        });


                    }
                }

                if (recObj.type == 'creditmemo') {
                    var invoiceSearchObj = search.create({
                        type: "invoice",
                        filters: [
                            ["mainline", "is", "T"],
                            "AND",
                            ["custbody_linked_transaction", "anyof", soId],
                            "AND",
                            ["type", "anyof", "CustInvc"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custbody_total_cost",
                                label: "Total Cost"
                            }),
                            search.createColumn({
                                name: "custbody_estimated_profit",
                                label: "Estimated Profit"
                            }),
                            search.createColumn({
                                name: "custbody_dollar_diffrence",
                                label: "($) DIFFERENCE"
                            }),
                          search.createColumn({name: "custbody_sales_rep_commission", label: "Sales Rep Commission"}),
      search.createColumn({name: "custbody_total_commission", label: "Total Commission"}),
                                search.createColumn({name: "custbody_total_revenue", label: "Total Revenue "})
                        ]
                    });

                    var runSearch = invoiceSearchObj.run().getRange(0, 100);
                    log.debug('runSearch', runSearch);

                    if (runSearch && runSearch.length > 0) {

                        var invCost = runSearch[0].getValue('custbody_total_cost')

                        var invProfit = runSearch[0].getValue('custbody_estimated_profit')

                        var invDollar = runSearch[0].getValue('custbody_dollar_diffrence')

                       var tComm = runSearch[0].getValue('custbody_total_commission')

                       var sComm = runSearch[0].getValue('custbody_sales_rep_commission')

                       var tRev = runSearch[0].getValue('custbody_total_revenue')

                      if(tComm){
                        tComm = Number(tComm)*-1
                      }

                       if(sComm){
                        sComm = Number(sComm)*-1
                      }

                       if(invCost){
                        invCost = Number(invCost)*-1
                      }

                       if(invProfit){
                        invProfit = Number(invProfit)*-1
                      }

                       if(invDollar){
                        invDollar = Number(invDollar)*-1
                      }

                       if(tRev){
                        tRev = Number(tRev)*-1
                      }

                        var id = record.submitFields({
                            type: 'creditmemo',
                            id: recObj.id,
                            values: {
                                'custbody_total_cost': invCost,
                                'custbody_estimated_profit': invProfit,
                                'custbody_dollar_diffrence': invDollar,
                              'custbody_total_commission':tComm,
                              'custbody_sales_rep_commission':sComm,
                              'custbody_total_revenue':tRev
                            }
                        });
                    }

                }




            } catch (er) {
                log.error('ERROR', er.toString());
            }

        }


        function updateDeinedCost(scriptContext) {

            try {

                var rec = scriptContext.newRecord;

                var count = rec.getLineCount('item');

                var rClass = rec.getValue('class');

                if (rClass == 2) {

                    getvendorBill(scriptContext);
                    return;
                }

                log.debug('count-so', count);

                var soId = rec.getValue('createdfrom');

                var costLines = '';

                if (soId) {

                    var itemfulfillmentSearchObj = search.create({
                        type: "itemfulfillment",
                        filters: [
                            ["type", "anyof", "ItemShip"],
                            "AND",
                            ["createdfrom", "anyof", soId],
                            "AND",
                            ["mainline", "is", "T"]
                        ],
                        columns: [
                            search.createColumn({
                                name: "custbody_cost_object",
                                label: "Cost Object"
                            })
                        ]
                    });

                    var runSearch = itemfulfillmentSearchObj.run().getRange(0, 100);
                    log.debug('runSearch', runSearch);
                    if (runSearch && runSearch.length > 0) {
                        costLines = runSearch[0].getValue('custbody_cost_object');
                    }



                }

                if (costLines) {

                    costLines = JSON.parse(costLines);
                    log.debug('costLines', costLines)
                }

                for (var s = 0; s < count; s++) {

                    var item = rec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: s
                    });
                    var qty = rec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        line: s
                    });

                    var sLine = rec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'orderline',
                        line: s
                    });
                    log.debug('item', item);

                    var aCost = parseFloat(getCost(item));
                    if (!aCost) {
                        aCost = 0;
                    }

                    if (costLines) {

                        if (costLines && costLines.length > 0) {

                            for (var i = 0; i < costLines.length; i++) {

                                var soLine = costLines[i].soline;

                                log.debug('soLine', soLine + '--' + sLine)

                                if (soLine == sLine) {
                                    aCost = costLines[i].cost;

                                    break;
                                }


                            }
                        }
                    }

                    log.debug('aCost', aCost);

                    var tCost = parseFloat(aCost) * parseFloat(qty);
                    aCost = aCost.toFixed(5)
                    tCost = tCost.toFixed(5)
                    log.debug('aCost', aCost);
                    log.debug('tCost', tCost);
                    rec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol2',
                        value: aCost,
                        line: s
                    })
                    rec.setSublistValue({
                        sublistId: 'item',
                        fieldId: 'custcol3',
                        value: tCost,
                        line: s
                    })



                }

            } catch (er) {

                log.debug('ERROR-definedcost', er.toString());
            }
        }


        function getCost(id) {

            var itemSearchObj = search.create({
                type: "item",
                filters: [
                    ["internalid", "anyof", id]
                ],
                columns: [
                    search.createColumn({
                        name: "type",
                        label: "Type"
                    }),
                    search.createColumn({
                        name: "custitem_jaguar_item_categorization",
                        label: "Item Categorization"
                    }),
                    search.createColumn({
                        name: "costestimatetype",
                        label: "Cost Estimate Type"
                    }),
                    search.createColumn({
                        name: "costestimate",
                        label: "Item Defined Cost"
                    }),
                    search.createColumn({
                        name: "cost",
                        label: "Purchase Price"
                    }),
                    search.createColumn({
                        name: "averagecost",
                        label: "Average Cost"
                    }),
                    search.createColumn({
                        name: "lastpurchaseprice",
                        label: "Last Purchase Price"
                    })
                ]
            });


            var runSearch = itemSearchObj.run().getRange(0, 100);
            log.debug('runSearch', runSearch);

            if (runSearch && runSearch.length > 0) {

                var type = runSearch[0].getValue('type');

                var category = runSearch[0].getText('custitem_jaguar_item_categorization');

                var costType = runSearch[0].getValue('costestimatetype');

                var definedCost = runSearch[0].getValue('costestimate');

                var purchasePrice = runSearch[0].getValue('cost');

                var averageCost = runSearch[0].getValue('averagecost');

                var lastPurcahsePrice = runSearch[0].getValue('lastpurchaseprice');

                var actualcost = 0;
                var ind = -1;
                if (category) {
                    ind = category.indexOf('Fuel');
                    log.debug('ind', ind);
                }
                if (type == 'InvtPart' && costType == 'Purchase Price') {
                    actualcost = purchasePrice || lastPurcahsePrice;
                }
                if (type == 'InvtPart' && costType == 'Average Cost') {
                    actualcost = averageCost
                }
                if (type == 'Service') {
                    actualcost = definedCost
                }
                if (type == 'NonInvtPart' && costType == 'Item Defined Cost') {
                    actualcost = definedCost;
                }
                log.debug('actualcost', actualcost);
                return actualcost
            }


        }


        function searchProject(proId) {

            var sArray = [];

            var jobSearchObj = search.create({
                type: "customer",
                filters: [
                    ["internalid", "anyof", proId],
                    "AND",
                    ["contribution", "greaterthan", "0"]
                ],
                columns: [
                    search.createColumn({
                        name: "salesteammember",
                        label: "Sales Team Member"
                    })
                ]
            });

            var runSearch = jobSearchObj.run().getRange(0, 100);
            log.debug('runSearch', runSearch);
            if (runSearch && runSearch.length > 0) {

                for (var i = 0; i < runSearch.length; i++) {
                    var customId = runSearch[i].getValue('salesteammember');

                    sArray.push(customId);
                }

                log.debug('sArray', sArray);
                return sArray

            } else {
                return sArray;
            }




        }

        function getvendorBill(scriptContext) {

            var recObj = scriptContext.newRecord;

            var linkedId = recObj.getValue('custbody_linked_transaction');

            var vendorbillSearchObj = search.create({
                type: "vendorbill",
                filters: [
                    ["type", "anyof", "VendBill"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["custbody_linked_transaction", "anyof", linkedId]
                ],
                columns: [
                    search.createColumn({
                        name: "internalid",
                        label: "Internal ID"
                    })
                ]
            });
            var runSearch = vendorbillSearchObj.run().getRange(0, 100);
            log.debug('runSearch', runSearch);
            if (runSearch && runSearch.length > 0) {

                var billrec = runSearch[0].id;

                log.debug('billrec', billrec);

                var billRec = record.load({
                    type: record.Type.VENDOR_BILL,
                    id: billrec,
                    isDynamic: true
                });

                var lineCount = billRec.getLineCount({
                    sublistId: 'item'
                });

                // use 'expense' if updating expense lines

                var invLines = recObj.getLineCount({
                    sublistId: 'item'
                });

                for (var i = 0; i < lineCount; i++) {
                    var item = billRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: i
                    });

                    var aCost = billRec.getSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        line: i
                    });

                    for (var j = 0; j < lineCount; j++) {
                        var invitem = recObj.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: j
                        });

                        if (invitem == item) {


                            var qty = recObj.getSublistValue({
                                sublistId: 'item',
                                fieldId: 'quantity',
                                line: j
                            });


                            log.debug('aCost', aCost);

                            var tCost = parseFloat(aCost) * parseFloat(qty);
                            aCost = aCost.toFixed(5)
                            tCost = tCost.toFixed(5)
                            log.debug('aCost', aCost);
                            log.debug('tCost', tCost);
                            recObj.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol2',
                                value: aCost,
                                line: j
                            })
                            recObj.setSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol3',
                                value: tCost,
                                line: j
                            })

                        }

                    }

                }


            }



        }

        return {
            // beforeLoad: beforeLoad,
            beforeSubmit: beforeSubmit,
            afterSubmit: afterSubmit
        };

    });