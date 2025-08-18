import subprocess
import sys
import time
from pathlib import Path

# Set working directory to the script's own directory
base_dir = Path(__file__).resolve().parent

steps = [
    ("🔎 Step 1: Extract CLUB player IDs", ["python", "club.1.get.ids.py"]),
    ("📦 Step 2: Scrape player data", ["node", "club.2.fetch.data.js"]),
    ("🔍 Step 3: Enrich with evo and all cleaning", ["python", "club.3.clean.py"]),
]

start = time.time()

for label, command in steps:
    print(f"\n{label}")
    result = subprocess.run(command, cwd=base_dir)

    if result.returncode != 0:
        print(f"\n❌ Failed at: {label}")
        sys.exit(result.returncode)

print(f"\n✅ Club pipeline completed successfully in {round(time.time() - start, 2)} seconds!")