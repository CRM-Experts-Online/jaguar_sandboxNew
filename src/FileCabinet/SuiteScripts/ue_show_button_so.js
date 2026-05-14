/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
define(['N/runtime','N/cache','N/error', 'N/search'],
    function ( runtime,cache,error, search) {


    function beforeLoad(context) {
		
		try{
			if(context.type == 'view'){
				var invRec = context.newRecord; 
				var recId = invRec.id;
				var vendor = invRec.getValue('custbody_vendor');
            var form = context.form;
          var path = runtime.getCurrentScript().getParameter({name: 'custscript_q_sb_cs_script_path'});
          log.debug('path', path);
            form.clientScriptModulePath = path;
            form.addButton({
                id : 'custpage_sales_order',
                label : 'Sales Order',
                functionName: 'createSalesorder("'+vendor+'")'
            });
			}
			
    
		}catch(e){
			log.error('error', e.toString());
		}
        
        
    }

    return {
        beforeLoad: beforeLoad    };
});