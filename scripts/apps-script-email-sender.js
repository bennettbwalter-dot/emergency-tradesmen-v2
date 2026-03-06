/**
 * ============================================================
 *  Emergency Tradesmen — Gmail Mail Merge via Apps Script
 * ============================================================
 *
 * HOW TO USE:
 * 1. Open your Google Sheet with the outreach leads
 * 2. Click Extensions → Apps Script
 * 3. Delete everything in the editor and paste this entire file
 * 4. Click Save (disk icon)
 * 5. Run "setupTrigger" once to schedule automatic daily sends
 * 6. Click Run → "sendBatch" to send manually right now
 *
 * SHEET FORMAT (Row 1 must be headers):
 * | Email | FirstName | BusinessName | City | Trade | PricingLink | Sent |
 *
 * The "Sent" column is added automatically. Once a row is sent,
 * it is marked "YES" and will never be emailed again.
 * ============================================================
 */

// ─── CONFIG ─────────────────────────────────────────────────
const CONFIG = {
    SHEET_NAME: 'Sheet1',          // Name of your sheet tab
    BATCH_SIZE: 50,                // Emails to send per run (safe limit)
    DELAY_SECONDS: 2,              // Delay between each email (avoid spam flags)
    FROM_NAME: 'Emergency Tradesmen',
    REPLY_TO: 'emergencytradesmen@gmail.com',
    POSTHOG_WEBHOOK_URL: 'https://xwqvhymkwuasotsgmarn.supabase.co/functions/v1/mailmeteor-webhook',
};

// ─── EMAIL TEMPLATE ─────────────────────────────────────────
function getEmailTemplate(row) {
    const firstName = row.FirstName || 'there';
    const businessName = row.BusinessName || 'your business';
    const trade = row.Trade || 'your trade';
    const city = row.City || 'your area';
    const pricingLink = row.PricingLink || 'https://emergencytradesmen.net/pricing';

    const subject = `${businessName} — Get More Emergency ${capitalise(trade)} Enquiries in ${city}`;

    const body = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 15px; color: #333; line-height: 1.6; max-width: 600px; }
    .cta { display: inline-block; background: #e55a00; color: #fff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 16px 0; }
    .footer { margin-top: 32px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 12px; }
  </style>
</head>
<body>
  <p>Hi ${firstName},</p>

  <p>I noticed <strong>${businessName}</strong> offers emergency ${trade} services in ${city} — 
  that's exactly the kind of business we help get more leads.</p>

  <p>We run <strong>Emergency Tradesmen</strong>, a UK directory that connects homeowners 
  with trusted local tradespeople the moment something goes wrong. 
  We send verified emergency enquiries directly to the tradespeople on our platform.</p>

  <p>→ <strong>Listing your business is completely free to start.</strong></p>

  <p>Over 1,000 tradespeople are already receiving enquiries through us. 
  We'd love to add ${city}'s top ${trade} to the platform.</p>

  <a href="${pricingLink}" class="cta">See How It Works →</a>

  <p>If you have any questions just reply to this email — I personally read every reply.</p>

  <p>Best,<br>
  <strong>Nick</strong><br>
  Emergency Tradesmen<br>
  emergencytradesmen.net</p>

  <div class="footer">
    You're receiving this because you are a ${trade} in ${city}. 
    To stop receiving emails, simply reply with "Unsubscribe" and we'll remove you immediately.
  </div>
</body>
</html>
`;

    return { subject, body };
}

// ─── MAIN SEND FUNCTION ──────────────────────────────────────
function sendBatch() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

    if (!sheet) {
        Logger.log('ERROR: Sheet "' + CONFIG.SHEET_NAME + '" not found.');
        return;
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => h.toString().trim());

    // Ensure "Sent" column exists
    let sentCol = headers.indexOf('Sent');
    if (sentCol === -1) {
        sheet.getRange(1, headers.length + 1).setValue('Sent');
        headers.push('Sent');
        sentCol = headers.length - 1;
    }

    let sent = 0;

    for (let i = 1; i < data.length; i++) {
        if (sent >= CONFIG.BATCH_SIZE) break;

        const row = {};
        headers.forEach((h, j) => { row[h] = data[i][j]; });

        // Skip if already sent
        if (row['Sent'] === 'YES') continue;
        // Skip if no email
        if (!row['Email'] || !row['Email'].toString().includes('@')) continue;

        try {
            const { subject, body } = getEmailTemplate(row);

            GmailApp.sendEmail(
                row['Email'],
                subject,
                '',  // plain text fallback (empty — HTML only)
                {
                    htmlBody: body,
                    name: CONFIG.FROM_NAME,
                    replyTo: CONFIG.REPLY_TO,
                }
            );

            // Mark as sent in the sheet
            sheet.getRange(i + 1, sentCol + 1).setValue('YES');

            // Fire PostHog tracking event
            trackEvent('email.sent', row['Email'], row);

            sent++;
            Logger.log('Sent to: ' + row['Email'] + ' (' + sent + ')');

            // Throttle to avoid spam flags
            if (sent < CONFIG.BATCH_SIZE) {
                Utilities.sleep(CONFIG.DELAY_SECONDS * 1000);
            }

        } catch (e) {
            Logger.log('ERROR sending to ' + row['Email'] + ': ' + e.message);
            // Mark as error so we don't retry endlessly
            sheet.getRange(i + 1, sentCol + 1).setValue('ERROR: ' + e.message);
        }
    }

    Logger.log('✅ Batch complete. Sent ' + sent + ' emails.');
    SpreadsheetApp.getActiveSpreadsheet().toast(
        'Sent ' + sent + ' emails successfully!', '✅ Batch Complete', 5
    );
}

// ─── POSTHOG TRACKING ────────────────────────────────────────
function trackEvent(eventType, email, row) {
    try {
        const payload = {
            type: eventType,
            id: 'apps_script_' + Date.now(),
            created_at: new Date().toISOString(),
            data: {
                object: {
                    to: email,
                    campaign: 'apps_script_batch',
                    variables: {
                        Trade: row['Trade'] || '',
                        City: row['City'] || '',
                        FirstName: row['FirstName'] || '',
                    }
                }
            }
        };

        UrlFetchApp.fetch(CONFIG.POSTHOG_WEBHOOK_URL, {
            method: 'POST',
            contentType: 'application/json',
            payload: JSON.stringify(payload),
            muteHttpExceptions: true,
        });
    } catch (e) {
        Logger.log('PostHog tracking error (non-fatal): ' + e.message);
    }
}

// ─── DAILY TRIGGER SETUP (run once) ─────────────────────────
function setupTrigger() {
    // Delete existing triggers first
    ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

    // Create a new daily trigger at 9am
    ScriptApp.newTrigger('sendBatch')
        .timeBased()
        .everyDays(1)
        .atHour(9)
        .create();

    Logger.log('✅ Daily trigger set for 9am. sendBatch will run automatically every day.');
    SpreadsheetApp.getActiveSpreadsheet().toast('Daily trigger set for 9am!', '✅ Trigger Set', 5);
}

// ─── HELPERS ─────────────────────────────────────────────────
function capitalise(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
