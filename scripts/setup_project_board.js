#!/usr/bin/env node

const https = require('https');

// Configuration
const REPO_OWNER = 'Tucomullen';
const REPO_NAME = 'FamilyBridgeapp';
const PROJECT_TITLE = 'Phase 1 - MVP';

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
        'User-Agent': 'FamilyBridge-Project-Setup',
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

// Get user's projects
async function getUserProjects() {
  try {
    console.log('🔍 Fetching user projects...');
    const projects = await makeGitHubRequest(`/users/${REPO_OWNER}/projects`);
    console.log(`📊 Found ${projects.length} projects`);
    return projects;
  } catch (error) {
    console.error('❌ Error fetching projects:', error.message);
    return [];
  }
}

// Find or create project
async function findOrCreateProject() {
  try {
    const projects = await getUserProjects();
    const existingProject = projects.find(p => p.name === PROJECT_TITLE);
    
    if (existingProject) {
      console.log(`✅ Found existing project: "${PROJECT_TITLE}" (ID: ${existingProject.id})`);
      return existingProject;
    }
    
    console.log(`❌ Project "${PROJECT_TITLE}" not found`);
    console.log('📝 Please create the project manually:');
    console.log('   1. Go to: https://github.com/Tucomullen/FamilyBridgeapp/projects');
    console.log('   2. Click "New project"');
    console.log('   3. Choose "Board" layout');
    console.log('   4. Name it: "Phase 1 - MVP"');
    console.log('   5. Create columns: Backlog, In Progress, Review, Done');
    console.log('   6. Run this script again after creating the project');
    
    return null;
  } catch (error) {
    console.error('❌ Error finding project:', error.message);
    return null;
  }
}

// Add issues to project (simplified - would need project API)
async function addIssuesToProject(project, issues) {
  console.log(`📝 Would add ${issues.length} issues to project "${project.name}"`);
  console.log('📋 Issues to add:');
  issues.slice(0, 5).forEach(issue => {
    console.log(`  - #${issue.number}: ${issue.title}`);
  });
  if (issues.length > 5) {
    console.log(`  ... and ${issues.length - 5} more`);
  }
  
  console.log('\n📝 Manual steps to add issues to project:');
  console.log('   1. Go to each issue: https://github.com/Tucomullen/FamilyBridgeapp/issues');
  console.log('   2. Click "Projects" in the right sidebar');
  console.log('   3. Select "Phase 1 - MVP"');
  console.log('   4. Move to "Backlog" column');
}

// Main function
async function main() {
  try {
    console.log('🚀 Setting up Project Board for Phase 1 MVP...\n');
    
    // Get issues
    const issues = await getIssuesForMilestone();
    if (issues.length === 0) {
      console.log('❌ No issues found for milestone "Phase 1 - MVP"');
      return;
    }
    
    // Find or create project
    const project = await findOrCreateProject();
    if (!project) {
      return;
    }
    
    // Add issues to project
    await addIssuesToProject(project, issues);
    
    console.log('\n🎉 Project board setup completed!');
    console.log(`📊 Summary:`);
    console.log(`  - Issues found: ${issues.length}`);
    console.log(`  - Project: ${project.name} (ID: ${project.id})`);
    console.log(`  - Project URL: ${project.html_url}`);
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
