import re

with open('f:/Smart_Business_Dashboard/target.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Make the group headers light blue Excel style
css_header_colors = """
        .pivot-table thead tr.group-header th {
            background: #dbeafe;
            color: #1e3a8a;
            font-size: 0.75rem;
            text-transform: none;
            letter-spacing: 0;
            font-weight: 700;
        }

        .pivot-table thead tr.group-header th.store-group,
        .pivot-table thead tr.group-header th.staff-group {
            background: #dbeafe;
        }
"""

content = re.sub(r'\.pivot-table thead tr\.group-header th \{[^}]+\}', css_header_colors, content)

with open('f:/Smart_Business_Dashboard/target.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Header colors updated")
