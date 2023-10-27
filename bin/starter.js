import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { getAltVPath, presetPrompt, startAltV } from './utils.js';
const dirname = "AltVStarter";
const __dirname = path.join(process.env.APPDATA, dirname);

export default async function starter() {
	console.log(chalk.greenBright('| alt:V starter |'));
	const prevPath = path.join(__dirname, 'last.json');
	if (!fs.existsSync(prevPath)) {
		fs.mkdir(__dirname, function (err) {
			if (err) {
				console.log(chalk.redBright(dirname + " directory didn't created.",), '\n', err);
			} else {
				console.log(chalk.greenBright(dirname + " directory successfully created. Path: " + __dirname));
			}
		});
		fs.writeFileSync(prevPath, '{}');
	}
	if (!fs.existsSync(prevPath)) fs.writeFileSync(prevPath, '{}');
	const prev = JSON.parse(fs.readFileSync(prevPath));
	let altvPath = await getAltVPath(prev.altvPath);
	const preset = await presetPrompt(false, prev);
	fs.writeFileSync(prevPath, JSON.stringify({ ...preset, altvPath }));
	startAltV(preset, altvPath);
	console.log(chalk.greenBright('| alt:V starter complete |'));
}