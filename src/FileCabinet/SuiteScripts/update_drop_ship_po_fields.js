/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/search', 'N/record', 'N/log', 'N/format'],
    (search, record, log, format) => {

        const onRequest = (context) => {
            try {
                const soId = context.request.parameters.soId;
                const trandateParam = context.request.parameters.trandate;
           log.debug('Received parameters', { soId, trandate: trandateParam });
                if (!soId) {
                    log.error('Missing SO ID parameter');
                    return;
                }

                // Parse SO date safely
                let soDate = null;
                if (trandateParam) {
                    soDate = format.parse({
                        value: trandateParam,
                        type: format.Type.DATE
                    });
                }

                // Search related Drop Ship POs
                const poSearch = search.create({
                    type: search.Type.PURCHASE_ORDER,
                    filters: [
                        ['createdfrom', 'anyof', soId],
                        'AND',
                        ['dropshipso', 'is', 'T']
                    ],
                    columns: ['internalid']
                });

                poSearch.run().each(result => {
                    record.submitFields({
                        type: record.Type.PURCHASE_ORDER,
                        id: result.getValue({ name: 'internalid' }),
                        values: {
                            customform: 258,
                            trandate: soDate,
                            custbody_is_script_run: true // Set flag to avoid infinite loop
                        },
                        options: {
                            enableSourcing: false,
                            ignoreMandatoryFields: true
                        }
                    });
                    return true;
                });

                log.debug('Drop Ship POs updated successfully', { soId, trandate: trandateParam });

            } catch (e) {
                log.error('Suitelet error', e);
            }
        };

        return { onRequest };
    });
