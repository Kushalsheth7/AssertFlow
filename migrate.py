import os
import re

directory = "src/pages"

for filename in os.listdir(directory):
    if filename.endswith(".jsx"):
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # 1. Update imports
        # replace `import { getDB` with `import { getDB, initDB`
        if 'getDB' in content and 'initDB' not in content:
            content = content.replace('import { getDB', 'import { getDB, initDB')
            
        # 2. Update setDb(getDB())
        content = content.replace('setDb(getDB())', 'initDB().then(setDb)')
        
        # 3. Handle saving logic
        # For prototype speed, since we don't have individual API mappings for every complex logic,
        # we can replace saveDB(updatedDb) with a comment indicating API sync, or implement the sync.
        # Let's leave saveDB intact in imports, but we need to implement it in dataStore.js to just save to local cache.
        
        with open(filepath, 'w', encoding='utf-8') as file:
            file.write(content)

print("Migration script executed.")
