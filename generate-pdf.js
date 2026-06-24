const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

(async () => {
  const htmlPath = path.join(__dirname, 'project-report.html');
  const pdfPath = path.join(__dirname, 'Luminedge_CRM_Report.pdf');

  // Find Edge on Windows (always pre-installed)
  const edgePaths = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  const executablePath = edgePaths.find(p => fs.existsSync(p));
  if (!executablePath) {
    console.error('Could not find Microsoft Edge. Please install it or update the path.');
    process.exit(1);
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  console.log('Loading report...');
  await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  // Hide the print bar before generating PDF
  await page.evaluate(() => {
    document.querySelectorAll('.no-print').forEach(el => el.style.display = 'none');
  });

  console.log('Generating PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '18mm', right: '16mm', bottom: '20mm', left: '16mm' },
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `
      <div style="width:100%; text-align:center; font-size:9px; color:#94a3b8; font-family:system-ui,sans-serif; padding:0 16mm;">
        <span>Luminedge CRM — Project Report</span>
        <span style="float:right;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
  });

  await browser.close();

  const stats = fs.statSync(pdfPath);
  const sizeKB = (stats.size / 1024).toFixed(1);
  console.log(`\n✅ PDF generated successfully!`);
  console.log(`   📄 ${pdfPath}`);
  console.log(`   📦 Size: ${sizeKB} KB`);
})();
