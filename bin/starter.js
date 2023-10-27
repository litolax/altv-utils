import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { getAltVPath, presetPrompt, startAltV, _dirname, ensureDirectoryExists } from './utils.js';
const __dirname = path.join(process.env.APPDATA, _dirname);

export default async function starter() {
	console.log(chalk.greenBright('| alt:V starter |'));
	const prevPath = path.join(__dirname, 'last.json');
	ensureDirectoryExists();
	if (!fs.existsSync(prevPath)) fs.writeFileSync(prevPath, '{}');
	const prev = JSON.parse(fs.readFileSync(prevPath));
	let altvPath = await getAltVPath(prev.altvPath);
	const preset = await presetPrompt(false, prev);
	fs.writeFileSync(prevPath, JSON.stringify({ ...preset, altvPath }));
	startAltV(preset, altvPath);
	console.log(chalk.greenBright('| alt:V starter complete |'));
}