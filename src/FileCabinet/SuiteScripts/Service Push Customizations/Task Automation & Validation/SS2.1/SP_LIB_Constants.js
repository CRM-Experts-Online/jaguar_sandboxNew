define([], function() {
    
    const
        TASK = {
            recordType: 'task', 
            fields: {
                title: {
                    id: 'title'
                },
                assignedTo: {
                    id: 'assigned'
                },
                assignedRole: {
                    id: 'custevent_assigned_role'
                }
            }
        },
        EMPLOYEE = {
            tableType: 'employee',
            suiteQLColumns:{
                id: {
                    col: 'id'
                },
                email: {
                    col: 'email'
                }
            }
        },
        EMPLOYEE_ROLES_FOR_SEARCH = {
            tableType: 'EmployeeRolesForSearch',
            suiteQLColumns:{
                id: {
                    col: 'id'
                },
                entity: {
                    col: 'entity'
                },
                role: {
                    col: 'role'
                }
            }
        };

    return{ TASK, EMPLOYEE, EMPLOYEE_ROLES_FOR_SEARCH }
});