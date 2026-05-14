/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['N/search', 'N/record', 'N/log'], (search, record, log) => {

    const getInputData = () => {
        return search.create({
            type: "customer",
            filters: [
                ["custentity_commission_percent", "lessthan", "10"]
            ],
            columns: [
                search.createColumn({
                    name: "custentity_commission_percent",
                    label: "Commission %"
                })
            ]
        });
    };

    const map = (context) => {
        try {
            const result = JSON.parse(context.value);

            const customerId = result.id;
            const oldValue = result.values.custentity_commission_percent;

            log.debug("Processing Customer", `ID: ${customerId}, Old Value: ${oldValue}`);

            // Load customer record
            const customerRec = record.load({
                type: record.Type.CUSTOMER,
                id: customerId
            });

            // Always set to 10%
            customerRec.setValue({
                fieldId: 'custentity_commission_percent',
                value: 10
            });

            // Save record
            const newId = customerRec.save();
            log.audit("Updated Customer", `ID: ${newId} => Commission% set to 10`);

        } catch (e) {
            log.error("Map Error", e);
        }
    };

    return {
        getInputData,
        map
    };
});
