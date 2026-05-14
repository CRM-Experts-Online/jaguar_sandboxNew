/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search'], function (record, search) {

    var internalIds = []; // Array to store internal IDs
    function getInputData() {
        var customerSearchObj = search.create({
            type: "customer",
            filters:
                [
      ["stage","anyof","CUSTOMER"], 
      "AND", 
      ["isinactive","is","F"], 
      "AND", 
      ["parentcustomer.entityid","isnotempty",""]
   ],
            columns: [search.createColumn({ name: "internalid", label: "Internal ID" })],
        });

        // Run the search in pages
        var searchPagedData = customerSearchObj.runPaged({ pageSize: 1000 }); // Adjust pageSize as needed

        // Process each page of results
        searchPagedData.pageRanges.forEach(function (pageRange) {
            var page = searchPagedData.fetch({ index: pageRange.index });
            page.data.forEach(function (result) {
                var internalId = result.getValue({ name: 'internalid' });
                internalIds.push(internalId);
            });
        });

        return internalIds;
    }

    function map(context) {
        var internalId = context.value;
        log.debug("Internal ID in map function:", internalId);

        var customerRecord = record.load({
            type: record.Type.CUSTOMER,
            id: internalId,
            isDynamic: true,
        });

        var parentId = customerRecord.getValue({ fieldId: 'parent' });

        var parentRecord = record.load({
            type: record.Type.CUSTOMER,
            id: parentId,
            isDynamic: true,
        });

        log.debug({
            title: "parentRecord",
            details: parentRecord
        });

        var getAddr1 = parentRecord.getValue({
            fieldId: 'shipaddr1'
        });

        var getAddr2 = parentRecord.getValue({
            fieldId: 'shipaddr2'
        });

        var getCity = parentRecord.getValue({
            fieldId: 'shipcity'
        });
        var getCountry = parentRecord.getValue({
            fieldId: 'shipcountry'
        });
        var getState = parentRecord.getValue({
            fieldId: 'shipstate'
        });

        var getZip = parentRecord.getValue({
            fieldId: 'shipzip'
        });

        log.debug({
            title: "Address Details",
            details: getAddr1 + " " + getAddr2 + " " + getCity + " " + getCountry + " " + getZip
        })
        var addressBookSublist = customerRecord.getSublist({ sublistId: 'addressbook' });

        log.debug({
            title: "addressBookSublist",
            details: addressBookSublist
        });

        // Set shipping address and mark it as default
        var selectNewLine = customerRecord.selectNewLine({
            sublistId: 'addressbook'
        });
        log.debug({
            title: "selectNewLine",
            details: selectNewLine
        });

        var addressSubrecord = customerRecord.getCurrentSublistSubrecord({
            sublistId: 'addressbook',
            fieldId: 'addressbookaddress'
        });

        log.debug({
            title: "addressSubrecord",
            details: addressSubrecord
        });

        var updateAddr1 = addressSubrecord.setValue({
            fieldId: 'addr1',
            value: getAddr1,
        });

        log.debug({
            title: "updateAddr1",
            details: updateAddr1
        });
        var updateAddr2 = addressSubrecord.setValue({
            fieldId: 'addr2',
            value: getAddr2,
        });

        log.debug({
            title: "updateAddr2",
            details: updateAddr2
        });
        var updateCity = addressSubrecord.setValue({
            fieldId: 'city',
            value: getCity,
        });

        log.debug({
            title: "updateCity",
            details: updateCity
        });
        var updatestate = addressSubrecord.setValue({
            fieldId: 'state',
            value: getState,
        });

        log.debug({
            title: "updatestate",
            details: updatestate
        });
        var updateZip = addressSubrecord.setValue({
            fieldId: 'zip',
            value: getZip,
        });

        log.debug({
            title: "updateZip",
            details: updateZip
        });
        customerRecord.setCurrentSublistValue({
            sublistId: 'addressbook',
            fieldId: 'defaultshipping',
            value: true,
        });

        customerRecord.setCurrentSublistValue({
            sublistId: 'addressbook',
            fieldId: 'defaultbilling',
            value: false,
        });

        var updateAddr1 = addressSubrecord.setValue({
            fieldId: 'addr1',
            value: getAddr1,
        });

        log.debug({
            title: "updateAddr1",
            details: updateAddr1
        });
        var updateAddr2 = addressSubrecord.setValue({
            fieldId: 'addr2',
            value: getAddr2,
        });

        log.debug({
            title: "updateAddr2",
            details: updateAddr2
        });
        var updateCity = addressSubrecord.setValue({
            fieldId: 'city',
            value: getCity,
        });

        log.debug({
            title: "updateCity",
            details: updateCity
        });
        var updatestate = addressSubrecord.setValue({
            fieldId: 'state',
            value: getState,
        });

        log.debug({
            title: "updatestate",
            details: updatestate
        });
        var updateZip = addressSubrecord.setValue({
            fieldId: 'zip',
            value: getZip,
        });

        log.debug({
            title: "updateZip",
            details: updateZip
        });
        customerRecord.setCurrentSublistValue({
            sublistId: 'addressbook',
            fieldId: 'defaultshipping',
            value: false,
        });

        customerRecord.setCurrentSublistValue({
            sublistId: 'addressbook',
            fieldId: 'defaultbilling',
            value: true,
        });
        customerRecord.setCurrentSublistText({
            sublistId: 'addressbook',
            fieldId: 'label',
            text: "Bill To",
        });

        customerRecord.commitLine({
            sublistId: 'addressbook'
        });



        var customerId = customerRecord.save({
            enableSourcing: true,
            ignoreMandatoryFields: false
        });
        log.debug("Customer ID with updated addresses:", customerId);
    }

    return {
        getInputData: getInputData,
        map: map
    };
});


