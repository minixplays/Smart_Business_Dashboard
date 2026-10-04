import re

with open('f:/Smart_Business_Dashboard/target.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update validation
val_logic = """        function validateData(rows) {
            if (!rows.length) { toast('error','Empty File','No data rows found'); return false; }
            const keys = Object.keys(rows[0]);
            const hasCat = keys.includes('itemser_description') || keys.includes('product category');
            const hasType = keys.includes('item_type') || keys.includes('product type');
            const hasSite = keys.includes('site_descr') || keys.includes('store name');
            const hasSp = keys.includes('sp_name') || keys.includes('staff name');
            
            if (!hasCat || !hasType || !hasSite || !hasSp) {
                toast('error','Missing Columns', 'Please ensure file has required columns');
                return false;
            }
            return true;
        }"""

content = re.sub(r'        function validateData\(rows\) \{.*?return true;\n        \}', val_logic, content, flags=re.DOTALL)

# 2. Update parser mapping
map_logic = """            rawData.forEach(r => {
                const cat  = r['itemser_description'] || r['product category'] || 'Unknown';
                let type = r['item_type'] || r['product type'] || '';
                const site = r['site_descr'] || r['store name'] || '';
                const sp   = r['sp_name'] || r['staff name'] || '';"""

content = re.sub(r'            rawData\.forEach\(r => \{\n                const cat  = r\[\'itemser_description\'\] \|\| \'Unknown\';\n                let type = r\[\'item_type\'\] \|\| \'\';\n                const site = r\[\'site_descr\'\] \|\| \'\';\n                const sp   = r\[\'sp_name\'\] \|\| \'\';', map_logic, content)

with open('f:/Smart_Business_Dashboard/target.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated csv parsing")
