/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/log', 'N/search'], function (record, log, search) {

  function afterSubmit(context) {
    try {

        if (context.type !== context.UserEventType.CREATE) {
            return;
        }

        var poID = context.newRecord.id;

        // Load PO
        var poRec = record.load({
            type: record.Type.PURCHASE_ORDER,
            id: poID,
            isDynamic: false
        });

        // Get createdfrom (Sales Order ID)
        var createdfrom = poRec.getValue({
            fieldId: 'createdfrom'
        });

        if (!createdfrom) {
            log.error('Missing SO', 'PO is not created from Sales Order');
            return;
        }

        // Lookup Customer from Sales Order (Better than load)
        var soLookup = search.lookupFields({
            type: search.Type.SALES_ORDER,
            id: createdfrom,
            columns: ['entity']
        });

        var getCustomerID = soLookup.entity[0].value;

        log.debug('Customer ID', getCustomerID);

        if (!getCustomerID) {
            log.error('Customer Missing', 'No customer on SO');
            return;
        }

        // Lookup Customer Shipping Fields (No full load needed)
        var customerLookup = search.lookupFields({
            type: search.Type.CUSTOMER,
            id: getCustomerID,
            columns: [
                'shipaddr1',
                'shipaddr2',
                'shipcity',
                'shipstate',
                'shipzip',
                'shipcountry'
            ]
        });

        var getAddr1 = customerLookup.shipaddr1 || '';
        var getAddr2 = customerLookup.shipaddr2 || '';
        var getCity = customerLookup.shipcity || '';
        var getState = customerLookup.shipstate || '';
        var getZip = customerLookup.shipzip || '';
        var getCountry = customerLookup.shipcountry || '';

        var fullShipAddress =
            (getAddr1 ? getAddr1 + "\n" : "") +
            (getAddr2 ? getAddr2 + "\n" : "") +
            (getCity ? getCity + ", " : "") +
            (getState ? getState + " " : "") +
            (getZip ? getZip + "\n" : "") +
            (getCountry ? getCountry : "");
 log.debug('Full Shipping Address', fullShipAddress);
        // Update PO safely
        record.submitFields({
            type: record.Type.PURCHASE_ORDER,
            id: poID,
            values: {
                shipaddress: fullShipAddress,
                custbody_delivery_date: new Date(),
                custbody_delivery_time: '09:00 AM'
            },
            options: {
                enableSourcing: true,
                ignoreMandatoryFields: true
            }
        });

        log.debug('Success', 'PO updated successfully');

    } catch (e) {
        log.error('Error in afterSubmit', e);
    }
}


    return {
        afterSubmit: afterSubmit
    };
});
