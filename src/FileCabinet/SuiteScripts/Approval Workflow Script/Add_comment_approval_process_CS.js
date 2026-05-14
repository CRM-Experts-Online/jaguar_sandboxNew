/**
 *@NApiVersion 2.1
 *@NScriptType ClientScript
 */
define(['N/currentRecord', 'N/record', 'N/search', 'N/ui/dialog', 'N/log', 'N/url'], function (c, record, search, dialog, log, url) {

   function pageInit(context) {
      
   }

   function print_bill() {
      openSuitelet('first');
   }

   function print_bill_2nd() {
      openSuitelet('second');
   }

   function openSuitelet(approverType) {
      try {
         var currentRecord = c.get();

         var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_add_comment_approval_procec',
            deploymentId: 'customdeploy_add_comment_approval_procec',
            params: {
               recid: currentRecord.id,
               rectype: currentRecord.type,
               approver: approverType
            }
         });

         const leftPos = (window.screen.width / 2) - (800 / 2);
         const topPos = (window.screen.height / 2) - (550 / 2);

         window.open(
            suiteletUrl,
            'Approval Comment',
            `height=550,width=800,left=${leftPos},top=${topPos},resizable=yes`
         );

      } catch (e) {
         alert(e.message);
      }
   }


   return {
      pageInit: pageInit,
      print_bill: print_bill,
      print_bill_2nd: print_bill_2nd

   }
});