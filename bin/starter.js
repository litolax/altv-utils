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
	const prev = JSON.parse(fs.readFileSync(prevPath));
	if (!fs.existsSync(prevPath)) fs.writeFileSync(prevPath, '{}');
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
				{ name: 'Release', value: 'release' },
				{ name: 'Release Candidate', value: 'rc' },
				{ name: 'Development', value: 'dev' }
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

	console.log(chalk.greenBright('| alt:V starter complete |'));
}
