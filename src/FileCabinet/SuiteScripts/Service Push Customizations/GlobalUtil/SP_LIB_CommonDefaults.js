/**
 *! Author: Dev "Muhammad Kamran"
 *! Date Creation: "20/09/2022"
 *! Date Updated: "20/01/2023"
 *! Version: 4
 */

 define([], function() {

    const
        _SCRIPT = {
            USEREVENTSCRIPT:{
                ENTRYPOINTS : {
                    beforeLoad   : {
                        string: 'beforeLoad',
                        USERMODES: {
                            VIEW:      'view',
                            EDIT:      'edit',
                            COPY:      'copy',
                            CREATE:    'create',
                            PRINT:     'print',
                            EMAIL:     'email',
                            QUICKVIEW: 'quick view'
                        },
                        RECORDTYPES: {
                            NEW: 'new',
                        }
                    },
                    beforeSubmit   : {
                        string: 'beforeSubmit',
                        USERMODES: {
                            EDIT:         'edit',
                            PACK:         'pack',
                            SHIP:         'ship',
                            XEDIT:        'xedit',
                            DELETE:       'delete',
                            CREATE:       'create',
                            CANCEL:       'cancel',
                            REJECT:       'reject',
                            APPROVE:      'approve',
                            REASSIGN:     'reassign',
                            EDITFORECAST: 'editforecast',
                            MARKCOMPLETE: 'markcomplete'
                        },
                        RECORDTYPES: {
                            OLD: 'old',
                            NEW: 'new'
                        }
                    },
                    afterSubmit   : {
                        string: 'afterSubmit',
                        USERMODES: {
                            EDIT:         'edit',
                            PACK:         'pack',
                            SHIP:         'ship',
                            XEDIT:        'xedit',
                            DELETE:       'delete',
                            CREATE:       'create',
                            CANCEL:       'cancel',
                            REJECT:       'reject',
                            APPROVE:      'approve',
                            DROPSHIP:     'dropship',
                            PAYBILLS:     'paybills',
                            ORDERITEMS:   'orderitems',
                            SPECIALORDER: 'specialorder'
                        },
                        RECORDTYPES: {
                            OLD: 'old',
                            NEW: 'new'
                        }
                    }
                }
            },
            SUITELETSCRIPT:{
                ENTRYPOINTS : {
                    onRequest : {
                        string: 'onRequest',
                    }
                }
            },
            WORKFLOWACTION:{
                ENTRYPOINTS : {
                    onAction : {
                        string: 'onAction',
                        USERMODES: {
                            VIEW:         'view',
                            EDIT:         'edit',
                            DELETE:       'delete',
                            CREATE:       'create',
                            REJECT:       'reject',
                            APPROVE:      'approve'
                        },
                        RECORDTYPES: {
                            OLD: 'old',
                            NEW: 'new'
                        },
                    }
                }
            },
            CLIENTSCRIPT:{
                ENTRYPOINTS : {
                    pageInit : {
                        string: 'pageInit',
                        USERMODES: {
                            VIEW:   'view',
                            EDIT:   'edit',
                            CREATE: 'create'
                        },
                        RECORDTYPES: {
                            CURRENT: 'current'
                        },
                    },
                    validateField : {
                        string: 'validateField',
                        USERMODES: {
                            VIEW:   'view',
                            EDIT:   'edit',
                            CREATE: 'create'
                        },
                        RECORDTYPES: {
                            CURRENT: 'current'
                        },
                    },
                    postSourcing : {
                        string: 'postSourcing',
                        USERMODES: {
                            VIEW:   'view',
                            EDIT:   'edit',
                            CREATE: 'create'
                        },
                        RECORDTYPES: {
                            CURRENT: 'current'
                        },
                    },
                    saveRecord : {
                        string: 'saveRecord',
                        USERMODES: {
                            VIEW:   'view',
                            EDIT:   'edit',
                            CREATE: 'create'
                        },
                        RECORDTYPES: {
                            CURRENT: 'current'
                        },
                    }
                }
                // onRequest : 'onRequest'
            },
            QUERY_CONST : {
                ON:          'on',
                OR:          'or',
                IN:          'in',
                MAP:         'map',
                AS:          'as',
                ASC:         'asc',
                AND:         'and',
                ROWS:        'rows',
                OVER:        'over',
                ONLY:        'only',
                LIKE:        'LIKE',
                FROM:        'from',
                JOIN:        'join',
                DESC:        'desc',
                WHERE:       'where',
                FETCH:       'fetch',
                FIRST:       'first',
                SELECT:      'select',
                NOT_IN:      'not in',   
                ISNULL:      'is null',
                ORDERBY:     'order by',
                LEFTJOIN:    'left join',
                INNERJOIN:   'inner join',
                ISNOTNULL:   'is not null',
                PARTITIONBY: 'partition by',
                DBS : {
                    BIN:               'bin',
                    ITEM:              'item',
                    CLASS:             'classification',
                    LOCATION:          'location',
                    UNITSTYPE:         'unitsType',
                    TRANSACTION:       'Transaction',
                    UNITSTYPEUOM:      'unitsTypeUom',
                    TRANSACTIONLINE:   'TransactionLine',
                    INVENTORY_BALANCE: 'InventoryBalance',
                    INVENTORY_ASSIGNMENT: 'InventoryAssignment'
                },
                FUNCTIONS:{
                    UPPER:     'upper',
                    COALESCE:  'COALESCE',
                    TO_NUMBER: 'TO_NUMBER',
                    ROW_NUMBER: 'row_number()',
                    BUILTIN_DF: 'BUILTIN.DF'
                },
                FLDS: {
                    ID:                    'id',
                    BIN:                   'bin',
                    ITEM:                  'item',
                    MAP1:                  'mapone',
                    MAP2:                  'maptwo',
                    NAME:                  'name',
                    UNITS:                 'units',
                    CLASS:                 'class',
                    TRANID:                'tranid',   
                    STATUS:                'status',   
                    ISCOGS:                'iscogs', 
                    TAXLINE:               'taxline',   
                    TRANDATE:              'trandate',  
                    MAINLINE:              'mainline',  
                    QUANTITY:              'quantity',
                    UNITNAME:              'unitName',
                    LOCATION:              'location',
                    ITEMTYPE:              'itemType',
                    FULLNAME:              'fullName',
                    BASEUNIT:              'baseUnit',
                    SALEUNIT:              'saleUnit',
                    CUSTFORM:              'customform',
                    ISCLOSED:              'isclosed', 
                    STOCKUNIT:             'stockunit',
                    BINNUMBER:             'binNumber',
                    UNITSTYPE:             'unitsType',
                    INTERNALID:            'internalid',
                    RECORDTYPE:            'recordtype',
                    OTHRREFNUM:            'otherrefnum',
                    QTY_ONHAND:            'quantityOnHand',
                    QTY_PICKED:            'quantityPicked',
                    CREATEDFROM:           'createdfrom',
                    TRANSACTION:           'Transaction',
                    DESCRIPTION:           'description',
                    CREATEDDATE:           'createddate',
                    CONVER_RATE:           'conversionrate',
                    QTY_AVAILABLE:         'quantityAvailable',
                    INVENTORYNUMBER:       'inventorynumber',
                    TRANSACTIONLINE:       'transactionline',
                    IS_CUSTOMGLLINE:       'iscustomglline',
                    APPROVAL_STATUS:       'approvalstatus',
                    LANDEDCOST_PERLINE:    'landedcostperline',
                    IS_INVENTORYAFFECTING: 'isinventoryaffecting'
                },
                ALIAS:{
                    IF:                'itemfulfillment',
                    SO:                'salesorder',
                    LINE:              'line',
                    CLASS:             'class',
                    UTUOM:             'utuom',
                    IFLINES:           'itemfulfillmentlines',
                    BASEUOM:           'baseUOM',
                    MAPPING1:          'mapping1',
                    SALESUOM:          'salesUOM',
                    ITEM_NAME:         'itemname',
                    INVENDETAIL:       'InventoryDetail',
                    PREFUNITTYPE:      'prefunitType',
                    INVENTORY_BALANCE: 'InventoryBalance',
                    CREATEDFROM_TRANS: 'createdFromTransaction'
                },
                DEFAULTS:{
                    TRUE: `'T'`,
                    FALSE: `'F'`,
                    IS_NOT_NULL: 'IS NOT NULL'
                }
            },
            META_CONST : {
                REC_SEPERATOR : '.'
            },
            RECIPES:{
                autoNumbering:{
                    defaults:{
                        USEREVENTSCRIPT : {
                            VIEW : 'view',
                            V : 'view',
                        }
                    }
                }
            },
            BUTTONS: {
                types:{
                    redirectToSuitelet :{
                        id:    'custpage_redirecttosuitelet',
                        label: 'Redirect To Suitelet',
                        defaultParams:{
                            transactionId: 'transactionId',
                            transactionType: 'transactionType'
                        }
                    },
                    export :{
                        id:'custpage_export',
                        types:{
                            CSV: 'CSV',
                            TXT: 'PLAINTEXT',
                            XLSX: 'XLSX'
                        }
                    },
                    resetFilters:{
                        id:'custpage_resetfilters',
                        label: 'Reset Filters'
                    },
                    submit:{
                        id:'custpage_submit',
                    },
                    submitButtons:{
                        export:{
                            id:'custpage_submit',
                            label: 'Export'
                        }
                    }
                }
            },
            SUBLIST_BUTTONS: {
                types:{
                    markAllButton : {
                        id:'markAllButton'
                    },
                    refreshButton : {
                        id:'refreshButton'
                    }
                }
            },
            URL: {
                params:{
                    url: 'custpage_url',
                    exportIn:   'exportIn',
                    generatePDF: 'custpage_generate_pdf',
                    exportFile: 'exportFile',
                    inlineHTML: 'custpage_inlinehtml',
                    transactionId: 'custpage_transactionid',
                    buttonFunction:  'custpage_buttonfunction',
                    transactionType: 'custpage_transactiontype',
                    advancedPDFHTMLTemplate: 'custpage_advancedpdf_html_template'
                }
            },
        },
        
        _TRANSACTION = {
            type: 'transaction',
            fields: {
                id:       'id',
                date:     'trandate',
                docNum:   'tranid',
                voided:   'voided',
                recType:  'recordtype',
                mainline: 'mainline',
                opportunity: 'opportunity'
            },
            default : {
                mainline : {
                    true : 'T',
                    false : 'F'
                },
                recType:  {
                    PO : 'purchaseorder'
                }
            }
        },
        _TRANSACTIONLINE = {
            type: 'transactionline',
            fields: {
                item:        'item',
                mainline:    'mainline',
                netamount:   'netamount',
                taxamount:   'taxamount',
                transaction: 'transaction'
            },
            default : {
                mainline : {
                    true : 'T',
                    false : 'F'
                }
            }
        },

        _QUERYDEFAULTS = {
            as: 'AS',
            on: 'ON',
            and: 'AND',
            from: 'FROM',
            where: 'WHERE',
            select: 'SELECT',
            functions: {
                sum: 'SUM',
            },
            joinTypes: {
                inner: 'INNER JOIN',
                outer: 'OUTER JOIN'
            }
        },
        
        _UI = {
            FIELD : {
                text: 'text',
                value: 'value'
            },
            BUTTON : {
                id: 'custpage_',
            }
        },
        _ITEMFULFILLMENT = {
            type: 'itemfulfillment',
            fields: {
                id: 'id',
                ordertype: 'ordertype',
                shipStatus: 'shipstatus',
                createdfrom: 'createdfrom'
            },
            defaults : {
                shipStatus  : {
                    PICKED  : 'A',
                    PACKED  : 'B',
                    SHIPPED : 'C'
                },
                ordertype : {
                    SO : 'SalesOrd'
                }
            }
        }
        

    return{
        _UI     : _UI,
        _SCRIPT : _SCRIPT,
        _TRANSACTION : _TRANSACTION,
        _QUERYDEFAULTS : _QUERYDEFAULTS,
        _TRANSACTIONLINE : _TRANSACTIONLINE,
        _ITEMFULFILLMENT : _ITEMFULFILLMENT
    }

})