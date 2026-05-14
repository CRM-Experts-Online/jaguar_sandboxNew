/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/record', 'N/search', 'N/ui/message'], function(record, search, message) {

    function pageInit(context) {
        console.log("Page initialized successfully.");
    }

    function onButtonClick(getEntityID, memID) {
        try {
            console.log("Entity ID:", getEntityID);
            console.log("Parent Customer ID:", memID);
			log.debug("Entity ID:", getEntityID);
            log.debug("Parent Customer ID:", memID);

            var loadmem = record.load({
                type: record.Type.MEM_DOC, // Adjust type if it's a custom record type
                id: memID,
                isDynamic: true
            });

            
				entityName = loadmem.getValue({ fieldId: "name" });
			

            var lineCount = loadmem.getLineCount({ sublistId: "createdtransactions" });
            console.log("Line Count:", lineCount);
			log.debug("Line Count:", lineCount);

            var salesOrderNumbers = [];
            for (var i = 0; i < lineCount; i++) {
                var soNumber = loadmem.getSublistValue({
                    sublistId: "createdtransactions",
                    fieldId: 'documentnumber',
                    line: i
                });
                salesOrderNumbers.push(soNumber);
                console.log('Sales Order Number:', soNumber);
				log.debug('Sales Order Number:', soNumber);
            }

            if (salesOrderNumbers.length > 0) {
                var customerDetails = getCustomerDetails(entityName);
                if (customerDetails) {
                    if (customerDetails.status.indexOf("PROJECT") !== -1 && customerDetails.parent != null) {
                        salesOrderNumbers.forEach(function(soNumber) {
                            var salesOrderId = getSalesOrderId(soNumber);
                            if (salesOrderId) {
                                handleProject(customerDetails.parent, entityName, salesOrderId);
                            }
                        });
                    } else {
                        salesOrderNumbers.forEach(function(soNumber) {
                            var salesOrderId = getSalesOrderId(soNumber);
                            if (salesOrderId) {
                                handleCustomer(customerDetails.id, entityName, salesOrderId);
                            }
                        });
                    }
                } else {
                    console.log("No customer found with entity name:", entityName);
                }
            } else {
                console.log("No Sales Order number found in the MEM_DOC record.");
            }
        } catch (error) {
            console.error("Error in onButtonClick:", error);
        }
    }

    function getSalesOrderId(soNumber) {
        var salesOrderId;
        var salesorderSearchObj = search.create({
            type: "salesorder",
            filters: [
                ["type", "anyof", "SalesOrd"],
                "AND",
                ["numbertext", "is", soNumber]
            ],
            columns: [
                search.createColumn({ name: "internalid", label: "Internal ID" })
            ]
        });

        salesorderSearchObj.run().each(function(result) {
            salesOrderId = result.getValue({ name: "internalid" });
            return false; // Return false to stop iterating after the first result
        });

        return salesOrderId;
    }

    function getCustomerDetails(entityName) {
        var customerDetails;
        var customerSearchObj = search.create({
            type: "customer",
            filters: [
                ["entityid", "contains", entityName]
            ],
            columns: [
                search.createColumn({ name: "internalid", label: "Internal ID" }),
                search.createColumn({ name: "entitystatus", label: "Status" }),
				search.createColumn({
         name: "internalid",
         join: "parentCustomer",
         label: "Internal ID"
      }),
      search.createColumn({
         name: "entitystatus",
         join: "parentCustomer",
         label: "Status"
      })
            ]
        });

       var results = customerSearchObj.run().getRange({
                    start: 0,
                    end: 1000
                });

                log.debug('results', results);
				
				if(results && results.length > 0){
					
					var parent = results[0].getValue({
         name: "internalid",
         join: "parentCustomer",
         label: "Internal ID"
      });
	  
	  var parentStatus = results[0].getText({
         name: "entitystatus",
         join: "parentCustomer",
         label: "Status"
      })
					
					if(parent){
						customerDetails = {
               id: results[0].getValue('internalid'),
                status: results[0].getText('entitystatus'),
				parent:parent
            };
					}else{
						customerDetails = {
                id: results[0].getValue('internalid'),
                status: results[0].getText('entitystatus'),
				parent:null
            };
					}
				
				}
				log.debug('customerDetails', customerDetails);

        return customerDetails;
    }

    function handleProject(customerId, entityName, internalId) {
        try {
            var salesOrder = record.load({
                type: record.Type.SALES_ORDER,
                id: internalId,
                isDynamic: true
            });
			
			var nDate = new Date();

            var isMemorizedTransaction = salesOrder.getValue({ fieldId: 'custbodymemorized_transaction' });
           if (isMemorizedTransaction) {
                console.log("Sales Order already marked as memorized, skipping update.");
                return;
            }

            var jobRecordCreate = record.create({
                type: record.Type.JOB,
                isDynamic: true
            });

            jobRecordCreate.setValue({
                fieldId: 'parent',
                value: customerId
            });

            
			
			try{
				var parentRecord = record.load({
                type: 'customer',
                id: customerId,
                isDynamic: true
            });
			}catch(er){
				log.debug('not a cistomer it is a project');
				var parentRecord = record.load({
                type: record.Type.JOB,
                id: customerId,
                isDynamic: true
            });
			}
			
			var altName = parentRecord.getValue('companyname');

          var months = parseFloat(nDate.getMonth())+1

          var aName = months+'-'+nDate.getDate()+'-'+nDate.getFullYear()+'-'+nDate.getHours()+'-'+nDate.getMinutes();

          log.debug('aName', aName);
			
			jobRecordCreate.setValue({
                fieldId: 'companyname',
                value: altName +'-'+aName
            });
            

            var shippingAddress = {
                addr1: parentRecord.getValue({ fieldId: 'shipaddr1' }),
                addr2: parentRecord.getValue({ fieldId: 'shipaddr2' }),
                city: parentRecord.getValue({ fieldId: 'shipcity' }),
                country: parentRecord.getValue({ fieldId: 'shipcountry' }),
                state: parentRecord.getValue({ fieldId: 'shipstate' }),
                zip: parentRecord.getValue({ fieldId: 'shipzip' })
            };

            var billingAddress = {
                addr1: parentRecord.getValue({ fieldId: 'billaddr1' }),
                addr2: parentRecord.getValue({ fieldId: 'billaddr2' }),
                city: parentRecord.getValue({ fieldId: 'billcity' }),
                country: parentRecord.getValue({ fieldId: 'billcountry' }),
                state: parentRecord.getValue({ fieldId: 'billstate' }),
                zip: parentRecord.getValue({ fieldId: 'billzip' })
            };

            // Ensure the job record's shipping address is updated
            updateAddress(jobRecordCreate, 'defaultshipping', shippingAddress, "Ship To");
            // Ensure the job record's billing address is updated
            updateAddress(jobRecordCreate, 'defaultbilling', billingAddress, "Bill To");

            var projectId = jobRecordCreate.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
            console.log("New Project ID:", projectId);
			log.debug("New Project ID:", projectId);

            salesOrder.setValue({ fieldId: 'entity', value: projectId });
            salesOrder.setValue({ fieldId: 'custbody_project', value: projectId }); // Ensure the custom project field is updated
            salesOrder.setValue({ fieldId: 'custbodymemorized_transaction', value: true }); // Mark as memorized

            salesOrder.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });

            // Display success message
            showMessageAndSpinner();

            console.log("Updated Sales Order with Project ID:", projectId);
        } catch (error) {
            console.error("Error in handleProject:", error);
			log.error("Error in handleProject:", error);
        }
    }
   
    function handleCustomer(customerId, entityName, internalId) {
        try {
            var salesOrder = record.load({
                type: record.Type.SALES_ORDER,
                id: internalId,
                isDynamic: true
            });

            var isMemorizedTransaction = salesOrder.getValue({ fieldId: 'custbodymemorized_transaction' });
            if (isMemorizedTransaction) {                
                console.log("Sales Order already marked as memorized, skipping update.");
                return;
            }

            salesOrder.setValue({ fieldId: 'entity', value: customerId });
            salesOrder.setValue({ fieldId: 'custbodymemorized_transaction', value: true }); // Mark as memorized

            salesOrder.save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });

            // Display success message
            showMessageAndSpinner();

            console.log("Updated Sales Order with Customer ID:", customerId);
        } catch (error) {
            console.error("Error in handleCustomer:", error);
        }
    }

    function updateAddress(record, defaultField, address, label) {
        record.selectNewLine({
            sublistId: 'addressbook'
        });

        var addressSubrecord = record.getCurrentSublistSubrecord({
            sublistId: 'addressbook',
            fieldId: 'addressbookaddress'
        });

        addressSubrecord.setValue({
            fieldId: 'addr1',
            value: address.addr1
        });
        addressSubrecord.setValue({
            fieldId: 'addr2',
            value: address.addr2
        });
        addressSubrecord.setValue({
            fieldId: 'city',
            value: address.city
        });
        addressSubrecord.setValue({
            fieldId: 'state',
            value: address.state
        });
        addressSubrecord.setValue({
            fieldId: 'zip',
            value: address.zip
        });
        addressSubrecord.setValue({
            fieldId: 'country',
            value: address.country
        });

        record.setCurrentSublistValue({
            sublistId: 'addressbook',
            fieldId: defaultField,
            value: true
        });

        record.setCurrentSublistValue({
            sublistId: 'addressbook',
            fieldId: 'label',
            value: label
        });

        record.commitLine({
            sublistId: 'addressbook'
        });
    }

    function showMessageAndSpinner() {
        // Display success message
        var successMessage = message.create({
            title: 'Sales Order Updated',
            message: 'The sales order has been successfully updated with the project ID.',
            type: message.Type.CONFIRMATION
        });

        successMessage.show();
    }

    return {
        pageInit: pageInit,
        onButtonClick: onButtonClick
    }
});