#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const REPO_OWNER = 'Tucomullen';
const REPO_NAME = 'FamilyBridgeapp';
const CSV_FILE = path.join(__dirname, '..', 'github_issues.csv');

// GitHub API configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API_BASE = 'https://api.github.com';

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
  console.log('Please set your GitHub token: export GITHUB_TOKEN=your_token_here');
  process.exit(1);
}

// Helper function to make GitHub API requests
function makeGitHubRequest(endpoint, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'FamilyBridge-Import-Script',
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(jsonBody);
          } else {
            reject(new Error(`GitHub API Error ${res.statusCode}: ${jsonBody.message || body}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Parse CSV file
function parseCSV(csvContent) {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  const issues = [];

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
      const issue = {
        title: values[0].replace(/^"|"$/g, ''),
        body: values[1].replace(/^"|"$/g, ''),
        labels: values[2] ? values[2].split(',').map(l => l.trim()) : [],
        milestone: values[3] ? values[3].replace(/^"|"$/g, '') : null,
        assignees: values[4] ? values[4].split(',').map(a => a.trim()).filter(a => a) : []
      };
      issues.push(issue);
    }
  }
  
  return issues;
}

// Create milestone if it doesn't exist
async function ensureMilestone(milestoneName) {
  try {
    console.log(`🔍 Checking if milestone "${milestoneName}" exists...`);
    const milestones = await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/milestones`);
    const existingMilestone = milestones.find(m => m.title === milestoneName);
    
    if (existingMilestone) {
      console.log(`✅ Milestone "${milestoneName}" already exists (ID: ${existingMilestone.number})`);
      return existingMilestone.number;
    }
    
    console.log(`📝 Creating milestone "${milestoneName}"...`);
    const newMilestone = await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/milestones`, 'POST', {
      title: milestoneName,
      state: 'open',
      description: `Milestone for ${milestoneName} development phase`
    });
    
    console.log(`✅ Created milestone "${milestoneName}" (ID: ${newMilestone.number})`);
    return newMilestone.number;
  } catch (error) {
    console.error(`❌ Error managing milestone: ${error.message}`);
    return null;
  }
}

// Create labels if they don't exist
async function ensureLabels(labels) {
  const labelColors = {
    'setup': '0e8a16',
    'ui': '7057ff',
    'accessibility': '28a745',
    'feature': '0052cc',
    'mvp': 'd73a4a',
    'P0': 'd73a4a',
    'P1': 'ff8c00',
    'P2': 'ffd33d'
  };

  for (const label of labels) {
    if (!label) continue;
    
    try {
      console.log(`🔍 Checking if label "${label}" exists...`);
      await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/labels/${encodeURIComponent(label)}`);
      console.log(`✅ Label "${label}" already exists`);
    } catch (error) {
      if (error.message.includes('404')) {
        console.log(`📝 Creating label "${label}"...`);
        try {
          await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/labels`, 'POST', {
            name: label,
            color: labelColors[label] || 'ffffff',
            description: `Label for ${label}`
          });
          console.log(`✅ Created label "${label}"`);
        } catch (createError) {
          console.error(`❌ Error creating label "${label}": ${createError.message}`);
        }
      } else {
        console.error(`❌ Error checking label "${label}": ${error.message}`);
      }
    }
  }
}

// Create issue
async function createIssue(issue, milestoneNumber) {
  try {
    const issueData = {
      title: issue.title,
      body: issue.body,
      labels: issue.labels,
      assignees: issue.assignees
    };
    
    if (milestoneNumber) {
      issueData.milestone = milestoneNumber;
    }
    
    console.log(`📝 Creating issue: "${issue.title}"`);
    const createdIssue = await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/issues`, 'POST', issueData);
    console.log(`✅ Created issue #${createdIssue.number}: "${issue.title}"`);
    return createdIssue;
  } catch (error) {
    console.error(`❌ Error creating issue "${issue.title}": ${error.message}`);
    return null;
  }
}

// Main function
async function main() {
  try {
    console.log('🚀 Starting GitHub Issues Import...');
    console.log(`📁 Reading CSV file: ${CSV_FILE}`);
    
    // Read and parse CSV
    const csvContent = fs.readFileSync(CSV_FILE, 'utf8');
    const issues = parseCSV(csvContent);
    
    console.log(`📊 Found ${issues.length} issues to import`);
    
    // Get all unique labels
    const allLabels = [...new Set(issues.flatMap(issue => issue.labels))];
    console.log(`🏷️  Labels to ensure: ${allLabels.join(', ')}`);
    
    // Get unique milestones
    const milestones = [...new Set(issues.map(issue => issue.milestone).filter(Boolean))];
    console.log(`🎯 Milestones to ensure: ${milestones.join(', ')}`);
    
    // Ensure labels exist
    await ensureLabels(allLabels);
    
    // Ensure milestones exist
    const milestoneNumbers = {};
    for (const milestone of milestones) {
      milestoneNumbers[milestone] = await ensureMilestone(milestone);
    }
    
    // Create issues
    console.log('\n📝 Creating issues...');
    const createdIssues = [];
    
    for (const issue of issues) {
      const milestoneNumber = issue.milestone ? milestoneNumbers[issue.milestone] : null;
      const createdIssue = await createIssue(issue, milestoneNumber);
      if (createdIssue) {
        createdIssues.push(createdIssue);
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎉 Import completed!');
    console.log(`✅ Successfully created ${createdIssues.length} issues`);
    console.log('\n📋 First 5 created issues:');
    createdIssues.slice(0, 5).forEach(issue => {
      console.log(`  - #${issue.number}: ${issue.title}`);
    });
    
    if (createdIssues.length > 5) {
      console.log(`  ... and ${createdIssues.length - 5} more`);
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
