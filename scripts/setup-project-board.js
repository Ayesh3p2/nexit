#!/usr/bin/env node

const { Octokit } = require('@octokit/rest');
const { createAppAuth } = require('@octokit/auth-app');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// GitHub configuration
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'your-username';
const GITHUB_REPO = process.env.GITHUB_REPO || 'nexit-itsm';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('Error: GITHUB_TOKEN environment variable is not set');
  process.exit(1);
}

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

// Project board details
const PROJECT_NAME = 'NexIT ITSM Development';
const PROJECT_DESCRIPTION = 'Project board for tracking development of NexIT ITSM platform';

// Columns for the project board
const COLUMNS = [
  { name: 'Backlog', position: 1 },
  { name: 'To Do', position: 2 },
  { name: 'In Progress', position: 3 },
  { name: 'In Review', position: 4 },
  { name: 'Done', position: 5 },
];

// Initial tasks for the project
const INITIAL_TASKS = [
  {
    title: 'Set up development environment',
    body: 'Set up local development environment with all required dependencies',
    column: 'Done',
    labels: ['setup', 'documentation'],
  },
  {
    title: 'Implement user authentication',
    body: 'Set up JWT authentication with refresh tokens',
    column: 'Done',
    labels: ['authentication', 'backend'],
  },
  {
    title: 'Implement user management',
    body: 'Create CRUD operations for user management with role-based access control',
    column: 'Done',
    labels: ['users', 'backend'],
  },
  {
    title: 'Set up CI/CD pipeline',
    body: 'Configure GitHub Actions for automated testing and deployment',
    column: 'To Do',
    labels: ['devops', 'ci/cd'],
  },
  {
    title: 'Implement incident management',
    body: 'Create incident management module with ticket creation and tracking',
    column: 'To Do',
    labels: ['incidents', 'core'],
  },
  {
    title: 'Set up monitoring and logging',
    body: 'Configure application monitoring and centralized logging',
    column: 'To Do',
    labels: ['devops', 'monitoring'],
  },
];

async function createProject() {
  try {
    console.log('Creating GitHub project...');
    
    // Create project
    const { data: project } = await octokit.projects.createForRepo({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      name: PROJECT_NAME,
      body: PROJECT_DESCRIPTION,
    });
    
    console.log(`Created project: ${project.html_url}`);
    
    // Create columns
    const columns = {};
    for (const column of COLUMNS) {
      const { data: newColumn } = await octokit.projects.createColumn({
        project_id: project.id,
        name: column.name,
      });
      columns[column.name] = newColumn;
      console.log(`Created column: ${newColumn.name}`);
    }
    
    // Create issues and add to columns
    for (const task of INITIAL_TASKS) {
      const { data: issue } = await octokit.issues.create({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        title: task.title,
        body: task.body,
        labels: task.labels,
      });
      
      await octokit.projects.createCard({
        column_id: columns[task.column].id,
        content_id: issue.id,
        content_type: 'Issue',
      });
      
      console.log(`Created issue: ${issue.title} (${task.column})`);
    }
    
    console.log('Project board setup complete!');
    console.log(`Project URL: ${project.html_url}`);
    
  } catch (error) {
    console.error('Error setting up project board:', error);
    process.exit(1);
  }
}

createProject();
