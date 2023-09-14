import chalk from 'chalk';
import fs from 'fs';
import TOML from '@iarna/toml';
import prompts from 'prompts';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function presetsSelector() {
	console.log(chalk.greenBright('| alt:V presets selector |'));

	const configPath = path.join(__dirname, 'presetsConfig.json');
	if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, '{}');
	const config = JSON.parse(fs.readFileSync(configPath));
	let altvPath = config.altvPath;

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
			initial: branches[config.branch] ?? 0
		},
		{
			type: 'toggle',
			name: 'debug',
			message: 'Enable debug mode',
			active: 'yes',
			inactive: 'no',
			initial: config.debug ?? false
		},
        {
            type: 'text',
			name: 'connecturl',
			message: 'Input url that you want to connect on start',
			hint: 'Input url',
            initial: config.connecturl ?? ''
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
					initial: config.noupdate ?? false
				}
			])
		);
	}

	fs.writeFileSync(configPath, JSON.stringify({ ...response, altvPath }));

	let tomlPath = path.join(altvPath, './altv.toml');
	var data = TOML.parse(fs.readFileSync(tomlPath));
	data.debug = response.debug;
	data.branch = response.branch;
	fs.writeFileSync(tomlPath, TOML.stringify(data));

	const args = [];
	if (response.noupdate) args.push('-noupdate');
    let connecturl = `-connecturl altv://connect/${response.connecturl}`;
    console.log(connecturl);
    if(response.connecturl) args.push(`--connecturl altv://connect/${response.connecturl}`);

	const child = spawn(path.join(altvPath, './altv.exe'), args, {
		detached: true,
		stdio: ['ignore', 'ignore', 'ignore']
	});

	child.unref();

	console.log(chalk.greenBright('| alt:V preset selector complete |'));
}
