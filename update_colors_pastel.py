import re

with open('f:/Smart_Business_Dashboard/target.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update CSS
new_css = """        .pivot-table thead tr.group-header th {
            font-size: 0.75rem;
            text-transform: none;
            letter-spacing: 0;
            font-weight: 700;
            text-align: center;
        }

        .pivot-table thead tr.group-header th.col-cat,
        .pivot-table thead tr.group-header th.col-type {
            background: #f1f5f9;
            color: #334155;
            border-bottom: 2px solid #cbd5e1;
        }

        .pivot-table thead tr.group-header th.store-group {
            background: #fee2e2;
            color: #b91c1c;
            border-bottom: 2px solid #ef4444;
        }

        .pivot-table thead tr.group-header th.staff-group {
            background: #e0e7ff;
            color: #4338ca;
            border-bottom: 2px solid #6366f1;
        }
        
        .pivot-table thead tr.group-header th.store-achieve-group {
            background: #d1fae5;
            color: #047857;
            border-bottom: 2px solid #10b981;
        }
        
        .pivot-table thead tr.group-header th.staff-achieve-group {
            background: #ffedd5;
            color: #c2410c;
            border-bottom: 2px solid #f97316;
        }"""

# Remove old CSS block
content = re.sub(r'\.pivot-table thead tr\.group-header th \{.*?\}\s*\.pivot-table thead tr\.group-header th\.staff-group \{.*?\}', new_css, content, flags=re.DOTALL)

# 2. Update JS renderTable
js_target_store = r'<th colspan="\s*\' \+ storeCols\.length \+ \'\s*" style="background: linear-gradient[^"]+">Store Achivement</th>'
js_target_staff = r'<th colspan="\s*\' \+ staffCols\.length \+ \'\s*" style="background: linear-gradient[^"]+">Staff Achivement</th>'

content = re.sub(js_target_store, '<th colspan="\' + storeCols.length + \'" class="store-achieve-group">Store Achivement</th>', content)
content = re.sub(js_target_staff, '<th colspan="\' + staffCols.length + \'" class="staff-achieve-group">Staff Achivement</th>', content)


with open('f:/Smart_Business_Dashboard/target.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated target.html")
