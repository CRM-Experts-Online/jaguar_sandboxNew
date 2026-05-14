/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search'], function (record, search) {

    function afterSubmit(context) {
        try {
            if (context.type !== context.UserEventType.CREATE &&
                context.type !== context.UserEventType.EDIT) {
                return;
            }

            var newRec = context.newRecord;
            var parentId = newRec.id;
            var parentType = newRec.type;

            // Example: get a field value to filter custom records
            var bol = newRec.getValue({ fieldId: 'custrecord_trans_report_bol_num' });

            if (!bol) return;

            // 🔍 Search custom records
            var customSearch = search.create({
                type: 'customrecord_pmp_package', // source custom record
                filters: [
                    ['custrecord_bol', 'is', bol]
                ],
                columns: [
                    'internalid'                   
                ]
            });

            customSearch.run().each(function (result) {
				
				log.debug('result', result);

                var interId = result.getValue('internalid');
               

                // 🧾 Create child record
                var childRec = record.load({
                    type: 'customrecord_pmp_package',
					id:interId,
                    isDynamic: true
                });

                // Link to parent
                childRec.setValue({
                    fieldId: 'custrecord_linked_bol',
                    value: parentId
                });

                childRec.save();

                return true;
            });

        } catch (e) {
            log.error('Error in afterSubmit', e.toString());
        }
    }

    return {
        afterSubmit: afterSubmit
    };
});