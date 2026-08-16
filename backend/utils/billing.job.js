const {
    markOverdueBills,
} = require("../controllers/billing.controller");


// ===========================================================
// START BILLING REMINDER JOB
// Sweeps unpaid bills once a day, flips any that are past the
// grace period to "overdue", and emails the resident a
// reminder. Runs once immediately on startup as well, so
// overdue bills show up right away instead of waiting a full
// day for the first sweep.
// ===========================================================

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const startBillingReminderJob = () => {

    console.log(
        "[Billing Reminder Job] Started."
    );

    const runSweep = async () => {

        try {

            const result = await markOverdueBills();

            console.log(
                `[Billing Reminder Job] Checked ${result.checked} bill(s), ` +
                `${result.newlyOverdue} newly marked overdue.`
            );

        } catch (error) {

            console.error(
                "[Billing Reminder Job] Error:",
                error.message
            );
        }
    };

    // Run once at startup...
    runSweep();

    // ...then once every 24 hours.
    setInterval(
        runSweep,
        ONE_DAY_MS
    );
};


module.exports = {
    startBillingReminderJob,
};
