/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/search', 'N/record', 'N/log'], function(search, record, log) {

    /* ========================
       GET INPUT DATA
    ========================= */
    function getInputData() {

        var customrecord_transaction_reportSearchObj = search.create({
            type: "customrecord_transaction_report",
            filters: [
                ["custrecord_related_po", "anyof", "@NONE@"],
                "AND",
                ["custrecord_parent_vendor", "noneof", "@NONE@"],
                "AND",
                ["created", "onorafter", "03/01/2026 12:00 am", "03/01/2026 12:00 am"]
            ],
            columns: [
                search.createColumn({
                    name: "internalid",
                    label: "Internal ID"
                }),
                search.createColumn({
                    name: "custrecord_bought_as_product_id",
                    join: "CUSTRECORD_BOL_HEADER",
                    label: "Bought As Product ID"
                }),
                search.createColumn({
                    name: "custrecord_gross_gallons_delivered",
                    join: "CUSTRECORD_BOL_HEADER",
                    label: "Net Gallons Delivered"
                }),
                search.createColumn({
                    name: "custrecord_parent_vendor",
                    label: "Parent Vendor"
                }),
                search.createColumn({
                    name: "custrecord_trans_report_bol_num",
                    label: "BOL Number"
                }),
                search.createColumn({
                    name: "custrecord_location_id",
                    label: "Location"
                }),
                search.createColumn({
                    name: "custrecord_trans_report_terminal_name",
                    label: "Terminal Name"
                }),
                search.createColumn({
                    name: "custrecord_trans_report_terminal_id",
                    label: "Terminal i.d."
                }),
                search.createColumn({
                    name: "custrecord_trans_report_ternimal_num",
                    label: "Terminal Number"
                }),
                search.createColumn({
                    name: "custrecord_trans_report_supplier_name",
                    label: "Supplier Name"
                }),
                search.createColumn({
                    name: "custrecord_trans_report_supplier_num",
                    label: "Supplier Number"
                }),
                search.createColumn({
                    name: "custrecord_trans_report_supplier_id",
                    label: "Supplier i.d."
                })



            ]
        });
        return customrecord_transaction_reportSearchObj;
    }


    /* ========================
       MAP STAGE
    ========================= */
    function map(context) {
        try {
            var result = JSON.parse(context.value);

            context.write({
                key: result.id,
                value: result.values
            });

        } catch (e) {
            log.error('Map Error', e);
        }
    }


    /* ========================
       REDUCE STAGE
    ========================= */
    function reduce(context) {
        var bolId;
        try {

            var actauLlines = [];

            var reduceLen = context.values.length;

            log.debug('reduceLen', reduceLen);


            if (reduceLen > 0) {

                for (var j = 0; j < reduceLen; j++) {
                    var actauLline = JSON.parse(context.values[j]);
                    log.debug('actauLline', actauLline);

                    actauLlines.push(actauLline);
                }
            }

            log.debug('actauLlines', actauLlines.length);

            if (actauLlines.length > 0) {

                var vendor = actauLlines[0].custrecord_parent_vendor.value;
                bolId = actauLlines[0].internalid.value;
                var bolNumber = actauLlines[0].custrecord_trans_report_bol_num;
                var locationId = actauLlines[0].custrecord_location_id.value;
                log.debug('locationId', locationId);
                var terminalName = actauLlines[0].custrecord_trans_report_terminal_name;
                var terminalNumber = actauLlines[0].custrecord_trans_report_ternimal_num;
                var TerminalId = actauLlines[0].custrecord_trans_report_terminal_id;
                var bolInternalId = actauLlines[0].internalid.value;
                var supplierName = actauLlines[0].custrecord_trans_report_supplier_name;
                var supplierNumber = actauLlines[0].custrecord_trans_report_supplier_num;
                var supplierId = actauLlines[0].custrecord_trans_report_supplier_id;

                var tranNumber = 'PO' + bolNumber;
                log.debug('tranNumber', tranNumber);

                var purchaseorderSearchObj = search.create({
                    type: "purchaseorder",
                    filters: [
                        ["type", "anyof", "PurchOrd"],
                        "AND",
                        ["numbertext", "is", tranNumber],
                        "AND",
                        ["mainline", "is", "T"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "tranid",
                            label: "Document Number"
                        }),
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        })
                    ]
                });

                var poRes = purchaseorderSearchObj.run().getRange({
                    start: 0,
                    end: 1000
                });

                log.debug('poRes', poRes);

                var existingRec = false;



                if (poRes && poRes.length > 0) {

                    var existingPo = poRes[0].getValue('internalid');

                    var po = record.load({
                        type: record.Type.PURCHASE_ORDER,
                        id: existingPo,
                        isDynamic: true
                    });
                    existingRec = true;

                } else {
                    var po = record.create({
                        type: record.Type.PURCHASE_ORDER,
                        isDynamic: true
                    });
                }



                po.setValue({
                    fieldId: 'customform',
                    value: 258
                });
                po.setValue({
                    fieldId: 'tranid',
                    value: tranNumber
                });
                po.setValue({
                    fieldId: 'entity',
                    value: vendor
                });
                po.setValue({
                    fieldId: 'custbody_bol_list',
                    value: bolInternalId
                });
                po.setValue({
                    fieldId: 'custbody_terminal_number',
                    value: terminalNumber
                });
                po.setValue({
                    fieldId: 'custbody_p_terminal_name',
                    value: terminalName
                });
                po.setValue({
                    fieldId: 'custbody_jaguar_terminal_id_fuel',
                    value: TerminalId
                });
                po.setValue({
                    fieldId: 'custbody_supplier_name',
                    value: supplierName
                });
                po.setValue({
                    fieldId: 'custbody_supplier_number',
                    value: supplierNumber
                });
                po.setValue({
                    fieldId: 'custbody_supplier_id',
                    value: supplierId
                });
                if (locationId) {
                    po.setValue({
                        fieldId: 'location',
                        value: locationId
                    });
                } else {
                    po.setValue({
                        fieldId: 'location',
                        value: 2
                    });
                }

                po.setValue({
                    fieldId: 'class',
                    value: 1
                });

                if (existingRec == true) {

                    var lineCount = po.getLineCount({
                        sublistId: 'item'
                    });
                    for (var i = lineCount - 1; i >= 0; i--) {
                        po.removeLine({
                            sublistId: 'item',
                            line: i
                        });
                    }

                }

                for (var i = 0; i < actauLlines.length; i++) {
                    log.debug('index', i);
                    var itemId = findItem(actauLlines[i]["custrecord_bought_as_product_id.CUSTRECORD_BOL_HEADER"])
                     var itemN = actauLlines[i]["custrecord_bought_as_product_id.CUSTRECORD_BOL_HEADER"];
                        /*   log.debug('item', item);
                        if (item.toLowerCase() == 'clear') {
                            itemId = 4050
                        } else if (item.toLowerCase() == 'dyed') {
                            itemId = 4051
                        } else if (item.toLowerCase() == 'mg89 ethanol free') {
                            itemId = 4062
                        } else if (item.toLowerCase() == 'pg93') {
                            itemId = 4056
                        } else if (item.toLowerCase() == 'rg87') {
                            itemId = 4059
                        } else if (item.toLowerCase() == 'rg87 ethanol free') {
                            itemId = 4060
                        } else {
                            log.debug('item-notfound', item);
                            continue;
                        }*/


                    var qty = parseFloat(actauLlines[i]["custrecord_gross_gallons_delivered.CUSTRECORD_BOL_HEADER"]);
                    var rate = 0;

                    po.selectNewLine({
                        sublistId: 'item'
                    });
                    po.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        value: itemId
                    });
                    var blucost = getBlucost(bolNumber, itemN);
                    if (blucost) {
                        log.debug('blucost', blucost);
                        rate = Number(blucost)
                    }

                    po.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'quantity',
                        value: qty
                    });
                    po.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'rate',
                        value: rate
                    });
                    po.commitLine({
                        sublistId: 'item'
                    });
                    log.debug('index', i);

                }

                var poId = po.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                });
                log.debug('poId', poId);

                record.submitFields({
                    type: 'customrecord_transaction_report',
                    id: bolId,
                    values: {
                        custrecord_related_po: poId
                    }
                });

                updatePmpPackages(poId, bolNumber)


            }


        } catch (e) {
            log.error('Reduce Error for Record ' + context.key, e.toString());
            if (bolId) {
                record.submitFields({
                    type: 'customrecord_transaction_report',
                    id: bolId,
                    values: {
                        custrecord_po_error: e.message
                    }
                });
            }

        }
    }


    /* ========================
       SUMMARY
    ========================= */
    function summarize(summary) {
        log.audit('Map/Reduce Completed', {
            usage: summary.usage,
            yields: summary.yields
        });

        summary.reduceSummary.errors.iterator().each(function(key, error) {
            log.error('Reduce Error for Key ' + key, error);
            return true;
        });
    }

    function getBlucost(bol, product) {

        var customrecord_pmp_packageSearchObj = search.create({
            type: "customrecord_pmp_package",
            filters: [
                ["custrecord_bol", "is", bol],
                "AND",
                ["custrecord_producttype", "is", product]
            ],
            columns: [
                search.createColumn({
                    name: "created",
                    summary: "MIN",
                    label: "Date Created"
                }),
                search.createColumn({
                    name: "custrecord_blucost",
                    summary: "MIN",
                    label: "BluCost"
                })
            ]
        });

        var sResults = customrecord_pmp_packageSearchObj.run().getRange({
            start: 0,
            end: 1000
        });

        log.debug('sResults', sResults);



        if (sResults && sResults.length > 0) {

            var bluCost = sResults[0].getValue({
                name: "custrecord_blucost",
                summary: "MIN",
                label: "BluCost"
            })

            return bluCost;


        }



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

    function updatePmpPackages(poId, bol) {

        var customrecord_pmp_packageSearchObj = search.create({
            type: "customrecord_pmp_package",
            filters: [
                ["custrecord_bol", "is", bol]
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
            for (var i = 0; i < sResults.length; i++) {

                var pmpId = sResults[i].getValue('internalid');

                record.submitFields({
                    type: 'customrecord_pmp_package',
                    id: pmpId,
                    values: {
                        custrecord_pmp_purchaseorder: poId
                    }
                });

            }

        }

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    };

});