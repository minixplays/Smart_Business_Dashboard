import re

with open('f:/Smart_Business_Dashboard/target.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('\\n        /* ── Achievement Cards', '\n        /* ── Achievement Cards')

with open('f:/Smart_Business_Dashboard/target.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Syntax fixed")
