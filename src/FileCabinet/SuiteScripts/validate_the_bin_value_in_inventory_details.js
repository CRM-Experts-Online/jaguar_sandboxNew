/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define([], function () {


   function saveRecord(context) {
    var rec = context.currentRecord;
    var lineCount = rec.getLineCount({ sublistId: 'item' });

    for (var i = 0; i < lineCount; i++) {
        rec.selectLine({ sublistId: 'item', line: i });

        var qty = rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'quantity' });
        if (!qty || qty <= 0) {
            rec.cancelLine({ sublistId: 'item' }); // cancel line before continuing
            continue;
        }

        var hasInvDetail = rec.getCurrentSublistValue({ sublistId: 'item', fieldId: 'inventorydetailavail' });
        if (hasInvDetail !== true && hasInvDetail !== 'T') {
            rec.cancelLine({ sublistId: 'item' }); // cancel line before continuing
            continue;
        }

        var invDetail = rec.getCurrentSublistSubrecord({ sublistId: 'item', fieldId: 'inventorydetail' });
        if (!invDetail) {
            rec.cancelLine({ sublistId: 'item' });
            continue;
        }

        var invLineCount = invDetail.getLineCount({ sublistId: 'inventoryassignment' });

        if (invLineCount > 0) {
            for (var j = 0; j < invLineCount; j++) {
                var bin = invDetail.getSublistValue({ sublistId: 'inventoryassignment', fieldId: 'binnumber', line: j });
                if (!bin) {
                    alert('BIN is mandatory for inventory assignment line ' + (j + 1) + ' of item line ' + (i + 1));
                    rec.commitLine({ sublistId: 'item' }); // cancel line to avoid lock
                    return false;
                }
            }
        }
        else{
             rec.commitLine({ sublistId: 'item' }); // cancel line to avoid lock
            continue;
        }

        rec.commitLine({ sublistId: 'item' }); // commit line after checks
    }

    return true;
}



    return {
        saveRecord: saveRecord
    };
});
