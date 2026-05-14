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
define(['N/ui/serverWidget', 'N/runtime', 'N/record'],
    function(ui, runtime, record) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
        	var stLogTitle = 'setRecordType';
        	var objRequest = context.request;
        	if (objRequest.method === 'GET'){
        		log.debug(stLogTitle, 'ENTRY: if (request.method === "GET")');
        		var stUrl = objRequest.parameters.stUrl;
            	var objPasswordForm = ui.createForm({
                    title: 'Set Password',
                    hideNavBar: true
            	});
          		var rt_group = objPasswordForm.addFieldGroup({
					id: "rtgroup",
					label: "Enter Password"
				});
          		var arrScriptIds = [runtime.getCurrentScript().id,'customscript_ns_sl_csvi_test'];
          		var strNewScriptId = runtime.getCurrentScript().getParameter('custscript_csvi_implementation_script_id');

                if (strNewScriptId) {
          			arrScriptIds.push(strNewScriptId);
          		}

                var strNewMrScriptId = runtime.getCurrentScript().getParameter('custscript_csvi_mr_script_id');

                if (strNewMrScriptId) {
          			arrScriptIds.push(strNewMrScriptId);
          		}

              	var strNewMrScriptIdSched = runtime.getCurrentScript().getParameter('custscript_csvi_mr_script_sched');

              	if (strNewMrScriptIdSched) {
          			arrScriptIds.push(strNewMrScriptIdSched);
          		}

          		log.debug('test',arrScriptIds);
        		var objCrdFld = objPasswordForm.addCredentialField({
        			id: 'password',
        			label: 'Password',
        			restrictToScriptIds: arrScriptIds,
        			restrictToDomains: [stUrl],
        			restrictToCurrentUser: false
        		});

              objCrdFld.maxLength = 64;

        		objPasswordForm.addSubmitButton("Submit");
        		rt_group.isBorderHidden = true;
        		rt_group.isSingleColumn = true;
        		log.debug(stLogTitle, 'END: GET');
        		context.response.writePage(objPasswordForm);
        	} else {
        		log.debug(stLogTitle, 'BEGIN: POST');
        		var password = objRequest.parameters.password; // Transactions
        		var stHtml = '<html>';
				stHtml += '<head>';
				stHtml += '<script language="JavaScript">';
				stHtml += 'if (window.opener)';
				stHtml += '{';
				stHtml += '   window.opener.nlapiSetFieldValue(\'custrecord_csvi_password\', \'' + password + '\');';
				stHtml += '}';
				stHtml += '';
				stHtml += '';
				stHtml += '';
				stHtml += 'window.close();';
				stHtml += '</script>';
				stHtml += '</head>';
				stHtml += '<body>';
				stHtml += '</body>';
				stHtml += '</html>';
				context.response.write(stHtml);
        	}
        }
        return {
        	onRequest: onRequest
        };
    }
);