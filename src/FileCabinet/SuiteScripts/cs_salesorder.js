/**
 * @NApiVersion 2.0
 * @NScriptType ClientScript
 */
 define(['N/url', 'N/currentRecord', 'N/runtime'],
    function(url, currentRecord, runtime) {
        
        function pageInit(context) {
        }

        function createSalesorder(vendor){
         //  alert('test');
          var recObj = currentRecord.get();
          log.debug('vendor', vendor);
		  
		  if(!vendor){
			  alert("Vendor is missing in Quote, add vendor to Quote");
		  }else{
			  var urlRedirect = "https://8151247.app.netsuite.com/app/accounting/transactions/salesord.nl?memdoc=0&transform=estimate&e=T&id="+recObj.id+"&whence=";
			  window.open(urlRedirect, '_self', false);
		  }
			
        }

        return {
            pageInit: pageInit,
            createSalesorder: createSalesorder
        };
    });