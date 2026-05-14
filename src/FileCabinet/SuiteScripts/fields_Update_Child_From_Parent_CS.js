/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define(['N/search', 'N/log'], (search, log) => {

    /**
     * Triggered when the Customer record form is loaded.
     * @param {Object} context
     * @param {Record} context.currentRecord
     * @param {string} context.mode - create | copy | edit 
     */
    const pageInit = (context) => {
        try {
            const rec = context.currentRecord;
            const mode = context.mode;

            // Only run in create or edit mode
           if (mode === 'create' || mode === 'edit') {

                let parentId = rec.getValue({ fieldId: 'parent' }) || getParentFromUrl();
                if (!parentId) return;

                log.debug('PageInit - Found Parent', parentId);

                // Lookup parent fields and set them
                updateChildFieldsFromParent(rec, parentId);
            }

        } catch (e) {
            log.error('Error in pageInit', e);
        }

        // Set the fields as read-only

        try {

            if (mode === 'Create') return;
            const userRole = runtime.getCurrentUser().role;
            const currentRecord = context.currentRecord;

            // Fields to disable for other roles
            const fieldsToRestrict = [
                'custentity_dyed_diesel_permit_number',
                'custentity_ava_exemptcertno',
                'custentity_bonded_user_license'
            ];

            // Only role ID 1390 can edit these fields
            if (userRole == 1390) {
                fieldsToRestrict.forEach((fieldId) => {
                    const fieldObj = currentRecord.getField(fieldId);
                    if (fieldObj) {
                        fieldObj.isDisabled = true;
                    }
                });
            }

        } catch (e) {
            console.error('Error disabling fields:', e);
        }

    };


    function getParentFromUrl() {
        const params = new URLSearchParams(window.location.search);
        return params.get('parent');
    }


    /**
     * Triggered whenever a field changes on the form.
     * @param {Object} context
     * @param {Record} context.currentRecord
     * @param {string} context.fieldId
     */
    const fieldChanged = (context) => {
        try {
            const rec = context.currentRecord;
            const fieldId = context.fieldId;

            if (fieldId !== 'parent') return;

            const parentId = rec.getValue('parent');

            if (!parentId) {
                // Clear dependent fields if parent is removed
                rec.setValue({ fieldId: 'vatregnumber', value: '' });
                rec.setValue({ fieldId: 'custentity_ava_exemptcertno', value: '' });
                rec.setValue({ fieldId: 'custpage_ava_exemption', value: '' });
                return;
            }

            log.debug('FieldChanged - Parent selected', parentId);

            updateChildFieldsFromParent(rec, parentId);

        } catch (e) {
            log.error('Error in fieldChanged', e);
        }
    };

    /**
     * Helper: Copies values from parent to child record fields
     */
    const updateChildFieldsFromParent = (rec, parentId) => {
        try {
            const parentFields = search.lookupFields({
                type: 'customer',
                id: parentId,
                columns: ['vatregnumber', 'custentity_ava_exemptcertno']
            });

            const vatRegNumber = parentFields.vatregnumber || '';
            const exemptCert = parentFields.custentity_ava_exemptcertno || '';

            rec.setValue({ fieldId: 'vatregnumber', value: vatRegNumber });
            rec.setValue({ fieldId: 'custentity_ava_exemptcertno', value: exemptCert });
            rec.setValue({ fieldId: 'custpage_ava_exemption', value: exemptCert });

            log.debug('Updated fields from parent', { parentId, vatRegNumber, exemptCert });

        } catch (e) {
            log.error('Error updating from parent', e);
        }
    };




    return { pageInit, fieldChanged };
});
