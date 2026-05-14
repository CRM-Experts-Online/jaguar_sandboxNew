/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/redirect'],
/**
 * @param {record} record
 * @param {runtime} runtime
 * @param {search} search
 * @param {serverWidget} serverWidget
 */
function(record, runtime, search, serverWidget, redirect) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {
		
		try{
			
			if (context.request.method == 'GET') {
        primaryPage(context)
      }
			
		}catch(er){
			log.error('ERROR', er.toString());
		}

    }
	
	function primaryPage(context){
		
		try {
      var soID = context.request.parameters.custpage_soid
      log.debug('soID', soID)

      if (soID) {
        var recObj = record.copy({
          type: 'salesorder',
          id: soID,
		  isDynamic:true
        });
		var entityName = recObj.getValue('entity');
		
		log.debug('entityName', entityName)
		
		var customerDetails = getCustomerDetails(entityName);
		
		log.debug('customerDetails', customerDetails);
		
		if (customerDetails) {
                    if (customerDetails.status.indexOf("PROJECT") !== -1) {
                       
                            var salesOrderId =soID
                            if (salesOrderId) {
                                handleProject(customerDetails.id, entityName, salesOrderId, recObj);
                            }
                       
                    } else {
                       
                            var salesOrderId = soID;
                            if (salesOrderId) {
                                handleCustomer(customerDetails.id, entityName, salesOrderId, recObj);
                            }
                        
                    }
                }
		var copyId = recObj.save();
		
		log.debug('copyId', copyId);
		
		redirect.toRecord({
              type: 'salesorder',
              id: copyId
            })
		
		
	  }
		}catch(er){
			log.error('ERROR', er.toString());
		}
	}
	
	
	  function getCustomerDetails(entityName) {
        var customerDetails;
        var customerSearchObj = search.create({
            type: "customer",
            filters: [
                ["internalid", "anyof", entityName]
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
					
					
						customerDetails = {
                id: results[0].getValue('internalid'),
                status: results[0].getText('entitystatus'),
				parent:null
            };
					
				
				}
				log.debug('customerDetails', customerDetails);

        return customerDetails;
    }
	
	function handleProject(customerId, entityName, internalId, recObj) {
        try {
            var salesOrder = recObj
			
			var nDate = new Date();


            var jobRecordCreate = record.create({
                type: record.Type.JOB,
                isDynamic: true
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
			
			var pParent = parentRecord.getValue('parent');

          var months = parseFloat(nDate.getMonth())+1

          var aName = months+'-'+nDate.getDate()+'-'+nDate.getFullYear()+'-'+nDate.getHours()+'-'+nDate.getMinutes();

          log.debug('aName', aName);
			
			jobRecordCreate.setValue({
                fieldId: 'companyname',
                value: altName +'-'+'copy'
            });
			
			jobRecordCreate.setValue({
                fieldId: 'parent',
                value: pParent
            });
			
			var siteContactName = parentRecord.getValue('custentity_site_contact_name');
			
			var siteContactNumber = parentRecord.getValue('custentity_site_contact_number');
			
			var gateCode = parentRecord.getValue('custentity_gate_code');
			
			var siteCode = parentRecord.getValue('custentity_site_code');
			
			var cShippingDetails = parentRecord.getValue('custentity_shipping_details');
			
			jobRecordCreate.setValue({
                fieldId: 'custentity_site_contact_name',
                value: siteContactName
            });
			
			jobRecordCreate.setValue({
                fieldId: 'custentity_site_contact_number',
                value: siteContactNumber
            });
			
			jobRecordCreate.setValue({
                fieldId: 'custentity_gate_code',
                value: gateCode
            });
			
			jobRecordCreate.setValue({
                fieldId: 'custentity_site_code',
                value: siteCode
            });
			jobRecordCreate.setValue({
                fieldId: 'custentity_shipping_details',
                value: cShippingDetails
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

			log.debug("New Project ID:", projectId);

            salesOrder.setValue({ fieldId: 'entity', value: projectId });
            salesOrder.setValue({ fieldId: 'custbody_project', value: projectId }); // Ensure the custom project field is updated
            salesOrder.setValue({ fieldId: 'custbody_make_copy', value: true }); // Mark as copied
			salesOrder.setValue({ fieldId: 'custbody_related_sales_order', value: ''}); // Mark as copied
			

            var copyId = salesOrder.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
					
		log.debug('copyId', copyId);
		
		redirect.toRecord({
              type: 'salesorder',
              id: copyId
            })

            
        } catch (error) {
           log.error('error', error.toString());
        }
    }
	
	 function handleCustomer(customerId, entityName, internalId) {
        try {
            var salesOrder = record.load({
                type: record.Type.SALES_ORDER,
                id: internalId,
                isDynamic: true
            });

           

            salesOrder.setValue({ fieldId: 'entity', value: customerId });
            salesOrder.setValue({ fieldId: 'custbodymemorized_transaction', value: true }); // Mark as memorized

            salesOrder.save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });

           
        } catch (error) {
           log.error('error', error.toString());
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

    return {
        onRequest: onRequest
    };
   
});