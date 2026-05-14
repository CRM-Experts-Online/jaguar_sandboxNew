/**
* @NApiVersion 2.1
* @NScriptType UserEventScript
*/
 
define(['N/record', 'N/log', 'N/search', 'N/email'],
    function(record, log, search, email) {
    function afterSubmit(context) {   
        try {
            var newRecord = context.newRecord;
           // var oldRecord = context.oldRecord;
            if(context.type == 'create') {
                var taskRec = record.create({
                    type: 'task'
                });
                taskRec.setValue('title', 'New Quote is Created');
                taskRec.setValue('message', 'quote has been created research vendors and send vendor list with pricing to sales rep');
                taskRec.setValue('company', newRecord.getValue('entity'));
                taskRec.setValue('transaction', newRecord.id);
                taskRec.setValue('priority', 'HIGH');
              var dateObj = new Date();
              dateObj.setDate(dateObj.getDate() + 3);
                taskRec.setValue('duedate', dateObj);
                if(newRecord.getValue('class') == 1) {
                    taskRec.setValue('custevent_assigned_role', 1365);
                } else if(newRecord.getValue('class') == 2) {
                    taskRec.setValue('custevent_assigned_role', 1362);
                }
                taskRec.save();
            }
            

        }
        catch(e) {
            log.debug('exception: ', e);
        }
    }

    return {
        afterSubmit: afterSubmit
    };
});