/**
 *@NApiVersion 2.x
 *@NScriptType ClientScript
 */
 define(['N/record', 'N/runtime' ,'N/currentRecord'], function(record, runtime , currentRecord) {

    function fieldChanged(context) {
        var currentRecord = context.currentRecord;

        var getClassVal = currentRecord.getValue({
            fieldId: 'class'
        });

        var getBOLField = currentRecord.getField({
            fieldId: 'custbody_jaguar_bol'
        });

        var userObj = runtime.getCurrentUser();
        log.debug({
            title: "userObj",
            details: userObj
        });

        if (getClassVal == 1 && (userObj.role == 1389 || userObj.role == 1365 || userObj.role == 3 || userObj.role == 1362)) { // Check if class = 1 and user role is one of the specified roles
            getBOLField.isMandatory = true;
            //getBOLField.isDisabled = false; // Field should be editable
        } else if(getClassVal != 1 && (userObj.role == 1389 || userObj.role == 1365 || userObj.role == 3)){
            getBOLField.isMandatory = false;
            getBOLField.isDisabled = false; // Field should be disabled
        }
        else if(getClassVal != 1 && (userObj.role != 1389 || userObj.role != 1365 || userObj.role != 3)){
            getBOLField.isMandatory = false; // Field should not be mandatory
            getBOLField.isDisabled = true; // Field should be disabled
        }
        else if(getClassVal == 1 && (userObj.role != 1389 || userObj.role != 1365 || userObj.role != 3)){
            getBOLField.isMandatory = true; 
            getBOLField.isDisabled = true;    
            }
            else{
                return;
            }
    }

    return {
        fieldChanged: fieldChanged
    };
});
