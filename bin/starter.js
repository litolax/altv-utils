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
		const response = await prompts({
			type: 'text',
			name: 'altvpath',
			message: chalk.red('- no altv.exe found, please enter alt:V path:')
		});

		altvPath = response.altvpath;
		console.log(
			chalk.cyan(
				'- altVPath: ' + altvPath +
				'.\n- It will be saved and will be used on another start up.'
			)
		);
	}

	
	const response = await presetPrompt(false, prev);
	fs.writeFileSync(prevPath, JSON.stringify({ ...response, altvPath }));
	startAltV(response, altvPath);
	console.log(chalk.greenBright('| alt:V starter complete |'));
}