/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search', 'N/ui/serverWidget', 'N/task', 'N/redirect', 'N/render', 'N/email'],
    /**
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     * @param {serverWidget} serverWidget
     */
    function(record, runtime, search, serverWidget, task, redirect, render, email) {

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

                if (context.request.method == 'GET') {

                    primaryPage(context)
                }

            } catch (er) {
                log.error('ERROR', er.toString());
            }

        }

        function primaryPage(context) {

            try {

                var soID = context.request.parameters.custpage_soid;
                log.debug('soID', soID);

                if (soID) {

                    var recObj = record.load({
                        type: 'purchaseorder',
                        id: soID

                    });
                  var tranId = recObj.getValue('tranid');


                    var emailId = recObj.getValue('entity');

                    var transactionFile = render.transaction({
                        entityId:  parseInt(soID),
                        printMode: render.PrintMode.PDF,
                        inCustLocale: true
                    });

                  var bodye = '***Please confirm that you have received this Purchase Order! Invoices and Delivery Tickets should be sent to vendorpaperwork@jaguarfueling.com.'
                  bodye += '<BR /> ***Please Do Not leave pricing at delivery site!'

bodye

                 /*   email.send({
                        author: 24088,
                        recipients: emailId,
                        subject: 'Purchase Order '+tranId+' from Jaguar Fueling Services',
                        body: bodye,
                        attachments: [transactionFile]
                    });*/

                    recObj.setValue('custbody_email_sent', true);


                    var saveRec = recObj.save();

                    log.debug('saveRec', saveRec);
					
					redirect.toRecord({
					type:'purchaseorder',
					id:soID
				})


                }


                //context.response.writePage(rForm);



            } catch (er) {
                log.error('ERROR-primary page', er.toString());
            }
        }

        

        return {
            onRequest: onRequest
        };

    });