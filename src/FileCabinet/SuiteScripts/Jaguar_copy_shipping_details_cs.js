/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount 
 *  Author: H M Salman Habib
 *  Date: 2024-06-20 
 *  version 1.0   Description: Copy Shipping Details from PO to Bill on Create 
 */
define(['N/currentRecord', 'N/url', 'N/record'], (currentRecord, url, record) => {

    function pageInit(context) {
        var record = context.currentRecord;
        var field = record.getField({
                    fieldId: 'custbody_primary_state_of_delivery'
                });

                if (field) {
                    // Remove the mandatory requirement by making it non-mandatory
                   
                    field.isMandatory = false;
                    
                    // log.debug({
                    //     title: 'Field Made Optional',
                    //     details: 'custbody_primary_state_of_delivery field is no longer mandatory on page init.'
                    // });
                }

        if (context.mode !== 'create') return;

        const billRec = currentRecord.get();
        const currentUrl = window.location.href;

        // Parse parameters from URL
        const params = getParams(currentUrl);
       console.log('URL Parameters', params);
        // The 'id' parameter is always the PO ID
        const poId = params.id;

        if (!poId) return;

        try {
            // Load Purchase Order
            const poRec = record.load({
                type: record.Type.PURCHASE_ORDER,
                id: poId
            });

            const shippingDetails = poRec.getValue('custbody_shipping_details');

            if (shippingDetails) {
                billRec.setValue({
                    fieldId: 'custbody_shipping_details',
                    value: shippingDetails
                });
            }           

        } catch (e) {
            console.error('Error copying shipping details:', e);
        }
    }

    /**
     * Helper function to parse URL parameters
     */
    function getParams(urlStr) {
        const params = {};
        const parser = new URL(urlStr);
        for (const [key, value] of parser.searchParams.entries()) {
            params[key] = value;
        }
        return params;
    }

    return { pageInit };
});
