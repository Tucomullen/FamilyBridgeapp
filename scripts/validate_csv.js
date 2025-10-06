#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const CSV_FILE = path.join(__dirname, '..', 'github_issues.csv');

console.log('🔍 Validating GitHub Issues CSV...\n');

try {
  const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
  const lines = csvContent.trim().split('\n');
  
  console.log(`📊 Total lines: ${lines.length}`);
  console.log(`📋 Expected issues: ${lines.length - 1} (excluding header)`);
  
  // Check header
  const header = lines[0];
  const expectedColumns = ['Title', 'Body', 'Labels', 'Milestone', 'Assignees'];
  const actualColumns = header.split(',');
  
  console.log('\n📝 Header validation:');
  console.log(`  Expected: ${expectedColumns.join(', ')}`);
  console.log(`  Actual:   ${actualColumns.join(', ')}`);
  
  if (actualColumns.length === expectedColumns.length) {
    console.log('  ✅ Header column count matches');
  } else {
    console.log('  ❌ Header column count mismatch');
  }
  
  // Validate each issue
  let validIssues = 0;
  let errors = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length >= 3) {
      const title = values[0].replace(/^"|"$/g, '');
      const body = values[1].replace(/^"|"$/g, '');
      const labels = values[2] ? values[2].split(',').map(l => l.trim()) : [];
      const milestone = values[3] ? values[3].replace(/^"|"$/g, '') : null;
      
      if (title && body) {
        validIssues++;
        console.log(`  ✅ Issue ${i}: "${title}" (${labels.length} labels)`);
      } else {
        errors.push(`Issue ${i}: Missing title or body`);
      }
    } else {
      errors.push(`Issue ${i}: Insufficient columns`);
    }
  }
  
  console.log(`\n📊 Validation Summary:`);
  console.log(`  ✅ Valid issues: ${validIssues}`);
  console.log(`  ❌ Errors: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n🚨 Errors found:');
    errors.forEach(error => console.log(`  - ${error}`));
  }
  
  // Check for expected labels
  const allLabels = new Set();
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length >= 3) {
      const labels = values[2] ? values[2].split(',').map(l => l.trim()) : [];
      labels.forEach(label => allLabels.add(label));
    }
  }
  
  console.log(`\n🏷️  Labels found: ${Array.from(allLabels).join(', ')}`);
  
  const expectedLabels = ['setup', 'ui', 'accessibility', 'feature', 'mvp', 'P0', 'P1'];
  const missingLabels = expectedLabels.filter(label => !allLabels.has(label));
  
  if (missingLabels.length === 0) {
    console.log('  ✅ All expected labels present');
  } else {
    console.log(`  ❌ Missing labels: ${missingLabels.join(', ')}`);
  }
  
  // Check milestones
  const milestones = new Set();
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    if (values.length >= 4) {
      const milestone = values[3] ? values[3].replace(/^"|"$/g, '') : null;
      if (milestone) milestones.add(milestone);
    }
  }
  
  console.log(`\n🎯 Milestones found: ${Array.from(milestones).join(', ')}`);
  
  if (milestones.has('Phase 1 - MVP')) {
    console.log('  ✅ Expected milestone present');
  } else {
    console.log('  ❌ Missing expected milestone: Phase 1 - MVP');
  }
  
  console.log('\n🎉 CSV validation completed!');
  
  if (validIssues === 15 && errors.length === 0) {
    console.log('✅ CSV is ready for GitHub import');
  } else {
    console.log('❌ CSV needs fixes before import');
  }
  
} catch (error) {
  console.error('❌ Error reading CSV file:', error.message);
  process.exit(1);
}
