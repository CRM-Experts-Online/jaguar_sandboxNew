/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/task'],
    /**
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     * @param {serverWidget} serverWidget
     */
    function(record, runtime, search, serverWidget, task) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {

            try {

                if (context.request.method == 'GET') {

                    primaryPage(context)
                } else {
                    //secondaryPage(context)
                }

            } catch (er) {
                log.error('ERROR', er.toString());
            }

        }

        function primaryPage(context) {

            try {
                var rForm = serverWidget.createForm({
                    title: 'Batch Report Margin',
                    hideNavBar: false
                });

                var dateFrom = rForm.addField({
                    id: 'custpage_date_from',
                    type: serverWidget.FieldType.DATE,
                    label: 'Date From'
                });

                var dateTo = rForm.addField({
                    id: 'custpage_date_to',
                    type: serverWidget.FieldType.DATE,
                    label: 'Date To'
                });


                var project = rForm.addField({
                    id: 'custpage_project',
                    label: 'Project',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customer'
                });


                var sublist = rForm.addSublist({
                    id: 'custpage_table',
                    type: serverWidget.SublistType.LIST,
                    label: 'Project List'
                });

                var projectLine = sublist.addField({
                    id: 'custpage_project_line',
                    label: 'Project',
                    type: serverWidget.FieldType.TEXT
                });

                var invoiceTotal = sublist.addField({
                    id: 'custpage_invoice_total',
                    label: 'Invoice Total',
                    type: serverWidget.FieldType.TEXT
                });

                var billTotal = sublist.addField({
                    id: 'custpage_bill_total',
                    label: 'Bill Total',
                    type: serverWidget.FieldType.TEXT
                });

                var GrossMargin = sublist.addField({
                    id: 'custpage_gross_margin',
                    label: 'Gross Margin',
                    type: serverWidget.FieldType.TEXT
                });

                var linktoReport = sublist.addField({
                    id: 'custpage_report',
                    label: 'Link to Report',
                    type: serverWidget.FieldType.TEXT
                });


                var getDetails = projectSearch();
				
				if(getDetails && getDetails.length > 0){
					
					for(var i = 0; i < getDetails.length; i++){
						
						sublist.setSublistValue({
						id: 'custpage_project_line',
						line:i,
						value:getDetails[i].projectText                   
					});
					
					var invAmt = getDetails[i].invoiceAmount
					
					var billAmt = getDetails[i].billAmount
					
					sublist.setSublistValue({
						id: 'custpage_invoice_total',
						line:i,
						value: invAmt                  
					});
					
					sublist.setSublistValue({
						id: 'custpage_bill_total',
						line:i,
						value:billAmt                   
					});
					
				
					
					var margin = (parseFloat(invAmt)- parseFloat(billAmt))/parseFloat(invAmt)
					
					log.debug('margin', margin);
					
					sublist.setSublistValue({
						id: 'custpage_gross_margin',
						line:i,
						value:margin.toFixed(3)                  
					});
					
					var reportLink = "https://8151247-sb1.app.netsuite.com/app/reporting/reportrunner.nl?cr=376&reload=T&whence=";
				
				var reportUrl = '<a href="' + reportLink+ '" target="_blank">View Batch Report</a>';
					
					
					sublist.setSublistValue({
						id: 'custpage_report',
						line:i,
						value:reportUrl                  
					});
					
					
					}
					
					
					
				}else{
					
				}

                rForm.addSubmitButton({
                    label: 'Refresh'
                });

                context.response.writePage(rForm);



            } catch (er) {
                log.error('ERROR-primary page', er.toString());
            }
        }

        function projectSearch() {

            var transactionSearchObj = search.create({
                type: "transaction",
                filters: [
                    ["type", "anyof", "VendBill", "CustInvc"],
                    "AND",
                    ["custbody_project", "noneof", "@NONE@"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["datecreated", "within", "lastmonth"]
                ],
                columns: [
                    search.createColumn({
                        name: "custbody_project",
                        summary: "GROUP",
                        label: "Project "
                    }),
                    search.createColumn({
                        name: "type",
                        summary: "GROUP",
                        label: "Type"
                    }),
                    search.createColumn({
                        name: "trandate",
                        summary: "GROUP",
                        label: "Date"
                    }),
                    search.createColumn({
                        name: "amount",
                        summary: "SUM",
                        label: "Amount"
                    })
                ]
            });

            var results = transactionSearchObj.run().getRange({
                start: 0,
                end: 1000
            });

            log.debug('results', results);

            if (results && results.length > 0) {

                var transactionArray = [];

                var projectArr = [];

                for (var i = 0; i < results.length; i++) {

                    var project = results[i].getValue({
                        name: "custbody_project",
                        summary: "GROUP",
                        label: "Project "
                    });
					
					var projectText = results[i].getText({
                        name: "custbody_project",
                        summary: "GROUP",
                        label: "Project "
                    });

                    var type = results[i].getValue({
                        name: "type",
                        summary: "GROUP",
                        label: "Type"
                    });

                    var amount = results[i].getValue({
                        name: "amount",
                        summary: "SUM",
                        label: "Amount"
                    });

                    var getIndex = projectArr.indexOf(project);
					
					log.debug('type', type);



                    if (getIndex > -1) {

                        if (type == 'VendBill') {
                            transactionArray[getIndex]["billAmount"] = amount;
                        } else {
                            transactionArray[getIndex]["invoiceAmount"] = amount;
                        }


                    } else {
                        projectArr.push(project);

                        var object = {};

                        object.project = project;
						
						 object.projectText = projectText;

                        if (type == 'VendBill') {

                            object.billAmount = amount;
                        } else {
                            object.invoiceAmount = amount;
                        }

                        transactionArray.push(object);

                    }


                }
				log.debug('transactionArray', transactionArray);
				return transactionArray;
            }


        }

        function secondaryPage(context) {

            try {
                log.debug('context', context);
                var date = context.request.parameters.custpage_date
                var subSidiary = context.request.parameters.custpage_subsidiary;
                var dep = context.request.parameters.custpage_department;
                var loc = context.request.parameters.custpage_location;

                var count = context.request.getLineCount('custpage_table');

                log.debug('count', count);
                var selectedArray = []
                if (count > 0) {
                    for (var ps = 0; ps < count; ps++) {

                        var obj = {};

                        obj.itemInternalid = context.request.getSublistValue('custpage_table', 'custpage_assemblyname', ps);

                        obj.itemName = context.request.getSublistValue('custpage_table', 'custpage_assemblyname', ps);

                        obj.QTY = context.request.getSublistValue('custpage_table', 'custpage_quantity', ps);

                        obj.invDetail = context.request.getSublistValue('custpage_table', 'custpage_inventory_detail', ps);
                        obj.date = date;
                        obj.subSidiary = subSidiary;
                        obj.dep = dep;
                        obj.loc = loc;

                        selectedArray.push(obj);


                    }

                }

                log.debug('selectedArray', selectedArray);

                if (selectedArray.length > 0) {

                    try {
                        var mapReduceScript = task.create({
                            taskType: task.TaskType.MAP_REDUCE
                        });
                        mapReduceScript.scriptId = 'customscript_mr_bulk_workorder';
                        mapReduceScript.deploymentId = 'customdeploy1';
                        mapReduceScript.params = {
                            'custscript_transaction_obj': selectedArray
                        };

                        var taskStatus = mapReduceScript.submit()

                        log.debug('taskStatus', taskStatus);

                        var erPage = serverWidget.createForm({
                            title: ' Task Submitted',
                            hideNavBar: false
                        });
                        erPage.clientScriptFileId = '303266';
                        var errField = erPage.addField({
                            id: 'custpage_submitted',
                            type: serverWidget.FieldType.TEXT,
                            label: '__',
                        });

                        errField.defaultValue = 'TASK SUBMITTED TO CREATE WORK ORDERS, NOTIFICATION WILL BE SENT AFTER TASK COMPLETION';

                        errField.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.INLINE
                        });

                        erPage.addButton({
                            id: 'custpage_goback',
                            label: "HOME",
                            functionName: 'goback'
                        });

                        context.response.writePage(erPage);

                    } catch (e) {

                        log.error('error-mrtrigger', e.toString());

                        var erPage = serverWidget.createForm({
                            title: ' Task Submitted',
                            hideNavBar: false
                        });
                        erPage.clientScriptFileId = '303266';
                        var errField = erPage.addField({
                            id: 'custpage_submitted',
                            type: serverWidget.FieldType.TEXT,
                            label: '__',
                        });

                        errField.defaultValue = 'A ERROR HAPPENED WHEN SUBMITTING TASK ----' + e.message;

                        errField.updateDisplayType({
                            displayType: serverWidget.FieldDisplayType.INLINE
                        });

                        erPage.addButton({
                            id: 'custpage_goback',
                            label: "HOME",
                            functionName: 'goback'
                        });

                        context.response.writePage(erPage);


                    }



                }

            } catch (er) {
                log.error('ERROR-secondary page', er.toString());
            }
        }

        return {
            onRequest: onRequest
        };

    });