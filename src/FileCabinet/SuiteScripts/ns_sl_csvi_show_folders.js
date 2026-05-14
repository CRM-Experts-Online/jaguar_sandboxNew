/**
 * Copyright (c) 1998-2020 Oracle NetSuite GBU, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * Oracle NetSuite GBU, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with Oracle NetSuite GBU.
 *
 * Module Description
 * Suitelet is used for manual transfer of files using SFTP connection.
 *
 * Version    Date          Author           Remarks
 * 1.00       2018          shradela         initial version
 * 1.01		  2020 February shradela         code revision
 *
 */
/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/task',
        'N/ui/serverWidget',
        'N/runtime',
        'N/email',
        'N/record',
        'N/search',
        'N/error',
        './NSUtil_Lib_SS2',
        'N/url',
        'N/http',
        'N/https',
        'N/redirect','N/ui/message'
    ],

    function(
        task,
        ui,
        runtime,
        email,
        record,
        search,
        error,
        NSUtil,
        url,
        http,
        https,
        redirect,
        message
    ) {

        var ST_GLOBAL_SCRIPT_PATH = runtime.getCurrentScript().getParameter('custscript_sftp_client_script_path');

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {

            try {

                log.debug('onRequest', '-- Start --');

                //get context
                var objResponse = context.response;
                //create form
                var objForm = createForm(context, runtime);
                //write form
                objResponse.writePage(objForm);

                log.debug("onRequest", '-- End --');

            } catch (err) {
                log.error("ERROR", err);

            }
        }

        /**
         * Create Suitelet UI form
         *
         * @param {Object} context
         * @param {Module} runtime
         * @return {Object} form
         **/
        function createForm(context, runtime) {

            try {

                var objRequest = context.request;
                var objParameters = objRequest.parameters;
                var stReqMethod = objRequest.method;
                var blnIsError = false;
                var arrSearchResults = [];

                /* Start Form */

                var objForm = ui.createForm({
                    title: 'Transmit Payment Files'
                });

                objForm.clientScriptModulePath = ST_GLOBAL_SCRIPT_PATH;

                //add buttons
                objForm.addSubmitButton({
                    label: 'Transmit Files'
                });

                /** Add Sublist **/

                var objSublist = objForm.addSublist({
                    id: 'custpage_folders_to_process',
                    type: ui.SublistType.LIST,
                    label: 'Folders to Process'

                });

                objSublist.addMarkAllButtons();

                var objSublistSelect = objSublist.addField({
                    id: 'custpage_select',
                    label: 'Process Folder',
                    type: ui.FieldType.CHECKBOX
                });

                var objFolderName = objSublist.addField({
                    id: 'custpage_folder_name',
                    label: 'Folder Name',
                    type: ui.FieldType.TEXT
                });

                var objFolderId = objSublist.addField({
                    id: 'custpage_folder_id',
                    label: 'Folder Id',
                    type: ui.FieldType.TEXT
                });

                objFolderId.updateDisplayType({
                    displayType: ui.FieldDisplayType.HIDDEN
                });

                var objNumOfFiles = objSublist.addField({
                    id: 'custpage_number_of_files',
                    label: 'Number of files',
                    type: ui.FieldType.TEXT
                });

                if (stReqMethod == "GET") {
                    log.debug('GET METHOD');
                    arrSearchResults = searchFolders();

                }

                log.debug('arrSearchResults', JSON.stringify(arrSearchResults));

                //Added else to show banner message on screen if no folder mappings are found
                if (!NSUtil.isEmpty(arrSearchResults)) {

                    setPageSublistValues(arrSearchResults, objSublist);

                }else
                {
                    objForm.addPageInitMessage({type: message.Type.WARNING, message: 'No Folder Mappings available. Please create folder mappings for SFTP configurations.', duration: 5000});
                }


                if (stReqMethod == "POST") {
                    try {


                        var arrDataToSentToMR = getSublistValues(context, NSUtil);
                        log.debug('arrDataToSentToMR', {arrDataToSentToMR: arrDataToSentToMR});

                        // Run only First Time
                        if(true){


                            log.debug('post param', {
                                contextParams: context.request.parameters
                            });

                            //call scheduled script
                            var objMapReduceScriptTask = task.create({
                                taskType: task.TaskType.MAP_REDUCE
                            });

                            objMapReduceScriptTask.scriptId = 'customscript_ns_mr_auto_file_transfer'; // rename
                            objMapReduceScriptTask.params = {
                              custscript_arr_folders: arrDataToSentToMR
                            };

                            callMapReduceScript(objMapReduceScriptTask);
                        }

                        arrSearchResults = searchFolders();
                        //Added else to show banner message on screen if no folder mappings are found
                        if (!NSUtil.isEmpty(arrSearchResults)) {

                            setPageSublistValues(arrSearchResults, objSublist);

                        }else
                        {
                            objForm.addPageInitMessage({type: message.Type.WARNING, message: 'No Folder Mappings available. Please add folder mappings to your SFTP configurations.', duration: 5000});
                        }

                        var objReqParams = context.request.parameters;

                        redirect.toSuitelet({
                            scriptId: objReqParams.script,
                            deploymentId: objReqParams.deploy,
                            parameters: {
                                'custparam_submitted': true
                            }
                        });

                    } catch (e) {
                        log.error('ERROR', e);
                    }

                }

                return objForm;

            } catch (e) {

                log.error('ERROR', e);

            }

        }

        /**
         * Creates the SFTP Folder Mapping search and returns the search results (Folder IDs) in array
         *
         * @returns {Array} results
         */
        function searchFolderMapping() {

            // Search SFTP - Folder Mapping
            var objSrch = search.create({
                type: "customrecord_ps_sftp_fld_map",
                filters:
                [
                  ["custrecord_ps_sftp_config_rel.isinactive","is","F"],
                  "AND",
                  ["isinactive","is","F"],
                  "AND",
                  ["custrecord_ps_sftp_config_rel","noneof","@NONE@"]
               ],
                columns:
                [
                  search.createColumn({
                     name: "custrecord_ps_sftp_ns_fld_from",
                     sort: search.Sort.ASC
                  })
                ]
                });

                var arrSrchFolder = objSrch.runPaged();

          			// Search RESULTS check: Zones
          			if(arrSrchFolder.count > 0){

          					log.debug('arrSrchFolder',{
          							arrSrchFolder: arrSrchFolder
          					});

                    var arrOutput = [];
          					arrSrchFolder.pageRanges.forEach(function(pageRange) {
          							var arrMyPageOfResults = arrSrchFolder.fetch({index : pageRange.index});
          							arrMyPageOfResults.data.forEach(function(result) {

          							    arrOutput.push(result.getValue({name : 'custrecord_ps_sftp_ns_fld_from'}));

          							});
          					});

          					log.debug('arrOutput', {
          							arrOutput: arrOutput
          					});

          					return arrOutput;

          			}else{
          					log.debug('arrSrchFolder - no Search Results', '0 Search Results');
          			}
        }

        /**
         * Creates the search and returns the search results in array
         *
         * @returns {Array} results
         */
        function searchFolders() {

            var arrResults = [];
            var arrFolderIDs = [];
            arrFolderIDs = searchFolderMapping();

            if(arrFolderIDs && arrFolderIDs.length > 0){
                var objPaymentFileFormatSearch = search.create({
                    type: "folder",
                    filters:
                        [
                            ["internalid","anyof",arrFolderIDs]
                        ],
                    columns:
                        [
                            search.createColumn({
                                name: "name",
                                sort: search.Sort.ASC
                            }),
                            "lastmodifieddate",
                            "numfiles",
                            "internalid",
                            "parent"
                        ]
                });

                objPaymentFileFormatSearch.run().each(function(result) {

                    var objResult = {};

                    objResult.folderName = result.getValue({
                        name: 'name'
                    });
                    objResult.folderId = result.getValue({
                        name: 'internalid'
                    });

                    objResult.numFiles = result.getValue({
                        name: 'numfiles'
                    });

                    objResult.lastModified = result.getValue({
                        name: 'lastmodifieddate'
                    });

                    objResult.parent = result.getText({
                        name: 'parent'
                    });

                    arrResults.push(objResult);

                    return true;
                });
            }

            return arrResults;
        }

        /**
         * Sets sublist values (with search values) on suitelet
         *
         * @param {Array} arrSearchResults - values to set
         * @param {Object} objSublist - sublist to be filled with values
         */
        function setPageSublistValues(arrSearchResults, objSublist) {

            log.debug('-- setPageSublistValues --');

            for (var i = 0; i < arrSearchResults.length; i++) {
                var objResult = arrSearchResults[i];

                objSublist.setSublistValue({
                    id: 'custpage_select',
                    line: i,
                    value: 'F'
                });

                //record id
                if (!NSUtil.isEmpty(objResult.folderName)) {

                    objSublist.setSublistValue({
                        id: 'custpage_folder_name',
                        line: i,
                        value: objResult.parent + ' : ' + objResult.folderName
                    });
                }

                if (!NSUtil.isEmpty(objResult.folderId)) {

                    objSublist.setSublistValue({
                        id: 'custpage_folder_id',
                        line: i,
                        value: objResult.folderId
                    });
                }


                //project
                if (!NSUtil.isEmpty(objResult.lastModified)) {

                    objSublist.setSublistValue({
                        id: 'custpage_last_modified',
                        line: i,
                        value: objResult.lastModified
                    });
                }

                if (!NSUtil.isEmpty(objResult.numFiles)) {
                    objSublist.setSublistValue({
                        id: 'custpage_number_of_files',
                        line: i,
                        value: objResult.numFiles
                    });
                }


            }

        }

        /**
         * Gets sublist values on suitelet
         *
         * @param {Object} context
         * @returns {Array} the values selected on the sublist lines
         */
        function getSublistValues(context) {
            var stLogTitle = 'getSublistValues';

            var objRequest = context.request;

            //set variable
            var arrDataToBeProcessed = [];

            //get line count
            var intLineCount = objRequest.getLineCount('custpage_folders_to_process');

            log.debug(stLogTitle, 'Sublist Line Count: ' + intLineCount);


            //get the values for each line
            for (var n = 0; n < intLineCount; n++) {

                var blnIsSelected = objRequest.getSublistValue({
                    group: 'custpage_folders_to_process',
                    name: 'custpage_select',
                    line: n
                });

                var intFolderId = objRequest.getSublistValue({
                    group: 'custpage_folders_to_process',
                    name: 'custpage_folder_id',
                    line: n
                });

                var intNumFiles = objRequest.getSublistValue({
                    group: 'custpage_folders_to_process',
                    name: 'custpage_number_of_files',
                    line: n
                });

                if (!forceBoolean(blnIsSelected)) {
                    continue;
                }


                arrDataToBeProcessed.push(intFolderId);
            }

            log.debug(stLogTitle, JSON.stringify(arrDataToBeProcessed));

            return arrDataToBeProcessed;
        }


        /**
         * Function to force string/integer value to boolean
         *
         * @param {String}/{Integer}/{Boolen} value - value to be forced to boolean
         * @return {boolean}  - returned boolean value
         *
         */
        function forceBoolean(value) {
            try {
                if (value && (value == 'true' || value == 'T' || value == true || value == 1)) {
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                throw (e);
            }
        }

        /**
         * Function to call MR script
         *
         * @param {Object} objMapReduce - value to be forced to boolean
         *
         */
        function callMapReduceScript(objMapReduce) {
            var stLogTitle = 'callMapReduceScript';

            try {
                //initial submit the task
                var stMapReduceId = objMapReduce.submit();
                var stTaskStatus = task.checkStatus(stMapReduceId);
                log.debug(stLogTitle, '** QUEUE STATUS : ' + JSON.stringify([stMapReduceId, stTaskStatus, task.TaskStatus.FAILED]));
            } catch (e) {
                //on error, create new deployment and retry

                log.error(stLogTitle, JSON.stringify(e));

                if (e.name == 'NO_DEPLOYMENTS_AVAILABLE') {
                    var stNewSDId = duplicateMRDeployment(objMapReduce.scriptId);

                    if (NSUtil.isEmpty(stNewSDId)) {
                        var objError = {};
                        objError.name = 'UNEXPECTED_ERROR';
                        objError.message = 'Error creating new deployment';
                        objError = error.create(objError);

                        throw objError;
                    }

                    var stMapReduceId = objMapReduce.submit();
                    var stTaskStatus = task.checkStatus(stMapReduceId);
                    log.audit(stLogTitle, '** RETRY QUEUE STATUS : ' + JSON.stringify([stMapReduceId, stTaskStatus, task.TaskStatus.FAILED]));

                }

            }
        }

        /**
         * Function to duplicate MR script deployment
         *
         * @param {String} stScriptId - value to be forced to boolean
         * @return {String}  - returned string value
         */
        function duplicateMRDeployment(stScriptId) {
            var stLogTitle = 'duplicateMRDeployment';

            //search for existing script deployment
            var stNewSDId = '';
            log.debug(stLogTitle, '--stScriptId = ' + stScriptId);

            var arrFilters = [
                search.createFilter({
                    name: 'scriptid',
                    join: 'script',
                    operator: search.Operator.IS,
                    values: stScriptId
                }),
                search.createFilter({
                    name: 'isdeployed',
                    operator: search.Operator.IS,
                    values: 'T'
                })
            ];

            var arrCols = [
                search.createColumn({
                    name: 'scriptid'
                })
            ];

            var objSearchSD = search.create({
                type: search.Type.SCRIPT_DEPLOYMENT,
                filters: arrFilters,
                columns: arrCols
            });

            var arrResults = objSearchSD.run().getRange(0, 1);

            if (!NSUtil.isEmpty(arrResults)) {
                var stSDInternalId = arrResults[0].id;
                log.debug(stLogTitle, '--Found stSDInternalId = ' + stSDInternalId);

                var recDeployment = record.copy({
                    type: record.Type.SCRIPT_DEPLOYMENT,
                    id: stSDInternalId
                });

                // Save deployment
                var stNewSDId = recDeployment.save();
                log.audit(stLogTitle, '--CREATED NEW SCRIPT DEPLOYMENT = ' + stNewSDId);
            }

            return stNewSDId;
        }


        return {
            onRequest: onRequest
        };

    });