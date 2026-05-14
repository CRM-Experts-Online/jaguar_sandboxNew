/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/record', 'N/search', 'N/log'], function(record, search, log) {

    function afterSubmit(context) {
        try {
            var soID = context.newRecord.id;
            log.debug("SalesOrder ID", soID);

            var loadSO = record.load({
                type: record.Type.SALES_ORDER,
                id: soID,
                isDynamic: true,
            });
            log.debug("Loaded SalesOrder", loadSO);

            var getCustID = loadSO.getValue({ fieldId: 'entity' });
            log.debug("Customer ID", getCustID);

            var customerTypeSearch = search.lookupFields({
                type: search.Type.CUSTOMER,
                id: getCustID,
                columns: ['companyname']
            });

            var getCustomerName = customerTypeSearch.companyname;
            log.debug("Customer Name", getCustomerName);

            // Process the 'custbody_bill_to' field
            var billToField = loadSO.getValue({ fieldId: 'custbody_bill_to' });
            log.debug("Bill To Field", typeof(billToField));

            if (typeof billToField === 'string' && billToField.trim().length > 0) {
                // Replace the prefix "5010699-101" with the customer name
                var newBillToField = getCustomerName + '\n' + billToField.split('\n').slice(1).join('\n');
                log.debug("New Bill To Field", newBillToField);

                // Update both 'billaddress' and 'custbody_bill_to'
             //   loadSO.setValue({
              //      fieldId: 'billaddress',
              //      value: newBillToField
              //  });
                
                loadSO.setText({
                    fieldId: 'custbody_bill_to',
                    text: "Test"
                });
            } else {
                log.error("Bill To Field Type Error", "Expected a non-empty string for 'custbody_bill_to' but got " + typeof billToField + " for sales order ID: " + soID);
            }

            // Process the 'custbody_ship_to' field
            var shipToField = loadSO.getValue({ fieldId: 'custbody_ship_to' });
            log.debug("Ship To Field", shipToField);

            if (typeof shipToField === 'string' && shipToField.trim().length > 0) {
                // Replace the prefix "5010699-101" with the customer name
                var newShipToField = getCustomerName + '\n' + shipToField.split('\n').slice(1).join('\n');
                log.debug("New Ship To Field", typeof(newShipToField));

                // Update both 'shipaddress' and 'custbody_ship_to'
             //   loadSO.setValue({
             //       fieldId: 'shipaddress',
             //       value: newShipToField
             //   });

                loadSO.setText({
                    fieldId: 'custbody_ship_to',
                    text: "Test"
                });
            } else {
                log.error("Ship To Field Type Error", "Expected a non-empty string for 'custbody_ship_to' but got " + typeof shipToField + " for sales order ID: " + soID);
            }

            // Save the sales order record
            var saveRec = loadSO.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
            log.debug("Saved Record ID", saveRec);

        } catch (error) {
            log.error("Error in afterSubmit", error.toString());
        }
    }

    return {
        afterSubmit: afterSubmit
    };
});
