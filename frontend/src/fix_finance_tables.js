const fs = require('fs');
const filepath = 'd:/final mca project E commerce(confirm)/Ecommerce-Website-main - Copy/frontend/src/components/admin/FinanceManager.jsx';
let content = fs.readFileSync(filepath, 'utf8');

content = content.replace(/px-8 py-5/g, 'px-4 lg:px-6 py-4 whitespace-nowrap');
content = content.replace(/<table className="w-full text-left border-collapse">/g, '<table className="w-full min-w-[900px] text-left border-collapse">');

fs.writeFileSync(filepath, content);
console.log('FinanceManager.jsx updated via script');
