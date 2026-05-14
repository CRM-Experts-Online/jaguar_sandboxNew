/**
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */
define(['N/search', 'N/record'], function(search, record) {

    return {
        get: get
    };

    function get(context) {
        try {
            log.debug('context', context);
            var orderInfos = [];
            search.load({
                id: 'customsearch1923'
            }).run().each(function(result) {
                log.debug('result', result);
                var soId = result.id;
                var soRec = record.load({
                    type: 'salesorder',
                    id: soId
                });
                var itemInfo = [];

                var entityId = result.getValue('entity');

              log.debug('entityId', entityId);

                var custDetails = getCustomer(entityId);

                log.debug('custDetails', custDetails);

                for (var i = 0; i < soRec.getLineCount('item'); i++) {
                    itemInfo.push({
                        'item': {
                            value: soRec.getSublistValue('item', 'item', i),
                            text: soRec.getSublistText('item', 'item', i)
                        },
                        'quantity': soRec.getSublistValue('item', 'quantity', i),
                        'rate': soRec.getSublistValue('item', 'rate', i),
                        'amount': soRec.getSublistValue('item', 'amount', i)
                    });
                }
                var isuploaded = soRec.getValue('custbody_uploaded_to_skybitz');
                orderInfos.push({
                    'tranid': soRec.getValue('tranid'),
                    //'entity': { value: soRec.getValue('entity'), text: soRec.getText('entity') },
                    'entity': {
                        value: soRec.getValue('entity'),
                        text: "SPL001"
                    },
                    'location': {
                        value: soRec.getValue('location'),
                        text: soRec.getText('location')
                    },
                    'class': {
                        value: soRec.getValue('class'),
                        text: soRec.getText('class')
                    },
                    'terms': {
                        value: soRec.getValue('terms'),
                        text: soRec.getText('terms')
                    },
                    'total': soRec.getValue('total'),
                    'iteminfo': itemInfo,
                    'isuploaded': isuploaded,
                    'assignedDate': soRec.getValue('custbody_delivery_date'),
                    'customerShipTo': custDetails[0],
                    'customer': custDetails[1],
					'parentCustomer': custDetails[2],
					'customerShippingDetail':soRec.getValue('custbody_additional_notes'),
					'gateCode': soRec.getValue('custbody_gate_code'),
					'isuploaded': false,
					'siteCode': soRec.getValue('custbody_site_code'),
					'siteContactName': soRec.getValue('custbody_site_contact_name'),
					'siteContactNumber': soRec.getValue('custbody_site_contact_number'),
					'fromTime': soRec.getText('custbody_from_time'),
					'toTime': soRec.getText('custbody_to_date'),
					'fromDate': soRec.getText('custbody_from_date'),
					'toDate': soRec.getText('custbody_to_time')
                });

                soRec.setValue('custbody_uploaded_to_skybitz', true);
                // soRec.save({
                //  enableSourcing : false,
                //  ignoreMandatoryFields : true
                // })
                return true;
            });

            log.debug('orderInfos', orderInfos);

            var orders = {};

            orders.orderInfos = orderInfos

            return orders;
        }catch(err){
			log.error('ERROR', err.toString());
            return {
                isSuccess: false,
                message: err.message,
                detail: JSON.stringify(err)
            };
        }
    }

    function getCustomer(entityId) {
		log.debug('entityId', entityId);

        var customerSearchObj = search.create({
   type: "customer",
   filters:
   [
     ["internalid","anyof",entityId]
   ],
   columns:
   [
      search.createColumn({
         name: "email",
         join: "salesRep",
         label: "Email"
      }),
      search.createColumn({name: "salesrep", label: "Sales Rep"}),
      search.createColumn({name: "shipaddress1", label: "Shipping Address 1"}),
      search.createColumn({name: "shipaddress2", label: "Shipping Address 2"}),
      search.createColumn({name: "shipcountry", label: "Shipping Country"}),
      search.createColumn({name: "shipcity", label: "Shipping City"}),
      search.createColumn({name: "shipstate", label: "Shipping State/Province"}),
      search.createColumn({name: "shipzip", label: "Shipping Zip"}),
      search.createColumn({name: "shipphone", label: "Shipping Phone"}),
      search.createColumn({name: "entityid", label: "ID"}),
      search.createColumn({name: "phone", label: "Phone"}),
      search.createColumn({
         name: "entityid",
         join: "parentCustomer",
         label: "ID"
      }),
      search.createColumn({name: "companyname", label: "Company Name"}),
      search.createColumn({name: "email", label: "Email"}),
      search.createColumn({name: "city", label: "City"}),
      search.createColumn({name: "state", label: "State/Province"}),
      search.createColumn({name: "country", label: "Country"}),
      search.createColumn({name: "address1", label: "Address 1"}),
      search.createColumn({name: "address2", label: "Address 2"}),
      search.createColumn({name: "zipcode", label: "Zip Code"}),
	  search.createColumn({name: "custentity_shipping_details", label: "Customer / Shipping Details"}),
      search.createColumn({name: "custentity_site_code", label: "Site Code"}),
      search.createColumn({name: "custentity_gate_code", label: "Gate Code "}),
      search.createColumn({name: "custentity_site_code", label: "Site Code"}),
      search.createColumn({name: "custentity_site_contact_name", label: "Site Contact Name"}),
      search.createColumn({name: "custentity_site_contact_number", label: "Site Contact Number"}),
      search.createColumn({name: "terms", label: "Terms"}),
	  search.createColumn({
         name: "email",
         join: "parentCustomer",
         label: "Email"
      }),
      search.createColumn({
         name: "entityid",
         join: "parentCustomer",
         label: "ID"
      }),
      search.createColumn({
         name: "state",
         join: "parentCustomer",
         label: "State/Province"
      }),
      search.createColumn({
         name: "address1",
         join: "parentCustomer",
         label: "Address 1"
      }),
      search.createColumn({
         name: "address2",
         join: "parentCustomer",
         label: "Address 2"
      }),
      search.createColumn({
         name: "companyname",
         join: "parentCustomer",
         label: "Company Name"
      }),
      search.createColumn({
         name: "city",
         join: "parentCustomer",
         label: "City"
      }),
      search.createColumn({
         name: "phone",
         join: "parentCustomer",
         label: "Phone"
      }),
      search.createColumn({
         name: "zipcode",
         join: "parentCustomer",
         label: "Zip Code"
      })
   ]
});

        var searchResult = customerSearchObj.run().getRange(0, 100);

        var shipTO = {};

        var customerObj = {};
		
		 var parentObj  = {};

        if (searchResult && searchResult.length > 0) {

            var shipToName = searchResult[0].getValue('companyname') || null;

            var shipSalesrep = searchResult[0].getValue('salesrep') || null;

            var shipSalesrepEmail = searchResult[0].getValue({
                name: "email",
                join: "salesRep",
                label: "Email"
            }) || null;

            var shiPId = searchResult[0].getValue('entityid') || null;

            var shipToparent = searchResult[0].getValue({
                name: "entityid",
                join: "parentCustomer",
                label: "ID"
            }) || null;

            var shipToadd1 = searchResult[0].getValue('shipaddress1') || null;

            var shipToadd2 = searchResult[0].getValue('shipaddress2') || null;

            var shipTocity = searchResult[0].getValue('shipcity') || null;

            var shipTostate = searchResult[0].getValue('shipstate') || null;

            var shipTocountry = searchResult[0].getValue('shipcountry') || null;

            var shipTozip = searchResult[0].getValue('shipzip') || null;

            var shipToPhone = searchResult[0].getValue('phone') || null;

            var custEmail = searchResult[0].getValue('email') || null;

            var custCity = searchResult[0].getValue('city') || null;

            var custState = searchResult[0].getValue('state') || null;
            var custCountry = searchResult[0].getValue('country') || null;
            var custAdd1 = searchResult[0].getValue('address1') || null;
            var custAdd2 = searchResult[0].getValue('address2') || null;
            var custZip = searchResult[0].getValue('zipcode') || null;
            var custPhone = searchResult[0].getValue('phone') || null;
			
			var parentEmail = searchResult[0].getValue({
         name: "email",
         join: "parentCustomer",
         label: "Email"
      }) || null;
	  
	  var parentId = searchResult[0].getValue({
         name: "entityid",
         join: "parentCustomer",
         label: "ID"
      }) || null;
	  
	  var parentState = searchResult[0].getValue({
         name: "state",
         join: "parentCustomer",
         label: "State/Province"
      }) || null;
	  
	   var parentAdd1 = searchResult[0].getValue({
         name: "address1",
         join: "parentCustomer",
         label: "Address 1"
      }) || null;
	  
	   var parentAdd2 = searchResult[0].getValue({
         name: "address2",
         join: "parentCustomer",
         label: "Address 2"
      }) || null;
	  
	   var parentAdd2 = searchResult[0].getValue({
         name: "address2",
         join: "parentCustomer",
         label: "Address 2"
      }) || null;
	  
	  var parentName = searchResult[0].getValue({
         name: "companyname",
         join: "parentCustomer",
         label: "Company Name"
      }) || null;
	  
	  
	    var parentCity = searchResult[0].getValue({
         name: "city",
         join: "parentCustomer",
         label: "City"
      }) || null;
	  
	   var parentPhone = searchResult[0].getValue({
         name: "phone",
         join: "parentCustomer",
         label: "Phone"
      }) || null;
	  
	   var parentZip = searchResult[0].getValue({
         name: "zipcode",
         join: "parentCustomer",
         label: "Zip Code"
      }) || null;
	  
	  parentObj.email = parentEmail;
	  parentObj.parentId = parentId;
	  parentObj.state = parentState;
	  parentObj.address1 = parentAdd1;
	  parentObj.address2 = parentAdd2;
	  parentObj.name = parentName;
	  parentObj.city = parentCity;
	   parentObj.phone = parentPhone;
	    parentObj.zip = parentZip;


            customerObj.customerId = shiPId;

            customerObj.name = shipToName;

            customerObj.email = custEmail;

            customerObj.city = custCity;

            customerObj.state = custState;

            customerObj.zip = custZip;

            customerObj.address1 = custAdd1;

            customerObj.address2 = custAdd2;

            customerObj.phone = custPhone;




            shipTO.name = shipToName

            shipTO.salesRep = shipSalesrep
            shipTO.salesRepEmail = shipSalesrepEmail
            shipTO.customerId = shiPId
            shipTO.masterId = shipToparent
            shipTO.address1 = shipToadd1
            shipTO.address2 = shipToadd2
            shipTO.city = shipTocity
            shipTO.state = shipTostate
            shipTO.country = shipTocountry
            shipTO.zip = shipTozip
            shipTO.phone = shipToPhone




        }

        var arr = []

        arr.push(shipTO)

        arr.push(customerObj)
		
		arr.push(parentObj)

        return arr;

    }
});