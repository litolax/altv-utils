#!/usr/bin/env node
import chalk from 'chalk';
import prompts from 'prompts';
import resourceNameImporter from './resourceNameImporter.js';

console.log(chalk.greenBright('┌────────────────────┐'));
console.log(chalk.greenBright('│     altv-utils     │'));
console.log(chalk.greenBright('└────────────────────┘'));

const args = process.argv;

for (let i = 0; i < args.length; i++) {
	if (args[i] === 'rni') {
		resourceNameImporter();
		finish();
	}
}

async function start() {
	const response = await prompts([
		{
			type: 'select',
			name: 'util',
			message: 'Select util that you want to start',
			hint: ' ',
			choices: [{ title: 'Resource-Name-Importer', value: 'rni' }]
		}
	]);

	if (response.util === 'rni') {
		resourceNameImporter();
	}

	finish();
}

function finish() {
	console.log(chalk.greenBright('┌────────────────────┐'));
	console.log(chalk.greenBright('│      finished      │'));
	console.log(chalk.greenBright('└────────────────────┘'));

	process.exit(0);
}

start();
