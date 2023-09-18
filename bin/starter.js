import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { presetPrompt, startAltV } from './utils.js'
import prompts from 'prompts';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default async function starter() {
	console.log(chalk.greenBright('| alt:V starter |'));

	const prevPath = path.join(__dirname, 'last.json');
	if (!fs.existsSync(prevPath)) fs.writeFileSync(prevPath, '{}');
	const prev = JSON.parse(fs.readFileSync(prevPath));
	let altvPath = prev.altvPath;

	if (!fs.existsSync(altvPath)) {
		altvPath = await prompts({
			type: 'text',
			name: 'altvpath',
			message: chalk.red('- no altv.exe found, please enter alt:V path:')
		}).altvpath;
		console.log(
			chalk.cyan(
				'- altVPath: ' + altvPath +
				'.\n- It will be saved and will be used on another start up.'
			)
		);
	}

	const preset = await presetPrompt(false, prev);
	fs.writeFileSync(prevPath, JSON.stringify({ ...preset, altvPath }));
	startAltV(preset, altvPath);
	console.log(chalk.greenBright('| alt:V starter complete |'));
}