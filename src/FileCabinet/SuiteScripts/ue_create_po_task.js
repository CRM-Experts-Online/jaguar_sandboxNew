/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log', 'N/search', 'N/email'],
    function (record, log, search, email) {
        function afterSubmit(context) {
            try {

                var newRecord = context.newRecord;
                var oldRecord = context.oldRecord;
                // Example call
                 const createdDate = getChicagoDateTime();
                if (newRecord.type == 'salesorder') {

                    var bolId = newRecord.getValue('custbody85');

                    if (bolId) {
                        updateBols(newRecord.id, bolId)
                    }

                    if (context.type == 'create' && newRecord.getValue('class') == 1) {
                        var taskRec = record.create({
                            type: 'task'
                        });
                        var transId = newRecord.getValue('tranid');

                        taskRec.setValue('title', `SO ID ${transId} – Sales order is ready to dispatch – ${createdDate}`);
                        taskRec.setValue('message', 'A new Sales Order is created.');
                        taskRec.setValue('company', newRecord.getValue('entity'));
                        taskRec.setValue('transaction', newRecord.id);

                        taskRec.setValue('custevent_assigned_group', 25924);
                        taskRec.setValue('custevent_assigned_role', 1365);


                        var taskId = taskRec.save();
                        log.debug('taskId', taskId);
                    }


                    if (context.type == 'edit' && newRecord.getValue('class') == 1) {

                        var newVal = newRecord.getValue('custbody_so_ready_to_dispatch');
                        var oldVal = newRecord.getValue('custbody_so_ready_to_dispatch');
                        if (newVal && newVal != oldVal) {
                            var taskRec = record.create({
                                type: 'task'
                            });
                            taskRec.setValue('title', 'Sales order is ready to dispatch');
                            taskRec.setValue('message', 'Sales order is ready to dispatch');
                            taskRec.setValue('company', newRecord.getValue('entity'));
                            taskRec.setValue('transaction', newRecord.id);


                            taskRec.setValue('custevent_assigned_group', 25924);
                            taskRec.setValue('custevent_assigned_role', 1365);

                            var taskId = taskRec.save();
                            log.debug('taskId', taskId);
                        }

                    }

                }
                if (newRecord.type == 'purchaseorder') {


                    log.debug('context purchaseorder ', context.type);
                    if (context.type == 'create') {
                        var taskRec = record.create({
                            type: 'task'
                        });
                        // Get the PO ID/number for the subject line
                        var poId = newRecord.getValue('tranid') || newRecord.id;

                        taskRec.setValue('title', 'Purchase Order #' + poId + ' - New Purchase Order Created');

                        // Get current date and time for the message
                        var now = new Date();
                        var dateTimeStr = now.toLocaleString();

                        var checklistMessage = 'The Purchase Order has been created. Please double-check the details and complete the "Order Entry Check List" by verifying the following:\n\n' +
                            'CHECK CUSTOMER NAME\n\n' +
                            'CHECK DELIVERY TIME AND DATE\n\n' +
                            'CHECK PRODUCT AND QUANTITY\n\n' +
                            'CHECK SITE NOTES\n\n' +
                            'CHECK SITE CONTACT\n\n' +
                            'CHECK CUSTOMER PRICE\n\n' +
                            'CHECK VENDOR COST\n\n' +
                            'Once everything on the checklist has been verified, please send the purchase order to the vendor.\n\n' +
                            'Task created: ' + dateTimeStr;

                        taskRec.setValue('message', checklistMessage);
                        taskRec.setValue('company', newRecord.getValue('entity'));
                        taskRec.setValue('transaction', newRecord.id);

                        // Set due date to 5 days from now (consistent with other tasks in the script)
                        var dueDate = new Date();
                        dueDate.setDate(dueDate.getDate() + 5);
                        taskRec.setValue('duedate', dueDate);

                        // Changed from National Dispatch to Order Entry
                        // Order Entry role instead of National Dispatch
                        taskRec.setValue('custevent_assigned_group', 25892); // Keeping the same group
                        taskRec.setValue('custevent_assigned_role', 1390); // Changed to Order Entry role ID

                        var taskId = taskRec.save();
                        log.debug('taskId', taskId);
                    }

                    if (context.type == 'edit') {
                        var recObj = context.newRecord;


                        var createdFrom = recObj.getValue('createdfrom');
                        log.debug('createdFrom', createdFrom);
                        if (!createdFrom) {
                            return
                        }
                        var approvedBydispatch = recObj.getValue('custbody_approved_by_dispatch');
                        var taskToAp = recObj.getValue('custbody_task_to_ap');
                        log.debug('approvedBydispatch', approvedBydispatch);
                        if (approvedBydispatch == 'F' || approvedBydispatch == false) {
                            return;
                        }
                        if (taskToAp == 'T' || taskToAp == true) {
                            return;
                        }

                        var vend = recObj.getValue('entity');

                        log.debug('vend', vend);

                        var d = new Date();
                        d.setDate(d.getDate() + 5);

                        var task = record.create({
                            type: 'task',
                            isDynamic: true
                        });

                        /*   task.setValue({
                               fieldId: 'assigned',
                               value: '9101'
                           });*/

                        task.setValue({
                            fieldId: 'title',
                            value: 'PO has been sent to the vendor'
                        });
                        task.setValue({
                            fieldId: 'message',
                            value: 'PO has been sent to the vendor when vendor Bill is received check the PO'
                        });

                        task.setValue({
                            fieldId: 'company',
                            value: vend
                        });

                        task.setValue({
                            fieldId: 'transaction',
                            value: recObj.id
                        });

                        task.setValue({
                            fieldId: 'duedate',
                            value: d
                        });

                        task.setValue({
                            fieldId: 'custevent_assigned_role',
                            value: 1382
                        });

                        task.setValue({
                            fieldId: 'custevent_assigned_group',
                            value: 25925
                        });

                        log.debug('createdFrom', createdFrom);



                        if (createdFrom) {
                            var fieldLookUp = search.lookupFields({
                                type: search.Type.SALES_ORDER,
                                id: createdFrom,
                                columns: ['createdfrom']
                            });

                            log.debug('fieldLookUp', fieldLookUp);

                            if (fieldLookUp && fieldLookUp.createdfrom) {
                                var soQuote = fieldLookUp.createdfrom[0].value;
                                log.debug('soQuote', soQuote);
                                task.setValue({
                                    fieldId: 'custevent_task_quote',
                                    value: soQuote
                                });
                            }


                        }



                        var recordId = task.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });
                        log.debug('taskforAP', recordId);
                        if (recordId) {

                            var POiD = record.submitFields({
                                type: 'purchaseorder',
                                id: recObj.id,
                                values: {
                                    'custbody_approvedby_date': new Date(),
                                    'custbody_task_to_ap': true
                                }
                            });

                            log.debug('POUPDATE', POiD);
                        }
                    }


                }

                if (newRecord.type == 'vendorbill') {
                    log.debug('context.type', context.type);



                    if ( context.type == 'create') {

                        var vbstatus = newRecord.getValue('approvalstatus');

                        var taskToBilling = newRecord.getValue('custbody_task_to_ap');

                        var soId = newRecord.getText('custbody_linked_transaction');
                        

                        var vendorId = newRecord.getValue('entity');
                        var classvalue = newRecord.getText('class');

                        // if (vbstatus == '2' && (taskToBilling == 'T' || taskToBilling == true)) {
                        //     return;
                        // }

                        var vbId = newRecord.id;
                        log.debug('vbId', vbId);

                        // var getDeatils = getfromPo(vbId);
                         log.debug('soId', soId);


                        if (classvalue == 'National' && soId ) {
                            var taskRec = record.create({
                                type: 'task'
                            });
                            taskRec.setValue('title', 'Create Invoice for' + soId);
                            taskRec.setValue('title', `${soId} – Create an Invoice for Sales Order – ${createdDate}`);
                            taskRec.setValue('message', 'A bill has been created. Please create the invoice for the following sales order:' + soId);
                            taskRec.setValue('company', vendorId);
                            //taskRec.setValue('transaction', getDeatils.soId);
                            // taskRec.setValue('assigned', 9101);
                            taskRec.setValue('custevent_assigned_role', 1379);
                            taskRec.setValue('custevent_assigned_group', 25926);
                            taskRec.setText('priority', 'High');
                            taskRec.setValue({
                                fieldId: 'transaction',
                                value: newRecord.id
                            });
                            var taskId = taskRec.save();
                            log.debug('taskId', taskId);

                            if (taskId) {

                                var POiD = record.submitFields({
                                    type: 'vendorbill',
                                    id: newRecord.id,
                                    values: {
                                        'custbody_task_to_ap': true
                                    }
                                });

                                log.debug('POUPDATE', POiD);
                            }
                        }



                    }
                }
                if (newRecord.type == 'invoice') {
                    var app1 = newRecord.getValue('custbody_custom_approval_status');

                    var app2 = newRecord.getValue('custbody_secondary_approval_status');

                    var taskCreated = newRecord.getValue('custbody_task_to_ap');

                    var transId = newRecord.getValue('tranid');

                    if ((app1 == 3 || app2 == 3) && !taskCreated) {

                        var vend = newRecord.getValue('entity');

                        var d = new Date();
                        d.setDate(d.getDate() + 5);

                        // COMMENTED OUT: Task creation for invoice rejection
                        var task = record.create({
                            type: 'task',
                            isDynamic: true
                        });


                        task.setValue({
                            fieldId: 'title',
                            value: `INV ID ${transId} – Invoice Rejected – ${createdDate}`  //INV ID 2337788 Invoice Rejected 10/28/2025 01:01 PM

                        });
                        task.setValue({
                            fieldId: 'message',
                            value: 'Invoice Has been rejected'
                        });

                        task.setValue({
                            fieldId: 'company',
                            value: vend
                        });

                        task.setValue({
                            fieldId: 'transaction',
                            value: newRecord.id
                        });

                        task.setValue({
                            fieldId: 'duedate',
                            value: d
                        });

                        if (newRecord.getValue('class') == 1) {
                            task.setValue({
                                fieldId: 'custevent_assigned_role',
                                value: 1380
                            });
                        } else {
                            task.setValue({
                                fieldId: 'custevent_assigned_role',
                                value: 1379
                            });
                        }


                        task.setValue({
                            fieldId: 'custevent_assigned_group',
                            value: 25925
                        });
                        var taskId = task.save();
                        log.debug('taskId', taskId);


                        if (taskId) {

                            var POiD = record.submitFields({
                                type: 'invoice',
                                id: newRecord.id,
                                values: {
                                    'custbody_task_to_ap': true
                                }
                            });

                            log.debug('POUPDATE', POiD);
                        }


                        // Task creation for invoice rejection has been commented out
                        log.debug('Invoice Rejection Task', 'Task creation for rejected invoice has been commented out');

                    }
                }

            } catch (er) {
                log.debug('ERROR', er.toString());
            }
        }

        function getfromPo(vbId) {

            try {
                var purchaseorderSearchObj = search.create({
                    type: "purchaseorder",
                    filters: [
                        ["applyingtransaction.internalid", "anyof", vbId],
                        "AND",
                        ["type", "anyof", "PurchOrd"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "entity",
                            join: "createdFrom",
                            label: "Name"
                        }),
                        search.createColumn({
                            name: "tranid",
                            label: "Document Number"
                        }),
                        search.createColumn({
                            name: "createdfrom",
                            label: "Created From"
                        })
                    ]
                });

                var getResult = purchaseorderSearchObj.run().getRange({
                    start: 0,
                    end: 1
                });
                log.debug('getResult', getResult);
                if (getResult && getResult.length > 0) {
                    var custId = getResult[0].getValue({
                        name: "entity",
                        join: "createdFrom",
                        label: "Name"
                    });
                    var soId = getResult[0].getValue('createdfrom');

                    var soText = getResult[0].getText('createdfrom');

                    var obj = {};

                    obj.custId = custId;
                    obj.soId = soId;
                    obj.soText = soText;
                    log.debug('obj', obj);
                    return obj;
                } else {

                    return null;
                }


            } catch (er) {

            }
        }

        function updateBols(poid, bolid) {

            var customrecord_bol_childSearchObj = search.create({
                type: "customrecord_bol_child",
                filters: [
                    ["custrecord_bol_header", "anyof", bolid]
                ],
                columns: [
                    search.createColumn({
                        name: "internalid",
                        label: "Internal ID"
                    })
                ]
            });

            var getResult = customrecord_bol_childSearchObj.run().getRange({
                start: 0,
                end: 1000
            });
            log.debug('getResult', getResult);
            if (getResult && getResult.length > 0) {

                for (var a = 0; a < getResult.length; a++) {

                    var updateBol = record.submitFields({
                        type: 'customrecord_bol_child',
                        id: getResult[a].id,
                        values: {
                            'custrecord_purchase_order': poid
                        }
                    });
                    log.debug('updateBol', updateBol);
                }

            }


        }

        function getChicagoDateTime() {
            const nowChicagoObj = new Date();

            const formattedDate = nowChicagoObj.toLocaleDateString('en-US', {
                timeZone: 'America/Chicago'
            });

            const formattedTime = nowChicagoObj.toLocaleTimeString('en-US', {
                timeZone: 'America/Chicago',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            // Combine date and time into one readable string
            const createdDate = `${formattedDate} ${formattedTime}`;
            return createdDate;
        }





        return {
            afterSubmit: afterSubmit
        };
    });