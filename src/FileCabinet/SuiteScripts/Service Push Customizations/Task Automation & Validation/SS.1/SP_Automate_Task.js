define(['./SP_LIB_Constants.js'], function(libConstants) {
    
    const
        TASK                      = libConstants.TASK,
        EMPLOYEE                  = libConstants.EMPLOYEE,
        EMPLOYEE_ROLES_FOR_SEARCH = libConstants.EMPLOYEE_ROLES_FOR_SEARCH;

    function sendEmailsToAssignedRoleEmployees({ctx, N, helper}){
        try{
            if(ctx.type == 'edit'){
                let
                    taskNewRecord = ctx.newRecord,

                    assignedTo = taskNewRecord.getValue(TASK.fields.assignedTo.id),
                    assignedRole = taskNewRecord.getValue(TASK.fields.assignedRole.id);

                log.debug('{assignedTo, assignedRole}', {assignedTo, assignedRole});

                log.debug('test', fetchEmployeesBasedOnRole(assignedRole));
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
                employeeIdsBasedOnRole = new Array(),
                employeesBasedOnRoleSearch= N.query.runSuiteQL({ "query":`
                    Select 
                        ${EMPLOYEE.suiteQLColumns.id.col}
                    From 
                        ${EMPLOYEE.tableType}  
                    JOIN ${EMPLOYEE_ROLES_FOR_SEARCH.tableType} ON
                        ( ${EMPLOYEE_ROLES_FOR_SEARCH.tableType}.${EMPLOYEE_ROLES_FOR_SEARCH.suiteQLColumns.entity.col} = ${EMPLOYEE.tableType}.${EMPLOYEE.suiteQLColumns.id.col} )
                    WHERE
                        ${EMPLOYEE_ROLES_FOR_SEARCH.tableType}.${EMPLOYEE_ROLES_FOR_SEARCH.suiteQLColumns.role.col} = ${assignedRole}
                `});

            if(employeesBasedOnRoleSearch.results.length)
                employeeIdsBasedOnRole = employeesBasedOnRoleSearch.results.map(res => res.values.pop());
            
            return employeeIdsBasedOnRole;
        }
        catch(err){
            log.debug('ERR! Found In fetchEmployeesBasedOnRole()', err)
        }
    }

    return{ sendEmailsToAssignedRoleEmployees }
});