/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */

define(['N/search', 'N/record', 'N/log'], (search, record, log) => {

    /**
     * Get all child customers for a specific parent.
     */
    const getInputData = () => {
        try {
            return search.create({
                type: 'customer',
                filters: [
                    ['isinactive', 'is', 'F'],
                    'AND',
                    ['parent', 'noneof', '@NONE@']
                ],
                columns: ['internalid', 'parent']
            });
        } catch (e) {
            log.error('Error in getInputData', e);
        }
    };

    /**
     * Group all children under their parent ID.
     */
    const map = (context) => {
        try {
            const result = JSON.parse(context.value);
            const childId = result.id;
            const parentId = result.values.parent?.value;

            if (!parentId || childId === parentId) {
                log.debug('Skipping invalid child-parent pair', { childId, parentId });
                return;
            }

            context.write({
                key: parentId,
                value: childId
            });
        } catch (e) {
            log.error('Error in map', e);
        }
    };

    /**
     * For each parent, update all its children with VAT and exemption info.
     */
    const reduce = (context) => {
        const parentId = context.key;
        const rawChildIds = context.values || [];

        // Ensure unique valid child IDs (avoid parent itself)
        const childIds = [...new Set(rawChildIds.filter(id => id && id !== parentId))];

        if (childIds.length === 0) {
           // log.audit('No valid children to update for parent', parentId);
            return;
        }

        log.audit('Processing Parent', { parentId, childCount: childIds.length });

        try {
            // Get parent's VAT and Exempt Certificate values
            const parentFields = search.lookupFields({
                type: 'customer',
                id: parentId,
                columns: ['vatregnumber', 'custentity_ava_exemptcertno']
            });

            const vatRegNumber = parentFields.vatregnumber || '';
            const exemptCert = parentFields.custentity_ava_exemptcertno || '';
            const exemptionValue = `${vatRegNumber} | ${exemptCert}`;

            // Loop through children
            for (let i = 0; i < childIds.length; i++) {
                const childId = childIds[i];
                try {
                    const childRec = record.load({
                        type: record.Type.CUSTOMER,
                        id: childId
                    });

                    // Copy parent's values into child
                    childRec.setValue({
                        fieldId: 'vatregnumber',
                        value: vatRegNumber
                    });

                    childRec.setValue({
                        fieldId: 'custentity_ava_exemptcertno',
                        value: exemptCert
                    });

                    childRec.setValue({
                        fieldId: 'custpage_ava_exemption',
                        value: exemptCert
                    });

                    const savedId = childRec.save({
                        enableSourcing: true,
                        ignoreMandatoryFields: true
                    });

                    log.audit('Updated Child', {
                        parentId,
                        childId: savedId,
                        vatRegNumber,
                        exemptCert
                    });

                } catch (childErr) {
                    log.error(`Error updating child ${childId}`, childErr);
                }
            }

        } catch (err) {
            log.error(`Error processing parent ${parentId}`, err);
        }
    };

    /**
     * Log results and handle errors gracefully.
     */
    const summarize = (summary) => {
        try {
            if (summary.output) {
                summary.output.iterator().each((key, value) => {
                    log.audit('Processed Output', { key, value });
                    return true;
                });
            }

            if (summary.errors) {
                summary.errors.iterator().each((key, error) => {
                    log.error('Summary Error', { key, error });
                    return true;
                });
            }

            log.audit('Script Completed', {
                usage: summary.usage,
                yields: summary.yields,
                totalSeconds: summary.seconds
            });
        } catch (e) {
            log.error('Summarize Failed', e);
        }
    };

    return { getInputData, map, reduce, summarize };
});
