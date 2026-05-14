/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 *
 * Purpose:
 * 1. Copy custentity_credit_insurance_amttt
 *    → custentity_credit_insurance_amt
 * 2. (Optional) Prepare data for export
 */

define(['N/search', 'N/record', 'N/log'],
    (search, record, log) => {

        // -------------------------------
        // 1. INPUT
        // -------------------------------
        const getInputData = () => {
            return search.create({
                type: search.Type.CUSTOMER,
                filters: [
                    ['custentity_credit_insurance_amttt', 'isnotempty', '']
                    // 'AND',
                    // ['internalid', 'is', '48024'] // remove if not needed
                ],
                columns: [
                    'internalid',
                    'entityid',
                    'companyname',
                    'custentity_dba_name',
                    'custentity_credit_insurance_amttt' // SOURCE
                ]
            });
        };

        // -------------------------------
        // 2. MAP
        // -------------------------------
        const map = (context) => {
            try {
                const result = JSON.parse(context.value);

                const customerId = result.id;
                const values = result.values;

                let insuranceAmt = values.custentity_credit_insurance_amttt;

                // Normalize value
                if (insuranceAmt) {
                    insuranceAmt = insuranceAmt.toString().replace(/,/g, '');
                    insuranceAmt = parseFloat(insuranceAmt) || 0;
                } else {
                    insuranceAmt = 0;
                }

                // Update TARGET field
                record.submitFields({
                    type: record.Type.CUSTOMER,
                    id: customerId,
                    values: {
                        custentity_credit_insurance_amt: insuranceAmt // TARGET
                    },
                    options: {
                        ignoreMandatoryFields: true
                    }
                });

                log.audit('Customer Updated', {
                    customerId,
                    insuranceAmt
                });

            } catch (e) {
                log.error('Map Error', e);
            }
        };

        // -------------------------------
        // 3. REDUCE (not required)
        // -------------------------------
        const reduce = () => {};

        // -------------------------------
        // 4. SUMMARIZE
        // -------------------------------
        const summarize = (summary) => {
            if (summary.inputSummary.error) {
                log.error('Input Error', summary.inputSummary.error);
            }

            summary.mapSummary.errors.iterator().each((key, error) => {
                log.error(`Map Error for key ${key}`, error);
                return true;
            });

            log.audit('Script Complete', 'Credit insurance amounts copied successfully');
        };

        return {
            getInputData,
            map,
            reduce,
            summarize
        };
    });
