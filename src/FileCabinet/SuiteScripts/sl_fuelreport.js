/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
var PAGE_SIZE = 50;
var SEARCH_ID = '2289';
var CLIENT_SCRIPT_FILE_ID = 14185;

define(['N/ui/serverWidget', 'N/search', 'N/redirect'],
    function(serverWidget, search, redirect) {
        function onRequest(context) {
			try{
				if (context.request.method == 'GET') {
                var form = serverWidget.createForm({
                    title: 'Fuel Report Texas (Sales Orders)',
                    hideNavBar: false
                });

                form.clientScriptFileId = CLIENT_SCRIPT_FILE_ID;

                // Get parameters
                var pageId = parseInt(context.request.parameters.page);
                var scriptId = context.request.parameters.script;
                var deploymentId = context.request.parameters.deploy;

                // Add sublist that will show results
                var sublist = form.addSublist({
                    id: 'custpage_table',
                    type: serverWidget.SublistType.LIST,
                    label: 'Transactions'
                });

                // Add columns to be shown on Page
                sublist.addField({
                    id: 'id',
                    label: 'Internal ID',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_class',
                    label: 'Class',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_invoicedate',
                    label: 'Invoice Date',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_invoicenumber',
                    label: 'Invoice Number',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_item',
                    label: 'Item',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_itemtype',
                    label: 'Item Type',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_itemdescription',
                    label: 'Item Description',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_qty',
                    label: 'Gallons',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_state',
                    label: 'Ship To Address State',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_carrier',
                    label: 'Carrier',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_custname',
                    label: 'Customer Name',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_permit',
                    label: 'Dyed Diesel Permit #',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_license',
                    label: 'Bonded User License',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_equipment',
                    label: 'Equipment Only',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_terminalname',
                    label: 'Terminal Name',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_terminalnumber',
                    label: 'Terminal Number',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_supplier',
                    label: 'Supplier',
                    type: serverWidget.FieldType.TEXT
                });

                sublist.addField({
                    id: 'custpage_vendor',
                    label: 'Vendor Name',
                    type: serverWidget.FieldType.TEXT
                });

                // Run search and determine page count
                var retrieveSearch = runSearch(SEARCH_ID, PAGE_SIZE);
                var pageCount = Math.ceil(retrieveSearch.count / PAGE_SIZE);

                // Set pageId to correct value if out of index
                if (!pageId || pageId == '' || pageId < 0)
                    pageId = 0;
                else if (pageId >= pageCount)
                    pageId = pageCount - 1;

                // Add buttons to simulate Next & Previous
                if (pageId != 0) {
                    form.addButton({
                        id: 'custpage_previous',
                        label: 'Previous',
                        functionName: 'getSuiteletPage(' + scriptId + ', ' + deploymentId + ', ' + (pageId - 1) + ')'
                    });
                }

                if (pageId != pageCount - 1) {
                    form.addButton({
                        id: 'custpage_next',
                        label: 'Next',
                        functionName: 'getSuiteletPage(' + scriptId + ', ' + deploymentId + ', ' + (pageId + 1) + ')'
                    });
                }

                // Add drop-down and options to navigate to specific page
                var selectOptions = form.addField({
                    id: 'custpage_pageid',
                    label: 'Page Index',
                    type: serverWidget.FieldType.SELECT
                });

                var itemT = form.addField({
                    id: 'custpage_itype',
                    label: 'Item',
                    type: serverWidget.FieldType.SELECT
                });
                var itemSearchObj = search.create({
                    type: "item",
                    filters: [
                        ["custitem_jaguar_item_categorization", "anyof", "13"]
                    ],
                    columns: [
                        search.createColumn({
                            name: "internalid",
                            label: "Internal ID"
                        }),
                        search.createColumn({
                            name: "itemid",
                            label: "Name"
                        })
                    ]
                });
				
				var itemSearch = itemSearchObj.run().getRange({
                start: 0,
                end: 1000
            });
			
			log.debug('DEBUG', itemSearch)
                if (itemSearch && itemSearch.length > 0) {
					 for (j = 0; j < itemSearch.length; j++){
						 
						 var itemId = itemSearch[j].getValue('internalid');
						 
						 var itemName = itemSearch[j].getValue('itemid');
						 
						 if(j ==0 ){
							 
							 itemT.addSelectOption({
                            value: '0',
                            text:'',
                            isSelected: true
                        });
						
						itemT.addSelectOption({
                            value:itemId,
                            text: itemName
                        });
						 }else{
							itemT.addSelectOption({
                            value:itemId,
                            text: itemName
                        }); 
						 }
						 
					 }
				}




                for (i = 0; i < pageCount; i++) {
                    if (i == pageId) {
                        selectOptions.addSelectOption({
                            value: 'pageid_' + i,
                            text: ((i * PAGE_SIZE) + 1) + ' - ' + ((i + 1) * PAGE_SIZE),
                            isSelected: true
                        });
                    } else {
                        selectOptions.addSelectOption({
                            value: 'pageid_' + i,
                            text: ((i * PAGE_SIZE) + 1) + ' - ' + ((i + 1) * PAGE_SIZE)
                        });
                    }
                }

                // Get subset of data to be shown on page
				log.debug('PAGEID', pageId);
               // if (pageId == 0) {
                  //  context.response.writePage(form);
               // } else {
                    var addResults = fetchSearchResult(retrieveSearch, pageId);

                    // Set data returned to columns
                    var j = 0;
                    addResults.forEach(function(result) {
                        sublist.setSublistValue({
                            id: 'id',
                            line: j,
                            value: result.id
                        });

                        sublist.setSublistValue({
                            id: 'amount',
                            line: j,
                            value: result.amount
                        });

                        j++
                    });

                    context.response.writePage(form);
               // }

            }
			}catch(er){
				log.error('ERROR', er.toString());
			}
            
        }

        return {
            onRequest: onRequest
        };

        function runSearch(searchId, searchPageSize) {
            var searchObj = search.load({
                id: searchId
            });

            log.debug('searchObj', JSON.stringify(searchObj));

            return searchObj.runPaged({
                pageSize: searchPageSize
            });
        }

        function fetchSearchResult(pagedData, pageIndex) {

            log.debug('pageIndex', pageIndex);

            log.debug('pagedData', pagedData);

            var searchPage = pagedData.fetch({
                index: pageIndex
            });

            var results = new Array();

            searchPage.data.forEach(function(result) {
                var internalId = result.id;

                var amount = result.getValue({
                    name: 'amount'
                });

                results.push({
                    "id": internalId,
                    "amount": amount
                });
            });
            return results;
        }
    });