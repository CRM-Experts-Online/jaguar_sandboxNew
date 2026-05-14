define(['./SP_LIB_Constants.js'], function(libConstants) {
    
    const
        TASK                      = libConstants.TASK,
        EMPLOYEE                  = libConstants.EMPLOYEE,
        EMPLOYEE_ROLES_FOR_SEARCH = libConstants.EMPLOYEE_ROLES_FOR_SEARCH;

    let
        _ctx, _N, _helper;

    function sendEmailsToAssignedRoleEmployees({ctx, N, helper}){
        try{
            _ctx = ctx, _N = N, _helper = helper;

            if(ctx.type == 'create' || ctx.type == 'copy'){
                let
                    employeesDataBasedOnRole = new Array(),
                    taskNewRecord = ctx.newRecord,

                    taskId = taskNewRecord.id,
                    taskTitle = taskNewRecord.getValue(TASK.fields.title.id),
                    assignedTo = taskNewRecord.getValue(TASK.fields.assignedTo.id),
                    assignedRole = taskNewRecord.getValue(TASK.fields.assignedRole.id),
                    taskRecordURL = "https://" + 
                    _N.url.resolveDomain({ hostType: _N.url.HostType.APPLICATION }) + 
                    _N.url.resolveRecord({
                        recordType: TASK.recordType,
                        recordId: taskId,
                        isEditMode: false
                    });

                log.debug('{assignedTo, assignedRole}', {assignedTo, assignedRole});

                employeesDataBasedOnRole = fetchEmployeesBasedOnRole(assignedRole)

                log.debug('test', employeesDataBasedOnRole);

                if(employeesDataBasedOnRole.length)
                    sendEmailToTheEmployees( taskRecordURL, taskTitle, employeesDataBasedOnRole.filter(({id}) => id != assignedTo) )
                else
                    log.debug(`No Employees Found Based On Role = ${assignedRole}`, `No Employees Found Based On Role = ${assignedRole}`);
            }
        }
        catch(err){
            log.debug('ERR! Found In sendEmailsToAssignedRoleEmployees()', err)
        }
    }

    function fetchEmployeesBasedOnRole(assignedRole){
        try{
            log.debug('Executing fetchEmployeesBasedOnRole()', 'Executing fetchEmployeesBasedOnRole()');

            let
                employeesDataBasedOnRole = new Array(),
                employeesBasedOnRoleSearch = _N.query.runSuiteQL({ "query":`
                    Select 
                        ${EMPLOYEE.suiteQLColumns.id.col}, ${EMPLOYEE.suiteQLColumns.email.col}
                    From 
                        ${EMPLOYEE.tableType}  
                    JOIN ${EMPLOYEE_ROLES_FOR_SEARCH.tableType} ON
                        ( ${EMPLOYEE_ROLES_FOR_SEARCH.tableType}.${EMPLOYEE_ROLES_FOR_SEARCH.suiteQLColumns.entity.col} = ${EMPLOYEE.tableType}.${EMPLOYEE.suiteQLColumns.id.col} )
                    WHERE
                        ${EMPLOYEE_ROLES_FOR_SEARCH.tableType}.${EMPLOYEE_ROLES_FOR_SEARCH.suiteQLColumns.role.col} = ${assignedRole}
                `});

            if(employeesBasedOnRoleSearch.results.length)
                employeesDataBasedOnRole = employeesBasedOnRoleSearch.results.map(res => ({email: res.values[1], id: res.values[0]}))
            
            return employeesDataBasedOnRole;
        }
        catch(err){
            log.debug('ERR! Found In fetchEmployeesBasedOnRole()', err)
        }
    }

    function sendEmailToTheEmployees(taskRecordURL, taskTitle, employeesDataBasedOnRole){
        try{

            log.debug('test2 ', employeesDataBasedOnRole);

            _N.email.send({
                author: _N.runtime.getCurrentUser().id,
                body: `
                    A new task has been created. Kindly check the link below.

                    <a href = "${taskRecordURL}" > ${taskTitle} </a>
                `,
                recipients: employeesDataBasedOnRole.map(({email}) => email),
                subject: `New Task Created {${taskTitle}}`,
                // relatedRecords: {
                //     entityId: recipientId,
                //     customRecord:{
                //         id:recordId,
                //         recordType: recordTypeId   //an integer value
                //     }
                // }

                // attachments: | file.File[],
                // bcc: number[] | string[],
                // cc: number[] | string[],
                // isInternalOnly: boolean,
                // replyTo: string
            })

        }
        catch(err){
            log.debug('ERR! Found In sendEmailToTheEmployees()', err);
        }
    }

    return{ sendEmailsToAssignedRoleEmployees }
});