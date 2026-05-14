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
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define([
	'N/https',
	'N/error',
	'N/runtime',
	'N/url',
	'N/currentRecord',
	'N/log',
	'N/search',
	'N/ui/message','N/ui/dialog',
	'N/record'
],
function (
	https,
	error,
	runtime,
	url,
	currentRecord,
	log,
	search,
	message, dialog,
	record
) {

	//CONSTANTS
	var HOST_KEY_TOOL_URL = 'https://ursuscode.com/tools/sshkeyscan.php?url=';
	var INT_AUTH_RAW = 1;
	var INT_AUTH_SSH = 2;
	var INT_AUTH_METHOD_USERNAME = 1;
	var INT_AUTH_METHOD_CERTKEY = 2;

	var scriptContext;
	var oldName;

	/**
	* Hide Empty + New option in dropdown Authentication Methods
	* Show + Hide fields/buttons depending on chosen Authentication method
	*
	* @param 	{Object} context
	* @returns 	{Void}
	*/
	function pageInit(context) {
		window.onbeforeunload = function() {
			return null;
		};

		// Hide Empty + New option in dropdown Authentication Methods
		// Reason: Inability to hide them via standard customization
		// DOM object not to be used 
		//var objDropdown = getDropdown(window.document.getElementsByName('inpt_custrecord_sftp_auth_method')[0]);
		//objDropdown.deleteOneOption('');
		//objDropdown.deleteOneOption('-1');

        var curRec = context.currentRecord;
        scriptContext = context;
        var authMethod = curRec.getValue({ fieldId : 'custrecord_csvi_auth_method'});
        oldName = curRec.getValue('name');

        //If there is no authentication Method set, then set it to default "Username / Password"
        if(!authMethod){
            curRec.setValue({
                fieldId : 'custrecord_csvi_auth_method',
                value : 1
            });
        }

		// Show + Hide fields/buttons depending on chosen Authentication method
		mngrAuth(curRec);
	}

	/**
	* Sets a Password
	*
	* @returns 	{Void}
	*/
	function setPasswordCall() {

			var recCurrent = currentRecord.get();
			var stUrl = recCurrent.getValue('custrecord_csvi_server_url');
			if (!stUrl || stUrl == '') {
				alert('Remote URL must be entered before Password is set');
			}

			else {

				var stSuiteletUrl = url.resolveScript({
						scriptId : 'customscript_ns_sl_csvi_set_password',
						deploymentId : 'customdeploy_ns_sl_csvi_set_password',
						returnExternalUrl : false,
						params : {
							stUrl : stUrl
				}
				});

				var intHeight = 250;
				var intWidth = 500;
				var newWindow = window.open(stSuiteletUrl, 'BatchSetting', 'width=' + intWidth + ',height=' + intHeight);
				newWindow.focus();
			}
	}

	/**
	* Obtains the Host Key from URSUS external server
	* Sets it into a hidden field to be stored with the record
	*
	* @param 		{Object} context
	* @returns 	{Void}
	*/
	function fieldChanged(context){

			var recCurrent = context.currentRecord;
			var intFieldId = context.fieldId;

			if(
					recCurrent == 'custrecord_csvi_server_url' ||
					recCurrent == 'custrecord_csvi_port' ||
					recCurrent == 'custrecord_csvi_host_key_type'
				){
					var stUrl = recCurrent.getValue('custrecord_csvi_server_url');
					var intPort = recCurrent.getValue('custrecord_csvi_port');
					var strHostKeyType = recCurrent.getValue('custrecord_csvi_host_key_type');

				/*	if(
							stUrl != '' && intPort != '' && strHostKeyType != ''
					){
							//var strUrl = HOST_KEY_TOOL_URL + stUrl + "&port=" + intPort + "&type=" + strHostKeyType;
							//var strResponse = https.get({url: strUrl}).body;
							//var strHostKeySplit = strResponse.split(' ')[2];

							log.debug('hostKey', {hostKey: strResponse});

							if (strHostKeySplit){
									if (strHostKeySplit.length > 100){
											message.create({
													title: "Confirmation",
													message: "Host Key was received successfully.",
													type: message.Type.CONFIRMATION
											}).show({
													duration: 5000
											});
									}

									else {
											message.create({
													title: "Invalid Host Key",
													message: "Received Host Key was NOT recognized. Please change one of the following fields: URL, Port, Host Key Type",
													type: message.Type.ERROR
											}).show({
													duration: 5000
											});
									}
							}

							else {
									message.create({
											title: "Invalid Host Key",
											message: "Received Host Key was NOT recognized. Please change one of the following fields: URL, Port, Host Key Type",
											type: message.Type.ERROR
									}).show({
											duration: 5000
									});
							}

							recCurrent.setValue({
								fieldId: 'custrecord_sftp_host_key',
								value: strHostKeySplit,
							});
					}*/
				}

				/*
				* Authentication method
				*/
				if (
                    intFieldId == 'custrecord_csvi_auth_method'
					){
						mngrAuth(recCurrent);
				}
	}

	/**
	 * Show + Hide fields/buttons depending on chosen Authentication method
	 *
	 * @param {Object} recCurrent - record object
	 * @returns {Void}
	 */
	function mngrAuth(recCurrent) {

			var intAuth = recCurrent.getValue('custrecord_csvi_auth_method');
			var strCertObj = 'custrecord_csvi_certificate';
			var strRAW_username = 'custrecord_csvi_username';
			var strRAW_guid = 'custrecord_csvi_password';
			var strButton_setPswd = 'custpage_set_password';
			var strButton_setPswd_blue = 'custpage_button_setpswd';

			// Show a shadow on hover of the Set Password button
			// jQuery("#btnSetPswd").hover(function(){
			//     jQuery(this).css("box-shadow", "0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19)");
			//     }, function(){
			// 	jQuery(this).css("box-shadow", "none");
			// });

			if (intAuth == INT_AUTH_RAW){

					// Show Username + Password GUID
					//jQuery("#" + strRAW_username + "_fs_lbl_uir_label").show();
					//jQuery("#" + strRAW_username + "_fs").show();

					// Make Username fld mandatory
					var objField = recCurrent.getField({fieldId : strRAW_username});
					objField.isMandatory = true;
					objField.isDisplay = true;
					recCurrent.getField({fieldId : strRAW_guid}).isDisplay = true;

					//Hiding the certificate field
					recCurrent.getField({fieldId: strCertObj}).isDisplay = false;

					//jQuery("#" + strRAW_guid + "_fs_lbl_uir_label").fadeIn();
					//jQuery("#" + strRAW_guid + "_fs").fadeIn();

					// Hide Certificates
					//jQuery("#" + strCertObj + "_fs_lbl_uir_label").hide();
					//jQuery("#" + strCertObj + "_fs").hide();

					// Show button "Set Password"
					jQuery("#tbl_" + strButton_setPswd).fadeIn();
					jQuery("#" + strButton_setPswd_blue + "_fs").fadeIn();

			}

			else if (intAuth == INT_AUTH_SSH){

					// Show Certificates
					//jQuery("#" + strCertObj + "_fs_lbl_uir_label").show();
					//jQuery("#" + strCertObj + "_fs").show();

					// Make Certificate fld mandatory
					recCurrent.getField(strCertObj).isMandatory = true;
					recCurrent.getField({fieldId: strCertObj}).isDisplay = true;
              
					recCurrent.getField(strRAW_guid).isDisplay = false;
					//recCurrent.getField(strRAW_username).isDisplay = false;

					// Hide Username + Password GUID
					//jQuery("#" + strRAW_username + "_fs_lbl_uir_label").hide();
					//jQuery("#" + strRAW_username + "_fs").hide();

					//jQuery("#" + strRAW_guid + "_fs_lbl_uir_label").fadeOut();
					//jQuery("#" + strRAW_guid + "_fs").fadeOut();

					// Hide button "Set Password"
					jQuery("#tbl_" + strButton_setPswd).fadeOut();
					jQuery("#" + strButton_setPswd_blue + "_fs").fadeOut();

			}else{
			    dialog.alert({title: 'Authentication Method', message : 'Please select either "Username / Password" or "Certificate / SSH Key". Blank or any other values are not allowed.'}).then().catch();
            }

	}

	/**
	 * Verifies the SFTP connection and returns a Confirmation or an Error
	 *
	 * @returns {Void}
	 */
	function testSFTP() {

			var recCurrent = currentRecord.get();

			var objSftpConfigParams = {
					username: recCurrent.getValue('custrecord_csvi_username'),
					url: recCurrent.getValue('custrecord_csvi_server_url'),
					port: recCurrent.getValue('custrecord_csvi_port'),
					hostKey: recCurrent.getValue('custrecord_csvi_host_key'),
					hostKeyType: recCurrent.getValue('custrecord_csvi_host_key_type')
			};

			/*
			* Authentication method
			*/
			var intAuthMethod = recCurrent.getValue('custrecord_csvi_auth_method');

			// Username/password
			if (intAuthMethod == INT_AUTH_METHOD_USERNAME){
					objSftpConfigParams.passwordGuid = recCurrent.getValue('custrecord_csvi_password');
			}

			// SSH Key/Certificate
			else {
					objSftpConfigParams.keyId = recCurrent.getText('custrecord_csvi_certificate');
			}

			var stSuiteletUrl = url.resolveScript({
					scriptId : 'customscript_ns_sl_csvi_test',
					deploymentId : 'customdeploy_ns_sl_csvi_test',
					returnExternalUrl : false,
					params : objSftpConfigParams
			});

			// Call SFTP Suitelet to try sftp.Connection and get a Response
			var objResponse = https.get({
			    url: stSuiteletUrl
			});

			log.debug('testSFTP', {objResponse: objResponse.body});

			if (objResponse.body == 'SUCCESS'){
					message.create({
							title: "Confirmation",
							message: "Connection was successful.",
							type: message.Type.CONFIRMATION
					}).show({
							duration: 5000
					});

			}

			else {

					// Create a link to Script Record > Execution Log tab
					var strSrchTrm = 'script=';
					var indexOfSTART = stSuiteletUrl.indexOf(strSrchTrm);
					var indexOfEND = stSuiteletUrl.indexOf('&', indexOfSTART);
					var strScriptID = stSuiteletUrl.substring(indexOfSTART+strSrchTrm.length, indexOfEND);

					var strScriptURL = url.resolveRecord({
					    recordType: 'script',
					    recordId: strScriptID,
					    isEditMode: false
					});
					strScriptURL += '&selectedtab=executionlog';

					message.create({
							title: "Connection Error",
							message: 'Connection was NOT successful. Please check script <a href ="' + strScriptURL + '" target="_blank">NS | SL | CSVI Test Connection</a> for more details.',
							type: message.Type.ERROR
					}).show({
							duration: 10000
					});
			}
	}

	/**
	 * Redirects to a Suitelet for manual OutBound transfer
	 *
	 * @returns {Void}
	 */
	function testOutbound() {

			var recCurrent = currentRecord.get();
			var recId = recCurrent.id;
			var stSuiteletUrl = url.resolveScript({
					scriptId : 'customscript_ns_sl_csvi_folders_to_proc',
					deploymentId : 'customdeploy_ns_sl_csvi_folders_to_proc',
					returnExternalUrl : false
			});
			window.open(stSuiteletUrl, '_blank');
	}

	/**
	 * Redirects to a Map/Reduce script to config the frequency of the schedule basis
	 *
	 * @returns {Void}
	 */
	function upldScheduled(recId) {

			var scriptdeploymentSearchObj = search.create({
					type: "scriptdeployment",
					filters:
						[
						  ["title","is","NS | MR | CSVi File Transfer - Scheduled"]
						],
					columns:
						[
						  "script"
						]
			});

			var searchResultCount = scriptdeploymentSearchObj.runPaged().count;
			if (searchResultCount > 0){

					var intDeployID;
					scriptdeploymentSearchObj.run().each(function(result){
							intDeployID = result.getValue({name : 'script'});
					});
					
					var output2 = '/app/common/scripting/scriptrecord.nl?scripttype=' + intDeployID;
					
					var output = url.resolveRecord({
							recordType: 'scriptdeployment',
							recordId: intDeployID,
							isEditMode: true,
							params: {
								custscript_csvi_folder_mapping_id: recId
							}
					});
					console.log(output2);

					var wo = window.open(output2, '_blank');
					//var test = wo.nlapiGetFieldValue('scriptid');
					//console.log(test);
					


			}

			else {
					log.audit('function upldScheduled', '0 Search results for Script Deployments');
			}

	}

	function saveRecord(context){
        var record = context.currentRecord;
        var isValid = true;
        var message = "";
        var currName = record.getValue('name');
        log.debug('OldName',oldName+', currName: '+currName);

        if ((isCreateRecord() || isCopyRecord()) && checkDuplicateName(currName)) {
            message = "Duplicate SFTP Configuration. A SFTP configuration record already exists with name: "+currName;
            isValid = false;
        }
        else if((isUpdateRecord() && oldName != currName) && checkDuplicateName(currName)){
            message = "Duplicate SFTP Configuration. A SFTP configuration record already exists with name: "+currName;
            isValid = false;
        }

        if(!isValid){
            dialog.alert({title: 'SFTP Configuration Validation', message : message}).then().catch();
		}

		return isValid;
	}

    function checkDuplicateName(configName){
        var configSearch = search.create({
            type : 'customrecord_ns_csvi_configuration',
            filters:
                [
                    ["name","is",configName]
                ],
            columns:
                [
                    "internalid"
                ]
        });

        var resultCount = configSearch.runPaged().count;
        if(resultCount > 0)
            return true;
        else
            return false;
    }

    function isCreateRecord() {
        return scriptContext && scriptContext.mode === "create";
    }

    function isCopyRecord() {
        return scriptContext && scriptContext.mode === "copy";
    }

    function isUpdateRecord() {
        return scriptContext && scriptContext.mode === "edit";
    }

	return {
			pageInit : pageInit,
			fieldChanged: fieldChanged,
			setPasswordCall : setPasswordCall,
			testOutbound : testOutbound,
			upldScheduled: upldScheduled,
			testSFTP : testSFTP,
			saveRecord : saveRecord

	};
});