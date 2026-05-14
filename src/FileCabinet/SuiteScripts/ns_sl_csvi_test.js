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
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define (['N/sftp','N/record', 'N/ui/serverWidget','N/search','N/file','N/runtime', 'N/certificateControl', 'N/keyControl'],
function (sftp, record, ui, search, file, runtime, cc, keyControl) {

  /**
   * Definition of the Suitelet script trigger point.
   *
   * @param {Object} context
   * @param {ServerRequest} context.request - Encapsulation of the incoming request
   * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
   * @Since 2015.2
   */
    function onRequest(context) {
    	stLogTitle = 'Test Connection';
    	log.debug(stLogTitle,'START');
    	var objSFTPparams = context.request.parameters;
    	log.debug(stLogTitle + 'Input params', {objSFTPparams: objSFTPparams});
      objSFTPparams.port = parseInt(objSFTPparams.port);

      var message = 'SUCCESS';

      try {

          // Translate SSH Key internal ID into scriptID needed for SFTP connection
          if (objSFTPparams.keyId){
              getAuthMethod(objSFTPparams);
          }

  	    	var connection = sftp.createConnection(objSFTPparams);

          log.debug('Connection successful');
    	}

      catch (e) {
          message = 'FAIL';
          log.error('Connection Error', {
              error: e
          });
    	}

      context.response.write({
          output: message
      });
      return;

    	var objForm = ui.createForm({
    		title: 'Test SFTP Connection',
    		hideNavBar: true
		});
		var responseField = objForm.addField({
			id: 'message',
			type: ui.FieldType.TEXT,
			label: 'Message'
		});
		responseField.updateDisplayType({
			displayType: ui.FieldDisplayType.INLINE
		});
		responseField.defaultValue = message;
		var type = context.request.parameters.type;
		if (type == 'outbound') {
			var success = true;
			var responseField = objForm.addField({
				id: 'sentfiles',
				type: ui.FieldType.TEXT,
				label: 'Outbound Test'
			});
			responseField.updateDisplayType({
				displayType: ui.FieldDisplayType.INLINE
			});
			var stFiles = '';
			var col = search.createColumn({
				name: 'internalid',
				join: 'file'
			});
			var fileSearch = search.create({
				type: 'folder',
				filters: ['internalid','is',runtime.getCurrentScript().getParameter('custscript_csvi_outbound_folder')],
				columns: col
			});
			fileSearch.run().each(function(result){
				var fileId = result.getValue({
					name: 'internalid',
					join: 'file'
				});
				log.debug('test',fileId);
				var fileObj = file.load({
					id: fileId
				});
				try {
		    		connection.upload({
		    			file: fileObj
		    		});
		            log.debug(stLogTitle, 'Outbound transmission to directory ' + directory + ' successful for File: ' + fileId);
		            stFiles = stFiles + fileObj.name + ' ';
				} catch (error) {
		            log.debug(stLogTitle,'SFTP connection failure for file ID: ' + fileId + ' | error message: ' + error);

				}
				return true;
			});
			responseField.defaultValue = 'The following files have been transmitted: ' + stFiles;
		}
		if (type == 'inbound') {
			var responseField = objForm.addField({
				id: 'inboundfiles',
				type: ui.FieldType.TEXT,
				label: 'Inbound Test'
			});
			responseField.updateDisplayType({
				displayType: ui.FieldDisplayType.INLINE
			});
			try {
	    		var objDownloadedFile = connection.download({
	    			filename: fileName,
	    			directory: directory
	    		});
	            log.debug(stLogTitle, 'Inbound transmission successful for file: ' + fileName);
	            objDownloadedFile.folder = runtime.getCurrentScript().getParameter('custscript_csvi_inbound_folder');
	            objDownloadedFile.save();
				responseField.defaultValue = 'The following file has been received: ' + objDownloadedFile.name;
			} catch (error) {
	            log.debug(stLogTitle,'Inbound transmission failed for file: ' + fileName + ' | error message: ' + error);
				responseField.defaultValue = 'Inbound transmission failed for file: ' + fileName + ' | Error Message: ' + error;
			}
		}
    	context.response.writePage(objForm);
    }

    /**
    * Search & Match internal ID to script ID needed for SFTP connection
    *
    * @param {Object} objSFTPparams - Parameters for SFTP connection
    * @returns {Object} objSFTPparams - updated parameters
    */
    function getAuthMethod(objSFTPparams){

        // Search Digital Certificates + SSH Keys
        var arrCert = cc.findCertificates({
    			  name: objSFTPparams.keyId
    		});
        var arrKeys = keyControl.findKeys({
    			  name: objSFTPparams.keyId
    		});

        // Certificate
        if (arrCert.length > 0){
            objSFTPparams.keyId = arrCert[0].id;
        }

        // Key
        else if (arrKeys.length > 0){
            objSFTPparams.keyId = arrKeys[0].id;
        }

        else {
            log.error('getAuthMethod mismatch', 'Unmatched Key/Certificate');
        }

        log.debug('getAuthMethod - Updated params', {objSFTPparams: objSFTPparams});

        return objSFTPparams;

    }

    return {
        onRequest: onRequest
    };
});