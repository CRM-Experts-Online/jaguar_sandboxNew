function customizeGlImpact(transactionRecord, standardLines, customLines, book) {

    var lineObj = transactionRecord.getFieldValue('custbody_cost_object');

    nlapiLogExecution('DEBUG', 'lineObj', lineObj);

    if (lineObj) {
        lineObj = JSON.parse(lineObj)
		
		var processedLines = [];

        if (lineObj && lineObj.length > 0) {
			
            for (var i = 0; i < standardLines.count; i++) {

                var standardLine = standardLines.getLine(i);

                var dAmount = standardLine.getDebitAmount()
                var cAmount = standardLine.getCreditAmount()
                var account = standardLine.getAccountId()

                nlapiLogExecution('DEBUG', 'dAmount', dAmount);
                nlapiLogExecution('DEBUG', 'cAmount', cAmount);
                nlapiLogExecution('DEBUG', 'account', account);
				
				if((dAmount <= 0) && (cAmount <= 0)){
					continue;
					
				}
				
				 for (var j = 0; j < lineObj.length; j++) {
					 
					 if(processedLines.indexOf(j) > -1){
						// nlapiLogExecution('DEBUG', 'line processed', j);
						 continue
					 }
					 
					 var lType = lineObj[j].type;
					 
					  var invAccount = lineObj[j].invAccount;
					  
					  var assetccount = lineObj[j].assetccount;
					  
					  var lCost = lineObj[j].cost;
					 
					 if(lType == 'debit' && dAmount > 0 && account == invAccount){
						 
						 //currLine.setDebitAmount(lCost)
						 
						 var customLine = customLines.addNewLine();
            customLine.setCreditAmount(standardLine.getDebitAmount());
			nlapiLogExecution('DEBUG', 'linetotal', standardLine.getDebitAmount());
            customLine.setAccountId(parseInt(invAccount));
            if (standardLine.getClassId()) customLine.setClassId(standardLine.getClassId());
            if (standardLine.getLocationId()) customLine.setLocationId(standardLine.getLocationId());
            if (standardLine.getEntityId()) customLine.setEntityId(standardLine.getEntityId());
            if (standardLine.getDepartmentId()) customLine.setDepartmentId(standardLine.getDepartmentId());
            if (standardLine.getLocationId()) customLine.setLocationId(standardLine.getLocationId());
            customLine.setMemo('Reversal GL Posting');
            var customLine = customLines.addNewLine();
            customLine.setDebitAmount(lCost);
			nlapiLogExecution('DEBUG', 'linetotal', lCost);
            customLine.setAccountId(parseInt(invAccount));
            if (standardLine.getClassId()) customLine.setClassId(standardLine.getClassId());
            if (standardLine.getEntityId()) customLine.setEntityId(standardLine.getEntityId());
            if (standardLine.getDepartmentId()) customLine.setDepartmentId(standardLine.getDepartmentId());
            if (standardLine.getLocationId()) customLine.setLocationId(standardLine.getLocationId());
            customLine.setMemo(standardLine.getMemo());
			 processedLines.push(j)
			break;
					 }
					 
					 if(lType == 'credit' && cAmount > 0 && account == assetccount){
						 
						 var customLine = customLines.addNewLine();
            customLine.setDebitAmount(standardLine.getCreditAmount());
		    nlapiLogExecution('DEBUG', 'linetotal', standardLine.getCreditAmount());
            customLine.setAccountId(parseInt(assetccount));
            if (standardLine.getClassId()) customLine.setClassId(standardLine.getClassId());
            if (standardLine.getLocationId()) customLine.setLocationId(standardLine.getLocationId());
            if (standardLine.getEntityId()) customLine.setEntityId(standardLine.getEntityId());
            if (standardLine.getDepartmentId()) customLine.setDepartmentId(standardLine.getDepartmentId());
            if (standardLine.getLocationId()) customLine.setLocationId(standardLine.getLocationId());
            customLine.setMemo('Reversal GL Posting');
            var customLine = customLines.addNewLine();
            customLine.setCreditAmount(lCost);
			nlapiLogExecution('DEBUG', 'linetotal', lCost);
            customLine.setAccountId(parseInt(assetccount));
            if (standardLine.getClassId()) customLine.setClassId(standardLine.getClassId());
            if (standardLine.getEntityId()) customLine.setEntityId(standardLine.getEntityId());
            if (standardLine.getDepartmentId()) customLine.setDepartmentId(standardLine.getDepartmentId());
            if (standardLine.getLocationId()) customLine.setLocationId(standardLine.getLocationId());
            customLine.setMemo(standardLine.getMemo());
			 processedLines.push(j)
			break;
					 }
					 
					// processedLines.push(j)
					 
				 }

            }
        }

    }



}