/**
 * Copyright � 2018, Oracle and/or its affiliates. All rights reserved.
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['N/runtime', 'N/file', 'N/task', 'N/record'],
function(runtime, file, task, record) {

    function execute(context) {
        try {
			var scriptObj = runtime.getCurrentScript();
			var fileId = scriptObj.getParameter({name: 'custscript_csvi_import_file_id'});
			var jobId = scriptObj.getParameter({name: 'custscript_csvi_import_job_id'});
			var processedFolderId = scriptObj.getParameter({name: 'custscript_csvi_processed_folder_id'});
			var configFileId = scriptObj.getParameter({name: 'custscript_csvi_config_id'});
			log.debug('fileId', fileId);
			log.debug('jobId', jobId);
			log.debug('processedFolderId', processedFolderId);
			log.debug('configFileId', configFileId);
			var parsedFileId = JSON.parse(fileId);
			log.debug('parsedFileId', parsedFileId);
			log.debug('parsedFileId.length', parsedFileId.length);
			
			for(var i = 0; i < parsedFileId.length; i++){
				var fileObj = file.load({
					id: parsedFileId[i]
				});
				
				var csvTask = task.create({
					taskType: task.TaskType.CSV_IMPORT,
					mappingId: jobId,
					importFile:fileObj
				});
				
				
				var csvImportTaskId = csvTask.submit();
				
				log.debug('csvImportTaskId', csvImportTaskId);
				
				var timeString = JSON.stringify(new Date());
				fileObj.name += timeString;
				fileObj.folder = processedFolderId;
				var fileId = fileObj.save();
				log.debug('fileId', fileId);
				var script = runtime.getCurrentScript();
				log.debug('Remaining Usage: ', script.getRemainingUsage());
				
			}
			
   
        } catch (e) {
			
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

    return {
        execute: execute
    };
});