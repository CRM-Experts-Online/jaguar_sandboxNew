/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/log', 'N/ui/serverWidget'], function(log, serverWidget) {

    function beforeLoad(context) {
        var newRecord = context.newRecord;
        var form = context.form;

        if (context.type === context.UserEventType.CREATE || 
            context.type === context.UserEventType.EDIT || 
            context.type === context.UserEventType.COPY) {

            log.debug({
                title: "beforeLoad Triggered",
                details: "Record Type: " + newRecord.type
            });

            try {
                var itemSublist = form.getSublist({ id: 'item' });

                // Check if the item sublist is valid
                if (itemSublist) {
                    var locationField = itemSublist.getField({ id: 'location' });

                    if (locationField) {
                        log.debug({
                            title: "Setting Location Field Non-Mandatory",
                            details: "Field: location"
                        });
                        locationField.isMandatory = false; // Set the field to non-mandatory
                    } else {
                        log.debug({
                            title: "Location Field Not Found on Sublist",
                            details: "Sublist: item"
                        });
                    }
                } else {
                    log.debug({
                        title: "Item Sublist Not Found",
                        details: "Check the sublist ID"
                    });
                }
            } catch (e) {
                log.error({
                    title: 'Error modifying field',
                    details: e.message
                });
            }
        }

        log.debug({
            title: 'Event Type',
            details: 'Context Type: ' + context.type
        });
    }

    return {
        beforeLoad: beforeLoad
    };
});
