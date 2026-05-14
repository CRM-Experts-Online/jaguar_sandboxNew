/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/log'], (record, search, log) => {

  const CONTACT_ROWS = [
    { companyId: 56994, firstName: 'Accounts', lastName: 'Payables', email: 'ap@4hornpower.com' },
    { companyId: 56994, firstName: 'P',        lastName: 'Sykes',    email: 'psykes@4hornpower.com' },
    { companyId: 56968, firstName: 'Accounts', lastName: 'Payables', email: 'ap@4hornpower.com' },
    { companyId: 53955, firstName: 'Accounts', lastName: 'Payables', email: 'ap@4hornpower.com' },
    { companyId: 53957, firstName: 'T',        lastName: 'Amik',     email: 'tamik@afgeneralcontractors.com' }
  ];

  const SUBSIDIARY_ID = 2;

  const findExistingContact = (companyId, email) => {
    const s = search.create({
      type: 'contact',
      filters: [
        ['company', 'anyof', companyId],
        'AND',
        ['email', 'is', email]
      ],
      columns: ['internalid']
    });

    const res = s.run().getRange({ start: 0, end: 1 });
    return res.length ? res[0].getValue({ name: 'internalid' }) : null;
  };

  const getInputData = () => CONTACT_ROWS;

  const map = (context) => {
    // ✅ context.value is a JSON string in M/R
    const row = JSON.parse(context.value);

    log.debug('MAP ROW', row);

    context.write({
      key: String(row.companyId),
      value: row
    });
  };

  const reduce = (context) => {
    log.debug('Reduce Start', { key: context.key, count: context.values.length });

    context.values.forEach((val) => {
      const row = JSON.parse(val);
      log.debug('ROW', row);

      if (!row.companyId || !row.email) {
        log.error('Missing required data', row);
        return;
      }

      const existing = findExistingContact(row.companyId, row.email);
      if (existing) {
        log.audit('Skipped duplicate contact', { existing, email: row.email, companyId: row.companyId });
        return;
      }

      const contact = record.create({ type: record.Type.CONTACT, isDynamic: true });

      contact.setValue({ fieldId: 'company', value: row.companyId });

      // subsidiary might not exist on Contact in some accounts; keep try/catch
      try {
        contact.setValue({ fieldId: 'subsidiary', value: SUBSIDIARY_ID });
      } catch (e) {
        log.debug('Subsidiary not set (field missing or not editable)', e.message);
      }

      contact.setValue({ fieldId: 'firstname', value: row.firstName || '' });
      contact.setValue({ fieldId: 'lastname', value: row.lastName || '' });
      contact.setValue({ fieldId: 'email', value: row.email });

      const id = contact.save({ enableSourcing: true, ignoreMandatoryFields: false });
      log.audit('Contact created', { id, company: row.companyId, email: row.email });
    });
  };

  const summarize = (summary) => {
    if (summary.inputSummary.error) {
      log.error('Input error', summary.inputSummary.error);
    }

    summary.mapSummary.errors.iterator().each((key, error) => {
      log.error(`Map error for key ${key}`, error);
      return true;
    });

    summary.reduceSummary.errors.iterator().each((key, error) => {
      log.error(`Reduce error for key ${key}`, error);
      return true;
    });

    log.audit('Map/Reduce completed', {
      usage: summary.usageSummary.usage,
      yields: summary.yieldSummary.yields,
      concurrency: summary.concurrencySummary.concurrency
    });
  };

  return { getInputData, map, reduce, summarize };
});
