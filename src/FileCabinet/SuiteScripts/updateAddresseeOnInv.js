/**
 *@NApiVersion 2.1
 *@NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/log'], function(record, search, log) {
    

    function beforeSubmit(scriptContext) {

        try {

            var recObj = scriptContext.newRecord;

            var recType = recObj.type;

            if (recType == 'invoice') {

                var entity = recObj.getValue('entity');

                var customerSearchObj = search.create({
                    type: "customer",
                    filters: [
                        ["internalid", "anyof", entity]
                    ],
                    columns: [
                        search.createColumn({
                            name: "entitystatus",
                            label: "Status"
                        }),
                        search.createColumn({
                            name: "addressee",
                            label: "Addressee"
                        })
                    ]
                });

                var results = customerSearchObj.run().getRange({
                    start: 0,
                    end: 1000
                });
                log.debug('DEBUG', results);

                var addresse = results[0].getValue('addressee');
                log.debug('addresse', addresse);
                recObj.setValue('custbody_addresse', addresse);

            }
			
			if(recType == 'vendorbill'){
				 var entity = recObj.getValue('entity');
				 
				 var customerSearchObj = search.create({
                    type: "vendor",
                    filters: [
                        ["internalid", "anyof", entity]
                    ],
                    columns: [
                        search.createColumn({
                            name: "addressee",
                            label: "Addressee"
                        })
                    ]
                });

                var results = customerSearchObj.run().getRange({
                    start: 0,
                    end: 1000
                });
                log.debug('DEBUG', results);

                var addresse = results[0].getValue('addressee');
                log.debug('addresse', addresse);
                recObj.setValue('custbody_addresse', addresse);
			}




        } catch (er) {
            log.error('ERROR', er.toString());
        }
    }

    function afterSubmit(context) {
		 var recObj = context.newRecord;

            var recType = recObj.type;
        try {
			 if (recType == 'invoice') {
            var invID = context.newRecord.id;
            log.debug("Invoice ID", invID);

            var loadInv = record.load({
                type: record.Type.INVOICE,
                id: invID,
                isDynamic: true,
            });
            log.debug("Loaded Invoice", loadInv);

            var getCustID = loadInv.getValue({
                fieldId: 'entity'
            });
            log.debug("Customer ID", getCustID);

            var getCustomerNameFromSearch = search.lookupFields({
                type: record.Type.CUSTOMER,
                id: getCustID,
                columns: ['altname']
            });

            var getCustomerName = getCustomerNameFromSearch.altname;
            log.debug("Customer Name", getCustomerName);

            if (typeof getCustomerName === 'string') {
                var billingAddressSubrecord = loadInv.getSubrecord({
                    fieldId: 'billingaddress'
                });
                log.debug("Billing Address Subrecord", billingAddressSubrecord);

                var newAddressee = getCustomerName.split('-')[0].trim();
                log.debug("New Addressee", newAddressee);

                billingAddressSubrecord.setValue({
                    fieldId: 'addressee',
                    value: newAddressee
                });

                var saveRec = loadInv.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: false
                });
                log.debug("Saved Record ID", saveRec);
            } else {
                log.error("Customer Name Type Error", "Expected a string for customer name but got " + typeof getCustomerName + " for customer ID: " + getCustID);
            }
        }} catch (error) {
            log.error("Error in afterSubmit", error.toString());
        }
    }

    return {
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
});