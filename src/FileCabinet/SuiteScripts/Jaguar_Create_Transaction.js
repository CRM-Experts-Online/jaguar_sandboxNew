/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 * @NModuleScope public
 */
define(['N/record', 'N/search', 'N/runtime', 'N/file', 'N/email', 'N/sftp', 'N/https', 'N/task'],
    function(record, search, runtime, file, email, sftp, https, task) {

        var PMPMapping = {};


        function GetInputData() {
            try {
                var scriptContext = runtime.getCurrentScript();

                var searchId = scriptContext.getParameter('custscript_saved_search');
                log.debug('searchId', searchId);

                var dailyCSV = search.load({
                    id: searchId
                });

                var arrayByItem = {};
                var arrayByCustomer = {};

                var csvData = [];

                dailyCSV.run().each(function(result) {
                    var JSONData = CSV2JSON(result.getValue('name'), result.id);
                    csvData = csvData.concat(JSONData);

                    return true;

                });

                log.debug('data', csvData);

                return csvData;
            } catch (err) {
                log.debug("GetInputData Error", err);

            }
        }

        function Map(context) {

            try {
                var dataIs = JSON.parse(context.value);
                log.debug('context', context);

                log.debug('dataIs', dataIs.value[0]);
                if (dataIs.value[0]) {
                    context.write({
                        key: context.key,
                        value: context.value
                    })
                }

            } catch (err) {
                log.debug("Map", err);
            }
        }

        function Reduce(context) {

            try {
                var scriptContext = runtime.getCurrentScript();
                var depId = scriptContext.deploymentId;
                log.debug('depId', depId);

                log.debug('context', context.key);

                var fistLine = JSON.parse(context.values[0]);
                log.debug('fistLine', fistLine);

                var getFileId = fistLine.filename;

                getFileId = getFileId.split("|");

                var fileInternalid = getFileId[1];

                log.debug('fileInternalid', fileInternalid);

                context.values.forEach((e) => {
                    var value = JSON.parse(e)
                    if (depId == 'customdeploy2') {

                        if (fistLine.value[0] != 'RouteDay') {

                            var pmpRec = record.create({
                                type: 'customrecord_pmp_package',
                            });

                            pmpRec.setValue('custrecord_routeday', fistLine.value[0]);
                            pmpRec.setValue('custrecord_accountcode', fistLine.value[1]);
                            pmpRec.setValue('custrecord_customername', fistLine.value[2]);
                            pmpRec.setValue('custrecord_shiptoaddress', fistLine.value[3]);
                            pmpRec.setValue('custrecord_producttype', fistLine.value[4]);
                            pmpRec.setValue('custrecord_gallons', fistLine.value[5]);
                            pmpRec.setValue('custrecord_ticket', fistLine.value[6]);
                            pmpRec.setValue('custrecord_bol', fistLine.value[7]);
                            pmpRec.setValue('custrecord_po', fistLine.value[8]);
                            pmpRec.setValue('custrecord_cost_pmp', fistLine.value[9]);
                            pmpRec.setValue('custrecord_blucost', fistLine.value[10]);
                            pmpRec.setValue('custrecord_invoice', fistLine.value[11]);
                            pmpRec.setValue('custrecord_billedgallons', fistLine.value[12]);
                            pmpRec.setValue('custrecord_dc', fistLine.value[13]);
                            pmpRec.setValue('custrecord_margin', fistLine.value[14]);
                            pmpRec.setValue('custrecord_invoiced', fistLine.value[15]);
                            pmpRec.setValue('custrecord_trucknumber', fistLine.value[16]);
                            //pmpRec.setValue('mediaitem', fileInternalid);

                            var BolId = fistLine.value[7];
                            log.debug('BolId', BolId);

                            var soId = fistLine.value[8];
                            log.debug('soId', soId);

                            var getBoId = searchBol(BolId);

                            var getSoId = searchso(soId);

                            log.debug('getBoId', getBoId);
                            log.debug('getSoId', getSoId);

                            if (getBoId && getBoId.length > 0) {
                                var setBolids = [];



                                for (i = 0; i < getBoId.length; i++) {

                                    setBolids.push(getBoId[i].id)



                                }

                                pmpRec.setValue('custrecord_linked_bol', setBolids);


                            }

                            if (getSoId && getSoId.length > 0) {

                                var setSoids = []

                                for (i = 0; i < getSoId.length; i++) {

                                    setSoids.push(getSoId[0].id)



                                }

                                log.debug('getSoId[0].id', setSoids);

                                pmpRec.setValue('custrecord_sales_order', setSoids);


                            }

                            var savePmp = pmpRec.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });
                            log.debug('savePmp', savePmp);

                            var attachid = record.attach({
                                record: {
                                    type: 'file',
                                    id: fileInternalid
                                },
                                to: {
                                    type: 'customrecord_pmp_package',
                                    id: savePmp
                                }
                            });
                            log.debug('attachid', attachid);


                        }




                    } else {

                        var bolHeader = '';

                        search.create({
                            type: 'customrecord_transaction_report',
                            filters: [
                                ['custrecord_trans_report_bol_num', 'is', value['value'][0]]
                            ]
                        }).run().each(function(result) {
                            log.debug('EXIST', result.id);
                            bolHeader = result.id;
                        });


                        if (!bolHeader) {
                            var tranReportRec = record.create({
                                type: 'customrecord_transaction_report',
                            });
                            tranReportRec.setValue('name', value['value'][0]);
                            tranReportRec.setValue('custrecord_trans_report_bol_num', value['value'][0]);
                            tranReportRec.setValue('custrecord_trans_report_transaction_id', value['value'][1]);
                            tranReportRec.setValue('custrecord_trans_report_start_time', value['value'][2]);
                            tranReportRec.setValue('custrecord_trans_report_end_time', value['value'][3]);
                            tranReportRec.setValue('custrecord_trans_report_dest_state_id', value['value'][4]);
                            tranReportRec.setValue('custrecord_trans_report_terminal_id', value['value'][9]);
                            tranReportRec.setValue('custrecord_trans_report_ternimal_num', value['value'][10]);
                            tranReportRec.setValue('custrecord_trans_report_terminal_name', value['value'][11]);
                            tranReportRec.setValue('custrecord_trans_report_supplier_id', value['value'][12]);
                            tranReportRec.setValue('custrecord_trans_report_supplier_num', value['value'][13]);
                            tranReportRec.setValue('custrecord_trans_report_supplier_name', value['value'][14]);
                            tranReportRec.setValue('custrecord_trans_report_vendor_id', value['value'][15]);
                            tranReportRec.setValue('custrecord_trans_report_vendor_num', value['value'][16]);
                            tranReportRec.setValue('custrecord_trans_report_vendor_name', value['value'][17]);
                            tranReportRec.setValue('custrecord_trans_report_driver_id', value['value'][20]);
                            tranReportRec.setValue('custrecord_trans_report_shift_id', value['value'][21]);
                            tranReportRec.setValue('custrecord_trans_report_shift_date', value['value'][22]);
                            tranReportRec.setValue('custrecord_trans_report_demurrage_mins', value['value'][23]);
							
							if(value['value'][10]){
								var locationId = getLocation(value['value'][10])
								
								if(locationId != null){
										tranReportRec.setValue('custrecord_location_id',locationId);
								}
							}
							
							var getParent = searchParent(value['value'][13]);
							
							if(getParent != null ){
								tranReportRec.setValue('custrecord_parent_vendor', getParent);
							
							}else{
								tranReportRec.setValue('custrecord_po_error', 'VENDOR RECORD NOT FOUND');
							}


                            bolHeader = tranReportRec.save({
                                enableSourcing: true,
                                ignoreMandatoryFields: true
                            });
                            log.debug('bolHeader', bolHeader);
                        }

                        var childrecord = record.create({
                            type: 'customrecord_bol_child',
                        });

                        childrecord.setValue('custrecord_bol_header', bolHeader);
                        childrecord.setValue('custrecord_bought_as_product_id', value['value'][5]);
                        childrecord.setValue('custrecord_sold_as_product_id', value['value'][6]);
                        childrecord.setValue('custrecord_gross_gallons_delivered', value['value'][7]);
                        childrecord.setValue('custrecord_net_gallons_delivered', value['value'][8]);
                        var saveChild = childrecord.save({
                            enableSourcing: true,
                            ignoreMandatoryFields: true
                        });


                        var attachid = record.attach({
                            record: {
                                type: 'file',
                                id: fileInternalid
                            },
                            to: {
                                type: 'customrecord_bol_child',
                                id: saveChild
                            }
                        });

                        log.debug('attachid', attachid);


                    }

                });
            } catch (err) {
                log.debug("Reduce", err);
            }
        }

        function updateItem(dataIs) {

            var recId = dataIs["NetSuite ID"];
            log.debug(recId, JSON.stringify(dataIs));
            if (!recId) return;

            var soRec = record.load({
                type: record.Type.SALES_ORDER,
                id: recId
            });
            for (var key in dataIs) {
                if (key == "NetSuite ID") continue;
                if (!fieldMapping[key]) continue;
                if (!dataIs[key]) continue;
                soRec.setValue(fieldMapping[key], dataIs[key]);
            }
            var soId = soRec.save({
                enableSourcing: true,
                ignoreMandatoryFields: true
            });
            log.debug(soId, "Saved");
        }
		
		function getLocation(terminalNum){
			
			var locationSearchObj = search.create({
   type: "location",
   filters:
   [
      ["custrecord_terminals.name","is",terminalNum]
   ],
   columns:
   [
      search.createColumn({name: "name", label: "Name"}),
      search.createColumn({name: "phone", label: "Phone"}),
      search.createColumn({name: "city", label: "City"}),
      search.createColumn({name: "state", label: "State/Province"}),
      search.createColumn({name: "country", label: "Country"}),
      search.createColumn({name: "custrecord_mfgmob_wo_defaultlocation", label: "Default Work Order Location"})
   ]
});

var results = locationSearchObj.run();
            var searchRes = results.getRange({
                start: 0,
                end: 1000
            });
          log.debug('location', searchRes);
		  
		  if(searchRes && searchRes.length > 0){
			  return searchRes[0].id;
		  }else{
			  return null
		  }


		}
		
		function searchParent(vId){
			
			var vendorSearchObj = search.create({
   type: "vendor",
   filters:
   [
      ["entityid","is",vId],
     "AND", 
      ["isinactive","is","F"]
   ],
   columns:
   [
      search.createColumn({name: "internalid", label: "Internal ID"}),
      search.createColumn({name: "custentity_parent_vendor", label: "Parent Vendor"}),
      search.createColumn({name: "custentity_primary_parent_vendor", label: "Primary Parent vendor"})
   ]
});

 var results = vendorSearchObj.run();
            var searchRes = results.getRange({
                start: 0,
                end: 1000
            });
          log.debug('VENDOR', searchRes);

           if(searchRes && searchRes.length > 0){
			   var pId = searchRes[0].getValue('custentity_primary_parent_vendor');
			   return pId;
		   }else{
			   return null;
		   }


			
		}

        function CSV2PMP(csv_file_id) {
            var o_csvFile = file.load(csv_file_id);

            var csvContent = o_csvFile.getContents();
            var rows_data = CSVToArray(csvContent);

            // var headers = rows_data[0].toString().split(',')
            for (var csv_index = 1; csv_index < rows_data.length; csv_index++) //file_data.length-1
            {
                var row_data = rows_data[csv_index].toString().split(',');
                PMPMapping["BOLID"] = row_data[7];
                PMPMapping["SOID"] = row_data[8];
            }
        }

        function CSV2JSON(filename, csv_file_id) {
            var o_csvFile = file.load(csv_file_id);

            filename = filename + '|' + csv_file_id;

            var csvContent = o_csvFile.getContents();
            var rows_data = CSVToArray(csvContent);

            var JSON_OUTPUT = [];
            // var headers = rows_data[0].toString().split(',')
            for (var csv_index = 0; csv_index < rows_data.length; csv_index++) //file_data.length-1
            {
                var row_data = rows_data[csv_index].toString().split(',');
                JSON_OUTPUT.push({
                    filename: filename,
                    value: row_data
                });
            }
			o_csvFile.folder = 3048;
			var fileId = o_csvFile.save();
                        log.debug('fileId', fileId);

            return JSON_OUTPUT;
        }

        function searchBol(BolId) {

            var bolSearch = search.create({
                type: "customrecord_transaction_report",
                filters: [
                    ["custrecord_trans_report_bol_num", "is", BolId]
                ],
                columns: [
                    search.createColumn({
                        name: "custrecord_trans_report_bol_num",
                        label: "BOL Number"
                    })
                ]
            });
            var results = bolSearch.run();
            var searchRes = results.getRange({
                start: 0,
                end: 1000
            });

            return searchRes;

        }

        function searchso(soId) {

            var soSearch = search.create({
                type: "salesorder",
                filters: [
                    ["type", "anyof", "SalesOrd"],
                    "AND",
                    ["mainline", "is", "T"],
                    "AND",
                    ["numbertext", "is", soId]
                ],
                columns: [
                    search.createColumn({
                        name: "internalid",
                        label: "Internal ID"
                    })
                ]
            });
            var results = soSearch.run();
            var searchRes = results.getRange({
                start: 0,
                end: 1000
            });

            return searchRes;

        }

        function CSVToArray(strData, strDelimiter) {
            strDelimiter = (strDelimiter || ",");
            var objPattern = new RegExp((

                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi");

            var arrData = [
                []
            ];
            var arrMatches = null;
            while (arrMatches = objPattern.exec(strData)) {

                var strMatchedDelimiter = arrMatches[1];
                if (strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {
                    arrData.push([]);
                }
                if (arrMatches[2]) {
                    var strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");
                } else {

                    var strMatchedValue = arrMatches[3];
                }
                arrData[arrData.length - 1].push(strMatchedValue);
            }

            return (arrData);
        }

        function Summarize(summary) {
            try {
                var scriptContext = runtime.getCurrentScript();
                var depId = scriptContext.deploymentId;
                log.debug('depId', depId);

                if (depId != 'customdeploy2') {
                    var mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE
                    });
                    mrTask.scriptId = 'customscript_jaguar_create_transaction';
                    mrTask.deploymentId = 'customdeploy2';
                    var mrTaskId = mrTask.submit();
                }

                var scriptContext = runtime.getCurrentScript();

                var searchId = scriptContext.getParameter('custscript_saved_search');
                log.debug('searchId', searchId);

                var dailyCSV = search.load({
                    id: 2831
                });
                var results = dailyCSV.run();
                var searchRes = results.getRange({
                    start: 0,
                    end: 1000
                });

                if (searchRes && searchRes.length > 0) {
                    for (i = 0; i < searchRes.length; i++) {

                        var fileObj = file.load({
                            id: searchRes[i].id
                        });
                        fileObj.folder = 3033;
                        var fileId = fileObj.save();
                        log.debug('fileId', fileId);

                    }
                }



            } catch (err) {
                log.debug("Summarize", err);
            }
        }
        return {
            getInputData: GetInputData,
            map: Map,
            reduce: Reduce,
            summarize: Summarize
        };
    });