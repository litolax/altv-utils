import chalk from 'chalk';
import fs from 'fs';
import prompts from 'prompts';
import path from 'path';
import { fileURLToPath } from 'url';
import { startAltV } from './starter.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function presetsSelector() {
	console.log(chalk.greenBright('| alt:V presets selector |'));

	const configPath = path.join(__dirname, 'presetsConfig.json');
	if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, '{}');
	let config = JSON.parse(fs.readFileSync(configPath));
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

	let preset;
	let isSelect;
	while (!isSelect) {
		config = JSON.parse(fs.readFileSync(configPath));
		const presets = config.presets ? config.presets.map(c => { return { title: `${c.presetname}`, value: c } }) : [];

		const response = await prompts([
			{
				type: 'select',
				name: 'preset',
				message: 'Select, add or delete preset',
				hint: ' ',
				choices: [
					...presets,
					{ title: 'Add', value: 'add' },
					{ title: 'Edit', value: 'edit'},
					{ title: 'Delete', value: 'delete' },
					{ title: 'Exit', value: 'exit' }
				],
				initial: 0
			}
		])
		switch (response.preset) {
			case 'add':
				{
					let p = await presetPrompt(true);
					if (!config.presets) config.presets = [];
					config.presets.push(p);
					writeConfig(configPath, altvPath, config.presets)
					break;
				}
			case 'delete':
				{
					const deleteResponse = await prompts([
						{
							type: 'select',
							name: 'delete',
							message: 'Select preset to delete',
							hint: 'Preset to delete',
							choices: presets,
						}
					]);
					config.presets = config.presets.filter(p => p !== deleteResponse.delete);
					writeConfig(configPath, altvPath, config.presets)
					break;
				}
			case 'edit':
				{
					const editResponse = await prompts([
						{
							type: 'select',
							name: 'edit',
							message: 'Select preset to edit',
							hint: 'Preset to edit',
							choices: presets,
						}
					]);
					let i = config.presets.indexOf(editResponse.edit);
					config.presets[i] = await presetPrompt(true, editResponse.edit);
					writeConfig(configPath, altvPath, config.presets)
					break;
				}
			case 'exit': return;
			default: {
				preset = response.preset;
				isSelect = true;
				break;
			}
		}
	}

	startAltV(preset, altvPath)
	console.log(chalk.greenBright('| alt:V preset selector complete |'));
}

async function presetPrompt(isUrl, prev) {
	const branches = { release: 0, rc: 1, dev: 2 };
	const preset = await prompts([
		{
			type: 'text',
			name: 'presetname',
			message: 'Input name for your preset',
			hint: 'Input name',
			initial: prev?.presetname ?? ''
		},
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
			initial: branches[prev?.branch] ?? 0
		},
		{
			type: 'toggle',
			name: 'debug',
			message: 'Enable debug mode',
			active: 'yes',
			inactive: 'no',
			initial: prev?.debug ?? false
		}
	]);

	if (isUrl) {
		Object.assign(
			preset,
			await prompts([
				{
					type: 'text',
					name: 'connecturl',
					message: 'Input url that you want to connect on start',
					hint: 'Input url',
					initial: prev?.connecturl ?? ''
				},]))
	};

	if (preset.debug) {
		Object.assign(
			preset,
			await prompts([
				{
					type: 'toggle',
					name: 'noupdate',
					message: 'Disable update',
					hint: '-noupdate flag',
					active: 'yes',
					inactive: 'no',
					initial: prev?.noupdate ?? false
				}
			])
		);
	}
	return preset;
}

function writeConfig(configPath, altvPath, presets) {
	fs.writeFileSync(configPath, JSON.stringify({ presets, altvPath }));
}