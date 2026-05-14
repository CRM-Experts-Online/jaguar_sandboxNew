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
**/

/**
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 * @NModuleScope SameAccount
 */
define(['N/error', 'N/record', 'N/search', 'N/file', 'N/runtime', 'N/email', 'N/sftp', './NSUtil_Lib_SS2', 'N/certificateControl', 'N/keyControl', 'N/task'],
    function(error, record, search, file, runtime, email, sftp, NSUtil, cc, keyControl, task) {

        //CONSTANTS
        var INT_AUTH_METHOD_USERNAME = 1;
        var INT_AUTH_METHOD_CERTKEY = 2;
		var MAX_ARR_LENGTH = 50;

        /**
         * Marks the beginning of the Map/Reduce process and generates input data.
         *
         * @typedef {Object} ObjectRef
         * @property {number} id - Internal ID of the record instance
         * @property {string} type - Record type id
         *
         * @return {Array|Object|Search|RecordRef} inputSummary
         * @since 2015.1
         */
        function getInputData() {

			try{
				var stLogTitle = 'getInputData';
				
				log.debug({
					title: stLogTitle,
					details: 'Start -->'
				});
				
				var input = {};
				var scriptObj = runtime.getCurrentScript();
				var configFileId = scriptObj.getParameter({name: 'custscript_csvi_folder_mapping_id'});
				log.debug('configFileId', configFileId);
				// Search Digital Certificates + SSH Keys
				var arrCert = cc.findCertificates();
				var arrKeys = keyControl.findKeys();

				// Search SFTP - Folder Mapping
				var arrSrch = searchSFTPrecordsToProcess(arrCert, arrKeys, configFileId);
				
				
                //var searchResult = arrSrch;
                log.debug(stLogTitle, 'objItem = ' + JSON.stringify(arrSrch));
				var searchResult = arrSrch[0];
				log.debug('searchResult', searchResult);
				var arrCompleteDirectoryList = [];
				
				var objSftpConfigParams = {
                    hostKey: searchResult.custrecord_csvi_host_key,
                    hostKeyType: searchResult.custrecord_csvi_host_key_type,
                    port: parseInt(searchResult.custrecord_csvi_port),
                    directory: searchResult.custrecord_csvi_remote_directory,
                    url: searchResult.custrecord_csvi_server_url,
                    username: searchResult.custrecord_csvi_username,
					filename: searchResult.custrecord_csvi_inbound_file_name,
					importJob: searchResult.custrecord_csvi_import_job,
					transferFolderId: searchResult.custrecord_csvi_fld_from,
					processedFolderId: searchResult.custrecord_csvi_fld_to,
					maxLines : searchResult.custrecord_csvi_max_lines,
					deleteRemoteFile: searchResult.custrecord_csvi_delete_remote_file,
					configFile: searchResult.custrecord_csvi_config_rel
                };
				log.debug('objSftpConfigParams', objSftpConfigParams);
				log.debug('objSftpConfigParams.filename', objSftpConfigParams.filename);

                var objSftpFolders = {
                    sftpTransferFolder: searchResult.custrecord_csvi_fld_from,
                    sftpProcessedFolder: searchResult.custrecord_csvi_fld_to
                };
				
                /*
                 * Single-factor authentication
                 */

                // Auth: Certificate / SSH Key
                if (searchResult.custrecord_csvi_auth_method == INT_AUTH_METHOD_CERTKEY) {
					objSftpConfigParams.authMethod = INT_AUTH_METHOD_CERTKEY;
                    objSftpConfigParams.keyId = searchResult.keyId;
                    delete objSftpConfigParams.passwordGuid;
                }

                // Default Auth: Username/Password
                else {
					objSftpConfigParams.authMethod = INT_AUTH_METHOD_USERNAME;
                    objSftpConfigParams.passwordGuid = searchResult.custrecord_csvi_password;
                    delete objSftpConfigParams.keyId;
                }
				
				if(objSftpConfigParams.filename == null || objSftpConfigParams.filename == ''){
					if (
						(objSftpConfigParams.passwordGuid || objSftpConfigParams.keyId) &&
						objSftpConfigParams.hostKey &&
						objSftpConfigParams.hostKeyType &&
						objSftpConfigParams.port &&
						objSftpConfigParams.url &&
						objSftpConfigParams.username &&
						//objSftpConfigParams.filename &&
						objSftpConfigParams.importJob
					) {
						var connection = sftp.createConnection(objSftpConfigParams);

						log.debug({
							title: 'Connection',
							details: JSON.stringify(connection)
						});
						
						var directoryList = connection.list();
						log.debug('directoryList', directoryList);
						
						for(var i = 0; i < directoryList.length; i++){
							var isDirectory = directoryList[i].directory;
							log.debug('isDirectory', isDirectory);
							if(isDirectory == false){
								arrCompleteDirectoryList.push(directoryList[i].name);
							}
						}
						log.debug('arrCompleteDirectoryList', arrCompleteDirectoryList);
						log.debug('arrCompleteDirectoryList.length', arrCompleteDirectoryList.length);
					}
				}
				
				if(arrCompleteDirectoryList.length > 0){
					for(var j = 0; j < arrCompleteDirectoryList.length; j++){//ToDo: Change to arrCompleteDirectoryList.length
						log.debug('j|arrCompleteDirectoryList[j]', j + '|' + arrCompleteDirectoryList[j]);
						var tempParams = {};
						tempParams.hostKey = objSftpConfigParams.hostKey;
						tempParams.hostKeyType = objSftpConfigParams.hostKeyType;
						tempParams.port = parseInt(objSftpConfigParams.port);
						tempParams.directory = objSftpConfigParams.directory;
						tempParams.url = objSftpConfigParams.url;
						tempParams.username = objSftpConfigParams.username;
						tempParams.importJob = objSftpConfigParams.importJob;
						tempParams.transferFolderId = objSftpConfigParams.transferFolderId;
						tempParams.processedFolderId = objSftpConfigParams.processedFolderId;
						tempParams.maxLines = objSftpConfigParams.maxLines;
						tempParams.deleteRemoteFile = objSftpConfigParams.deleteRemoteFile;
						tempParams.configFile = objSftpConfigParams.configFile;
						tempParams.authMethod = objSftpConfigParams.authMethod;
						tempParams.keyId = objSftpConfigParams.keyId;
						tempParams.passwordGuid = objSftpConfigParams.passwordGuid;
						tempParams.filename = arrCompleteDirectoryList[j];

						//log.debug('objSftpConfigParams in List Loop', JSON.stringify(objSftpConfigParams));
						input[j] = tempParams;
						//log.debug('List input', JSON.stringify(input));
					}
					log.debug('List input', JSON.stringify(input));
				}
				else{
					input[j] = objSftpConfigParams;
					log.debug('No List input', JSON.stringify(input));
				}
				return input;
			}
			catch(e){
				log.debug('Error getInputData()', e);
				var currentDate = new Date();
				record.submitFields({
					type: 'customrecord_ns_csvi_configuration',
					id: configFileId,
					values:{
						custrecord_csvi_error_message : 'Error in getInputData() :' + e.message.toString(),
						custrecord_csvi_error_date : currentDate
					}
				});	
			}

        }
        /**
         * Executes when the map entry point is triggered and applies to each key/value pair.
         *
         * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
         * @since 2015.1
         */
        function map(context) {
            try {
				var scriptObj = runtime.getCurrentScript();
				var configFileId = scriptObj.getParameter({name: 'custscript_csvi_folder_mapping_id'});
                var stLogTitle = 'map';
				log.debug(stLogTitle, configFileId);
				
                var searchResult = JSON.parse(context.value);
                log.debug(stLogTitle, 'objItem = ' + JSON.stringify(searchResult));
				/***
				var arrCompleteDirectoryList = [];
				
				var objSftpConfigParams = {
                    hostKey: searchResult.custrecord_csvi_host_key,
                    hostKeyType: searchResult.custrecord_csvi_host_key_type,
                    port: parseInt(searchResult.custrecord_csvi_port),
                    directory: searchResult.custrecord_csvi_remote_directory,
                    url: searchResult.custrecord_csvi_server_url,
                    username: searchResult.custrecord_csvi_username,
					filename: searchResult.custrecord_csvi_inbound_file_name,
					importJob: searchResult.custrecord_csvi_import_job,
					transferFolderId: searchResult.custrecord_csvi_fld_from,
					processedFolderId: searchResult.custrecord_csvi_fld_to,
					maxLines : searchResult.custrecord_csvi_max_lines,
					deleteRemoteFile: searchResult.custrecord_csvi_delete_remote_file,
					configFile: searchResult.custrecord_csvi_config_rel
                };

                var objSftpFolders = {
                    sftpTransferFolder: searchResult.custrecord_csvi_fld_from,
                    sftpProcessedFolder: searchResult.custrecord_csvi_fld_to
                };
				*/
                /*
                 * Single-factor authentication
                 */
				/***
                // Auth: Certificate / SSH Key
                if (searchResult.custrecord_csvi_auth_method == INT_AUTH_METHOD_CERTKEY) {
                    objSftpConfigParams.keyId = searchResult.keyId;
                    delete objSftpConfigParams.passwordGuid;
                }

                // Default Auth: Username/Password
                else {
                    objSftpConfigParams.passwordGuid = searchResult.custrecord_csvi_password;
                    delete objSftpConfigParams.keyId;
                }
				
				if(objSftpConfigParams.filename == null || objSftpConfigParams.filename == ''){
					if (
						(objSftpConfigParams.passwordGuid || objSftpConfigParams.keyId) &&
						objSftpConfigParams.hostKey &&
						objSftpConfigParams.hostKeyType &&
						objSftpConfigParams.port &&
						objSftpConfigParams.url &&
						objSftpConfigParams.username &&
						//objSftpConfigParams.filename &&
						objSftpConfigParams.importJob
					) {
						var connection = sftp.createConnection(objSftpConfigParams);

						log.debug({
							title: 'Connection',
							details: JSON.stringify(connection)
						});
						
						var directoryList = connection.list();
						log.debug('directoryList', directoryList);
						
						for(var i = 0; i < directoryList.length; i++){
							var isDirectory = directoryList[i].directory;
							log.debug('isDirectory', isDirectory);
							if(isDirectory == false){
								arrCompleteDirectoryList.push(directoryList[i].name);
							}
						}
						log.debug('arrCompleteDirectoryList', arrCompleteDirectoryList);
						log.debug('arrCompleteDirectoryList.length', arrCompleteDirectoryList.length);
					}
				}
				if(arrCompleteDirectoryList.length > 0){
					for(var j = 0; j < arrCompleteDirectoryList.length; j++){//ToDo: Change to arrCompleteDirectoryList.length
						context.write(arrCompleteDirectoryList[j], JSON.stringify(searchResult));
					}
				}
				else{
					context.write(context.key, JSON.stringify(searchResult));
				}
				*/

            } catch (err) {
                log.error('ERROR', 'Error in Map' + err.toString());
				var currenDate = new Date();
				record.submitFields({
					type: 'customrecord_ns_csvi_configuration',
					id: configFileId,
					values:{
						custrecord_csvi_error_message : 'Error in Map :' + err.message.toString(),
						custrecord_csvi_error_date : currentDate
					}
				});
                throw error.create({
                    name: 'Error in Map',
                    message: err.toString()
                });
            }
        }
        /**
         * Executes when the reduce entry point is triggered and applies to each group.
         *
         * @param {ReduceSummary} context - Data collection containing the groups to process through the reduce stage
         * @since 2015.1
         */
        function reduce(context) {
            try {
				var scriptObj = runtime.getCurrentScript();
				var configFileId = scriptObj.getParameter({name: 'custscript_csvi_folder_mapping_id'});

                var stLogTitle = 'reduce';
                log.debug({
                    title: stLogTitle,
                    details: 'key: ' + JSON.stringify(context.key)
                });
				
				log.debug(stLogTitle, configFileId);
                var objJSON = JSON.parse(context.values[0]);

                log.debug({
                    title: stLogTitle,
                    details: {
                        objJSON: objJSON
                    }
                });
                var objSftpConfigParams = {
                    hostKey: objJSON.hostKey,
                    hostKeyType: objJSON.hostKeyType,
                    port: parseInt(objJSON.port),
                    directory: objJSON.directory,
                    url: objJSON.url,
                    username: objJSON.username,
					filename: objJSON.filename,
					importJob: objJSON.importJob,
					transferFolderId: objJSON.transferFolderId,
					processedFolderId: objJSON.processedFolderId,
					maxLines : objJSON.maxLines,
					deleteRemoteFile: objJSON.deleteRemoteFile,
					configFile: objJSON.configFile,
					keyName: context.key
                };
				
				/*
                var objSftpFolders = {
                    sftpTransferFolder: objJSON.custrecord_csvi_fld_from,
                    sftpProcessedFolder: objJSON.custrecord_csvi_fld_to
                };
				*/
				
                /*
                 * Single-factor authentication
                 */

                // Auth: Certificate / SSH Key
                if (objJSON.authMethod == INT_AUTH_METHOD_CERTKEY) {
                    objSftpConfigParams.keyId = objJSON.keyId;
                    delete objSftpConfigParams.passwordGuid;
                }

                // Default Auth: Username/Password
                else {
                    objSftpConfigParams.passwordGuid = objJSON.passwordGuid;
                    delete objSftpConfigParams.keyId;
                }
 
				//log.debug('objSftpConfigParams ----------------', objSftpConfigParams);
				
				if (
					(objSftpConfigParams.passwordGuid || objSftpConfigParams.keyId) &&
					objSftpConfigParams.hostKey &&
					objSftpConfigParams.hostKeyType &&
					objSftpConfigParams.port &&
					objSftpConfigParams.url &&
					objSftpConfigParams.username &&
					//objSftpConfigParams.filename &&
					objSftpConfigParams.importJob
				) {
					
					var savedFileIDs = downloadFile(objSftpConfigParams);
					var writeValues = {
						fileIDs : savedFileIDs,
						importJob : objSftpConfigParams.importJob,
						processedFolderId : objSftpConfigParams.processedFolderId,
						configFile : objSftpConfigParams.configFile
					}
					context.write(0, writeValues);
					

				} else {

					log.error('ERROR', 'SFTP Configuration Error');
					throw error.create({
						name: 'SFTP Configuration Error:',
						message: 'SFTP Configuration Error:'
					});

				}

            } catch (err) {
                log.error('ERROR', 'Error in Reduce :' + err.toString());
				
				var currentDate = new Date();
				record.submitFields({
					type: 'customrecord_ns_csvi_configuration',
					id: configFileId,
					values:{
						custrecord_csvi_error_message : 'Error in Reduce :' + err.message.toString(),
						custrecord_csvi_error_date : currentDate
					}
				});
				
                throw error.create({
                    name: 'Error in Reduce',
                    message: error.toString()
                });
            }
        }
        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(summary) {
			try{
				var arrID = [];
				var summarizeImportJob;
				var summarizeProcessedFolderId;
				var summarizeConfigFile;
				var scriptObj = runtime.getCurrentScript();
				var configFileId = scriptObj.getParameter({name: 'custscript_csvi_folder_mapping_id'});
				log.debug('configFileId', configFileId);
				
				summary.output.iterator().each(function(key, value) {
					var tempValueArray = JSON.parse(value);
					log.audit('tempValueArray', tempValueArray);
					//log.audit('tempValueArray.fileIDs', tempValueArray.fileIDs);
					//log.audit('tempValueArray.configFile', tempValueArray.configFile);
					summarizeImportJob = tempValueArray.importJob;
					summarizeProcessedFolderId = tempValueArray.processedFolderId;
					summarizeConfigFile = tempValueArray.configFile;
					arrID.push.apply(arrID, tempValueArray.fileIDs);
					return true;
				});
				
				
				log.audit('summary.usage', summary.usage);
				log.audit('JSON.stringify(arrID)', JSON.stringify(arrID));
				log.audit('arrID.length', arrID.length);
				
				log.audit('summarizeImportJob', summarizeImportJob);
				log.audit('summarizeProcessedFolderId', summarizeProcessedFolderId);
				
				////////////////Testing
				//var testArrID = [7031,7148,7260,7170];
				var splitArrID = [];
				//log.debug('testArrID.length', testArrID.length);
				//log.debug('JSON.stringify(testArrID)', JSON.stringify(testArrID));
				
				var arrSplitFlag = false;
				if(arrID.length > MAX_ARR_LENGTH){//TODO: Change to arrID after testing.
					var i, j;
					for(i = 0, j = arrID.length; i < j; i += MAX_ARR_LENGTH){
						log.debug('i', i);
						
						splitArrID.push(arrID.slice(i, i+MAX_ARR_LENGTH));
					}
					arrSplitFlag = true;
				}
				var splitArrIDLength = splitArrID.length;
				log.debug('splitArrIDLength', splitArrIDLength);
				///////////////End of Testing
							
				if(arrSplitFlag == true && splitArrIDLength > 0){
					log.debug('splitArrID', splitArrID);
					for(var k = 0; k < splitArrIDLength; k++){
						var scheduledTask = task.create({
							taskType: task.TaskType.SCHEDULED_SCRIPT,
							scriptId: 'customscript_ns_sc_csvi_import_trigger',
							//deploymentId: 'customdeploy_ns_sc_csvi_import_trigger',
							params:{
								custscript_csvi_import_file_id : splitArrID[k],//TODO: Change to splitArrID[k] after testing.
								custscript_csvi_import_job_id : summarizeImportJob,
								custscript_csvi_processed_folder_id : summarizeProcessedFolderId,
								custscript_csvi_config_id : configFileId
							}
						});
						var scheduledTaskTrigger = scheduledTask.submit();
						log.audit('Summarize. Split.', scheduledTaskTrigger);
					}
				}
				else{
					var scheduledTask = task.create({
						taskType: task.TaskType.SCHEDULED_SCRIPT,
						scriptId: 'customscript_ns_sc_csvi_import_trigger',
						//deploymentId: 'customdeploy_ns_sc_csvi_import_trigger',
						params:{
							custscript_csvi_import_file_id : arrID,//TODO: Change to arrID after testing.
							custscript_csvi_import_job_id : summarizeImportJob,
							custscript_csvi_processed_folder_id : summarizeProcessedFolderId,
							custscript_csvi_config_id : configFileId
						}
					});
					var scheduledTaskTrigger = scheduledTask.submit();
					log.audit('Summarize. No Split.', scheduledTaskTrigger);
				}
				
				var currentDate = new Date();
				record.submitFields({
					type: 'customrecord_ns_csvi_configuration',
					id: summarizeConfigFile,
					values:{
						custrecord_csvi_error_message : 'No Errors in SFTP connection.',
						custrecord_csvi_error_date : currentDate
					}
				});
			}
			catch(e){
				log.error('Error', e);
				var currentDate = new Date();
				record.submitFields({
					type: 'customrecord_ns_csvi_configuration',
					id: configFileId,
					values:{
						custrecord_csvi_error_message : 'Error in Download :' + e.message.toString(),
						custrecord_csvi_error_date : currentDate
					}
				});
			}
        }

		
		
		function downloadFile(objSftpConfigParams){
			try{
				var stLogTitle = '<< runSFTP Download >>';
				
				
				var objConnectionParams = objSftpConfigParams;
				//log.debug('download configFileId', objConnectionParams.configFile);
				//log.debug('forceError', forceError);
				var maxLineNumber = parseInt(objConnectionParams.maxLines || 0);
				log.debug('maxLineNumber', maxLineNumber);
				var arrID = [];
				/*
				log.debug('SFTP Download PARAMETERS', {
					objConnectionParams: objConnectionParams
				});
				*/
				log.debug('Inbound File Name', objConnectionParams.filename);
				
				var connection = sftp.createConnection(objConnectionParams);

				log.debug({
					title: 'Connection',
					details: JSON.stringify(connection)
				})

				log.audit(stLogTitle, 'Connection Successful');

				if(objConnectionParams.filename == null || objConnectionParams.filename == ''){
					log.debug('case keyName', objConnectionParams.keyName);
					var downloadedFile = connection.download({
						filename: objConnectionParams.keyName
					});
				}
				else{
					log.debug('case filename', objConnectionParams.filename);
					var downloadedFile = connection.download({
						filename: objConnectionParams.filename
					});
				}

				var fileLinesArr = downloadedFile.getContents().split('\n');
				var tempFileLinesArr = [];
				log.debug('fileLinesArr.length', fileLinesArr.length);
				var index = 0;
				var splitFlag = false;
				if(maxLineNumber != 0 && fileLinesArr.length > maxLineNumber){
					var i, j;
					for(i = 0, j = fileLinesArr.length; i < j; i += maxLineNumber){
						log.debug('i', i);
						
						tempFileLinesArr.push(fileLinesArr.slice(i, i+maxLineNumber));
						if(index != 0){
							tempFileLinesArr[index].unshift(fileLinesArr[0]);
						}
						index++;
					}
					splitFlag = true;
				}
					
				log.debug('tempFileLinesArr', tempFileLinesArr);
				if(splitFlag == true){
					for(var l = 0; l < tempFileLinesArr.length; l++){
						var tempFileName = downloadedFile.name.substr(0, downloadedFile.name.lastIndexOf('.')) || downloadedFile.name;
						tempFileName += '_';
						tempFileName += l;
						log.debug('tempFileName', tempFileName);
						var fileObj = file.create({
							name: tempFileName,
							fileType: file.Type.CSV,
							contents: tempFileLinesArr[l].join('\n'),
							encoding: file.Encoding.UTF8,
							folder: objConnectionParams.transferFolderId
						});
						var fileId = fileObj.save();
						arrID.push(fileId);
					}
				}
				else{
					//log.debug(stLogTitle, JSON.stringify(downloadedFile.getContents()));
					downloadedFile.folder = objConnectionParams.transferFolderId;
					var fileId = downloadedFile.save();
					log.debug(stLogTitle, fileId);
					arrID.push(fileId);
				}
				if(objConnectionParams.deleteRemoteFile == true){
					try{
						
						connection.removeFile({
							path: downloadedFile.name
						});
						
						log.debug('File Removed');
					}
					catch(error){
						log.debug('Removal Error', error);
					}
				}
				
				log.debug('arrID', arrID);
				var tempArr = [];
				tempArr.push(7367);
				//tempArr.push(5873);
				//tempArr.push(5874);
				return arrID;
			}
			catch(e){
				log.debug('Error', e);
				log.debug('objConnectionParams.configFile', objConnectionParams.configFile);
				var currentDate = new Date();
				record.submitFields({
					type: 'customrecord_ns_csvi_configuration',
					id: objConnectionParams.configFile,
					values:{
						custrecord_csvi_error_message : 'Error in Download :' + e.message.toString(),
						custrecord_csvi_error_date : currentDate
					}
				});
				
			}

		}
		
        /**
         * Get the already existing suffix number for the file which starts with stFileName string
         *
         * @param {String} stFileName - The name of the file
         * @param {Integer} intFolder - Internal ID  of the folder
         * @returns the highest suffix found
         */
        function findDuplicitFile(stFileName, intFolder) {
            var stLogTitle = '<< findDuplicitFile >>';
            log.debug(stLogTitle);

            var inHighestSuffixFound = -1;
            var intIterator = 0;
            var stFileName = stFileName.substring(0, stFileName.lastIndexOf(".")); //stFileName.split(".")[0]; FIX 2608 BY LZ
            log.debug(stLogTitle, {
                stFileName: stFileName,
                intFolder: intFolder
            });

            var objFileSearch = search.create({
                type: "file",
                filters: [
                    ["name", "startswith", stFileName],
                    "AND",
                    ["folder", "anyof", intFolder]
                ],
                columns: [
                    search.createColumn({
                        name: "name"
                    }),
                    search.createColumn({
                        name: "folder"
                    }),
                    search.createColumn({
                        name: "filetype"
                    })
                ]
            });
            var searchResultCount = objFileSearch.runPaged().count;
            log.debug(stLogTitle + "result count", searchResultCount);

            objFileSearch.run().each(function(result) {

                // get the name without .txt/.csv suffix
                var stName = result.getValue("name"); //.split('.')[0];
                stName = stName.substring(0, stName.lastIndexOf(".")); // FIX 2608 BY LZ
                log.debug(stLogTitle + 'Name Found |  stFileName' + stName + "|" + stFileName);

                if (stName == stFileName && inHighestSuffixFound < 0) {

                    inHighestSuffixFound++;

                } else {

                    var arrFileName = stName.split(".");
                    // get the name suffix number, f.e: for file x_y_1.txt, get 1
                    var arrFileSuffixs = arrFileName[0].split('_');
                    var stSuffixNumber = arrFileSuffixs[arrFileSuffixs.length - 1];

                    if (stSuffixNumber > inHighestSuffixFound) {
                        inHighestSuffixFound = parseInt(stSuffixNumber);
                    }

                }
                //  log.debug(stLogTitle + "ITERATION #" + intIterator + " - inHighestSuffixFound", inHighestSuffixFound);

                intIterator++;
                return true;
            });

            log.debug(stLogTitle + "Highest Suffix found : " + inHighestSuffixFound);

            return inHighestSuffixFound;

        }

        /**
         * Search SFTP Mapping records ane their related SFTP Configuration records
         * Reason: Gather details for SFTP connection
         *
         * @param {Array} arrCert - List of all Digital Certificates
         * @param {Array} arrKeys - List of all SSH Private Keys
         * @returns Array of Search results prepared for SFTP connection
         */
        function searchSFTPrecordsToProcess(arrCert, arrKeys, configFileId) {
			
			log.debug('configFileId search', configFileId);
            var objSrch = search.create({
                type: "customrecord_csvi_fld_map",
                filters: [
                    ["custrecord_csvi_config_rel.isinactive", "is", "F"],
                    "AND",
                    ["isinactive", "is", "F"],
                    "AND",
                    ["custrecord_csvi_config_rel", "noneof", "@NONE@"],
					"AND",
					["custrecord_csvi_config_rel.internalidnumber", "equalto", configFileId]
                ],
                columns: [
                    search.createColumn({
                        name: "name",
                        sort: search.Sort.ASC
                    }),
                    "custrecord_csvi_config_rel",
                    "custrecord_csvi_fld_from",
                    "custrecord_csvi_fld_to",
                    "custrecord_csvi_bank_fld",
                    search.createColumn({
                        name: "custrecord_csvi_host_key",
                        join: "custrecord_csvi_config_rel"
                    }),
                    search.createColumn({
                        name: "custrecord_csvi_host_key_type",
                        join: "custrecord_csvi_config_rel"
                    }),
                    search.createColumn({
                        name: "internalid",
                        join: "custrecord_csvi_config_rel"
                    }),
                    search.createColumn({
                        name: "custrecord_csvi_password",
                        join: "custrecord_csvi_config_rel"
                    }),
                    search.createColumn({
                        name: "custrecord_csvi_port",
                        join: "custrecord_csvi_config_rel"
                    }),
                    search.createColumn({
                        name: "custrecord_csvi_server_url",
                        join: "custrecord_csvi_config_rel"
                    }),
                    search.createColumn({
                        name: "custrecord_csvi_username",
                        join: "custrecord_csvi_config_rel"
                    }),
                    search.createColumn({
                        name: "name",
                        join: "custrecord_csvi_config_rel"
                    }),
                    search.createColumn({
                        name: "isinactive",
                        join: "custrecord_csvi_config_rel"
                    }),
                    search.createColumn({
                        name: "custrecord_csvi_auth_method",
                        join: "custrecord_csvi_config_rel"
                    }),
                    search.createColumn({
                        name: "custrecord_csvi_certificate",
                        join: "custrecord_csvi_config_rel"
                    }),
					search.createColumn({
                        name: "custrecord_csvi_inbound_file_name",
                        join: "custrecord_csvi_config_rel"
                    }),
					search.createColumn({
                        name: "custrecord_csvi_import_job",
                        join: "custrecord_csvi_config_rel"
                    }),
					search.createColumn({
                        name: "custrecord_csvi_fld_to"
                    }),
					search.createColumn({
                        name: "custrecord_csvi_fld_from"
                    }),
					search.createColumn({
                        name: "custrecord_csvi_remote_directory",
                        join: "custrecord_csvi_config_rel"
                    }),
					search.createColumn({
                        name: "custrecord_csvi_max_lines",
                        join: "custrecord_csvi_config_rel"
                    }),
					search.createColumn({
                        name: "custrecord_csvi_delete_remote_file",
                        join: "custrecord_csvi_config_rel"
                    }),
                ]
            });

            log.debug({
                title: 'Parameters',
                details: {
                    objSrch: objSrch
                }
            });

            // Results
            var arrResults = [];
            var arrPagedData = objSrch.runPaged();
            if (arrPagedData.count > 0) {

                arrPagedData.pageRanges.forEach(function(pageRange) {
                    var arrPage = arrPagedData.fetch({
                        index: pageRange.index
                    }).data;

                    // Row
                    arrPage.forEach(function(result) {

                        var objRow = {};

                        // Auth method = Certification/Key
                        objRow.keyId = '';

                        // Column
                        for (i in objSrch.columns) {

                            var objCol = objSrch.columns[i];
                            objRow[objCol.name] = result.getValue(objCol);

                            if (objCol.name == 'custrecord_csvi_auth_method' && objRow[objCol.name] == INT_AUTH_METHOD_CERTKEY) {

                                var strCertID = result.getText({
                                    name: "custrecord_csvi_certificate",
                                    join: "CUSTRECORD_CSVI_CONFIG_REL"
                                });

                                /*
                                 * Search & Match internal ID to script ID needed for SFTP connection
                                 */

                                // 1. Certification
                                for (var c = 0; c < arrCert.length; c++) {

                                    if (strCertID == arrCert[c].name) {
                                        objRow.keyId = arrCert[c].id;
                                        break;
                                    }
                                }

                                // 2. SSH Key
                                for (var k = 0; k < arrKeys.length; k++) {

                                    if (strCertID == arrKeys[k].name) {
                                        objRow.keyId = arrKeys[k].id;
                                        break;
                                    }

                                    // Certificate/Key not found
                                    else {
                                        objRow.keyId = undefined;
                                    }
                                }
                            }
                        }
                        arrResults.push(objRow);
                    });
                });
            }

            log.debug('GetInputData - searchSFTPrecordsToProcess', {
                arrResults: arrResults
            });
            return arrResults;
        }

        /**
         * Checks if any of array elements is empty and returns false if matched
         *
         * @param {Object} objInput - List of all Digital Certificates
         * @returns Boolean
         */
        function falsyChecker(objInput) {
            for (var i in objInput) {
                if (!objInput[i]) {
                    return false;
                }
            }
        }

        return {
            getInputData: getInputData,
            //map: map,
            reduce: reduce,
            summarize: summarize
        };

    });