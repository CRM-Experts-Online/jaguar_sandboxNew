/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/record', 'N/log'], function(record, log) {

    function onRequest(context) {
        try {
            var soId = context.request.parameters.id;

            if (!soId) {
                context.response.write(JSON.stringify({ error: "Missing id parameter" }));
                return;
            }
            log.debug("Suitelet", "Loading SO ID: " + soId);
            // Load original SO
            var so = record.load({
                type: record.Type.SALES_ORDER,
                id: soId
            });

            var lineCount = so.getLineCount({ sublistId: 'item' });
            var vendors = [];

            for (var i = 0; i < lineCount; i++) {
                var item = so.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'item',
                    line: i
                });

                var vendor = so.getSublistValue({
                    sublistId: 'item',
                    fieldId: 'povendor',
                    line: i
                });

                vendors.push({ line: i, item: item, vendor: vendor });
            }
         
            // Return JSON
            context.response.setHeader('Content-Type', 'application/json');
            context.response.write(JSON.stringify(vendors));

        } catch (e) {
            log.error("Suitelet Error", e);
            context.response.write(JSON.stringify({ error: e.message }));
        }
    }

    return {
        onRequest: onRequest
    };
});
