/**
 * @NApiVersion 2.1
 * @NScriptType MapReduceScript
 */

define(['N/file', 'N/record', 'N/log'], (file, record, log) => {

    const FILE_ID = 161699;

    // =========================
    // GET INPUT DATA
    // =========================
    const getInputData = () => {
        try {
            const csvFile = file.load({ id: FILE_ID });

            log.debug('File Loaded', `File ID: ${FILE_ID}, Name: ${csvFile.name}`);

            const contents = csvFile.getContents();

            // FIX: Windows + Unix line breaks + cleanup
            let lines = contents
                .split(/\r?\n/)
                .map(line => line.trim())
                .filter(line => line && line.length > 0);

            log.debug('File Read', `Total Clean Lines: ${lines.length}`);

            // Remove header safely
            lines.shift();

            log.debug('Header Removed', `Lines after header removed: ${lines.length}`);

            return lines;

        } catch (e) {
            log.error('getInputData Error', e);
        }
    };

    // =========================
    // MAP
    // =========================
    const map = (context) => {
        try {
            const line = context.value;

            if (!line) return;

            // FIX: safe trim split
            const cols = line.split(',').map(c => c.trim());

            const internalId = cols[0];
            const qbInv = cols[1];

            if (!internalId || !qbInv) {
                log.debug('Skipping Line', `Invalid data: ${line}`);
                return;
            }

            // Build new transaction ID
            const newTranId = 'INV' + qbInv;

            log.debug('Mapping', {
                internalId: internalId,
                newTranId: newTranId
            });

            context.write({
                key: internalId,
                value: newTranId
            });

        } catch (e) {
            log.error('Map Error', e);
        }
    };

    // =========================
    // REDUCE
    // =========================
    const reduce = (context) => {
        try {
            const internalId = context.key;
            const newTranId = context.values[0];

            log.debug('Reducing', {
                internalId,
                newTranId
            });

            // =========================
            // ENABLE UPDATE HERE
            // =========================
            record.submitFields({
                type: record.Type.INVOICE,
                id: internalId,
                values: {
                    tranid: newTranId
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            });

            log.audit('SUCCESS', `Invoice ${internalId} → ${newTranId}`);

        } catch (e) {
            log.error(`Reduce Error (ID: ${context.key})`, e);
        }
    };

    // =========================
    // SUMMARY
    // =========================
    const summarize = (summary) => {
        log.audit('Summary', 'Process completed');

        // Map errors
        summary.mapSummary.errors.iterator().each((key, error) => {
            log.error(`MAP ERROR for key: ${key}`, error);
            return true;
        });

        // Reduce errors
        summary.reduceSummary.errors.iterator().each((key, error) => {
            log.error(`REDUCE ERROR for key: ${key}`, error);
            return true;
        });

        log.audit('Summary Complete', {
            usage: summary.usage,
            concurrency: summary.concurrency,
            yields: summary.yields
        });
    };

    return {
        getInputData,
        map,
        reduce,
        summarize
    };
});