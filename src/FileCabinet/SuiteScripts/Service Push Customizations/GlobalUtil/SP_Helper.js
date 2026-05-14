
/**
 *! Author: Dev "Muhammad Kamran"
 *! Date Creation: "20/09/2022"
 *! Date Updated: "20/01/2023"
 *! Version: 5
*/

define(['N', './SP_LIB_CommonDefaults.js'], function(NSModules, commonDefaults) {
    
    try{
        const
            _UI              = commonDefaults._UI,
            _SCRIPT          = commonDefaults._SCRIPT,
            _META_CONST      = _SCRIPT.META_CONST,
            _CLIENTSCRIPT    = _SCRIPT.CLIENTSCRIPT,
            _QUERY_CONST     = _SCRIPT.QUERY_CONST,
            _SUITELETSCRIPT  = _SCRIPT.SUITELETSCRIPT,
            _WORKFLOWACTION  = _SCRIPT.WORKFLOWACTION,
            _USEREVENTSCRIPT = _SCRIPT.USEREVENTSCRIPT,
            _URL             = _SCRIPT.URL,
            _BUTTONS         = _SCRIPT.BUTTONS,
            _SUBLIST_BUTTONS = _SCRIPT.SUBLIST_BUTTONS,
            _ITEMFULFILLMENT = commonDefaults._ITEMFULFILLMENT;

        let
            form               = new Object(),
            list               = new Object(),
            meta               = new Object(),
            files              = new Array(),
            context            = new Object(),
            button             = new Object(),
            request            = new Object(),
            response           = new Object(),
            renderer           = new Object(),
            // NSModules          = new Object(),
            domainURL          = new String(),
            entryPoint         = new Object(),
            holdingFile        = new Object(),
            holdedRecords      = new Array(),
            holdingRecord      = new Object(),
            entryPointFeatures = new Object();
            

        //*For Item FulFillment //TODO: Update Code
        // function statusIsShipped(id) { (!id && holdingRecord.recType == _ITEMFULFILLMENT.type)?null:validateHoldingRecord({recType: _ITEMFULFILLMENT.type, id: id}); return ( get(_ITEMFULFILLMENT.fields.shipStatus) == _ITEMFULFILLMENT.defaults.shipStatus.SHIPPED )}; 

        //*For Getting Netsuite Fields Data
        function get({field, type, sublistId, currentSublist, line, fromRecord, fromPostRequest, from, format}) { 

            if(!fromRecord && !fromPostRequest) throw new Error('Kindly mention from which record field value should be picked?');

            try{
                
                let 
                    fromSource, value, sublistLineObj, fieldObj;

                if(!!fromRecord){
                    fieldObj = field;
                    fromSource = extrctRecordObj(fromRecord);
                    sublistLineObj = {sublistId: sublistId, fieldId: field, line:line};
                }
                else if(!!fromPostRequest){
                    fieldObj = field;
                    fromSource = fromPostRequest;
                    sublistLineObj = {group: sublistId, name: field, ...(!currentSublist)?{line:line}:{}};
                }

                if(!fromSource) throw new Error('Kindly mention from which source the value/text should be picked');

                //TODO : Verify Field Object in case of From Post Request

                value = 
                    (!sublistId && !line)?
                        (!type)? 
                            fromSource.getValue(fieldObj)
                        :(type.includes(_UI.FIELD.value))? 
                            fromSource.getValue(fieldObj)
                        :(type.includes(_UI.FIELD.text))? 
                            fromSource.getText(fieldObj)
                        :null
                    :(!!sublistId)?
                        (!!currentSublist)?
                            (!type)? 
                                fromSource.getCurrentSublistValue(sublistLineObj)
                            :(type.includes(_UI.FIELD.value))? 
                                fromSource.getCurrentSublistValue(sublistLineObj)
                            :(type.includes(_UI.FIELD.text) )? 
                                fromSource.getCurrentSublistText(sublistLineObj)
                            :null
                        :(!!line || line == 0)?
                            (!type)? 
                                fromSource.getSublistValue(sublistLineObj)
                            :(type.includes(_UI.FIELD.value))? 
                                fromSource.getSublistValue(sublistLineObj)
                            :(type.includes(_UI.FIELD.text) && !fromPostRequest)? 
                                fromSource.getSublistText(sublistLineObj)
                            :null
                        :null
                    :null

                if( !!format)
                    if(!!value && !!format.stringToDate){
                        log.debug('stringToDate', typeof(value));
                        value = NSModules.format.parse({ value, type: NSModules.format.Type.DATE })
                        log.debug('stringToDate',value )
                    }
                    else if(!!value && !!format.dateToString){
                        log.debug('dateToString', typeof(value));
                        value = NSModules.format.format({ value, type: NSModules.format.Type.DATE })
                        log.debug('dateToString',value )
                    }


                return value;
            }
            catch(err){
                log.debug('Error', 'Error Found In get');
                log.debug('Error', err);
            }
        }

        function set({field, type, data, sublistId, currentSublist, line, fromRecord, ignoreFieldChange, forceSyncSourcing}){

            log.debug('{field, data, sublistId, line}',{field, data, sublistId, line});

            if(!fromRecord) throw new Error('Kindly mention from which record field value should be picked?');
            if(typeof(data) == 'undefined'){ 
                log.error('ERR!', 'Kindly provide data for the resective field!');
                return;
            }

            // log.debug('{field, type, data, sublistId, currentSublist, line}',{field, type, data, sublistId, currentSublist, line})

            try{
                
                let 
                    fromSource, sublistLineObj, fieldObj;
                
                if(!!fromRecord){
                    fieldObj = {fieldId: field, ...(( !!(type) && (type.includes(_UI.FIELD.text)))? {text: data}: {value: data}) };
                    fromSource = extrctRecordObj(fromRecord);
                    sublistLineObj = {sublistId: sublistId, fieldId: field, ignoreFieldChange, forceSyncSourcing, ...(( !!(type) && (type.includes(_UI.FIELD.text)))? {text: data}: {value: data}), ...(!currentSublist)?{line:line}:{} };
                }

                if(!fromSource) throw new Error('Kindly mention from which source the value/text should be picked');

                log.debug('fromSource', fromSource);
                log.debug('{field, data, sublistId, line, fieldObj}',{field, data, sublistId, line, currentSublist, fieldObj, sublistLineObj});

                (!sublistId && !line)?
                    (!type)? 
                        fromSource.setValue(fieldObj)
                    :(type.includes(_UI.FIELD.value))? 
                        fromSource.setValue(fieldObj)
                    :(type.includes(_UI.FIELD.text))? 
                        fromSource.setText(fieldObj)
                    :null
                :(!!sublistId)?
                    (!!currentSublist)?
                        (!type)? 
                            fromSource.setCurrentSublistValue(sublistLineObj)
                        :(type.includes(_UI.FIELD.value))? 
                            fromSource.setCurrentSublistValue(sublistLineObj)
                        :(type.includes(_UI.FIELD.text))? 
                            fromSource.setCurrentSublistText(sublistLineObj)
                        :null
                    :(!!line || line == 0)?
                        (!type)? 
                            fromSource.setSublistValue(sublistLineObj)
                        :(type.includes(_UI.FIELD.value))? 
                            fromSource.setSublistValue(sublistLineObj)
                        :(type.includes(_UI.FIELD.text))? 
                            fromSource.setSublistValue(sublistLineObj)
                        :null
                    :null
                :null
            }
            catch(err){
                //log.debug('Error', 'Error Found In set');
                //log.debug('Error', err);
            }
        }

        function getMultiple({fieldsNTypeOBJ, fromRecord, getAllLinesData, sublistId, line}) { //TODO: Add validations for text data

            if(!fromRecord) throw new Error('Kindly mention from which record field value should be picked?');
            try{
                
                if(!validators().isEmptyArray(fieldsNTypeOBJ)){

                    let
                        fieldsDataAOObj = new Array();

                    if(!!verifyParam(getAllLinesData).isBoolean && getAllLinesData)
                        for(let line=0; line<fromRecord.getLineCount(sublistId); line++){
                            fieldsDataAOObj.push(new Object());
                            fieldsNTypeOBJ.forEach( (field)=>{
                                field.value = get({...field, line, fromRecord, sublistId});
                                fieldsDataAOObj[fieldsDataAOObj.length-1][field.field] = {...field};
                            });
                            
                        }
                    else if(!!line || line == 0){
                        fieldsDataAOObj.push(new Object());
                        fieldsNTypeOBJ.forEach( (field)=>{
                            field.value = get({...field, line:line, fromRecord, sublistId});
                            fieldsDataAOObj[fieldsDataAOObj.length-1][field.field] = field;
                        });
                    }
                    else{
                        fieldsDataAOObj.push(new Object());
                        fieldsNTypeOBJ.forEach( (field)=>{
                            field.value = get({...field, fromRecord});
                            fieldsDataAOObj[fieldsDataAOObj.length-1][field.field] = field;
                        });
                    }
                    
                    //log.debug('fieldsDataAOObj', fieldsDataAOObj);

                    return fieldsDataAOObj;
                }
            }
            catch(err){
                log.debug('Error', 'Error Found In getMultiple()');
                log.debug('Error', err);
            }
        }

        function getSublistData(param, fromRecord, pickFromUI, fromPostRequest){
            try{
                if(!!({...verifyParam(param)}).isObject){
                    
                    //log.debug('param', param);

                    let 
                        sublistObj = param;

                    if(!!sublistObj){
                        
                        let
                            fromRec, lineCount, UI_SublistObj, postRequestObj,
                            sublistFieldsDataArray = new Array(),
                            {id, fields} = sublistObj,
                            sublistId = id;

                        if(!!fromRecord){
                            fromRec = extrctRecordObj(fromRecord);
                            lineCount = fromRec.getLineCount(sublistId);
                        }
                        else if(!!pickFromUI){
                            UI_SublistObj = form.getSublist(sublistId);
                            lineCount     =  UI_SublistObj.getLineCount;
                        }
                        else if(!!fromPostRequest){
                            postRequestObj = fromPostRequest;
                            lineCount     =  postRequestObj.getLineCount({ group: sublistId });
                        }

                        for(let line=0; line<lineCount; line++){
                            
                            sublistFieldsDataArray.push({line:line});
                            
                            fields.forEach(({id})=>{
                                sublistFieldsDataArray[sublistFieldsDataArray.length-1][id] = {
                                    text:(
                                        (!!fromRec)?
                                            get({ field:id, fromRecord:fromRec, type: _UI.FIELD.text, sublistId: sublistId, line: line })
                                        :(!!UI_SublistObj)?
                                            get({ field:id, fromRecord:fromRec, type: _UI.FIELD.text, sublistId: sublistId, line: line })
                                        :(!!postRequestObj)?
                                            get({ field:id, fromPostRequest:postRequestObj, type: _UI.FIELD.text, sublistId: sublistId, line: line })
                                        :null
                                    ),
                                    value:(
                                        (!!fromRec)?
                                            get({ field:id, fromRecord:fromRec, sublistId: sublistId, line: line })
                                        :(!!UI_SublistObj)?
                                            get({ field:id, fromRecord:fromRec, type: _UI.FIELD.text, sublistId: sublistId, line: line })
                                        :(!!postRequestObj)?
                                            get({ field:id, fromPostRequest:postRequestObj, type: _UI.FIELD.value, sublistId: sublistId, line: line })
                                        :null
                                    )
                                        
                                }    
                            });
                        }

                        return sublistFieldsDataArray;
                        
                    }
                }
            }
            catch(err){
                //log.debug('Error', 'Error Found In getSublistData()');
                //log.debug('Error', err);
            }

        }

        //TODO: Optimize Code For setRecord
        //*Initializing Record, Input Format {rec:record, type:'new', id:recordid, recType: recordType}
        function setRecord(rec){
            //log.audit('Processing', 'Executing setRecord()');

            try{
                //log.audit('rec', `{id=${rec.id}, recType=${rec.recType}, type=${rec.type}}`);
                holdingRecord =
                    (!!rec.mode && rec.mode == 'create')?  
                        (holdedRecords.push({ mode:rec.mode, recType: rec.recType, rec: NSModules.record.create({ type:rec.recType, ...(( !!rec.isDynamic || String(rec.isDynamic).includes('false') )?{isDynamic:rec.isDynamic}:{}) }) }) && holdedRecords[holdedRecords.length-1]) :
                    (!!rec.rec && (existingRecord = findRecord({type: rec.type}) ) )?
                        existingRecord:
                    (!!rec.rec)?
                        (holdedRecords.push({rec: rec.rec, recType: rec.recType, type: rec.type}) && holdedRecords[holdedRecords.length-1]): 
                    (!!rec.id && (existingRecord = findRecord({id: rec.id})))?
                        existingRecord: 
                    (!!rec.id)?
                        (holdedRecords.push({ id:rec.id, recType: rec.recType, rec: NSModules.record.load({ type:rec.recType, id:rec.id, ...(( !!rec.isDynamic || String(rec.isDynamic).includes('false') )?{isDynamic:rec.isDynamic}:{}) })}) && holdedRecords[holdedRecords.length-1] ):
                        undefined; 

                //log.audit('holdedRecords', holdedRecords.map(({id, recType, type})=>{return `{id=${id}, recType=${recType}, type=${type}}`}));
                
                return holdingRecord;
            }
            catch(err){
                log.debug('Error', 'Error Found In setRecord');
                log.debug('Error', err);
            }
        }

        //*Initializing Script
        function setContext({ctx, ep, mode}){ //TODO: Optimize this function    
            //log.audit('Processing', 'Executing setContext()');

            try{
                context = ctx;


                //log.debug('NSModules', NSModules);
                //log.debug('NSModules.ui.serverWidget', NSModules.ui.serverWidget);
                //log.debug('NSModules.serverWidget', NSModules.serverWidget);
                //log.debug('NSModules', NSModules);
                //log.debug('NSModules', NSModules);
                //log.debug('NSModules', JSON.stringify(NSModules));
                
                if(!context) throw new Error("Helper: Context Not Found!");
                if(!ep) throw new Error("Helper: Unable To Determine Entry Point!");
            
                if(ep == _USEREVENTSCRIPT.ENTRYPOINTS.beforeLoad.string){
                    
                    //initializing global variable
                    entryPoint = _USEREVENTSCRIPT.ENTRYPOINTS.beforeLoad;

                    if(!context.form)      throw new Error("Helper: Context Form Not Found");
                    if(!context.newRecord) throw new Error("Helper: Context New Record Not Found");
                    setForm(context.form); setRecord({type:entryPoint.RECORDTYPES.NEW, rec:context.newRecord});
                    if(!!context.newRecord.type && !!context.newRecord.id) setRecord({ id:context.newRecord.id, recType:context.newRecord.type });

                    return{
                        setToBeGenerated:setToBeGenerated
                    }
                }
                else if(ep == _SUITELETSCRIPT.ENTRYPOINTS.onRequest.string){

                    //initializing global variable
                    entryPoint = _SUITELETSCRIPT.ENTRYPOINTS.onRequest;


                    if(!context.request) throw new Error("Helper: Context Request Not Found");
                    if(!context.response) throw new Error("Helper: Context Response Not Found");

                    request  = context.request; response = context.response;

                    let 
                        recId   = getUrlParamData(_URL.params.transactionId),
                        recType = getUrlParamData(_URL.params.transactionType);

                    if(!!recId && validators().isValidRecordString(recType))
                        setRecord({recType:recType, id:recId});
                }
                else if(ep == _USEREVENTSCRIPT.ENTRYPOINTS.beforeSubmit.string){

                    //initializing global variable
                    entryPoint = _USEREVENTSCRIPT.ENTRYPOINTS.beforeSubmit;

                    if(!context.oldRecord && (!!mode && mode != entryPoint.USERMODES.CREATE)) throw new Error("Helper: Context Old Record Not Found");
                    else setRecord({type:entryPoint.RECORDTYPES.OLD, rec:context.oldRecord});
                    if(!context.newRecord) throw new Error("Helper: Context New Record Not Found");
                    else setRecord({type:entryPoint.RECORDTYPES.NEW, rec:context.newRecord});

                    if(!!context.newRecord.type && !!context.newRecord.id) setRecord({ id:context.newRecord.id, recType:context.newRecord.type });
                    else if(!!context.oldRecord && !!context.oldRecord.type && !!context.oldRecord.id) setRecord({ id:context.oldRecord.id, recType:context.oldRecord.type });
                    
                }
                else if(ep == _USEREVENTSCRIPT.ENTRYPOINTS.afterSubmit.string){

                    //initializing global variable
                    entryPoint = _USEREVENTSCRIPT.ENTRYPOINTS.afterSubmit;

                    if(!context.oldRecord && (mode != entryPoint.CREATE)) throw new Error("Helper: Context Old Record Not Found");
                    else setRecord({type:entryPoint.RECORDTYPES.OLD, rec:context.oldRecord});
                    if(!context.newRecord) throw new Error("Helper: Context New Record Not Found");
                    else setRecord({type:entryPoint.RECORDTYPES.NEW, rec:context.newRecord});

                    if(!!context.newRecord.type && !!context.newRecord.id) setRecord({ id:context.newRecord.id, recType:context.newRecord.type });
                    else if(!!context.oldRecord.type && !!context.oldRecord.id) setRecord({ id:context.oldRecord.id, recType:context.oldRecord.type });
                }
                else if(ep == _WORKFLOWACTION.ENTRYPOINTS.onAction.string){

                    //initializing global variable
                    entryPoint = _WORKFLOWACTION.ENTRYPOINTS.onAction;

                    if(!context.oldRecord && (mode != entryPoint.CREATE)) throw new Error("Helper: Context Old Record Not Found");
                    else setRecord({type:entryPoint.RECORDTYPES.OLD, rec:context.oldRecord});
                    if(!context.newRecord) throw new Error("Helper: Context New Record Not Found");
                    else setRecord({type:entryPoint.RECORDTYPES.NEW, rec:context.newRecord});

                    if(!!context.newRecord.type && !!context.newRecord.id) setRecord({ id:context.newRecord.id, recType:context.newRecord.type });
                    else if(!!context.oldRecord.type && !!context.oldRecord.id) setRecord({ id:context.oldRecord.id, recType:context.oldRecord.type });
                }

                function setToBeGenerated({fieldId, disable, disableOnCreateMode, disableOnEditMode}){ 
                    
                    try{
                        
                        if(!["edit", "view"].includes(context.type))
                            findRecord({
                                type:entryPoint.RECORDTYPES.NEW
                            }).rec.setValue(fieldId, 'To Be Generated');


                        if(!["view"].includes(context.type))
                            if(!!verifyParam(disable).isBoolean) //TODO: add such strings in global default
                                form.getField({
                                    id : fieldId
                                }).updateDisplayType({
                                    displayType : NSModules.ui.serverWidget.FieldDisplayType.DISABLED
                                });
                                
                        if(!["edit", "view"].includes(context.type))
                            if(verifyParam(disableOnCreateMode).isBoolean)
                                form.getField({
                                    id : fieldId
                                }).updateDisplayType({
                                    displayType : NSModules.ui.serverWidget.FieldDisplayType.DISABLED
                                });
                                
                        if(!["create", "view"].includes(context.type))
                            if(verifyParam(disableOnEditMode).isBoolean)
                                form.getField({
                                    id : fieldId
                                }).updateDisplayType({
                                    displayType : NSModules.ui.serverWidget.FieldDisplayType.DISABLED
                                });
                                
                    } //TODO: Optimize the code 
                    catch(err){
                        log.debug('Error', 'Error Found In setToBeGenerated');
                        log.debug('Error', err);
                    }
                }
            }
            catch(err){
                log.error('Error', 'Error Found In setContext');
                log.error('Error', err);
            }
        }

        function setClientContext({ctx, ep, mode}){

            try{

                context = ctx;


                //log.debug('NSModules', NSModules);
                //log.debug('NSModules', NSModules);
                //log.debug('NSModules', JSON.stringify(NSModules));
                
                if(!context) throw new Error("Helper: Context Not Found!");
                if(!ep) throw new Error("Helper: Unable To Determine Entry Point!");

                if(ep == _CLIENTSCRIPT.ENTRYPOINTS.validateField.string){

                    entryPointFeatures = new Object();

                    //initializing global variable
                    entryPoint = _CLIENTSCRIPT.ENTRYPOINTS.validateField;

                    if(!!context.currentRecord) setRecord({ type: entryPoint.RECORDTYPES.CURRENT, rec: context.currentRecord });
                    if(!!context.currentRecord.type && !!context.currentRecord.id) setRecord({ id: context.currentRecord.id, recType: context.currentRecord.type });
                }
                else if(ep == _CLIENTSCRIPT.ENTRYPOINTS.pageInit.string){

                    entryPointFeatures = new Object();

                    //initializing global variable
                    entryPoint = _CLIENTSCRIPT.ENTRYPOINTS.pageInit;

                    if(!!context.currentRecord) setRecord({ type: entryPoint.RECORDTYPES.CURRENT, rec: context.currentRecord });
                    if(!!context.currentRecord.type && !!context.currentRecord.id) setRecord({ id:context.currentRecord.id, recType:context.currentRecord.type });
                }
                else if(ep == _CLIENTSCRIPT.ENTRYPOINTS.postSourcing.string){

                    entryPointFeatures = new Object();

                    //initializing global variable
                    entryPoint = _CLIENTSCRIPT.ENTRYPOINTS.postSourcing;

                    if(!!context.currentRecord) setRecord({ type: entryPoint.RECORDTYPES.CURRENT, rec: context.currentRecord });
                    if(!!context.currentRecord.type && !!context.currentRecord.id) setRecord({ id: context.currentRecord.id, recType: context.currentRecord.type });
                }
                else if(ep == _CLIENTSCRIPT.ENTRYPOINTS.saveRecord.string){

                    entryPointFeatures = new Object();

                    //initializing global variable
                    entryPoint = _CLIENTSCRIPT.ENTRYPOINTS.saveRecord;

                    if(!!context.currentRecord) setRecord({ type: entryPoint.RECORDTYPES.CURRENT, rec: context.currentRecord });
                    if(!!context.currentRecord.type && !!context.currentRecord.id) setRecord({ id:context.currentRecord.id, recType:context.currentRecord.type });
                }
                
            }
            catch(err){
                log.error('Error', 'Error Found In setClientContext');
                log.error('Error', err);
                console.log('Error', 'Error Found In setClientContext');
                console.log('Error', err);
            }
        }

        //*Initializing Form
        function setForm(formObj, clientScript, formTitle){ /*log.debug('{formObj, clientScript, formTitle}', {formObj, clientScript, formTitle});*/  form = (!!formObj && (typeof(formObj)).includes('object'))?formObj:(!!formTitle && typeof(formTitle).includes('string'))?NSModules.ui.serverWidget.createForm(formTitle||'SUITELET PAGE'): null; /*log.debug('form', form);*/  if(!!clientScript)(!!clientScript.path)? (form.clientScriptModulePath = clientScript.path) :(!!clientScript.id)? (form.clientScriptFileId = clientScript.id):null;  }
        function setList(listObj, clientScript, listTitle){ /*log.debug('{formObj, clientScript, formTitle}', {formObj, clientScript, formTitle});*/  list = (!!listObj && (typeof(listObj)).includes('object'))?listObj:(!!listTitle && typeof(listTitle).includes('string'))?NSModules.ui.serverWidget.createList(listTitle||'SUITELET PAGE'): null; /*log.debug('form', form);*/  if(!!clientScript)(!!clientScript.path)? (list.clientScriptModulePath = clientScript.path) :(!!clientScript.id)? (list.clientScriptFileId = clientScript.id):null;  }
        function getForm(){ return form; }
        function getList(){ return list; }
        function extrctRecordObj (rec) { return (!!rec && rec.hasOwnProperty('rec'))? rec.rec : rec }

        //*Show Button On Transaction
        function showButton( {buttonMeta, func, name} ){  
            //log.audit('Processing', 'Executing showButton()');

            //log.debug('verifyParam(func).isString',      verifyParam(func).isString);
            //log.debug('verifyParam(func).isFunction',    verifyParam(func).isFunction);
            //log.debug('validators().isEmptyArray(func)', validators().isEmptyArray(func));


            let functionNameStr = 
                ( !!verifyParam(func).isString )? 
                    `console.log('${func}'); ${func};`
                :( !!verifyParam(func).isFunction )? 
                    `handleMod=null; console.log("${func()}"); ${func()};`
                :( !validators().isEmptyArray(func) )?
                    `handleMod=null; console.log("${func.map(f=>{return `${f()};`;})}"); ${func.map(f=>{return `${f()};`;})}`
                :null;

            try{
                //log.audit('functionNameStr',functionNameStr); 
                button = form.addButton({ 
                    id: _UI.BUTTON.id + buttonMeta.id||'', 
                    label: buttonMeta.label, 
                    functionName: functionNameStr
                });  
                return button; 
            }
            catch(err){
                log.error('Error', 'Error Found In showButton');
                log.error('Error', err);
            }
        }

        function setButtons(buttonsMeta, params){
            try{
                if(!!buttonsMeta && (typeof(buttonsMeta)).includes('object') && !!Object.keys(buttonsMeta).length && !!buttonsMeta.buttons && !!buttonsMeta.buttons.length){
                    
                    let
                        buttonsList = buttonsMeta.buttons;

                    (!!buttonsList)?
                        buttonsList.forEach( button => { 
                            
                            //log.debug("button.id.includes(_BUTTONS.types.export.id.toLowerCase())", button.id.includes(_BUTTONS.types.export.id.toLowerCase()));
                            if(button.id.includes(_BUTTONS.types.export.id.toLowerCase())) 
                                    showButton({
                                        buttonMeta: button, 
                                        func:buttonListeners({
                                            params:{[_URL.params.exportFile]: true, [_URL.params.exportIn]:_BUTTONS.types.export.types.CSV, ...params},
                                            currentSuitelet:  true,
                                            openInCurrentTab: true
                                        }).redirectToSuitelet
                                    })
                            else if(button.id.includes(_BUTTONS.types.resetFilters.id.toLowerCase())) {
                                showButton({
                                    buttonMeta: button, 
                                    func:buttonListeners({
                                        params:{},
                                        currentSuitelet:  true,
                                        openInCurrentTab: true
                                    }).redirectToSuitelet
                                })
                            }
                            else if(button.id.includes(_BUTTONS.types.submit.id.toLowerCase())){
                                let 
                                    submitBtnObj = form.addSubmitButton(button);

                                if(!!verifyParam(button.isDisabled).isBoolean)submitBtnObj.isDisabled = button.isDisabled;
                                if(!!verifyParam(button.isHidden).isBoolean)submitBtnObj.isHidden = button.isHidden;

                            }
                            else
                                form.addButton(button); 
                        })
                    : null;
                }
                else
                    log.error('Err!', 'buttonsMeta not Found or may be of different data. Kindly provide correct data buttonsMeta is supposed to be an object')
            }
            catch(err){
                log.error('Error', 'Error Found In setButtons');
                log.error('Error', err);
            }
        }

        function setColumns(columnsMeta){
            try{
                
                if(!!columnsMeta && (typeof(columnsMeta)).includes('object') && !!Object.keys(columnsMeta).length && !!columnsMeta.columns && !!columnsMeta.columns.length){
                    columnsMeta.columns.forEach(columnObj => {
                        list.addColumn(columnObj)
                    })
                }
            }
            catch(err){
                log.debug('ERR! Found In setColumns')
            }
        }

        // function setRows(rowData){
        //     try{
                
        //         if(!!columnsMeta && (typeof(columnsMeta)).includes('object') && !!Object.keys(columnsMeta).length && !!columnsMeta.columns && !!columnsMeta.columns.length){
        //             columnsMeta.columns.forEach(columnObj => {
        //                 list.addColumn(columnObj)
        //             })
        //         }
        //     }
        //     catch(err){
        //         log.debug('ERR! Found In setColumns')
        //     }
        // }

        function setFieldGroups(fieldGroups){ (!!fieldGroups && (typeof(fieldGroups)).includes('object') && !!fieldGroups.length)? fieldGroups.forEach( fieldGroup => form.addFieldGroup(fieldGroup) ): null; }

        function setFields(fields, params){ 
            try{
                log.debug('{fields, params}',{fields, params});

                (!validators().isEmptyArray(fields))?
                    fields.forEach(field => {
                        //log.debug('field', field);
                        let
                            fieldObj = form.addField(field);

                        (field.type == NSModules.ui.serverWidget.FieldType.SELECT && !!field.customOptions)?
                            field.customOptions.forEach( option => fieldObj.addSelectOption(option) ) :null;

                        (field.displayType)?
                            fieldObj.updateDisplayType({ displayType: field.displayType }): null;  
                            
                        (field.is)?
                            fieldObj.updateDisplayType({ displayType: field.displayType }): null;   
                        
                        (!!field.isMandatory)?
                            fieldObj.isMandatory = field.isMandatory: null; 
                            
                        (!!field.displaySize)?
                            fieldObj.updateDisplaySize(field.size): null; 

                        fieldObj.defaultValue = 
                            (field.type == NSModules.ui.serverWidget.FieldType.DATE && !!field.pickCurrentDate)? new Date()
                            // :(!!verifyParam(field.defaultValue).isBoolean || field.type == NSModules.ui.serverWidget.FieldType.CHECKBOX)? field.defaultValue||false
                            :(!field.defaultValue && !!params)? params[field.id]||null:field.defaultValue;
                    })
                : null;
            }
            catch(err){
                log.debug('Error', 'Error Found In setFields');
                log.debug('Error', err);
            }
        }

        function setFieldAttributes(param){
            try{
                if(!!verifyParam(param).isObject){

                    let 
                        fieldObj = param,
                        uiFieldObj = form.getField({id: fieldObj.fieldId});
                    
                    if(!!verifyParam(fieldObj.isMandatory).isBoolean) uiFieldObj.isMandatory = fieldObj.isMandatory;
                }
                else if(!!verifyParam(param).isArray && !isEmptyArray(param)){
                    
                    let 
                        uiFieldObj,
                        fieldsArray = param;

                    fieldsArray.forEach(fieldObj=>{

                        uiFieldObj = form.getField({id: fieldObj.fieldId});
                        if(!!verifyParam(fieldObj.isMandatory).isBoolean)  uiFieldObj.isMandatory = fieldObj.isMandatory;
                    })

                }
            }
            catch(err){
                log.debug('Error', 'Error Found In setMandatoryField()');
                log.debug('Error', err);
            }
        }

        function setButtonAttributes(param){
            try{
                if(!!verifyParam(param).isObject){

                    let 
                        buttonObj   = param,
                        uiButtonObj = form.getButton({id: buttonObj.buttonId});
                    
                    //log.debug('buttonObj', buttonObj);
                    //log.debug('buttonObj.isHidden',buttonObj.isHidden);
                    //log.debug('!!verifyParam(buttonObj.isHidden).isBoolean',!!verifyParam(buttonObj.isHidden).isBoolean);
                    if(!!verifyParam(buttonObj.isDisabled).isBoolean) uiButtonObj.isDisabled = buttonObj.isDisabled;
                    if(!!verifyParam(buttonObj.isHidden).isBoolean)   uiButtonObj.isHidden   = buttonObj.isHidden;
                    if(!!verifyParam(buttonObj.label).isString)       uiButtonObj.label      = buttonObj.label;
                }
                else if(!!verifyParam(param).isArray && !isEmptyArray(param)){
                    
                    let 
                        uiButtonObj,
                        buttonsArray = param;

                    buttonsArray.forEach(buttonObj=>{

                        uiButtonObj = form.getField({id: buttonObj.buttonId});

                        if(!!verifyParam(buttonObj.isDisabled).isBoolean) uiButtonObj.isDisabled = buttonObj.isDisabled;
                        if(!!verifyParam(buttonObj.isHidden).isBoolean)   uiButtonObj.isHidden   = buttonObj.isHidden;
                        if(!!verifyParam(buttonObj.label).isString)       uiButtonObj.label      = buttonObj.label;
                    })

                }
            }
            catch(err){
                log.debug('Error', 'Error Found In setMandatoryField()');
                log.debug('Error', err);
            }
        }

        function setDefaultFieldValue({field, sublist, lineCount, forExportButton, label, checkboxId}){

            //log.debug('{field, sublist, lineCount}',{field, sublist, lineCount});
            
            if(!!lineCount){                
                //log.debug('lineCount',form.getSublist({id:sublist}).lineCount);
                let 
                    lineCount = form.getSublist({id:sublist}).lineCount;
                form.getField(field).defaultValue = (lineCount<0)?0:lineCount;
            }

            if(!!forExportButton){
                return `
                    <script> 

                        console.log(jQuery("[value='${label}']"));
                        `.concat(
                            (!!checkboxId)?`jQuery("[name='${checkboxId}']").attr('disabled',true)`:``
                        ).concat(`
                            setTimeout(()=>{
                                jQuery("")
                                jQuery("[value='${label}']").reverse().each((iter, btn) => {
            
                                    let 
                                        btnClass = jQuery(btn).attr('class');
                                    
                                    localStorage['${label}'] = btnClass
            
                                    jQuery(btn).attr({'disabled': 'true', 'class': '', 'pointer-events': 'none'});
                                    jQuery(btn).css({'background-color': '#f0f0f0', 'box-shadow': '0px 0px 10px 2px lavenderblush'});
            
                                });
                            },50)
                        </script>
                    `);
            }
        }

        function setSublists(sublists){
            (!!sublists && (typeof(sublists)).includes('object') && !!sublists.length)?
                sublists.forEach( sublist => {
                        
                    sublistObj = form.addSublist( sublist );

                    sublist.fields.forEach(sublistField => {
                        
                        let
                            sublistFieldObj = sublistObj.addField(sublistField);
                        
                        (!!sublistField.displayType)?
                            sublistFieldObj.updateDisplayType({ displayType: sublistField.displayType }): null;    

                        //log.debug('sublistField',sublistField);    
                        (!!sublistField.isMandatory)?
                            sublistFieldObj.isMandatory = sublistField.isMandatory: null; 

                        (!!sublistField.updateTotallingFieldId)?
                            sublistObj.updateTotallingFieldId(sublistField): null
                    });

                    sublist.buttons.forEach(sublistButton => {
                        (!!sublistButton.id.includes(_SUBLIST_BUTTONS.types.markAllButton.id))?
                            sublistObj.addMarkAllButtons()
                        :(!!sublistButton.id.includes(_SUBLIST_BUTTONS.types.refreshButton.id))?
                            sublistObj.addRefreshButton()
                        :
                            sublistObj.addButton(sublistButton);
                    });

            }): null;
        }

        //*Custom Button Listeners
        function buttonListeners(args){

            let
                params       = args.params,
                paramsArray  = args.paramsArray,
                suiteletMeta = args.suiteletMeta||{},
                currentSuitelet = args.currentSuitelet,
                openInCurrentTab = args.openInCurrentTab;

            //log.debug('args', args);

            function redirectToSuitelet(){ //TODO: Add here validation for triggerPoint, e.g( triggerPoint == "BUTTON")
                
                let scriptUrl, functionsStr = new String();

                if(!!paramsArray){
                    paramsArray.map( params=>{
                        
                        scriptUrl    = (!!currentSuitelet)? getCurrentSuiteletScriptURL(suiteletMeta.returnExternalUrl, params) : getScriptURL(suiteletMeta, params);
                        functionsStr += 'window.open(\''+ scriptUrl + '\'' + ( (!!openInCurrentTab)? ', \'_self\'' :'' ) + ');';
                    });
                }
                else if(!!params){
                    scriptUrl    = (!!currentSuitelet)? getCurrentSuiteletScriptURL(suiteletMeta.returnExternalUrl, params) : getScriptURL(suiteletMeta, params);
                    functionsStr = 'window.open(\''+ scriptUrl + '\'' + ( (!!openInCurrentTab)? ', \'_self\'' :'' ) + ');';
                }
                else{
                    scriptUrl    = (!!currentSuitelet)? getCurrentSuiteletScriptURL(suiteletMeta.returnExternalUrl, null) : getScriptURL(suiteletMeta, null);
                    functionsStr = 'window.open(\''+ scriptUrl + '\'' + ( (!!openInCurrentTab)? ', \'_self\'' :'' ) + ');';
                }

                //log.debug('functionsStr', functionsStr);

                return functionsStr;
            }

            return{
                redirectToSuitelet : redirectToSuitelet
            }

        }

        function getGovernanceUsage(){ return NSModules.runtime.getCurrentScript().getRemainingUsage(); }
        function getCurrentUserInfo(){ return NSModules.runtime.getCurrentUser(); }
            
        function sendGETrequestToURL(url, params){ NSModules.redirect.redirect({ url: url, parameters: params }); }

        function sendPOSTrequestToURL({url, body, headerObj}){ 
            
            try{
                let
                    response = NSModules.https.post({
                        url:     url,
                        body:    body,
                        headers: headerObj || {
                            name: 'content-type',
                            value: 'application/json',
                        },
                    });

                //log.debug('response.body', response.body);
            }
            catch (err) {
                log.error('Err!', 'Error found in sendPOSTrequestToURL()');
                log.error('Err!', err);
            }
        
        }

        function validators(){

            try{
            
                function isValidString       (str)               { let isStringValid = (!!str && !!verifyParam(str).isString && !!str.trim()); return (!!isStringValid);}
                function isValidFieldString  (str, inRecord)     { return isValidString(str) && extrctRecordObj(inRecord).getFields().includes(str) }
                function isValidRecordString (str)               { let isRecordStrValid = ( isValidString(str) && Object.values(NSModules.record.Type).includes(str) ); return isRecordStrValid }
                function validateArrayRemoveWhiteHoles(array)    { return (array.filter(data=>{return !!data && ( (!!verifyParam(data).isString && !!data.trim) || (!!verifyParam(data).isObject && !!Object.keys(data).length) )}) || [])  }
                function isEmptyArray(array)                     { return !!array && !!verifyParam(array).isArray && !validateArrayRemoveWhiteHoles(array).length }
                function getUniqueArrayValues(array)             { return (!isEmptyArray(array))? array.reduce((arr, d, i)=>{ if(!!arr & !arr.includes(d)) arr.push(d); return arr; },[]) : [] }
                function areArraysHavingSameElements(arr1, arr2) { return isEmptyArray(arr1.filter(data=>{return !arr2.includes(data)}))}  
                function isClientScript()                        { if ( !!(typeof(window) == 'object') ) return true; else return false; }
                function isServerScript()                        { return !isClientScript() }


                return {
                    isEmptyArray                  : isEmptyArray,
                    isValidString                 : isValidString,
                    isClientScript                : isClientScript,
                    isServerScript                : isServerScript,
                    isValidFieldString            : isValidFieldString,
                    isValidRecordString           : isValidRecordString,
                    getUniqueArrayValues          : getUniqueArrayValues,
                    areArraysHavingSameElements   : areArraysHavingSameElements,
                    validateArrayRemoveWhiteHoles : validateArrayRemoveWhiteHoles
                }

            }
            catch(err){
                log.error('Err!', 'Error found in validators()');
                log.error('Err!', err);
            }
        }

        function submitButtonFeatures(postRequest){
            try{

                function exportDocument(param){
                    try{

                        let 
                            {fileMeta, exportIn, sublistObj} = param;

                        if(exportIn == _EXPORT_TYPES.CSV){
                            
                            let 
                                contents, sublistFieldsDataArray;

                                sublistFieldsDataArray = getSublistData(sublistObj, null, null, postRequest);

                                //log.debug('sublistFieldsDataArray', sublistFieldsDataArray);

                                // contents += sublistFieldsDataArray[0].map(({label})=>{return label.replace(/[^a-z A-Z.,]/g,'');}).join() + '\n';
                                // contents += finalRenderedReportAOO.map(fields=>{return fields.map(({value})=>{return (!!value)?String(value).replace(/[^a-z A-Z0-9.,]/g,''):'';}).join() + '\n';}).join('');
                                
                            // exportFeatures({fileMeta}).inCSV({sublist: sublistFieldsDataArray});
                        }

                        // function getSu
                        
                    }
                    catch(err){
                        log.debug('Error', 'Error Found In exportDoc()');
                        log.debug('Error', err);
                    }
                }

                return {
                    exportDocument
                }
            }
            catch(err){

            }
        }

        function exportFeatures({fileMeta}) {
            try{

                function inCSV({sublist}){
                    try{
            
                        let
                            fileId, loadedFileObj = new Object(),
                            fileObj, contents = new String(),
                            extension = file.extension,
                            dateTimeStr = `D${new Date().toDateString().replace(/ /g, '')}T${new Date().toLocaleTimeString()}`,
                            description = `${meta.description} By ${helper.getCurrentUserInfo().name} On ${dateTimeStr}`
                            folderId = meta.folderId,
                            fileName = `${file.name} (${dateTimeStr})`;
            
                        
            
                        //log.debug('contents',contents);
            
                        fileObj = file.create({
                            name: fileName + `(By ${helper.getCurrentUserInfo().name})` + extension,
                            fileType: file.Type.CSV,
                            contents: contents,
                            description: file.description,
                            folder: file.folderId
                        });
            
                        fileId = fileObj.save();
                        loadedFileObj = file.load({id: fileId});
            
                        //log.debug('url', loadedFileObj.url);
            
                        helper.sendGETrequestToURL(loadedFileObj.url);
            
                    }
                    catch(err){
                        log.debug('Err!', 'Error Found In inCSV()');
                        log.debug('Err!', err);
                    }
                }
                
                return{
                    inCSV
                }
                
            }
            catch(err){
                log.debug('Err!', 'Error Found In exportFeatures()');
                log.debug('Err!', err);
            }
        }

        function verifyParam(param){
            try{
                if(typeof(param)=='object' && !Array.isArray(param))
                    return {isObject: true};
                else if(typeof(param)=='object' && !!Array.isArray(param))
                    return {isArray: true}
                else if(typeof(param)=='string')
                    return {isString: true}
                else if(typeof(param)=='number')
                    return {isNumber: true}
                else if(typeof(param)=='boolean')
                    return {isBoolean: true}
                else if(typeof(param)=='function')
                    return {isFunction: true}
                else
                    return {
                        isArray:  false,
                        isObject: false,
                        isString: false,
                        isNumber: false
                    }
            }
            catch(err){
                log.debug('Error', 'Error Found In helper --> verifyParam()');
                log.debug('Error', err);
            }
        }

        function dateTime(){
            try{

                let 
                    daysInAWeek = 7,
                    hoursInADay = 24,
                    minutesInAnHour = 60,
                    secondsInAMinute = 60,
                    msInASecond = 1000,
                    totalWeeksInAYear = 52,
                    msInAWeek = msInASecond*secondsInAMinute*minutesInAnHour*hoursInADay*daysInAWeek;

                function weeksDifference(start, end){ 

                    //*This function will calculate the number of weeks difference between two dates

                    if(!start || !end || (!verifyParam(start).isString && !verifyParam(start).isObject) || (!verifyParam(end).isString && !verifyParam(end).isObject))
                        return null;

                    let numberOfWeeksInt, numberOfWeeksFloat;

                    if(validators().isValidString(start)) start = parseToDateObj(start)
                    if(validators().isValidString(end))   end   = parseToDateObj(end)

                    numberOfWeeksFloat = (end.getTime() - start.getTime())/msInAWeek;

                    return { numberOfWeeksInt: Math.round(numberOfWeeksFloat), numberOfWeeksFloat };
                }

                function weeksOccupied(start, end){ 

                    //*This function will calculate the number of weeks occupied
                    //* E.g Start on 1st Week last date and End on 2nd Week 1st date = 2 weeks occupied

                    if(!start || !end || (!verifyParam(start).isString && !verifyParam(start).isObject) || (!verifyParam(end).isString && !verifyParam(end).isObject))
                        return null;

                    if(validators().isValidString(start)) start = parseToDateObj(start);
                    if(validators().isValidString(end))   end   = parseToDateObj(end);

                    if(start > end) throw new Error("Please Correct | Start Date cannot be greater than End Date");

                    startWOY = weekOfYear(start);
                    endWOY   = weekOfYear(end);
                    yearDiff = end.getFullYear() - start.getFullYear();
                    numberOfWeeks = endWOY - startWOY + 1;

                    numberOfWeeks = ( yearDiff != 0 )? (numberOfWeeks + totalWeeksInAYear*yearDiff) :numberOfWeeks;

                    return numberOfWeeks;
                }

                function weekOfYear(date){ 

                    if(!date || (!verifyParam(date).isString && !verifyParam(date).isObject))
                        return null;
                
                    let 
                        numberOfWeeks, firstDayOfYear, firstWeekOfYear, dateWeekOfYear;
                
                    if(validators().isValidString(date)) date = parseToDateObj(date)
                
                    firstDayOfYear  = new Date('01/01/' + date.getFullYear());
                    firstWeekOfYear = firstDayOfYear.getTime()/msInASecond/secondsInAMinute/minutesInAnHour/hoursInADay/daysInAWeek;
                    dateWeekOfYear  = date.getTime()/msInASecond/secondsInAMinute/minutesInAnHour/hoursInADay/daysInAWeek;
                
                    numberOfWeeks = Math.floor(dateWeekOfYear - firstWeekOfYear) + 1;
                
                    // log.debug('{firstDayOfYear, firstWeekOfYear, dateWeekOfYear, numberOfWeeks}', {firstDayOfYear, firstWeekOfYear, dateWeekOfYear, numberOfWeeks})
                
                    return numberOfWeeks;
                }

                function parseToDateObj(dateStr) { 
                    try{
                        if(validators().isValidString(dateStr)) 
                            return NSModules.format.parse({ value: dateStr, type: NSModules.format.Type.DATE }); 
                        else 
                            return dateStr;
                    } 
                    catch(err){
                        log.debug('Error', 'Error Found In helper --> dateTime() --> parseToDateObj()');
                        log.debug('Error', err);
                    }
                }

                return{ weekOfYear, weeksDifference, parseToDateObj, weeksOccupied }
            }
            catch(err){
                log.debug('Error', 'Error Found In helper --> dateTime()');
                log.debug('Error', err);
            }
        }

        function queryModule(){

            try{

                function fetchLastSavedRecordDetail({fieldsObj, recType, number, conditions}){ 

                    try{

                        if(!fieldsObj || !!fieldsObj && !Object.keys(fieldsObj).length && !recType)
                            throw new Error('input provided for fetchLastSavedRecordDetail() is incorrect or undefined/null, please provide correct data');

                        let
                            lastSavedRecordQueryStr = 
                                `${_QUERY_CONST.SELECT} 
                                    ${Object.keys(fieldsObj).join(', ')} 
                                ${_QUERY_CONST.FROM} 
                                    ${_QUERY_CONST.DBS.TRANSACTION} 
                                ${_QUERY_CONST.WHERE} 
                                    ${_QUERY_CONST.FLDS.RECORDTYPE} = '${recType}'
                                ${(!!conditions && !!conditions.length)?conditions.map(condition=>{ return `AND ${condition} `}).join(''):` `}
                                ${_QUERY_CONST.ORDERBY} 
                                    ${_QUERY_CONST.FLDS.CREATEDDATE} ${_QUERY_CONST.DESC} 
                                ${_QUERY_CONST.FETCH} ${_QUERY_CONST.FIRST} ${number||1} ${_QUERY_CONST.ROWS} ${_QUERY_CONST.ONLY}`;

                        //log.debug('lastSavedRecordQueryStr', lastSavedRecordQueryStr);
                        
                        let
                            lastSavedRecordQuery = NSModules.query.runSuiteQL(lastSavedRecordQueryStr),
                            lastSavedRecordQueryResults = lastSavedRecordQuery.results;

                        if(!!lastSavedRecordQueryResults && !!lastSavedRecordQueryResults.length)
                            return lastSavedRecordQueryResults.map(result=>{
                                Object.keys(fieldsObj).forEach((field, iter)=>{
                                    fieldsObj[field] = result.values[iter]
                                });
                                return fieldsObj;
                            })
                        else return [];
                    }
                    catch(err){
                        log.error('Err!', 'Error found in fetchLastSavedRecordDetail()');
                        log.error('Err!', err);
                    }
                }

                // function fetchCustomListValues(customListId){

                //     let 
                //         customListValues = `
                //             ${_QUERY_CONST.SELECT}
                //         `;

                //     return query.runSuiteQL({
                //         query: string
                //     });
                // }

                function fetchInventoryByBinLocation({fieldsObj, conditions}, ...rest){
                    
                    try{

                        if(!fieldsObj || !!fieldsObj && !Object.keys(fieldsObj).length)
                            throw new Error('input provided for fetchInventoryByBinLocation() is incorrect or undefined/null, please provide correct data');

                        let
                            inventoryDataAsPerBinLocationStrQueryStr = 
                                `${_QUERY_CONST.SELECT} 
                                    ${Object.keys(fieldsObj).join(', ')} 
                                ${_QUERY_CONST.FROM} 
                                    ${_QUERY_CONST.DBS.INVENTORY_BALANCE} 
                                        ${_QUERY_CONST.AS} 
                                            ${_QUERY_CONST.ALIAS.INVENTORY_BALANCE} 
                                ${_QUERY_CONST.JOIN}
                                    ${_QUERY_CONST.DBS.ITEM} 
                                        ${_QUERY_CONST.ON} 
                                            ${_QUERY_CONST.ALIAS.INVENTORY_BALANCE}.${_QUERY_CONST.FLDS.ITEM} = ${_QUERY_CONST.DBS.ITEM}.${_QUERY_CONST.FLDS.ID}
                                ${_QUERY_CONST.JOIN}
                                    ${_QUERY_CONST.DBS.BIN} 
                                        ${_QUERY_CONST.ON} 
                                            ${_QUERY_CONST.ALIAS.INVENTORY_BALANCE}.${_QUERY_CONST.FLDS.BINNUMBER} = ${_QUERY_CONST.DBS.BIN}.${_QUERY_CONST.FLDS.ID}
                                ${_QUERY_CONST.JOIN}
                                    ${_QUERY_CONST.DBS.CLASS} 
                                        ${_QUERY_CONST.AS} 
                                            ${_QUERY_CONST.ALIAS.CLASS} 
                                        ${_QUERY_CONST.ON} 
                                            ${_QUERY_CONST.DBS.ITEM}.${_QUERY_CONST.FLDS.CLASS} = ${_QUERY_CONST.ALIAS.CLASS}.${_QUERY_CONST.FLDS.ID}
                                ${_QUERY_CONST.JOIN} 
                                    ${_QUERY_CONST.DBS.UNITSTYPE} 
                                        ${_QUERY_CONST.AS} 
                                            ${_QUERY_CONST.ALIAS.PREFUNITTYPE} 
                                        ${_QUERY_CONST.ON} 
                                            ${_QUERY_CONST.DBS.ITEM}.${_QUERY_CONST.FLDS.UNITSTYPE} = ${_QUERY_CONST.ALIAS.PREFUNITTYPE}.${_QUERY_CONST.FLDS.ID}
                                ${_QUERY_CONST.JOIN}
                                    ${_QUERY_CONST.DBS.UNITSTYPEUOM} 
                                        ${_QUERY_CONST.AS} 
                                            ${_QUERY_CONST.ALIAS.SALESUOM} 
                                        ${_QUERY_CONST.ON} 
                                            ${_QUERY_CONST.ALIAS.PREFUNITTYPE}.${_QUERY_CONST.FLDS.ID} = ${_QUERY_CONST.ALIAS.SALESUOM}.${_QUERY_CONST.FLDS.UNITSTYPE}
                                ${_QUERY_CONST.JOIN}
                                    ${_QUERY_CONST.DBS.UNITSTYPEUOM} 
                                        ${_QUERY_CONST.AS} 
                                            ${_QUERY_CONST.ALIAS.BASEUOM} 
                                        ${_QUERY_CONST.ON} 
                                            ${_QUERY_CONST.ALIAS.PREFUNITTYPE}.${_QUERY_CONST.FLDS.ID} = ${_QUERY_CONST.ALIAS.BASEUOM}.${_QUERY_CONST.FLDS.UNITSTYPE}
                                ${_QUERY_CONST.JOIN}
                                    ${_QUERY_CONST.DBS.LOCATION} 
                                        ${_QUERY_CONST.ON} 
                                            ${_QUERY_CONST.ALIAS.INVENTORY_BALANCE}.${_QUERY_CONST.FLDS.LOCATION} = ${_QUERY_CONST.DBS.LOCATION}.${_QUERY_CONST.FLDS.ID}
                                ${_QUERY_CONST.WHERE}
                                    ${_QUERY_CONST.ALIAS.INVENTORY_BALANCE}.${_QUERY_CONST.FLDS.BINNUMBER} ${_QUERY_CONST.DEFAULTS.IS_NOT_NULL}
                                ${_QUERY_CONST.AND}
                                    ${_QUERY_CONST.FUNCTIONS.UPPER}(${_QUERY_CONST.ALIAS.SALESUOM}.${_QUERY_CONST.FLDS.BASEUNIT}) =  ${_QUERY_CONST.DEFAULTS.TRUE}
                                ${_QUERY_CONST.AND}
                                    ${_QUERY_CONST.ALIAS.BASEUOM}.${_QUERY_CONST.FLDS.INTERNALID} = ${_QUERY_CONST.DBS.ITEM}.${_QUERY_CONST.FLDS.STOCKUNIT}
                                ${(!!conditions && !!conditions.length)?conditions.map(condition=>{ return `AND ${condition} `}).join(''):` `}
                                ${_QUERY_CONST.ORDERBY} 
                                    ${_QUERY_CONST.DBS.ITEM}.${_QUERY_CONST.FLDS.ID}`;

                        //log.debug('inventoryDataAsPerBinLocationStrQueryStr', inventoryDataAsPerBinLocationStrQueryStr);
                        
                        let
                            inventoryDataAsPerBinLocationStrQuery = query.runSuiteQL(inventoryDataAsPerBinLocationStrQueryStr),
                            inventoryDataAsPerBinLocationStrQueryResults = inventoryDataAsPerBinLocationStrQuery.results;

                        if(!!inventoryDataAsPerBinLocationStrQueryResults && !!inventoryDataAsPerBinLocationStrQueryResults.length){
                            let inventoryDataAsPerBinLocationArr = new Array();
                            inventoryDataAsPerBinLocationStrQueryResults.forEach(result=>{
                                Object.keys(fieldsObj).forEach((field, iter)=>{
                                    if(verifyParam(fieldsObj[field]).isObject)
                                        fieldsObj[field] = {...fieldsObj[field], ...{value: result.values[iter]}}
                                    else
                                        fieldsObj[field] = {value: result.values[iter]}
                                });
                                //log.debug('fieldsObj',fieldsObj);
                                inventoryDataAsPerBinLocationArr.push({...fieldsObj});
                            })
                            return inventoryDataAsPerBinLocationArr;
                        }
                        else return [];
                    }
                    catch(err){
                        log.error('Err!', 'Error found in fetchInventoryByBinLocation()');
                        log.error('Err!', err);
                    }
                }

                function fetchCustomRecordEntries({recType, fieldsObj, joins, conditions, sortBy, otherQueryString}){
                    try{

                        if(!verifyParam(fieldsObj).isObject || (!!verifyParam(fieldsObj).isObject && !Object.keys(fieldsObj).length) )
                            throw new Error('input provided for fetchCustomRecordEntries() is incorrect or undefined/null, please provide correct data');

                            // log.debug('fieldsObj',fieldsObj);
                            // log.debug('recType',recType);


                        let
                            recordEntriesQueryStr = 
                                `${_QUERY_CONST.SELECT} 
                                    ${Object.keys(fieldsObj).join(', ')} 
                                ${_QUERY_CONST.FROM} 
                                    ${recType}
                                `.concat( 
                                    (!!joins && !!verifyParam(joins).isArray && !!joins.length)?
                                        ` ${joins.map((join)=>{ return (!!validators().isValidString(join))?`JOIN ${join} `:``}).join('')} `:`` 
                                ).concat( 
                                    (!!conditions && !!verifyParam(conditions).isArray && !!conditions.length)?
                                        `${_QUERY_CONST.WHERE} 
                                            ${conditions.map((condition, iter)=>{ return (!!validators().isValidString(condition))? (iter>0)?`AND ${condition} `:` ${condition} `:``}).join('')}
                                        `:``
                                ).concat( 
                                    (!!sortBy && !!verifyParam(sortBy).isArray && !!sortBy.length)?
                                        `${_QUERY_CONST.ORDERBY} 
                                            ${sortBy.map((sortby, iter)=>{ return (!!validators().isValidString(sortby))? (iter>0)?`, ${sortby} `:` ${sortby} `: ``}).join('')}
                                        `:``
                                ).concat( 
                                    (!!otherQueryString && (!!validators().isValidString(otherQueryString)))?`${otherQueryString}`:``
                                );
                                
                        log.debug('recordEntriesQueryStr',recordEntriesQueryStr);

                        let
                            recordEntriesQuery = NSModules.query.runSuiteQL(recordEntriesQueryStr),
                            recordEntriesQueryResults = recordEntriesQuery.results;

                        // log.debug('recordEntriesQueryResults',recordEntriesQueryResults);



                        if(!!recordEntriesQueryResults && !!recordEntriesQueryResults.length)
                            return recordEntriesQueryResults.reduce((resArr, queryResult)=>{
                                if(!!resArr){
                                    resArr.push(Object.keys(fieldsObj).reduce((resObj, field, iter)=>{
                                        if(!!verifyParam(fieldsObj[field]).isObject)
                                            resObj[field] = {...fieldsObj[field], value: queryResult.values[iter]};
                                        else{
                                            resObj[field] = new Object();
                                            resObj[field].value = queryResult.values[iter];
                                        }
                                        return resObj;
                                    },{}));

                                    return resArr;
                                }
                            },[])
                        else return [];
                    }
                    catch(err){
                        log.error('Err!', 'Error found in fetchCustomRecordEntries()');
                        log.error('Err!', err);
                    }
                }

                function fetchTransactionLineEntries({fieldsObj, conditions}){
                    try{

                        if(!verifyParam(fieldsObj).isObject || (!!verifyParam(fieldsObj).isObject && !Object.keys(fieldsObj).length) || !verifyParam(conditions).isArray )
                            throw new Error('input provided for fetchTransactionLineEntries() is incorrect or undefined/null, please provide correct data');

                            //log.debug('fieldsObj',fieldsObj);

                        let
                            transactionLineEntriesQueryStr = 
                                ` ${_QUERY_CONST.SELECT} 
                                    ${Object.keys(fieldsObj).join(', ')} 
                                ${_QUERY_CONST.FROM}
                                    ${_QUERY_CONST.DBS.TRANSACTIONLINE} ${_QUERY_CONST.AS} ${_QUERY_CONST.ALIAS.LINE} 
                                ${_QUERY_CONST.JOIN} 
                                    ${_QUERY_CONST.DBS.TRANSACTION} ${_QUERY_CONST.ON} ${_QUERY_CONST.DBS.TRANSACTION}.${_QUERY_CONST.FLDS.ID} = ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.TRANSACTION} 
                                ${_QUERY_CONST.JOIN} 
                                    ${_QUERY_CONST.DBS.ITEM} ${_QUERY_CONST.ON} ${_QUERY_CONST.DBS.ITEM}.${_QUERY_CONST.FLDS.ID} = ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.ITEM} 
                                ${_QUERY_CONST.WHERE}  
                                    ${(!!conditions && !!conditions.length)?conditions.map((condition, iter)=>{ return (iter>0)?`AND ${condition} `:` ${condition} `}).join(''):` `}
                                ${_QUERY_CONST.AND}
                                    ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.TAXLINE}               = 'F'
                                ${_QUERY_CONST.AND}
                                    ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.MAINLINE}              = 'F'
                                ${_QUERY_CONST.AND}
                                    ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.IS_CUSTOMGLLINE}       = 'F'
                                ${_QUERY_CONST.AND}
                                    ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.LANDEDCOST_PERLINE}    = 'F'
                                ${_QUERY_CONST.AND}
                                    ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.IS_INVENTORYAFFECTING} = 'F'
                                ${_QUERY_CONST.AND}
                                    ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.ISCOGS} = 'T'
                                ${_QUERY_CONST.AND}
                                    ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.ISCLOSED} = 'F'
                                ${_QUERY_CONST.ORDERBY} 
                                    ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.TRANSACTION} ${_QUERY_CONST.ASC}`;
                                
                        //log.debug('transactionLineEntriesQueryStr', transactionLineEntriesQueryStr);
                        
                        let
                            transactionLineEntriesQuery = NSModules.query.runSuiteQL(transactionLineEntriesQueryStr),
                            transactionLineEntriesQueryResults = transactionLineEntriesQuery.results;

                        if(!!transactionLineEntriesQueryResults && !!transactionLineEntriesQueryResults.length)
                            return transactionLineEntriesQueryResults.reduce((resArr, queryResult)=>{
                                if(!!resArr){
                                    resArr.push(Object.keys(fieldsObj).reduce((resObj, field, iter)=>{
                                        if(!!verifyParam(fieldsObj[field]).isObject)
                                            resObj[field] = {...fieldsObj[field], value: queryResult.values[iter]};
                                        else{
                                            resObj[field] = new Object();
                                            resObj[field].value = queryResult.values[iter];
                                        }
                                        return resObj;
                                    },{}));

                                    return resArr;
                                }
                            },[])
                        else return [];
                    }
                    catch(err){
                        log.error('Err!', 'Error found in fetchLastSavedRecordDetail()');
                        log.error('Err!', err);
                    }
                }

                
                function fetchFullTransactionNLineDetails({fieldsObj, conditions, joins, sortBy, transactionAlias, otherQueryString}){
                    try{

                        if(!verifyParam(fieldsObj).isObject || (!!verifyParam(fieldsObj).isObject && !Object.keys(fieldsObj).length) )
                            throw new Error('input provided for fetchFullTransactionNLineDetails() is incorrect or undefined/null, please provide correct data');

                            //log.debug('fieldsObj',fieldsObj);

                        let
                            fullTransactionNLineDetailsQueryStr = 
                                ` ${_QUERY_CONST.SELECT} 
                                    ${Object.keys(fieldsObj).join(', ')} 
                                ${_QUERY_CONST.FROM}
                                    ${_QUERY_CONST.DBS.TRANSACTION}
                                ${_QUERY_CONST.INNERJOIN} 
                                    ${_QUERY_CONST.DBS.TRANSACTIONLINE} ${_QUERY_CONST.AS} ${_QUERY_CONST.ALIAS.LINE} ${_QUERY_CONST.ON} ${_QUERY_CONST.DBS.TRANSACTION}.${_QUERY_CONST.FLDS.ID} = ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.TRANSACTION} 
                                ${_QUERY_CONST.INNERJOIN} 
                                    ${_QUERY_CONST.DBS.ITEM} ${_QUERY_CONST.ON} ${_QUERY_CONST.DBS.ITEM}.${_QUERY_CONST.FLDS.ID} = ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.ITEM} 
                                ${_QUERY_CONST.LEFTJOIN} 
                                    ${_QUERY_CONST.DBS.TRANSACTION} ${_QUERY_CONST.AS} ${_QUERY_CONST.ALIAS.CREATEDFROM_TRANS} ${_QUERY_CONST.ON} ${_QUERY_CONST.ALIAS.CREATEDFROM_TRANS}.${_QUERY_CONST.FLDS.ID} = ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.CREATEDFROM} 
                                ${_QUERY_CONST.LEFTJOIN} 
                                    ${_QUERY_CONST.DBS.UNITSTYPEUOM} ${_QUERY_CONST.AS} ${_QUERY_CONST.ALIAS.UTUOM} ${_QUERY_CONST.ON} ${_QUERY_CONST.ALIAS.UTUOM}.${_QUERY_CONST.FLDS.INTERNALID} = ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.UNITS} 
                                `.concat( 
                                    (validators().isEmptyArray(joins))?
                                        ` ${joins.map((join)=>{ return (!!validators().isValidString(condition))?`JOIN ${join} `:``}).join('')} `:`` 
                                )
                                .concat(`${_QUERY_CONST.WHERE}`)
                                .concat(`
                                        ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.MAINLINE} = 'F'
                                    ${_QUERY_CONST.AND}
                                        ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.ISCLOSED} = 'F'
                                `)
                                .concat( 
                                    (!!conditions && !!verifyParam(conditions).isArray && !!conditions.length)?
                                        ` ${conditions.map((condition, iter)=>{ return (!!validators().isValidString(condition))? `AND ${condition} `:``}).join('')} `:``
                                ).concat( 
                                    (!!sortBy && !!verifyParam(sortBy).isArray && !!sortBy.length)?
                                        `${_QUERY_CONST.ORDERBY} 
                                            ${sortBy.map((sortby, iter)=>{ return (!!validators().isValidString(sortby))? (iter>0)?`, ${sortby} `:` ${sortby} `: ``}).join('')}
                                        `:``
                                ).concat( 
                                    ((!!validators().isValidString(otherQueryString)))?`${otherQueryString}`:``
                                );
                                
                        //log.debug('fullTransactionNLineDetailsQueryStr', fullTransactionNLineDetailsQueryStr);
                        fullTransactionNLineDetailsQueryStr.replace(/\n/g,'').match(/.{1,1500}/g).forEach((queryChunk, i)=>{/*log.debug('queryChunk '+i, queryChunk);*/});
                        
                        let
                            fullTransactionNLineDetailsQuery = NSModules.query.runSuiteQL(fullTransactionNLineDetailsQueryStr),
                            fullTransactionNLineDetailsQueryResults = fullTransactionNLineDetailsQuery.results;

                        if(!!fullTransactionNLineDetailsQueryResults && !!fullTransactionNLineDetailsQueryResults.length)
                            return fullTransactionNLineDetailsQueryResults.reduce((resArr, queryResult)=>{
                                if(!!resArr){
                                    resArr.push(Object.keys(fieldsObj).reduce((resObj, field, iter)=>{
                                        if(!!verifyParam(fieldsObj[field]).isObject)
                                            resObj[(!!fieldsObj[field].alias)?fieldsObj[field].alias:field] = {...fieldsObj[field], value: queryResult.values[iter]};
                                        else{
                                            resObj[(!!fieldsObj[field].alias)?fieldsObj[field].alias:field] = new Object();
                                            resObj[(!!fieldsObj[field].alias)?fieldsObj[field].alias:field].value = queryResult.values[iter];
                                        }
                                        return resObj;
                                    },{}));

                                    return resArr;
                                }
                            },[])
                        else return [];
                    }
                    catch(err){
                        log.error('Err!', 'Error found in fetchFullTransactionNLineDetails()');
                        log.error('Err!', err);
                    }
                }

                function fetchTransactionEntries({fieldsObj, conditions, joins, sortBy, transactionAlias, otherQueryString, isClientScript}){
                    try{
                        if(!verifyParam(fieldsObj).isObject || (!!verifyParam(fieldsObj).isObject && !Object.keys(fieldsObj).length) )
                            throw new Error('input provided for fetchTransactionLineEntries() is incorrect or undefined/null, please provide correct data');
                        
                        //log.debug('fieldsObj',fieldsObj);
                        //log.debug('conditions',conditions);
                        //log.debug('joins',joins);

                        let
                            transactionEntriesQueryStr = 
                                `${_QUERY_CONST.SELECT} 
                                    ${Object.keys(fieldsObj).join(', ')} 
                                ${_QUERY_CONST.FROM} 
                                    ${_QUERY_CONST.DBS.TRANSACTION}
                                `.concat( 
                                    (!!validators().isValidString(transactionAlias))?
                                        ` ${_QUERY_CONST.AS} ${transactionAlias} `:``
                                ).concat( 
                                    (!!joins && !!verifyParam(joins).isArray && !!joins.length)?
                                        ` ${joins.map((join)=>{ return (!!validators().isValidString(join))?`JOIN ${join} `:``}).join('')} `:`` 
                                ).concat( 
                                    (!!conditions && !!verifyParam(conditions).isArray && !!conditions.length)?
                                        `${_QUERY_CONST.WHERE} 
                                            ${conditions.map((condition, iter)=>{ return (!!validators().isValidString(condition))? (iter>0)?`AND ${condition} `:` ${condition} `:``}).join('')}
                                        `:``
                                ).concat( 
                                    (!!sortBy && !!verifyParam(sortBy).isArray && !!sortBy.length)?
                                        `${_QUERY_CONST.ORDERBY} 
                                            ${sortBy.map((sortby, iter)=>{ return (!!validators().isValidString(sortby))? (iter>0)?`, ${sortby} `:` ${sortby} `: ``}).join('')}
                                        `:``
                                ).concat( 
                                    ((!!validators().isValidString(otherQueryString)))?`${otherQueryString}`:``
                                );

                            log.debug('transactionEntriesQueryStr',transactionEntriesQueryStr);
                            if(isClientScript){
                                console.log('transactionEntriesQueryStr',transactionEntriesQueryStr);
                            }

                        let
                            transactionEntriesQuery = NSModules.query.runSuiteQL(transactionEntriesQueryStr),
                            transactionEntriesQueryResults = transactionEntriesQuery.results;

                        if(!!transactionEntriesQueryResults && !!transactionEntriesQueryResults.length)
                            return transactionEntriesQueryResults.reduce((resArr, queryResult)=>{
                                if(!!resArr){
                                    resArr.push(Object.keys(fieldsObj).reduce((resObj, field, iter)=>{
                                        if(!!verifyParam(fieldsObj[field]).isObject)
                                            resObj[field] = {...fieldsObj[field], value: queryResult.values[iter]};
                                        else{
                                            resObj[field] = new Object();
                                            resObj[field].value = queryResult.values[iter];
                                        }
                                        return resObj;
                                    },{}));

                                    return resArr;
                                }
                            },[])
                        else return [];
                        
                    }
                    catch(err){
                        log.error('Err!', 'Error found in fetchTransactionEntries()');
                        log.error('Err!', err);
                        if(isClientScript){
                            console.log('Err!', 'Error found in fetchTransactionEntries()');
                            console.log('Err!', err);
                        }
                    }
                }

                function fetchTransactionLineEntries2({fieldsObj, conditions, joins, sortBy, transactionAlias, otherQueryString}){
                    try{

                        if(!verifyParam(fieldsObj).isObject || (!!verifyParam(fieldsObj).isObject && !Object.keys(fieldsObj).length) || !verifyParam(conditions).isArray )
                            throw new Error('input provided for fetchTransactionLineEntries() is incorrect or undefined/null, please provide correct data');

                            //log.debug('fieldsObj',fieldsObj);

                        let
                            transactionLineEntriesQueryStr = 
                                `${_QUERY_CONST.SELECT} 
                                    ${Object.keys(fieldsObj).join(', ')} 
                                ${_QUERY_CONST.FROM} 
                                    ${_QUERY_CONST.DBS.TRANSACTION}
                                ${_QUERY_CONST.JOIN}
                                    ${_QUERY_CONST.DBS.TRANSACTIONLINE} ${_QUERY_CONST.AS} ${_QUERY_CONST.ALIAS.LINE}
                                ${_QUERY_CONST.ON} 
                                    ${_QUERY_CONST.DBS.TRANSACTION}.${_QUERY_CONST.FLDS.ID} = ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.TRANSACTION} 
                                `.concat( 
                                    (!!joins && !!verifyParam(joins).isArray && !!joins.length)?
                                        ` ${joins.map((join)=>{ return (!!validators().isValidString(condition))?`JOIN ${join} `:``}).join('')} `:`` 
                                ).concat( 
                                    (!!conditions && !!verifyParam(conditions).isArray && !!conditions.length)?
                                        `${_QUERY_CONST.WHERE} 
                                            ${conditions.map((condition, iter)=>{ return (!!validators().isValidString(condition))? (iter>0)?`AND ${condition} `:` ${condition} `:``}).join('')}
                                        `:``
                                ).concat( 
                                    (!!sortBy && !!verifyParam(sortBy).isArray && !!sortBy.length)?
                                        `${_QUERY_CONST.ORDERBY} 
                                            ${sortBy.map((sortby, iter)=>{ return (!!validators().isValidString(sortby))? (iter>0)?`, ${sortby} `:` ${sortby} `: ``}).join('')}
                                        `:``
                                ).concat( 
                                    ((!!validators().isValidString(otherQueryString)))?`${otherQueryString}`:``
                                ).concat(`
                                    ${_QUERY_CONST.AND}
                                        ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.TAXLINE}               = 'F'
                                    ${_QUERY_CONST.AND}
                                        ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.MAINLINE}              = 'F'
                                    ${_QUERY_CONST.AND}
                                        ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.IS_CUSTOMGLLINE}       = 'F'
                                    ${_QUERY_CONST.AND}
                                        ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.LANDEDCOST_PERLINE}    = 'F'
                                    ${_QUERY_CONST.AND}
                                        ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.IS_INVENTORYAFFECTING} = 'F'
                                    ${_QUERY_CONST.AND}
                                        ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.ISCOGS} = 'T'
                                    ${_QUERY_CONST.AND}
                                        ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.ISCLOSED} = 'F'
                                    ${_QUERY_CONST.ORDERBY} 
                                        ${_QUERY_CONST.ALIAS.LINE}.${_QUERY_CONST.FLDS.TRANSACTION} ${_QUERY_CONST.ASC}`
                                );
                                
                        log.debug('transactionLineEntriesQueryStr', transactionLineEntriesQueryStr);
                        
                        let
                            transactionLineEntriesQuery = NSModules.query.runSuiteQL(transactionLineEntriesQueryStr),
                            transactionLineEntriesQueryResults = transactionLineEntriesQuery.results;

                        if(!!transactionLineEntriesQueryResults && !!transactionLineEntriesQueryResults.length)
                            return transactionLineEntriesQueryResults.reduce((resArr, queryResult)=>{
                                if(!!resArr){
                                    resArr.push(Object.keys(fieldsObj).reduce((resObj, field, iter)=>{
                                        if(!!verifyParam(fieldsObj[field]).isObject)
                                            resObj[field] = {...fieldsObj[field], value: queryResult.values[iter]};
                                        else{
                                            resObj[field] = new Object();
                                            resObj[field].value = queryResult.values[iter];
                                        }
                                        return resObj;
                                    },{}));

                                    return resArr;
                                }
                            },[])
                        else return [];
                    }
                    catch(err){
                        log.error('Err!', 'Error found in fetchTransactionLineEntries2()');
                        log.error('Err!', err);
                    }
                }

                
                function fetchInventoryDetailLineEntries({fieldsObj, conditions}){
                    try{

                        if(!verifyParam(fieldsObj).isObject || (!!verifyParam(fieldsObj).isObject && !Object.keys(fieldsObj).length) || !verifyParam(conditions).isArray || (!!verifyParam(conditions).isArray && !conditions.length))
                            throw new Error('input provided for fetchTransactionLineEntries() is incorrect or undefined/null, please provide correct data');

                            //log.debug('fieldsObj',fieldsObj);

                        let
                            inventoryDetailLineEntriesQueryStr = 
                                ` ${_QUERY_CONST.SELECT} 
                                    ${Object.keys(fieldsObj).join(', ')} 
                                ${_QUERY_CONST.FROM}
                                    ${_QUERY_CONST.DBS.INVENTORY_ASSIGNMENT} ${_QUERY_CONST.AS} ${_QUERY_CONST.ALIAS.INVENDETAIL} 
                                ${_QUERY_CONST.WHERE}  
                                    ${(!!conditions && !!conditions.length)?conditions.map((condition, iter)=>{ return (iter>0)?`AND ${condition} `:` ${condition} `}).join(''):` `}
                                ${_QUERY_CONST.ORDERBY} 
                                    ${_QUERY_CONST.ALIAS.INVENDETAIL}.${_QUERY_CONST.FLDS.TRANSACTION} ${_QUERY_CONST.ASC}`;
                                
                                
                        //log.debug('inventoryDetailLineEntriesQueryStr', inventoryDetailLineEntriesQueryStr);
                        
                        let
                            inventoryDetailLineEntriesQuery = NSModules.query.runSuiteQL(inventoryDetailLineEntriesQueryStr),
                            inventoryDetailLineEntriesQueryResults = inventoryDetailLineEntriesQuery.results;

                        if(!!inventoryDetailLineEntriesQueryResults && !!inventoryDetailLineEntriesQueryResults.length)
                            return inventoryDetailLineEntriesQueryResults.reduce((resArr, queryResult)=>{
                                if(!!resArr){
                                    resArr.push(Object.keys(fieldsObj).reduce((resObj, field, iter)=>{
                                        if(!!verifyParam(fieldsObj[field]).isObject)
                                            resObj[field] = {...fieldsObj[field], value: queryResult.values[iter]};
                                        else{
                                            resObj[field] = new Object();
                                            resObj[field].value = queryResult.values[iter];
                                        }
                                        return resObj;
                                    },{}));

                                    return resArr;
                                }
                            },[])
                        else return [];
                    }
                    catch(err){
                        log.error('Err!', 'Error found in fetchLastSavedRecordDetail()');
                        log.error('Err!', err);
                    }
                }

                return {
                    fetchTransactionEntries:  fetchTransactionEntries,
                    fetchCustomRecordEntries: fetchCustomRecordEntries,
                    fetchLastSavedRecordDetail: fetchLastSavedRecordDetail,
                    fetchTransactionLineEntries: fetchTransactionLineEntries,
                    fetchTransactionLineEntries2: fetchTransactionLineEntries2,
                    fetchInventoryByBinLocation: fetchInventoryByBinLocation,
                    fetchInventoryDetailLineEntries: fetchInventoryDetailLineEntries,
                    fetchFullTransactionNLineDetails: fetchFullTransactionNLineDetails
                }

            }
            catch(err){
                log.error('Err!', 'Error found in validators()');
                log.error('Err!', err);
            }
        }

        //*get Current Netsuite Domain URL
        function getDomainURL(){ domainURL = NSModules.url.resolveDomain({ hostType: NSModules.url.HostType.APPLICATION, accountId: NSModules.runtime.accountId }); return domainURL; }

        //*get Script URL
        function getScriptURL(script, params){ /*log.debug('{script, params}',{script, params});*/ return NSModules.url.resolveScript({ scriptId: script.id, deploymentId:script.deploymentId, params:params, returnExternalUrl:script.returnExternalUrl||false }); }
        
        //*get Current Script URL
        function getCurrentSuiteletScriptURL(returnExternalUrl, params){ return NSModules.url.resolveScript({ scriptId: NSModules.runtime.getCurrentScript().id, deploymentId: NSModules.runtime.getCurrentScript().deploymentId, params:params, returnExternalUrl:returnExternalUrl||false }); }
        
        //*get Current Script URL
        function getCurrentRecordURL(record, isEditMode, params){ return NSModules.url.resolveRecord({ recordType: record.type, recordId: record.id, params:params, isEditMode:isEditMode||false }); }
        
        //*get Script Params
        function getScriptParamData(paramId){ return NSModules.runtime.getCurrentScript().getParameter(paramId); }

        //*get Script Params 
        function getUrlParamData(paramId){ return (!!request)?request.parameters[paramId]:null; } //TODO: Change to Get GET/POST Request Data

        // function getClientUrlParamData(paramId){ return new URLSearchParams(window.location.search).get(paramId) }
        
        //*get FileCabinet File Data
        function getFileData(fileId){ holdingFile = (!fileId && !holdingFile.id)? undefined: (!!fileId && (fcFile = files.find(({id})=>{return id==fileId;})))? fcFile: (!!holdingFile.id && (fcFile = files.find(({id})=>{return id==holdingFile.id;})))? fcFile: ( !!fileId )?(files.push({ id : fileId, fileObj: NSModules.file.load(fileId)}) && files[files.length-1]): undefined; return (!!holdingFile)?holdingFile.fileObj.getContents():"404 File Not Found"; }

        //*Set Advanced PDF/HTML Template based on template id
        function getAdvancedPdfHtmlLayout({advancedPdfHtmlTempId, records, searches}){ 
            //log.audit('Processing', 'Executing getAdvancedPdfHtmlLayout()');
            try{
                //log.audit('{advancedPdfHtmlTempId, records}',{advancedPdfHtmlTempId, records})
                if(!advancedPdfHtmlTempId) throw new Error("Template Id Not Found"); 

                renderer = NSModules.render.create(); 
                renderer.setTemplateById(advancedPdfHtmlTempId); 
                // if(!!add && !!add.dataSources) //TODO: Implement for datasource scenario
                //     dataSources.map( ds => { 
                //         renderer.addCustomDataSource({
                //             format: render.DataSource.OBJECT, 
                //             alias:'record', data:ds
                //         }); 
                //     }); 
                //log.audit('renderer', renderer);
                if(!!records && !!records.length){ 
                    records.map( rec => { 
                        if(!!rec)
                            renderer.addRecord({
                                templateName: rec.alias, record:rec.rec
                            });
                            //log.audit('renderer', renderer);
                    }); 
                }
                if(!!searches && !!searches.length){ 
                    searches.map( searchObj => { 
                        log.debug('searchObj', searchObj);
                        if(!!searchObj)
                            renderer.addSearchResults({
                                templateName: searchObj.alias, searchResult: searchObj.searchResult
                            });
                            //log.audit('renderer', renderer);
                    }); 
                }
                //log.audit('renderer.renderAsString()',renderer.renderAsString());
                return renderer.renderAsString();
            }
            catch(err){
                log.error('Error', 'Error Found In getAdvancedPdfHtmlLayout');
                log.error('Error', err);
            }
        }

        function validateHoldingRecord(rec){ holdingRecord = holdedRecords.find(({recType, id})=>{ return (!rec.id && (recType == rec.recType))? true: (!!rec.id && ((recType == rec.recType) && (id == rec.id)))? true: false; }); }

        function renderAdvPDFOnResponse(layoutString){
            //log.audit('Processing', 'Executing renderAdvPDFOnResponse()');
            try{
                response.renderPdf({
                    xmlString: layoutString
                })
            }
            catch(err){
                log.error('Error', 'Error Found In renderAdvPDFOnResponse');
                log.error('Error', err);
            }
        }

        function responseFuncs(){
            //log.audit('Processing', 'Executing response()');
            try{

                function writePage(){ response.writePage(form) }
                function write(xmlString){ response.write(xmlString) }
                function writeFile(fileObj, isInline){ 
                    response.setHeader({
                        name: 'Content-Disposition',
                        value: `attachment; filename = "${fileObj.name}"`,
                    });
                    response.writeFile({file: fileObj, isInline}) }

                return {
                    writePage : writePage,
                    writeFile : writeFile,
                    write: write
                }

            }
            catch(err){
                log.error('Error', 'Error Found In response');
                log.error('Error', err);
            }
        }

        function findRecord(query){ 
            //log.audit('Processing', 'Executing findRecord()'); 
            
            try{
                if(!holdedRecords.length) 
                    return null; 
                
                let rec = holdedRecords.find( ({id, recType, type, mode}) => {  
                    //log.audit('{id, recType, type, mode, query}', {id, recType, type, mode, query});

                    return  ( ( !!query.id     && id   == query.id   ) && ( !!query.recType && recType == query.recType                ) ) || 
                            ( ( !!query.mode   && mode == query.mode ) && ( !!query.recType && recType == query.recType                ) ) || 
                            ( ( !!query.type ) && type == query.type   && Object.values( entryPoint.RECORDTYPES ).includes( query.type ) );
                }); 
                
                // log.audit('rec',rec); 
                return rec;
            }
            catch(err){
                log.error('Error', 'Error Found In findRecord');
                log.error('Error', err);
            } 
        }

        return{
            get: get,
            set: set,
            form: form,
            getForm: getForm,
            getList: getList,
            request: request,
            setList: setList,
            setForm: setForm,
            dateTime: dateTime,
            response: response,
            NSModules: NSModules,
            setFields: setFields,
            setRecord: setRecord,
            validators: validators,
            setButtons: setButtons,
            setColumns: setColumns,
            setContext: setContext,
            findRecord: findRecord,
            showButton: showButton,
            verifyParam: verifyParam,
            queryModule: queryModule,
            setSublists: setSublists,
            getMultiple: getMultiple,
            getFileData: getFileData,
            getDomainURL: getDomainURL,
            getScriptURL: getScriptURL,
            responseFuncs: responseFuncs,
            holdedRecords: holdedRecords,
            getSublistData: getSublistData,
            setFieldGroups: setFieldGroups,
            extrctRecordObj: extrctRecordObj,
            buttonListeners: buttonListeners,
            getUrlParamData: getUrlParamData,
            // statusIsShipped: statusIsShipped,
            setClientContext: setClientContext,
            setFieldAttributes: setFieldAttributes,
            getScriptParamData: getScriptParamData,
            getGovernanceUsage: getGovernanceUsage,
            getCurrentUserInfo: getCurrentUserInfo,
            setButtonAttributes: setButtonAttributes,
            getCurrentRecordURL: getCurrentRecordURL,
            sendGETrequestToURL: sendGETrequestToURL,
            sendPOSTrequestToURL: sendPOSTrequestToURL,
            setDefaultFieldValue: setDefaultFieldValue,
            renderAdvPDFOnResponse: renderAdvPDFOnResponse,
            getAdvancedPdfHtmlLayout: getAdvancedPdfHtmlLayout,
            getCurrentSuiteletScriptURL: getCurrentSuiteletScriptURL
        };
    }
    catch (err) {
        log.error('Error', 'Error Found In SP_LIB_CommongDefaults.js');
        log.error('Error', err);
    }

});