import csv
import json
import os
import time
import requests
import logging
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env')

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
ANON_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

LOG_FILE = 'scripts/outreach_processor.log'

def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s [%(levelname)s] %(message)s',
        handlers=[
            logging.FileHandler(LOG_FILE, encoding='utf-8'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger('outreach_processor')

logger = setup_logging()

def log(message):
    logger.info(message)

def capitalise(s):
    if not s: return ""
    return s[0].upper() + s[1:]

def get_email_template(row):
    first_name = row.get('FirstName', 'there')
    business_name = row.get('BusinessName', 'your business')
    trade = row.get('Trade', 'your trade')
    city = row.get('City', 'your area')
    pricing_link = row.get('PricingLink', 'https://emergencytradesmen.net/pricing')

    subject = f"{business_name} — Get More Emergency {capitalise(trade)} Enquiries in {city}"

    html = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {{ font-family: Arial, sans-serif; font-size: 15px; color: #333; line-height: 1.6; max-width: 600px; }}
    .cta {{ display: inline-block; background: #e55a00; color: #fff !important; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; margin: 16px 0; }}
    .footer {{ margin-top: 32px; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 12px; }}
  </style>
</head>
<body>
  <p>Hi {first_name},</p>

  <p>I noticed <strong>{business_name}</strong> offers emergency {trade} services in {city} — 
  that's exactly the kind of business we help get more leads.</p>

  <p>We run <strong>Emergency Tradesmen</strong>, a UK directory that connects homeowners 
  with trusted local tradespeople the moment something goes wrong. 
  We send verified emergency enquiries directly to the tradespeople on our platform.</p>

  <p>→ <strong>Listing your business is completely free to start.</strong></p>

  <p>Over 1,000 tradespeople are already receiving enquiries through us. 
  We'd love to add {city}'s top {trade} to the platform.</p>

  <a href="{pricing_link}" class="cta">See How It Works →</a>

  <p>If you have any questions just reply to this email — I personally read every reply.</p>

  <p>Best,<br>
  <strong>Nick</strong><br>
  Emergency Tradesmen<br>
  emergencytradesmen.net</p>

  <div class="footer">
    You're receiving this because you are a {trade} in {city}. 
    To stop receiving emails, simply reply with "Unsubscribe" and we'll remove you immediately.
  </div>
</body>
</html>
"""
    return subject, html

def send_email(to, subject, html):
    url = f"{SUPABASE_URL}/functions/v1/send-email"
    headers = {
        "Authorization": f"Bearer {ANON_KEY}",
        "apikey": ANON_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "to": to,
        "subject": subject,
        "html": html,
        "from_name": "Emergency Tradesmen"
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=15)
        if response.status_code in [200, 201]:
            return True, response.text
        else:
            return False, f"Status {response.status_code}: {response.text}"
    except Exception as e:
        return False, str(e)

def mark_as_emailed(email):
    url = f"{SUPABASE_URL}/rest/v1/businesses?email=eq.{email}"
    headers = {
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    payload = {
        "last_emailed_at": datetime.now().isoformat()
    }
    
    try:
        response = requests.patch(url, headers=headers, json=payload, timeout=10)
        return response.status_code in [200, 204]
    except Exception as e:
        logger.error(f"DB Update Error for {email}: {str(e)}")
        return False

def process_batch(batch_file):
    logger.info(f"Starting Batch: {batch_file}")
    if not os.path.exists(batch_file):
        logger.warning(f"File not found: {batch_file}")
        return

    success_count = 0
    fail_count = 0

    try:
        with open(batch_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                email = row.get('Email')
                if not email or '@' not in email:
                    logger.info(f"Skipping invalid email: {email}")
                    continue

                subject, html = get_email_template(row)
                
                logger.info(f"Sending to {email}...")
                success, msg = send_email(email, subject, html)
                
                if success:
                    logger.info(f"✅ Email sent to {email}")
                    if mark_as_emailed(email):
                        logger.info(f"✅ DB updated for {email}")
                    else:
                        logger.warning(f"⚠️ DB update failed for {email}")
                    success_count += 1
                else:
                    logger.error(f"❌ Failed to send to {email}: {msg}")
                    fail_count += 1

                # Regulatory / Reputation delay
                time.sleep(5) # Slow down slightly to avoid rate limits
    except Exception as e:
        logger.error(f"Error processing batch file {batch_file}: {str(e)}")

    logger.info(f"Batch Complete: {batch_file}. Success: {success_count}, Failed: {fail_count}")

def main():
    logger.info("Starting Continuous Outreach Processor (Batches 1-5)")
    
    # Process batches 1 to 5 sequentially
    batches = [
        "outreach_batch_1.csv",
        "outreach_batch_2.csv",
        "outreach_batch_3.csv",
        "outreach_batch_4.csv",
        "outreach_batch_5.csv"
    ]
    
    for batch_file in batches:
        try:
            process_batch(batch_file)
            logger.info(f"Finished processing {batch_file}. Moving to next.")
        except Exception as e:
            logger.critical(f"CRITICAL ERROR in batch {batch_file}: {str(e)}")
            logger.info("Continuing to next batch...")
    
    logger.info("All batches processed successfully.")

if __name__ == "__main__":
    main()
