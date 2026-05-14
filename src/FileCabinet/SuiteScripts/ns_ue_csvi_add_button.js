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
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

define ([ 'N/runtime', 'N/error', 'N/search', 'N/ui/serverWidget', 'N/ui/message', 'N/keyControl' ],
		function (runtime, error, search, serverWidget, message, keyControl) {

			/*
			* Authentication flds
			*/
			var INT_AUTH_RAW = 1;
			var INT_AUTH_SSH = 2;

			/**
			 * Function definition to be triggered before record is loaded.
			 *
			 * @param {Object} 	scriptContext
			 * @param {Record} 	scriptContext.newRecord - New record
			 * @param {string} 	scriptContext.type 			- Trigger type
			 * @param {Form} 	scriptContext.form 			- Current form
			 * @Since 2015.2
			 */
				function beforeLoad (context) {

						var stLogTitle = 'beforeLoad';
						log.debug(stLogTitle, 'START');

						try {

								var objForm = context.form;
								var strScriptPath = runtime.getCurrentScript().getParameter('custscript_csvi_client_script_file_path');
								log.debug(stLogTitle, strScriptPath);
								objForm.clientScriptModulePath = strScriptPath;

								// Hide "Script ID" standard field
								var objFldScriptID = objForm.getField('scriptid').updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});

								if (context.type == context.UserEventType.EDIT) {

										objForm.removeButton('changeid');
										objForm.removeButton('resetter');
										objForm.addButton({
												id : 'custpage_set_password',
												label : 'Set Password',
												functionName : 'setPasswordCall()'
										});

										objForm.addButton({
												id : 'custpage_test_sftp',
												label : 'Test Connection',
												functionName : 'testSFTP()'
										});

										var objFld_html = objForm.addField({
										    id : 'custpage_button_setpswd',
										    type : serverWidget.FieldType.INLINEHTML,
										    label : 'Set Password GUID'
										});

										// WORKS - new blue button
										// objFld_html.defaultValue = '<input id="btnSetPswd" onclick="var rConfig = JSON.parse( `{}` ) ; rConfig[`context`] = `/SuiteScripts/sftp/ns_cs_sftp_call_suitelet`; var entryPointRequire = require.config(rConfig); entryPointRequire([`/SuiteScripts/sftp/ns_cs_sftp_call_suitelet`], function(mod){ try{ if (!!window) { var origScriptIdForLogging = window.NLScriptIdForLogging; var origDeploymentIdForLogging = window.NLDeploymentIdForLogging; window.NLScriptIdForLogging = `customscript_ns_ue_sftp_add_button`; window.NLDeploymentIdForLogging = `customdeploy_ns_ue_sftp_add_button`; }mod.setPasswordCall();}finally{ if (!!window) { window.NLScriptIdForLogging = origScriptIdForLogging; window.NLDeploymentIdForLogging = origDeploymentIdForLogging; }} }); return false;"" type="button" name="btnSetPswdName" value="Set Password" style="width:150px; height:30px; cursor: pointer; background-color:#378FFA;border:1px solid #9DBFF2; color:#FFFFFF; font-weight: bold; border-radius: 6px; transition-duration: 0.4s;"/>';

										// WORKS - move old button
										objFld_html.defaultValue = '<div id="setPswd_new_destination"><script>jQuery("#tbl_custpage_set_password").appendTo("#setPswd_new_destination");</script>';

										objForm.insertField({field: objFld_html, nextfield: 'custrecord_csvi_password'});
								}

								else if (context.type == context.UserEventType.VIEW){

										var rec = context.newRecord;
										var strUsername = rec.getValue('custrecord_csvi_username');    				// "Username" field on SFTP Configuration custom record
										var strURL = rec.getValue('custrecord_csvi_server_url');    	 				// "Remote URL" field on SFTP Configuration custom record
										var strPort = rec.getValue('custrecord_csvi_port');    				 				// "Port" field on SFTP Configuration custom record
										var strPswdGUID = rec.getValue('custrecord_csvi_password');    				// "Password GUID" field on SFTP Configuration custom record
										var strHostKeyType = rec.getValue('custrecord_csvi_host_key_type');   // "Host Key Type" field on SFTP Configuration custom record
										var strHostKey = rec.getValue('custrecord_csvi_host_key');   					// "Host Key" field on SFTP Configuration custom record
										var strSSHkey = rec.getValue('custrecord_csvi_certificate');   					// "Certificate" field on SFTP Configuration custom record

										// Show Transfer buttons
										if(
												(strUsername && strURL && strPort && strHostKeyType && strHostKey.length > 100) &&
												(strPswdGUID || strSSHkey)
										){
												/*objForm.addButton({
														id : 'custpage_test_outbound',
														label : 'Outbound - Manual',
														functionName : 'testOutbound()'
												});*/
												objForm.addButton({
														id : 'custpage_test_outbound',
														label : 'Schedule Import',
														functionName : 'upldScheduled('+rec.id+')'
												});
										}

										else {
												objForm.addPageInitMessage({
														type: message.Type.WARNING,
														title: 'Invalid SFTP parameters',
														message: 'Field values on this record are invalid for SFTP transfer. Please correct them.',
														duration: 5000
												});
										}

										var intAuth = rec.getValue('custrecord_csvi_auth_method');

										if (intAuth == INT_AUTH_RAW){

												// Hide "Certificate fld"
												objForm.getField('custrecord_csvi_certificate').updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
										}

										else if (intAuth == INT_AUTH_SSH){

												// Hide "Username" + "Password GUID" flds
												objForm.getField('custrecord_csvi_username').updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
												objForm.getField('custrecord_csvi_password').updateDisplayType({displayType : serverWidget.FieldDisplayType.HIDDEN});
										}
								}

								log.debug(stLogTitle, 'EXIT');
						}

						catch (e) {
								log.error(stLogTitle, {error: e});
								throw e;
						}
				}

				/**
				 * Function definition to be triggered before record is loaded.
				 *
				 * @param {Object} scriptContext
				 * @param {Record} scriptContext.newRecord - New record
				 * @param {Record} scriptContext.oldRecord - Old record
				 * @param {string} scriptContext.type - Trigger type
				 * @Since 2015.2
				 */
				function beforeSubmit(scriptContext) {

						log.debug('function beforeSubmit', 'START');

						var rec 				= scriptContext.newRecord;
						var intSchedID 	= rec.getValue('custrecord_csvi_scriptid_scheduled');
						var intManID 		= rec.getValue('custrecord_csvi_scriptid_manual');

						// Search & save the Script Deployment IDs to the record on creation
						if (!intSchedID || !intManID){

								var scriptdeploymentSearchObj = search.create({
										type: "scriptdeployment",
										filters:
										[
											["title","is","NS | MR | File Transfer - Manual"],
											"OR",
											["title","is","NS | MR | File Transfer - Scheduled"]
										],
										columns:
											[
												"internalid",
												"title"
											]
								});

								var searchResultCount = scriptdeploymentSearchObj.runPaged().count;
								if (searchResultCount > 0){

									var arrRes = [];
									scriptdeploymentSearchObj.run().each(function(result){

											var strRes = result.getValue({name : 'title'});
											arrRes.push(strRes);

											if ( strRes == "NS | MR | File Transfer - Scheduled" ){
													rec.setValue({
															fieldId: 'custrecord_sftp_scriptid_scheduled' ,
															value: result.getValue({name : 'internalid'}),
															ignoreFieldChange: true
													});
											}

											else if (strRes == "NS | MR | File Transfer - Manual" ){
													rec.setValue({
															fieldId: 'custrecord_sftp_scriptid_manual' ,
															value: result.getValue({name : 'internalid'}),
															ignoreFieldChange: true
													});
											}

											else {
													log.error('function beforeSubmit', 'Unrecognized Script Deployment Title');
											}
											return true;
									});

								}

								else{
										log.audit('function beforeSubmit', '0 Search results for Script Deployments');
								}
								log.debug('function beforeSubmit', {arrRes: arrRes});
						}
				}

				return {
					beforeLoad : beforeLoad,
					beforeSubmit: beforeSubmit
				};

				/**
		         * Get Script Internal Id
		         *
		         * @param {Integer} intScriptId
		         * @return {Integer} intInternalId
		         **/
				function getScriptInternalId(intScriptId) {
			        var intInternalId = '';
			        var objScriptSearch = search.create({
			            type: 'script',
			            columns: ['scriptfile'],
			            filters: ['internalid', 'is', intScriptId]
			            }).run();
			        var searchRange = objScriptSearch.getRange(0, 1);
			        if(searchRange){
			            intInternalId = searchRange[0].getValue('scriptfile');
			        }

			        return intInternalId;
			    }

});