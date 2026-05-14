/**
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 */

define(['N/search', 'N/email', 'N/runtime'], 
function (search, email, runtime) {

    function execute(context) {

        try {

            var savedSearchId = 'customsearch2808'; // Replace
            var savedSearchUrl = 'https://8151247-sb1.app.netsuite.com/app/common/search/search.nl?cu=T&e=T&id=2808'; // Replace

            var failureSearch = search.load({
                id: savedSearchId
            });

            var resultCount = failureSearch.runPaged().count;
			
			log.debug('resultCount', resultCount);

            // Only send notification if records exist
            if (resultCount > 0) {

                var emailSubject = 'Action Required: NetSuite <-> SkyBitz Integration Issue (Orders Not Uploading)';

                var emailBody =
                    'Hello Team,\n\n' +
                    'This is an automated notification from NetSuite. We detected Sales Orders still appearing in the SkyBitz failure monitoring Saved Search after 30 minutes, which indicates the NetSuite <-> SkyBitz order upload process may be failing.\n\n' +
                    'Please review the affected Sales Orders using the link below and take appropriate action:\n\n' +
                    'Saved Search (Failed Sales Orders):\n' +
                    savedSearchUrl + '\n\n' +
                    'Open Saved Search\n\n' +
                    'Notes for triage:\n\n' +
                    '• If the Saved Search is empty, the integration is working as expected.\n\n' +
                    '• If one or more Sales Orders remain listed after 30 minutes, the connection or upload process likely needs attention.\n\n' +
                    'Thank you,';

                email.send({
                    author: '25303',
                    recipients: ['samantha@service-push.com','agustin@service-push.com'], // Replace
                    subject: emailSubject,
                    body: emailBody
                });

                log.audit('SkyBitz Alert Sent', 'Failure count: ' + resultCount);
            }

        } catch (e) {
            log.error('Error Sending Notification', e);
        }
    }

    return {
        execute: execute
    };
});