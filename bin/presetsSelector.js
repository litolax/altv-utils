import chalk from 'chalk';
import fs from 'fs';
import prompts from 'prompts';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAltVPath, presetPrompt, startAltV } from './utils.js'
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function presetsSelector() {
	console.log(chalk.greenBright('| alt:V presets selector |'));
	const configPath = path.join(__dirname, 'presetsConfig.json');
	if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, '{}');
	let config = JSON.parse(fs.readFileSync(configPath));
	let altvPath = await getAltVPath(config.path);
	let preset;
	let isSelect;
	while (!isSelect) {
		config = JSON.parse(fs.readFileSync(configPath));
		const presets = config.presets ? config.presets.map(c => { return { title: `${c.presetname}`, value: c } }) : [];
		let menuChoices = [
			...presets, { title: 'Add', value: 'add' }];
			if(presets.length > 0) menuChoices.push({ title: 'Edit', value: 'edit' }, { title: 'Delete', value: 'delete' });
			menuChoices.push({ title: 'Exit', value: 'exit' });
		const response = await prompts([
			{
				type: 'select',
				name: 'preset',
				message: presets.length > 0 ? 'Select, add or delete preset' : 'Add preset or exit',
				hint: ' ',
				choices: menuChoices,
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

function writeConfig(configPath, altvPath, presets) {
	fs.writeFileSync(configPath, JSON.stringify({ presets, altvPath }));
}