#!/usr/bin/env node

const https = require('https');

// Configuration
const REPO_OWNER = 'Tucomullen';
const REPO_NAME = 'FamilyBridgeapp';

// GitHub API configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('❌ GITHUB_TOKEN environment variable is required');
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
        'User-Agent': 'FamilyBridge-Project-Manager',
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

// Get all issues with milestone "Phase 1 - MVP"
async function getIssuesForMilestone() {
  try {
    console.log('🔍 Fetching issues with milestone "Phase 1 - MVP"...');
    const issues = await makeGitHubRequest(`/repos/${REPO_OWNER}/${REPO_NAME}/issues?milestone=1&state=open&per_page=100`);
    console.log(`📊 Found ${issues.length} issues for milestone`);
    return issues;
  } catch (error) {
    console.error('❌ Error fetching issues:', error.message);
    return [];
  }
}

// Generate manual steps for adding issues to project
function generateManualSteps(issues) {
  console.log('\n📋 MANUAL STEPS TO ADD ISSUES TO PROJECT');
  console.log('=' .repeat(50));
  
  console.log('\n1️⃣ BULK SELECTION METHOD (Recommended):');
  console.log('   • Go to: https://github.com/Tucomullen/FamilyBridgeapp/issues?milestone=Phase%201%20-%20MVP');
  console.log('   • Check the "Select all" checkbox at the top');
  console.log('   • Click "Projects" dropdown');
  console.log('   • Select "Phase 1 - MVP"');
  console.log('   • Move all to "Backlog" column');
  
  console.log('\n2️⃣ INDIVIDUAL ISSUE METHOD:');
  issues.forEach((issue, index) => {
    const priority = issue.labels.some(l => l.name === 'P0') ? 'P0' : 'P1';
    const category = issue.labels.find(l => ['setup', 'ui', 'feature'].includes(l.name))?.name || 'unknown';
    console.log(`   ${index + 1}. #${issue.number}: ${issue.title} (${priority}, ${category})`);
    console.log(`      → https://github.com/Tucomullen/FamilyBridgeapp/issues/${issue.number}`);
    console.log(`      → Click "Projects" → "Phase 1 - MVP" → "Backlog"`);
  });
  
  console.log('\n3️⃣ PROJECT BOARD SETUP:');
  console.log('   • Go to your project board');
  console.log('   • Create columns: Backlog, In Progress, Review, Done');
  console.log('   • Set up automation rules (optional)');
  console.log('   • Configure status field (optional)');
}

// Generate project automation rules
function generateAutomationRules() {
  console.log('\n🔧 AUTOMATION RULES TO SET UP');
  console.log('=' .repeat(40));
  console.log('1. Go to project settings → Workflows');
  console.log('2. Enable "Auto-add issues to this project"');
  console.log('3. Add these rules:');
  console.log('   • When issue labeled P0 → Move to Backlog');
  console.log('   • When issue assigned → Move to In Progress');
  console.log('   • When PR opened → Move to Review');
  console.log('   • When issue closed → Move to Done');
}

// Generate project views
function generateProjectViews() {
  console.log('\n📊 SUGGESTED PROJECT VIEWS');
  console.log('=' .repeat(35));
  console.log('1. "All Issues" - Show all 15 issues');
  console.log('2. "P0 Critical" - Filter by P0 label');
  console.log('3. "P1 High" - Filter by P1 label');
  console.log('4. "Setup Tasks" - Filter by setup label');
  console.log('5. "UI/UX Work" - Filter by ui label');
  console.log('6. "Core Features" - Filter by feature label');
}

// Main function
async function main() {
  try {
    console.log('🚀 Project Board Issue Management Helper\n');
    
    // Get issues
    const issues = await getIssuesForMilestone();
    if (issues.length === 0) {
      console.log('❌ No issues found for milestone "Phase 1 - MVP"');
      return;
    }
    
    // Generate manual steps
    generateManualSteps(issues);
    
    // Generate automation rules
    generateAutomationRules();
    
    // Generate project views
    generateProjectViews();
    
    console.log('\n🎉 Project setup guide generated!');
    console.log(`📊 Summary: ${issues.length} issues ready for project board`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
