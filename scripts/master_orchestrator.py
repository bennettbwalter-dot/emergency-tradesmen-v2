import os
import subprocess
import time
import json
import logging
from datetime import datetime

# --- Configuration ---
SCRIPTS_DIR = os.path.dirname(__file__)
UK_SCRAPER = os.path.join(SCRIPTS_DIR, 'fill_uk_scraper.py')
USA_SCRAPER = os.path.join(SCRIPTS_DIR, 'fill_usa_gaps.py')
OUTREACH_PROCESSOR = os.path.join(SCRIPTS_DIR, 'continuous_outreach_processor.py')
HEARTBEAT_FILE = os.path.join(SCRIPTS_DIR, 'orchestrator_heartbeat.json')
LOG_FILE = os.path.join(SCRIPTS_DIR, 'master_orchestrator.log')

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE, encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('master_orchestrator')

def update_heartbeat(status, last_action):
    heartbeat = {
        "status": status,
        "last_action": last_action,
        "timestamp": datetime.now().isoformat(),
        "pid": os.getpid()
    }
    with open(HEARTBEAT_FILE, 'w', encoding='utf-8') as f:
        json.dump(heartbeat, f, indent=4)

def run_script(script_path, name, timeout=None):
    logger.info(f"--- Starting Agent: {name} ---")
    try:
        # We use a list to ensure proper path handling on Windows
        process = subprocess.Popen(['python', script_path], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8')
        
        # In a real environment, we'd want to stream the output, but for "autonomous" 
        # background running, we just wait for it to finish or crash.
        # However, fill_usa_gaps.py loops forever, so we should probably run it in a way
        # that we can check its health.
        
        # For now, let's assume scrapers perform a substantial "batch" then exit, 
        # or we monitor them.
        
        # Actually, let's modify the orchestration logic:
        # 1. Run UK Scraper (Batch)
        # 2. Run USA Scraper (Batch - I'll need to make sure it can exit)
        # 3. Run Outreach (Batch)
        
        # For the loop-forever USA script, we'll run it for 2 hours then restart it 
        # to clear memory/state.
        
        stdout, stderr = process.communicate(timeout=timeout)
        if process.returncode == 0:
            logger.info(f"✅ {name} completed successfully.")
        else:
            logger.error(f"❌ {name} failed with exit code {process.returncode}.")
            if stderr:
                logger.error(f"Error Details: {stderr[:500]}...")
    except subprocess.TimeoutExpired:
        logger.warning(f"⚠️ {name} timed out. Terminating...")
        process.terminate()
    except Exception as e:
        logger.error(f"❌ Failed to run {name}: {str(e)}")

def main():
    logger.info("==========================================")
    logger.info("🚀 Master Orchestrator V1 Starting...")
    logger.info("==========================================")
    
    cycle_count = 0
    
    while True:
        cycle_count += 1
        logger.info(f"\n🌀 Starting Global Orchestration Cycle #{cycle_count}")
        
        # Step 1: UK Scraping (Fill Gaps)
        update_heartbeat("UK_SCRAPE", "Scanning for UK business gaps...")
        run_script(UK_SCRAPER, "UK Scraper", timeout=3600) # 1 hour max
        
        # Step 2: USA Scraping (Fill Gaps)
        update_heartbeat("USA_SCRAPE", "Scanning for USA business gaps...")
        # Note: fill_usa_gaps.py is a loop_forever script. 
        # To make it work in this orchestrator, I'll run it for a set duration.
        run_script(USA_SCRAPER, "USA Scraper", timeout=3600) # 1 hour max
        
        # Step 3: Outreach (Email Processing)
        update_heartbeat("OUTREACH", "Processing lead outreach batches...")
        run_script(OUTREACH_PROCESSOR, "Outreach Processor", timeout=1800) # 30 mins max
        
        logger.info(f"✅ Cycle #{cycle_count} complete. Resting for 15 minutes...")
        update_heartbeat("IDLE", f"Cycle #{cycle_count} finished. Next cycle soon.")
        time.sleep(900)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        logger.info("🛑 Orchestrator stopped by user.")
        update_heartbeat("STOPPED", "Terminated manually.")
