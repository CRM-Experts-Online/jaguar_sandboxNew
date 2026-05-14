/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 * @NModuleScope public
 */


define(['./dao/ebiz_config_dao', 'N/currentRecord', 'N/format', 'N/record', 'N/url', 'N/ui/message', 'N/ui/dialog', 'N/search', './PapaParse.js', './lodash'],
    function (config, nsCurrentRec, nsFormat, nsRecord, nsUrl, nsMessage, nsDialog, nsSearch, papaParse, _) {


        function pageInit(context) {

    
        }


        function postSourcing(context) {
            var currentRec = context.currentRecord;
            var sublistId = context.sublistId;
            var fieldId = context.fieldId;
        }

         function saveRecord(context) {
        

        return true;
    }
     


        function fieldChanged(context) {
            var currentRec = context.currentRecord;
            var sublistId = context.sublistId;
            var fieldId = context.fieldId;
            var line = context.line;

            var customerFieldId = 'custpage_customer';

            if (sublistId !== null && !isNaN(line)) {
                
            }

            if (!sublistId) {
                var url = getSuiteletURL();
                var urlArray = [url];

                // Get current field values
                var customer = currentRec.getValue({ fieldId: customerFieldId });
                var fromDate = currentRec.getValue({ fieldId: 'custpage_fromdate' });
                var toDate = currentRec.getValue({ fieldId: 'custpage_todate' });
                var page = currentRec.getValue({ fieldId: 'custpage_page' });
                

                // Push parameters to URL
                if (customer) urlArray.push('customer=' + customer);
               

                // Handle date filters
                urlArray = passDateFilters(currentRec, urlArray);

                // Default date flag
                var hasParams = !!customer || (!!fromDate && !!toDate);
                urlArray.push(hasParams ? 'setdefaultdate=F' : 'setdefaultdate=T');

                // Handle page parameter safely
                if (fieldId === 'custpage_page') {
                    if (page && !isNaN(parseInt(page, 10)) && parseInt(page, 10) >= 0) {
                        urlArray.push('page=' + parseInt(page, 10));
                    }
                }

                // Handle filters that trigger redirect
                var hasToRedirect = ['custpage_customer','custpage_fromdate', 'custpage_todate', 'custpage_page'].includes(fieldId);

                if (hasToRedirect) {
                    window.onbeforeunload = null;
                    window.location = window.location.origin + urlArray.join('&');
                }
            }
        }

        /**
         * Adds date filters to the URL parameters and returns the updated array.
         */
        function passDateFilters(currentRec, urlArray) {
            var fromDate = currentRec.getValue({ fieldId: 'custpage_fromdate' });
            var toDate = currentRec.getValue({ fieldId: 'custpage_todate' });
            if (!!toDate && !!fromDate) {
                toDate = nsFormat.format({ value: toDate, type: nsFormat.Type.DATE });
                fromDate = nsFormat.format({ value: fromDate, type: nsFormat.Type.DATE })
                !!fromDate ? urlArray.push('fromdate=' + fromDate) : ''
                !!toDate ? urlArray.push('todate=' + toDate) : ''
            }

            return urlArray;
        }



        /**
       * Validates if the date range is valid.
       * @param {string} fromDate - The from date.
       * @param {string} toDate - The to date.
       * @returns {boolean} - True if the date range is valid, otherwise false.
       */
        function isValidDateRange(fromDate, toDate) {
            return fromDate <= toDate;
        }



        function resetFilters() {
            window.location = window.location.origin + getSuiteletURL();
        }

        function getSuiteletURL() {

            var url = "/app/site/hosting/scriptlet.nl?script=3874&deploy=1"
            return url
        }


        function downloadExcel() {
            try {
                var table = document.querySelector("table[id*='custpage_results']");

                if (!table) {
                    alert("Sublist table not found.");
                    return;
                }

                var rows = table.querySelectorAll("tr");
                var csvData = [];

                rows.forEach(function (row) {
                    var cols = row.querySelectorAll("th, td");
                    var rowData = [];

                    cols.forEach(function (col) {
                        var text = col.innerText.trim();
                        text = '"' + text.replace(/"/g, '""') + '"';
                        rowData.push(text);
                    });

                    csvData.push(rowData.join(","));
                });

                var csvString = csvData.join("\n");

                var blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
                var link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = "MST_Report.csv";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

            } catch (e) {
                console.error("CSV Export Error:", e);
                alert("Error generating Excel file.");
            }
        }


        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged,
            resetFilters: resetFilters,
            downloadExcel: downloadExcel,
            saveRecord: saveRecord

        };
    });