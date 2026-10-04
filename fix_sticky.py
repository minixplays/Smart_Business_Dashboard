import re

with open('f:/Smart_Business_Dashboard/target.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the sticky overlap
css_fix = """
        /* Header */
        .pivot-table thead th {
            background: #f3f4f6;
            color: #1f2937;
            font-weight: 700;
            font-size: 0.75rem;
            padding: 0.6rem 0.75rem;
            border: 1px solid #d1d5db;
            text-align: center;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        .pivot-table thead tr:nth-child(2) th {
            top: 31px;
        }
"""

content = re.sub(r'/\* Header \*/\s*\.pivot-table thead th \{[^}]+\}', css_fix, content)

with open('f:/Smart_Business_Dashboard/target.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("CSS sticky fixed")
