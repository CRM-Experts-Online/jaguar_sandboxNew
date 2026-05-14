/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
define(['N/record', 'N/runtime', 'N/search'],
    /**
     * @param {record} record
     * @param {runtime} runtime
     * @param {search} search
     */
    function(record, runtime, search) {

        /**
         * Function called upon sending a GET request to the RESTlet.
         *
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
         * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
         * @since 2015.1
         */
        function doGet(requestParams) {

        }

        /**
         * Function called upon sending a PUT request to the RESTlet.
         *
         * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
         * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
         * @since 2015.2
         */
        function doPut(requestBody) {

        }


        /**
         * Function called upon sending a POST request to the RESTlet.
         *
         * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'text/plain'
         * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
         * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
         * @since 2015.2
         */
		 
		 //{"recordId":"SO252969","custbody_skybitz_failed":true,"custbody_failed_reason":"Test Reason 123!#$"}
        function doPost(requestBody) {

            try {
                log.debug('Request Received', requestBody);

                var recs = requestBody;
				
				var isArr = Array.isArray(recs);

              log.debug('isArr', isArr)
				
				if(isArr == true){
					 if (recs && recs.length > 0) {

                    for (var i = 0; i < recs.length; i++) {
												 
                        var recId = recs[i].recordId;
						
						log.debug('recId-array', recId);
						
						var isFailed = recs[i].custbody_skybitz_failed;
						
						var reason = recs[i].custbody_failed_reason;

                            updateSalesorder(recId, isFailed, reason)
                        
                    }

                }
				}else{
					if(recs.recordId){

						log.debug('recs-object', recs.recordId);
						
						var recId = recs.recordId;
						
						var isFailed = recs.custbody_skybitz_failed;
						
						var reason = recs.custbody_failed_reason;
						
						updateSalesorder(recId, isFailed, reason)
						
					}
				}

               

              var obj =  {};

              obj.status = 'Updated';

              return obj;




            } catch (er) {
                log.error('ERROR', er.toString());
              
            }

        }

        function updateCustomer(recType, recId, reason) {

            var customerSearch = search.create({
                type: search.Type.CUSTOMER,
                filters: [
                    ['entityid', 'is', recId]
                ],
                columns: ['internalid']
            });

            var result = customerSearch.run().getRange({
                start: 0,
                end: 1
            });

            if (!result || result.length === 0) {
                return {
                    success: false,
                    message: 'Customer not found with ID: ' + recId
                };
            }

            var internalId = result[0].getValue({
                name: 'internalid'
            });

            log.debug('Customer Found', 'Internal ID: ' + internalId);

            // === Load and Update Customer Record ===
            var updatedId = record.submitFields({
                type: 'customer',
                id: internalId,
                values: {
                    custbody_skybitz_failed: true
					
                }
            });


            log.debug('Customer Updated', 'Internal ID: ' + updatedId);


        }

        function updateSalesorder(recId, isFailed, reason) {

          log.debug('recId', recId);
			
			var soSearch = search.create({
                type: search.Type.SALES_ORDER,
                filters: [['tranid', 'is', recId]],
                columns: ['internalid']
            });

            var result = soSearch.run().getRange({ start: 0, end: 1 });

          log.debug('result', result)

            if (!result || result.length === 0) {
                return {
                    success: false,
                    message: 'Sales Order not found with Document Number: ' + recId
                };
            }

            var internalId = result[0].getValue({ name: 'internalid' });
            log.debug('Sales Order Found', 'Internal ID: ' + internalId);
			
			 var updatedId = record.submitFields({
                type: 'salesorder',
                id: internalId,
                values: {
                    custbody_skybitz_failed: isFailed,
					custbody_failed_reason:reason
                }
            });


            log.debug('sales order', 'Internal ID: ' + updatedId);


        }

        /**
         * Function called upon sending a DELETE request to the RESTlet.
         *
         * @param {Object} requestParams - Parameters from HTTP request URL; parameters will be passed into function as an Object (for all supported content types)
         * @returns {string | Object} HTTP response body; return string when request Content-Type is 'text/plain'; return Object when request Content-Type is 'application/json'
         * @since 2015.2
         */
        function doDelete(requestParams) {

        }

        return {
            // 'get': doGet,
            // put: doPut,
            post: doPost,
            //'delete': doDelete
        };

    });