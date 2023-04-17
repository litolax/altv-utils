import chalk from 'chalk';
import fs from 'fs';
import prompts from 'prompts';
import axios from 'axios';

const rootPath = process.cwd();

export default async function resourceCreator() {
	console.log(chalk.greenBright('| Resource-Creator started |'));

	const response = await prompts([
		{
			type: 'select',
			name: 'type',
			message: 'Select type of new resource',
			choices: [
				{ title: 'Js', value: 'js' },
				{ title: 'Ts', value: 'ts' },
				{ title: 'Dlc', value: 'dlc' },
				{ title: 'Rpf', value: 'rpf' }
			]
		},
		{
			type: 'toggle',
			name: 'installHere',
			message: 'Do you want to install new resource in: ' + rootPath,
			active: 'yes',
			inactive: 'no'
		}
	]);

	let resourceType = response.type;
	if (!resourceType) return;

	let installationPath;

	if (!response.installHere) {
		const response = await prompts({
			type: 'text',
			name: 'installationPath',
			message: 'Please enter path where new resource will be installed:'
		});

		installationPath = response.installationPath;
		if (!installationPath) return;
	}

	let files;

	switch (resourceType) {
		case 'js': {
			files = await getJsResourceFiles();
			if (!files) return;

			files.forEach(file => {
				for (const [key, value] of Object.entries(file)) {
					createDirectoriesByPath(`./${key}`);
					fs.appendFileSync(`./${key}`, value);
				}
			});

			//todo path + log
		}

		//todo implement other types
	}

	console.log(chalk.greenBright('| Resource-Creator finished |'));
}

const getJsResourceFiles = async () => {
	let files = [];

	await axios
		.all([
			axios.get(
				'https://raw.githubusercontent.com/xxshady/altv-simple-js/main/resources/js/resource.toml'
			),
			axios.get(
				'https://raw.githubusercontent.com/xxshady/altv-simple-js/main/resources/js/server/main.js'
			),
			axios.get(
				'https://raw.githubusercontent.com/xxshady/altv-simple-js/main/resources/js/client/main.js'
			),
			axios.get(
				'https://raw.githubusercontent.com/xxshady/altv-simple-js/main/resources/js/client/ui/index.html'
			)
		])
		.then(
			axios.spread((response1, response2, response3, response4) => {
				files.push({ 'resource.toml': response1.data });
				files.push({ 'server/main.js': response2.data });
				files.push({ 'client/main.js': response3.data });
				files.push({ 'client/ui/index.html': response4.data });
			})
		)
		.catch(error => {
			console.log(chalk.red(error));
		});

	return files;
};

const createDirectoriesByPath = path => {
	const dirs = path.split('/').slice(0, -1);
	dirs.reduce((parentDir, currentDir) => {
		const newDir = `${parentDir}/${currentDir}`;
		if (!fs.existsSync(newDir)) {
			fs.mkdirSync(newDir);
		}
		return newDir;
	}, '.');
};
