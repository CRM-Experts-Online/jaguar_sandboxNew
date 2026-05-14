/**
 *@NApiVersion 2.x
 *@NScriptType MapReduceScript
 */
 define(['N/search', 'N/record'], function(search, record) {

    function getInputData() {
        var customerSearchObj = search.create({
            type: "customer",
            filters:
            [
               ["isjob","is","T"]
            ],
            columns:
            [
               search.createColumn({name: "internalid", label: "Internal ID"})
            ]
        });

        var searchResultCount = customerSearchObj.runPaged().count;
        log.debug("customerSearchObj result count", searchResultCount);

        var resultArray = [];
        customerSearchObj.run().each(function(result) {
            resultArray.push(result.getValue({name: 'internalid'}));
            return true;
        });

        return resultArray;
    }

    function map(context) {
        var customerId = JSON.parse(context.value);
        log.debug('Processing Customer ID:', customerId);
        
        // Perform your processing with the customerId here
        // For example, load the customer record:
        try {
            var parentRecord = record.load({
                type: record.Type.JOB,
                id: customerId
            });
            log.debug('parentRecord:', parentRecord);

            var getCustomerID = parentRecord.getValue({
                fieldId: 'parent'
            });

            var loadCustomerRec = record.load({
                type: record.Type.CUSTOMER,
                id: getCustomerID,
                isDynamic: true,
            });

            var getDyedDieselnum = loadCustomerRec.getValue({
                fieldId: 'custentity_dyed_diesel_permit_number'
            });

            var getEquipment = loadCustomerRec.getValue({
                fieldId: 'custentity_equipment_only'
            });

            var getBondedUserLic = loadCustomerRec.getValue({
                fieldId: 'custentity_bonded_user_license'
            });

            var getVatNumber = loadCustomerRec.getValue({
                fieldId: 'vatregnumber'
            });


            log.debug({
                title: "getDyedDieselnum",
                details: getDyedDieselnum +" "+ getEquipment +" "+ getBondedUserLic
            });

            var setvalueDDNum = parentRecord.setValue({
                fieldId: "custentity_dyed_diesel_permit_number",
                value: getDyedDieselnum,
            });

            var setvalueEquipment = parentRecord.setValue({
                fieldId: "custentity_equipment_only",
                value: getEquipment,
            });

            var setvalueBondedUser = parentRecord.setValue({
                fieldId: "custentity_bonded_user_license",
                value: getBondedUserLic,
            });

            var setValueTin = parentRecord.setValue({
                fieldId: 'custentity_vat_reg_no',
                value: getVatNumber
            });

            var saveRec = parentRecord.save({
                enableSourcing: true,
                ignoreMandatoryFields: false
            });

            log.debug({
                title: "saveRec",
                details: saveRec
            });



        } catch (e) {
            log.error('Error loading customer record', e);
        }
    }

    return {
        getInputData: getInputData,
        map: map
    }
});
