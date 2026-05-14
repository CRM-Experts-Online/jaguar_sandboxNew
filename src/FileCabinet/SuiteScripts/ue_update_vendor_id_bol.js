/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/search'], function (search) {

    function beforeSubmit(context) {

        // 🔒 Run only on EDIT
        if (context.type !== context.UserEventType.EDIT) {
            return;
        }

        try {
            var rec = context.newRecord;

            // Custom field storing vendor name (text)
            var customVendorName = rec.getValue({
                fieldId: 'custrecord_trans_report_supplier_num'
            });

            if (!customVendorName) return;

            var matchedVendorId = null;

            // 🔍 Search vendor by name
            var vendorSearch = search.create({
                type: search.Type.VENDOR,
                filters: [
                    ['entityid', 'is', customVendorName]
                ],
                columns: ['internalid']
            });

            vendorSearch.run().each(function (result) {
                matchedVendorId = result.getValue('internalid');
                return false;
            });

            // ✅ Set custom vendor field if match found
            if (matchedVendorId) {
                rec.setValue({
                    fieldId: 'custrecord_parent_vendor',
                    value: matchedVendorId
                });
            }

        } catch (e) {
            log.error('Error in beforeSubmit (EDIT)', e);
        }
    }

    return {
        beforeSubmit: beforeSubmit
    };
});