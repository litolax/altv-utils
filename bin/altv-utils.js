#!/usr/bin/env node
import chalk from 'chalk';
import prompts from 'prompts';
import resourceNameImporter from './resourceNameImporter.js';
import starter from './starter.js';
import resourceCreator from './resourceCreator.js';
import presetsSelector from './presetsSelector.js';

console.log(chalk.greenBright('┌────────────────────┐'));
console.log(chalk.greenBright('│     altv-utils     │'));
console.log(chalk.greenBright('└────────────────────┘'));

const args = process.argv;

async function start() {
	for (let i = 0; i < args.length; i++) {
		switch (args[i]) {
			case 'rni': {
				resourceNameImporter();
				break;
			}

			case 'starter': {
				await starter();
				finish();
				break;
			}

			case 'rc': {
				await resourceCreator();
				finish();
				break;
			}

			case 'ps': {
				await presetsSelector(args[i+1]);
				finish();
				break;
			}
			default: continue;
		}
	}

	const response = await prompts([
		{
			type: 'select',
			name: 'util',
			message: 'Select util that you want to start',
			hint: ' ',
			choices: [
				{
					title: 'Resource-Name-Importer',
					value: 'rni'
				},
				{
					title: 'alt:V Starter',
					value: 'starter'
				},
				{
					title: 'Resource-Creator',
					value: 'rc'
				},
				{
					title: 'Presets-Selector ',
					value: 'ps'
				}
			]
		}
	]);

	switch (response.util) {
		case 'rni': {
			resourceNameImporter();
			break;
		}
		case 'starter': {
			await starter();
			break;
		}
		case 'rc': {
			await resourceCreator();
			break;
		}
		case 'ps': {
			await presetsSelector();
			break;
		}
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