/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @Description When creating an Invoice from a Sales Order,
 *              this script fetches the delivery date (custbody_delivery_date)
 *              from the Sales Order and sets it on the Invoice form on page load.
 */

define(['N/search', 'N/log','N/format'], (search, log,format) => {

    const pageInit = (context) => {
        try {
            log.debug('context.mode', context.mode);
            // Run only when user is creating a new invoice
            if (context.mode !== 'copy') return;

            const currentRecord = context.currentRecord;

            // Get the "Created From" field (Sales Order ID)
            const createdFrom = currentRecord.getValue({ fieldId: 'createdfrom' });
            if (!createdFrom) return;

            // Lookup Sales Order to get the delivery date
            const soFields = search.lookupFields({
                type: search.Type.SALES_ORDER,
                id: createdFrom,
                columns: ['custbody_delivery_date']
            });

            const deliveryDateStr = soFields.custbody_delivery_date || null;
            if (!deliveryDateStr) return;

            // ✅ Convert string date to NetSuite date object using format module
            const deliveryDateObj = format.parse({
                value: deliveryDateStr,
                type: format.Type.DATE
            });

            // Set the value on the Invoice
            currentRecord.setValue({
                fieldId: 'trandate',
                value: deliveryDateObj
            });

            log.debug('Delivery Date Set on Invoice', {
                createdFrom,
                deliveryDate: deliveryDateObj
            });


        } catch (e) {
            log.error('Error in pageInit - Setting Delivery Date on Invoice', e);
        }
    };

    return { pageInit };
});
