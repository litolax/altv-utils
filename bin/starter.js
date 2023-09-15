import chalk from 'chalk';
import fs from 'fs';
import TOML from '@iarna/toml';
import prompts from 'prompts';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function starter() {
	console.log(chalk.greenBright('| alt:V starter |'));

	const prevPath = path.join(__dirname, 'last.json');
	if (!fs.existsSync(prevPath)) fs.writeFileSync(prevPath, '{}');
	const prev = JSON.parse(fs.readFileSync(prevPath));
	let altvPath = prev.altvPath;

	if (!fs.existsSync(altvPath)) {
		const response = await prompts({
			type: 'text',
			name: 'altvpath',
			message: chalk.red('- no altv.exe found, please enter alt:V path:')
		});

		altvPath = response.altvpath;
		console.log(
			chalk.cyan(
				'- altVPath: ' +
					altvPath +
					'.\n- It will be saved and will be used on another start up.'
			)
		);
	}

	const branches = { release: 0, rc: 1, dev: 2 };
	const response = await prompts([
		{
			type: 'select',
			name: 'branch',
			message: 'Select branch',
			hint: ' ',
			choices: [
				{ title: 'Release', value: 'release' },
				{ title: 'Release Candidate', value: 'rc' },
				{ title: 'Development', value: 'dev' }
			],
			initial: branches[prev.branch] ?? 0
		},
		{
			type: 'toggle',
			name: 'debug',
			message: 'Enable debug mode',
			active: 'yes',
			inactive: 'no',
			initial: prev.debug ?? false
		}
	]);

	if (response.debug) {
		Object.assign(
			response,
			await prompts([
				{
					type: 'toggle',
					name: 'noupdate',
					message: 'Disable update',
					hint: '-noupdate flag',
					active: 'yes',
					inactive: 'no',
					initial: prev.noupdate ?? false
				}
			])
		);
	}

	fs.writeFileSync(prevPath, JSON.stringify({ ...response, altvPath }));
	startAltV(prevPath, response, altvPath);
	console.log(chalk.greenBright('| alt:V starter complete |'));
}

export default function startAltV(configPath, response, altvPath)
 {
	fs.writeFileSync(configPath, JSON.stringify({ ...response, altvPath }));

	let tomlPath = path.join(altvPath, './altv.toml');
	var data = TOML.parse(fs.readFileSync(tomlPath));
	data.debug = response.debug;
	data.branch = response.branch;
	fs.writeFileSync(tomlPath, TOML.stringify(data));

	const args = [];
	if (response.noupdate) args.push('-noupdate');

	const child = spawn(path.join(altvPath, './altv.exe'), args, {
		detached: true,
		stdio: ['ignore', 'ignore', 'ignore']
	});

	child.unref();
 }