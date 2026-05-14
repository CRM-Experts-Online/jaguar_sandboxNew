/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */

define(['N/ui/serverWidget', 'N/search', 'N/record', 'N/format'], (nsUi, nsSearch, record, nsFormat) => {

    function onRequest(context) {
        try {
            var request = context.request;
            var response = context.response;
            var params = request.parameters;

            if (request.method === 'GET') {
                getHandler(request, response, params);
            } else {
                postHandler(request, response, params);
            }
        } catch (e) {
            log.error('Error::onRequest', e);
            response.writeLine({ output: 'Error: ' + e.name + ' , Details: ' + e.message });
        }
    }

    function getHandler(request, response, params) {
        var hasDateParams = (!!params.fromdate && !!params.todate)
        var setDefaultDate = params.setdefaultdate || 'T'


        var form = nsUi.createForm({
            title: '📄 Customer Credit Status Report'
        });
        form.clientScriptModulePath = './credit_hold_report_cs.js';
        form.addSubtab({ id: 'custpage_tab', label: 'Customers' });


        var fromDateFld = form.addField({
            id: 'custpage_fromdate',
            type: nsUi.FieldType.DATE,
            label: 'From Date',
        });

        var toDateFld = form.addField({
            id: 'custpage_todate',
            type: nsUi.FieldType.DATE,
            label: 'To Date',
        });

        var customerFld = form.addField({
            id: 'custpage_customer',
            type: nsUi.FieldType.SELECT,
            label: 'Customer',
            source: 'customer'
        });
        customerFld.defaultValue = params.customer;

        // var customerFieldbyCompanyName = form.addField({
        //     id: 'custpage_customer_name',
        //     type: nsUi.FieldType.TEXT,
        //     label: 'Search Customer By Company Name',
        // });
        // customerFieldbyCompanyName.defaultValue = !!params.custCompanyName ? params.custCompanyName : '';

        if (!hasDateParams && setDefaultDate == 'T') {
            var fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 7);
            var toDate = new Date();
            toDate.setDate(toDate.getDate() + 1);

            fromDate = nsFormat.format({
                value: fromDate,
                type: nsFormat.Type.DATE
            });
            toDate = nsFormat.format({
                value: toDate,
                type: nsFormat.Type.DATE
            });

            fromDateFld.defaultValue = fromDate
            toDateFld.defaultValue = toDate
            params.fromdate = fromDate
            params.todate = toDate
            setDefaultDate = 'F'
        } else {
            fromDateFld.defaultValue = params.fromdate ? nsFormat.format({
                value: params.fromdate,
                type: nsFormat.Type.DATE
            }) : '';

            toDateFld.defaultValue = params.todate ? nsFormat.format({
                value: params.todate,
                type: nsFormat.Type.DATE
            }) : '';
        }


        form.addButton({
            id: 'custpage_reset',
            label: '✅ Reset Filters',
            functionName: 'resetFilters'
        });


        var sublist = form.addSublist({
            id: 'custpage_results',
            label: 'Customer Credit Status Report',
            type: nsUi.SublistType.LIST,
            tab: 'custpage_tab'
        });
        // var countField = synclib.addSelectedCountField(form);

        var pagedData = getCustomersDetails(params.customer, params.fromdate, params.todate);
        if (pagedData.count > 0) {
            var results = getResult(pagedData, params.page || 0);
            addPagingField(form, pagedData, params.page);
            const searchCountField = form.addField({
                id: 'custpage_toal_count',
                type: nsUi.FieldType.TEXT,
                label: 'Total Count',
                container: 'custpage_tab'
            });
            searchCountField.updateDisplayType({ displayType: nsUi.FieldDisplayType.HIDDEN });
            searchCountField.defaultValue = pagedData.count.toString();

            const currentPageCountField = form.addField({
                id: 'custpage_current_page_count',
                type: nsUi.FieldType.TEXT,
                label: 'CurrentPage Count',
                container: 'custpage_tab'
            });
            currentPageCountField.updateDisplayType({ displayType: nsUi.FieldDisplayType.HIDDEN });
            currentPageCountField.defaultValue = results.length.toString();

        }

        if (!!results && results.length > 0) {
            populateSublist(sublist, results)
        }
        response.writePage(form);
    }

    function getCustomersDetails(customer, fromdate, todate,) {

        const customerIdToReport = '51251';
        var customerSearch = nsSearch.create({
            type: nsSearch.Type.CUSTOMER,
            columns: [
                nsSearch.createColumn({ name: "internalid", label: "Internal ID" }),
                nsSearch.createColumn({ name: "altname", label: "Name" }),
                nsSearch.createColumn({ name: "email", label: "Email" }),
                nsSearch.createColumn({ name: "custentity_parent_name", label: "Parent Name" }),
                nsSearch.createColumn({ name: "parent", label: "Top Level Parent" }),
                nsSearch.createColumn({ name: "balance", label: "Balance" }),
                nsSearch.createColumn({ name: "creditlimit", label: "Credit Limit" }),
                nsSearch.createColumn({ name: "custentity_credit_insurance_type", label: "Credit Insurance Type" }),
                nsSearch.createColumn({ name: "custentity_credit_insurance_amt", label: "Credit Insurance Amount" })
            ],

            filters: [

                // ['internalid', 'is', customerIdToReport]
            ]
        });

        if (!!customer) {
            var customerFilter = nsSearch.createFilter({
                name: 'internalid',
                operator: 'anyof',
                values: [customer]
            });
            customerSearch.filters.push(customerFilter);
        }


        var to_trandate = todate || '';
        var from_trandate = fromdate || '';
        if (to_trandate && from_trandate) {
            var dateFilter = nsSearch.createFilter({
                name: 'datecreated',
                operator: 'within',
                values: [from_trandate, to_trandate]

            });
            customerSearch.filters.push(dateFilter);
        }

        var pagedData = customerSearch.runPaged({
            pageSize: 30
        });
        //log.debug('pagedData', pagedData);

        return pagedData;
    }

    function getResult(pagedData, page) {
        var page = pagedData.fetch({
            index: page || 0
        });
        //log.debug('page', page);

        return page.data;
    }

    /**
             *
             * @param form
             * @param pagedData
             * @param currentPage
             * @description Adds pagination field for Netsuite searches.
             */

    function addPagingField(form, pagedData, currentPage) {
        var pageField = form.addField({
            id: 'custpage_page',
            type: nsUi.FieldType.SELECT,
            label: 'Page',
            container: 'custpage_tab'
        });

        var pageRanges = pagedData.pageRanges;

        pageRanges.forEach(function (pageRange, index) {
            pageField.addSelectOption({
                value: pageRange.index,
                text: index + 1
            })
        });
        pageField.defaultValue = currentPage;
    }

    /**
     * Populate sublist with customer fields + first 2 sales reps
     */
    /**
 * Populates a sublist with customer details including first 2 Sales Reps.
 * @param {Object} sublist - The Suitelet sublist object.
 * @param {Array} results - Array of customer search result objects.
 */
    function populateSublist(sublist, results) {
        if (!results || results.length === 0) return;

        // Define columns
        var columns = [
            { name: "altname", label: "Name", type: "text" },
            { name: "email", label: "Email", type: "text" },
            { name: "custentity_parent_name", label: "Parent Name", type: "text" },
            { name: "parent", label: "Top Level Parent", type: "text", useText: true },
            { name: "balance", label: "Balance", type: "currency" },
            { name: "creditlimit", label: "Credit Limit", type: "currency" },
            { name: "custentity_credit_insurance_type", label: "Credit Insurance Type", type: "text", useText: true },
            { name: "custentity_credit_insurance_amt", label: "Credit Insurance Amount", type: "currency" },
            { name: "salesrep1", label: "Sales Rep 1", type: "text" },
            { name: "salesrep2", label: "Sales Rep 2", type: "text" },
            { name: "balance_diff", label: "Balance vs Credit Limit", type: "currency" },
            { name: "balance_status", label: "Status", type: "text" } // over / close / ok
        ];

        // Add fields to sublist
        columns.forEach(function (col) {
            var fld = sublist.addField({
                id: 'custpage_' + col.name,
                label: col.label,
                type: col.type
            });
            if (col.type === "currency") {
                fld.updateDisplayType({ displayType: nsUi.FieldDisplayType.INLINE });
            }
        });

        // Populate sublist
        for (var i = 0; i < results.length; i++) {
            var customerId = results[i].getValue({ name: 'internalid' });
            if (!customerId) continue;

            // Load customer record for sales team
            var customerRecord = record.load({ type: record.Type.CUSTOMER, id: customerId });
            var salesTeam = [];
            var lineCount = customerRecord.getLineCount({ sublistId: 'salesteam' });
            for (var j = 0; j < lineCount && j < 2; j++) {
                var empName = customerRecord.getSublistText({
                    sublistId: 'salesteam',
                    fieldId: 'employee',
                    line: j
                });
                salesTeam.push(empName || '');
            }

            // Get balance and credit limit
            var balStr = results[i].getValue({ name: 'balance' }) || 0;
            var creditStr = results[i].getValue({ name: 'creditlimit' }) || 0;

            var balance = parseFloat(balStr) || 0;
            var creditLimit = parseFloat(creditStr) || 0;
            
            var balanceDiff = creditLimit - balance;
            log.debug('balanceDiff', balanceDiff);
            var balanceStatus;
            if (balance >= creditLimit) {
                balanceStatus = 'over limit';
            } else if (balance >= creditLimit * 0.85) {
                balanceStatus = 'close 85%';
            } else {
                balanceStatus = 'ok';
            }

            // Set values in sublist
            columns.forEach(function (col) {
                var val;
                if (col.name === 'salesrep1') {
                    val = salesTeam[0] || '';
                } else if (col.name === 'salesrep2') {
                    val = salesTeam[1] || '';
                } else if (col.name === 'balance_diff') {
                    val = balanceDiff.toString();
                } else if (col.name === 'balance_status') {
                    val = balanceStatus;
                } else if (col.name === 'email') {
                    val = results[i].getValue({ name: 'email' });
                    if (!val) {
                        // fallback to load record
                        val = customerRecord.getValue({ fieldId: 'email' }) || '';
                    }
                } else if (col.useText) {
                    val = results[i].getText({ name: col.name }) || '';
                } else {
                    val = results[i].getValue({ name: col.name }) || '';
                }

                if (col.type === "currency") {
                    val = val.toString().replace(/,/g, '');
                }
                var fieldId = 'custpage_' + col.name;

                if (val !== null && val !== undefined && val !== '') {
                    sublist.setSublistValue({
                        id: fieldId,
                        line: i,
                        value: val
                    });
                }
            });

        }
    }

    function parseCurrency(val) {
        if (!val) return 0;
        if (typeof val === 'string') val = val.replace(/,/g, '');
        return parseFloat(val) || 0;
    }

    return { onRequest };
});
