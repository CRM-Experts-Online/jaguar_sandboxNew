/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */

define(['N/currentRecord'], function(currentRecord) {

  function pageInit(context) {
        
  }
  
  function fieldChanged(context) {
    var currentRecord = context.currentRecord;
    var fieldId = context.fieldId;

    // Check if the field that changed is one of the fields you want to increase
    if (fieldId === 'cost' || fieldId === 'averagecost') {
      // Get the current value of the field
      var currentValue = currentRecord.getValue({
        fieldId: fieldId
      });

      // Increase the value with up to 5 decimal places
      var increasedValue = increaseDecimalPlaces(currentValue, 5);

      // Set the increased value back to the field
      currentRecord.setValue({
        fieldId: fieldId,
        value: increasedValue,
        ignoreFieldChange: true
      });
    }
  }

  function increaseDecimalPlaces(value, decimalPlaces) {
    // Check if the value is not a number or is null/undefined
    if (isNaN(value) || value == null) {
      return value; // Return the original value
    }

    // Convert the value to a number
    value = Number(value);

    // Check if the value is an integer
    if (Number.isInteger(value)) {
      // If the value is an integer, append ".00000"
      return value.toFixed(decimalPlaces);
    }

    // Round the value to the specified number of decimal places
    var factor = Math.pow(10, decimalPlaces);
    return Math.round(value * factor) / factor;
  }

  return {
    pageInit: pageInit,
    fieldChanged: fieldChanged
  };
});