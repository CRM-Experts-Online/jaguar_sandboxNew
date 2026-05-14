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
                    
            var customersInfo = getCustomer();
			
			var custObj = {};
			
			custObj.customersInfo = customersInfo;

            return custObj;
        }catch(err){
			log.error('ERROR', err.toString());
            return {
                isSuccess: false,
                message: err.message,
                detail: JSON.stringify(err)
            };
        }
    }

    function getCustomer() {
		//log.debug('entityId', entityId);

        var customerSearchObj = search.load('2760');

        var searchResult = customerSearchObj.run().getRange(0, 1000);

        var shipTO = {};

        var customerObj = {};
		
		var customersArry =[];
		
		log.debug('searchResult', searchResult);

        if (searchResult && searchResult.length > 0) {
			
			for(var j = 0; j < searchResult.length; j++){
				
				var parentEmail = searchResult[j].getValue({
         name: "email",
         join: "parentCustomer",
         label: "Email"
      });
	  
	  var parentCustomerId  = searchResult[j].getValue({
         name: "entityid",
         join: "parentCustomer",
         label: "ID"
      })
	  
	  var parentState = searchResult[j].getValue({
         name: "state",
         join: "parentCustomer",
         label: "State/Province"
      })
	  
	  var parentAdd2 = searchResult[j].getValue({
         name: "address2",
         join: "parentCustomer",
         label: "Address 2"
      })
	  
	  var parentName = searchResult[j].getValue({
         name: "altname",
         join: "parentCustomer",
         label: "Name"
      })
	  
	  var parentAdd1 = searchResult[j].getValue({
         name: "address1",
         join: "parentCustomer",
         label: "Address 1"
      })
	  
	   var parentCity = searchResult[j].getValue({
         name: "city",
         join: "parentCustomer",
         label: "City"
      })
	   var parentPhone = searchResult[j].getValue({
         name: "phone",
         join: "parentCustomer",
         label: "Phone"
      })
	  var parentZip = searchResult[j].getValue({
         name: "zipcode",
         join: "parentCustomer",
         label: "Zip Code"
      })
	  
	   var sales1FirstName = searchResult[j].getValue({
         name: "firstname",
         join: "salesRep",
         label: "First Name"
      })
	  
	   var sales1LastName = searchResult[j].getValue({
         name: "lastname",
         join: "salesRep",
         label: "Last Name"
      })
	  
	   var sales2FirstName = searchResult[j].getValue({
         name: "firstname",
         join: "CUSTENTITY_SECONDARY_SALESREP",
         label: "First Name"
      })
	  
	   var sales2LastName = searchResult[j].getValue({
         name: "lastname",
         join: "CUSTENTITY_SECONDARY_SALESREP",
         label: "Last Name"
      })
	  
	  var childCountry = searchResult[j].getValue('country')
	  var childPhone = searchResult[j].getValue('phone')
	  var childCity = searchResult[j].getValue('city')
	  var childAdd2 = searchResult[j].getValue('address2')
	  var childName = searchResult[j].getValue('altname')	  
	  var childAdd1 = searchResult[j].getValue('address1')
	  var childState = searchResult[j].getValue('state')
	  var childId = searchResult[j].getValue('entityid')
	  var childZip = searchResult[j].getValue('zip')
	   var childShiptocustomer = ''
	    var sales1Email = searchResult[j].getValue({
         name: "email",
         join: "salesRep",
         label: "Email"
      })
	   var sales2Email = searchResult[j].getValue({
         name: "email",
         join: "CUSTENTITY_SECONDARY_SALESREP",
         label: "Email"
      })
	  
	  var parentObj = {};
	  
	  var childObj = {};
	  
	  parentObj.contactEmail = parentEmail;
	  parentObj.customerId = parentCustomerId;
	  parentObj.state = parentState;
	  parentObj.streetAddress2 = parentAdd2;
	  parentObj.name = parentName;
	  parentObj.streetAddress1 = parentAdd1;
	  parentObj.city = parentCity;
	  parentObj.phone = parentPhone;
	  parentObj.zip = parentZip;
	  
	  childObj.slaesRepName1 = sales1FirstName+' '+sales1LastName
	  childObj.slaesRepName2 = sales2FirstName+' '+sales2LastName
	  childObj.country = childCountry;
	  childObj.phone = childPhone;
	   childObj.city = childCity;
	  childObj.streetAddress2 = childAdd2; 
	  childObj.name = childName; 
	   childObj.streetAddress1 = childAdd1; 
	    childObj.state = childState; 
		childObj.customerId = childId; 
		childObj.zip = childZip; 
		childObj.shioToCustomer = childShiptocustomer; 
		childObj.salesRepEmail1 = sales1Email; 
		childObj.salesRepEmail2 = sales2Email; 
	   
	  parentObj.childCustomer = childObj;
	  log.debug('parentObj', parentObj);
	  customersArry.push(parentObj);
				
			}


        }

        

        return customersArry;

    }
});