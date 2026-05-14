/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 */

define(['N/currentRecord', 'N/https', 'N/url', 'N/log'], function (currentRecord, https, url, log) {

    function getSourceIdFromUrl() {
        var params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    function pageInit(context) {
        try {
            // Only run if record is copied
            if (context.mode !== 'copy') {
                log.debug("pageInit", "Not in copy mode. Exiting.");
                return;
            }

            var rec = currentRecord.get();
            var sourceId = getSourceIdFromUrl();

            if (!sourceId) {
                log.debug("pageInit", "No source record ID found in URL.");
                return;
            }

            // log.debug("pageInit", "Source Record ID: " + sourceId);

            // Build Suitelet URL
            var suiteletUrl = url.resolveScript({
                scriptId: 'customscriptget_vendor_list_drop_ship_so',
                deploymentId: 'customdeployget_vendor_list_drop_ship_so',
                returnExternalUrl: false
            });
            log.debug("suiteletUrl", suiteletUrl);
            // Call Suitelet to get original vendors
            var response = https.get({
                url: suiteletUrl + '&id=' + sourceId
            });
            log.debug("response", response);
            var vendors = JSON.parse(response.body);

            if (vendors.error) {
                log.error("Suitelet returned error", vendors.error);
                return;
            }

            //  log.debug("Original Vendors", vendors);

            // Update line vendors on copied SO
            var lineCount = rec.getLineCount({ sublistId: 'item' });

            for (var i = 0; i < lineCount; i++) {

                rec.selectLine({
                    sublistId: 'item',
                    line: i
                });

                // Set the vendor field
                rec.setCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'povendor',
                    value: vendors[i].vendor,
                    ignoreFieldChange: true
                });

                // Commit the line
                rec.commitLine({ sublistId: 'item' });

                // log.debug("Line Vendor Set", "Line: " + i + " Vendor: " + vendors[i].vendor);
            }


            //  log.debug("pageInit", "All line vendors restored from original SO.");

        } catch (e) {
            log.error("pageInit Error", e);
        }
    }




    function fieldChanged(scriptContext) {

        var rec = scriptContext.currentRecord;
        var fieldId = scriptContext.fieldId;
        var line = scriptContext.line;

        var recClass = rec.getValue('class');
        var vendor = rec.getValue('custbody_vendor');

        // -----------------------------
        // 1) RATE FIELD FORMATTING
        // -----------------------------
        if (fieldId === 'rate') {

            var currentValue = rec.getCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate'
            });

            var formattedValue = formatDecimalPlaces(currentValue, 5);

            rec.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'rate',
                value: formattedValue,
                ignoreFieldChange: true
            });
        }

        // -----------------------------
        // 2) UPDATE VENDOR FIELDS ON ALL LINES WHEN BODY VENDOR CHANGES
        // -----------------------------
        if (fieldId == 'custbody_vendor' && recClass == 2) {

            if (vendor) {
                var lineCount = rec.getLineCount({ sublistId: 'item' });

                for (var i = 0; i < lineCount; i++) {

                    rec.selectLine({
                        sublistId: 'item',
                        line: i
                    });

                    rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'povendor',
                        value: vendor
                    });

                    // rec.setCurrentSublistValue({
                    //     sublistId: 'item',
                    //     fieldId: 'createpo',
                    //     value: ''
                    // });

                    rec.commitLine({ sublistId: 'item' });
                }
            }
        }

        // -----------------------------
        // 3) UPDATE LINE LOCATIONS WHEN BODY LOCATION CHANGES
        // -----------------------------
        try {
            // log.debug('fieldChanged', fieldId);
            if (fieldId === 'location') {
                var bodyLoc = rec.getValue('location');
                if (!bodyLoc) return;

                var lineCount = rec.getLineCount({ sublistId: 'item' });

                // for (var i = 0; i < lineCount; i++) {
                //     rec.selectLine({ sublistId: 'item', line: i });
                //     rec.setCurrentSublistValue({
                //         sublistId: 'item',
                //         fieldId: 'location',
                //         value: bodyLoc,
                //         ignoreFieldChange: true
                //     });
                //     rec.commitLine({ sublistId: 'item' });
                // }
            }

        } catch (e) {
            console.log('fieldChanged error: ' + e);
        }
    }

    function formatDecimalPlaces(value, decimalPlaces) {
        // Convert the value to a number and ensure it's not NaN
        value = Number(value);
        if (isNaN(value)) {
            return '0.00000'; // Default to '0.00000' if the value is not a number
        }

        // Round the value to the specified number of decimal places
        var factor = Math.pow(10, decimalPlaces);
        var roundedValue = Math.round(value * factor) / factor;

        // Convert the rounded value to a string with fixed decimal places
        var formattedValue = roundedValue.toFixed(decimalPlaces);
        return formattedValue;
    }

    function validateLine(context) {
        var currentRecord = context.currentRecord;
        var recClass = currentRecord.getValue('class');
        var vendor = currentRecord.getValue('custbody_vendor');
        var sublistName = context.sublistId;
        // if (sublistName === 'item' && recClass == 2 && vendor) {
        //     log.debug("run");
        currentRecord.setCurrentSublistValue({
            sublistId: sublistName,
            fieldId: 'povendor',
            value: vendor || null
        });

        // currentRecord.setCurrentSublistValue({
        //     sublistId: sublistName,
        //     fieldId: 'createpo',
        //     value: ''
        // });

        // }
        // if (sublistName === 'item' && recClass == 1 && vendor) {
        //     currentRecord.setCurrentSublistValue({
        //         sublistId: sublistName,
        //         fieldId: 'povendor',
        //         value: ''
        //     });

        //     currentRecord.setCurrentSublistValue({
        //         sublistId: sublistName,
        //         fieldId: 'createpo',
        //         value: ''
        //     });
        // }
        return true;

    }


    function postSourcing(scriptContext) {
        try {
            if (scriptContext.sublistId !== 'item') return;

            if (scriptContext.fieldId === 'item') {

                var rec = scriptContext.currentRecord;

                // Get line location (may be empty)
                var lineLocation = rec.getCurrentSublistValue({
                    sublistId: 'item',
                    fieldId: 'location'
                });

                // If empty → get body location

                var bodyLocation = rec.getValue('location');

                if (bodyLocation) {
                    rec.setCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'location',
                        value: bodyLocation,
                        ignoreFieldChange: true
                    });
                }

            }
        } catch (e) {
            console.log('postSourcing error: ' + e);
        }
    }


    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
       // validateLine: validateLine,
        postSourcing: postSourcing
    };
});