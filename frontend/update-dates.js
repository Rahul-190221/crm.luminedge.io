const fs = require('fs');
const files = [
  'c:/CRM/frontend/components/student/pages/StudentAppointments.tsx',
  'c:/CRM/frontend/components/leads/QuickAddLeadModal.tsx',
  'c:/CRM/frontend/components/leads/LeadDetail.tsx',
  'c:/CRM/frontend/components/leads/InputLead.tsx',
  'c:/CRM/frontend/components/dashboard/FollowUpPage.tsx',
  'c:/CRM/frontend/components/admin/AppointmentsAdmin.tsx',
  'c:/CRM/frontend/components/admin/MockTest.tsx',
  'c:/CRM/frontend/components/admin/AddExamModal.tsx',
  'c:/CRM/frontend/app/bdm/dashboard/leads/[id]/page.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let content = fs.readFileSync(f, 'utf8');
  
  // Replace type="datetime-local"
  content = content.replace(/type="datetime-local"/g, 'type="datetime-local" min={new Date().toISOString().slice(0, 16)}');
  
  // Replace type="date"
  content = content.replace(/type="date"/g, 'type="date" min={new Date().toISOString().split(\'T\')[0]}');
  
  fs.writeFileSync(f, content);
});
console.log('Updated date inputs');
