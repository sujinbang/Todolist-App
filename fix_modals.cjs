const fs = require('fs');

const files = [
  'src/components/RoutineManager.tsx',
  'src/components/ReadingLog.tsx',
  'src/components/Diary.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/className="fixed inset-0 z-50 bg-black\/60 flex justify-center items-end sm:items-center p-4"/g, 'className="fixed inset-0 z-[60] bg-black/60 flex justify-center items-end sm:items-center p-4 pb-[80px] sm:pb-4"');
  content = content.replace(/className="fixed inset-0 z-50 bg-black\/60 flex items-center justify-center p-4"/g, 'className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 pb-[80px] sm:pb-4"');
  // Also fix rounded-md to rounded-[20px] on modals
  content = content.replace(/className="w-full max-w-sm bg-white border border-neutral-100 rounded-md shadow-sm overflow-hidden relative"/g, 'className="w-full max-w-sm bg-white border border-neutral-100 rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden relative"');
  content = content.replace(/className="bg-white rounded-md max-w-sm w-full p-5 shadow-sm border border-neutral-100 space-y-4"/g, 'className="bg-white rounded-[20px] max-w-sm w-full p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-neutral-100 space-y-4"');
  content = content.replace(/className="bg-white rounded-md max-w-lg w-full p-5 shadow-sm border border-neutral-100 space-y-4"/g, 'className="bg-white rounded-[20px] max-w-lg w-full p-6 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-neutral-100 space-y-4"');
  
  fs.writeFileSync(file, content, 'utf8');
});
console.log("Modals fixed");
