#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import shell from 'shelljs';
import fs from 'fs';

const sanitizeProjectName = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
};

const askQuestions = () => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'projectName',
            message: 'Enter your project name:',
            default: 'my-react-app',
        },
        {
            type: 'list',
            name: 'setupTailwindProject',
            message: 'Do you want to include Tailwind CSS?',
            choices: ['Yes', 'No'],
        },
        {
            type: 'list',
            name: 'setupTypeScript',
            message: 'Do you want to use TypeScript?',
            choices: ['Yes', 'No'],
        },
    ]);
};

const createReactApp = (projectName, template) => {
    console.log(chalk.green(`\nCreating React app ${projectName}`));
    const command = `npx create-react-app ${projectName} ${template}`;
    if (shell.exec(command).code !== 0) {
        console.log(chalk.red(`Failed to create React app.`));
        shell.exit(1);
    }
};

const removeUnnecessaryFiles = (projectName) => {

    console.log(chalk.blue(`\nRemoving unnecessary files...`));
    shell.cd(projectName);


    shell.rm('-f', 'src/App.test.js');
    shell.rm('-f', 'src/reportWebVitals.js');


    const appJsContent = `
import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <h1 className="text-4xl font-bold">Welcome to Your React App with Tailwind!</h1>
    </div>
  );
}

export default App;
    `;
    fs.writeFileSync('src/App.js', appJsContent);


    const indexCssContent = `
@tailwind base;
@tailwind components;
@tailwind utilities;
    `;
    fs.writeFileSync('src/index.css', indexCssContent);


    const indexJsContent = fs.readFileSync('src/index.js', 'utf8');
    const updatedIndexJsContent = indexJsContent
        .replace(/import\s*{.*reportWebVitals.*}\s*from\s*'.*reportWebVitals.*';\n/, '')
        .replace(/reportWebVitals\(.*\);/, ''); // Remove the call to reportWebVitals
    fs.writeFileSync('src/index.js', updatedIndexJsContent);
};

const setupTailwind = (projectName) => {
    console.log(chalk.blue(`\nSetting up Tailwind CSS...`));
    shell.cd(projectName);


    shell.exec('npm install -D tailwindcss postcss autoprefixer');
    shell.exec('npx tailwindcss init');


    const tailwindConfig = `
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
    `;
    fs.writeFileSync('tailwind.config.js', tailwindConfig);


    removeUnnecessaryFiles(projectName);
    cleanUpTemplate(projectName);

    console.log(chalk.green(`\nTailwind CSS setup complete!`));
};

const createProject = async () => {
    const answers = await askQuestions();
    let { projectName, setupTailwindProject, setupTypeScript } = answers;


    projectName = sanitizeProjectName(projectName);


    if (fs.existsSync(projectName)) {
        console.log(chalk.red(`Directory "${projectName}" already exists. Choose a different name.`));
        shell.exit(1);
    }


    const template = setupTypeScript === 'Yes' ? '--template typescript' : '';


    createReactApp(projectName, template);


    if (setupTailwindProject === 'Yes') {
        setupTailwind(projectName);
    }


    console.log(chalk.green(`\nProject "${projectName}" created successfully!`));
    console.log(`\nNext steps:\n`);
    console.log(`  cd ${projectName}`);
    console.log(`  npm start`);
};

const cleanUpTemplate = (projectName) => {
    console.log(chalk`\n{blue Cleaning up template...}`);
    shell.cd(projectName);



    const indexJsPath = 'src/index.js';
    let indexJsContent = fs.readFileSync(indexJsPath, 'utf8');


    indexJsContent = indexJsContent.replace(
        /import reportWebVitals from '.\/reportWebVitals';\n/g,
        '// import reportWebVitals from \'./reportWebVitals\';\n'
    );
    indexJsContent = indexJsContent.replace(
        /reportWebVitals\(\);/g,
        '// reportWebVitals();'
    );


    fs.writeFileSync(indexJsPath, indexJsContent);

    console.log(chalk`{green Clean-up complete!}`);
};


createProject();
