import os
import re

html_files = [f for f in os.listdir('.') if f.endswith('.html')]
js_files = ['sidebar.js', 'font-manager.js', 'action-logger.js']

# Match <button ...> that doesn't have type=
def repl(match):
    tag = match.group(0)
    if 'type=' not in tag:
        return tag.replace('<button', '<button type="button"', 1)
    return tag

for filename in html_files + js_files:
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = re.sub(r'<button[^>]*>', repl, content)
        
        if new_content != content:
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Fixed {filename}")

