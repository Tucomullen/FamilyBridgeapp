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
        'User-Agent': 'FamilyBridge-Project-Creator',
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

// Helper function to make GraphQL requests
function makeGraphQLRequest(query) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path: '/graphql',
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'FamilyBridge-Project-Creator',
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
            reject(new Error(`GraphQL Error ${res.statusCode}: ${jsonBody.message || body}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse GraphQL response: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ query }));
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

// Try to create project using GraphQL
async function createProjectGraphQL() {
  try {
    console.log('🚀 Attempting to create project using GraphQL...');
    const result = await makeGraphQLRequest(`
      mutation {
        createProjectV2(input: {ownerId: "U_kgDODL9hFw", title: "${PROJECT_TITLE}"}) {
          projectV2 {
            id
            title
            url
          }
        }
      }
    `);
    
    if (result.data && result.data.createProjectV2 && result.data.createProjectV2.projectV2) {
      console.log('✅ Project created successfully via GraphQL!');
      return result.data.createProjectV2.projectV2;
    } else if (result.errors) {
      console.log('❌ GraphQL errors:', result.errors);
      return null;
    } else {
      console.log('❌ Unexpected GraphQL response:', result);
      return null;
    }
  } catch (error) {
    console.error('❌ GraphQL project creation failed:', error.message);
    return null;
  }
}

// Add issues to project (placeholder - would need project API)
async function addIssuesToProject(project, issues) {
  console.log(`📝 Project created: ${project.title}`);
  console.log(`🔗 Project URL: ${project.url}`);
  console.log(`📊 Issues to add: ${issues.length}`);
  
  console.log('\n📋 Issues that will be added to the project:');
  issues.slice(0, 5).forEach(issue => {
    console.log(`  - #${issue.number}: ${issue.title} (${issue.labels.map(l => l.name).join(', ')})`);
  });
  if (issues.length > 5) {
    console.log(`  ... and ${issues.length - 5} more`);
  }
  
  console.log('\n📝 Next steps to add issues to project:');
  console.log('   1. Go to the project board:', project.url);
  console.log('   2. Add issues manually or use bulk selection');
  console.log('   3. Set up columns: Backlog, In Progress, Review, Done');
  console.log('   4. Configure automation rules');
  
  return project;
}

// Main function
async function main() {
  try {
    console.log('🚀 Creating GitHub Project for Phase 1 MVP...\n');
    
    // Get issues
    const issues = await getIssuesForMilestone();
    if (issues.length === 0) {
      console.log('❌ No issues found for milestone "Phase 1 - MVP"');
      return;
    }
    
    // Try to create project
    const project = await createProjectGraphQL();
    if (!project) {
      console.log('\n❌ Project creation failed due to token permissions');
      console.log('📝 Manual steps required:');
      console.log('   1. Go to: https://github.com/Tucomullen/FamilyBridgeapp/projects');
      console.log('   2. Click "New project"');
      console.log('   3. Choose "Board" layout');
      console.log('   4. Name it: "Phase 1 - MVP"');
      console.log('   5. Create columns: Backlog, In Progress, Review, Done');
      console.log('   6. Add all issues manually');
      return;
    }
    
    // Add issues to project
    await addIssuesToProject(project, issues);
    
    console.log('\n🎉 Project setup completed!');
    console.log(`📊 Summary:`);
    console.log(`  - Project: ${project.title} (ID: ${project.id})`);
    console.log(`  - Project URL: ${project.url}`);
    console.log(`  - Issues ready: ${issues.length}`);
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
