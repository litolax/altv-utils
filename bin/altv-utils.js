const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const prompts = require('prompts');

const resourceNameImporter = require('./resourceNameImporter.js');

const args = process.argv;

for (let i = 0; i < args.length; i++) {
	if (args[i] === 'rni') {
		resourceNameImporter.start();
		return;
	}
}

(async () => {
	console.log(chalk.greenBright('┌────────────────────┐'));
	console.log(chalk.greenBright('│     altv-utils     │'));
	console.log(chalk.greenBright('└────────────────────┘'));

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
		resourceNameImporter.start();
	}

	console.log(chalk.greenBright('┌────────────────────┐'));
	console.log(chalk.greenBright('│      finished      │'));
	console.log(chalk.greenBright('└────────────────────┘'));
})();
