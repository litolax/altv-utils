import chalk from 'chalk';
import fs from 'fs-extra';
import prompts from 'prompts';
import axios from 'axios';
import path from 'path';

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

	let installationPath = rootPath;

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

			console.log(chalk.cyan('JS resource files was successfully downloaded'));
			break;
		}
		case 'ts': {
			files = await getTsResourceFiles();
			if (!files) return;

			console.log(chalk.cyan('TS resource files was successfully downloaded'));
			break;
		}
		default: {
			console.log(chalk.yellow('This is not implemented yet'));
			break;
		}
	}

	files.forEach(file => {
		for (const [key, value] of Object.entries(file)) {
			fs.outputFileSync(path.join(installationPath, key), value);
		}
	});

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

const getTsResourceFiles = async () => {
	let files = [];

	await axios
		.all([
			axios.get(
				'https://raw.githubusercontent.com/xxshady/altv-xts-boilerplate/main/src/resource.toml'
			),
			axios.get(
				'https://raw.githubusercontent.com/xxshady/altv-xts-boilerplate/main/src/server/main.ts'
			),
			axios.get(
				'https://raw.githubusercontent.com/xxshady/altv-xts-boilerplate/main/src/server/tsconfig.json'
			),
			axios.get(
				'https://raw.githubusercontent.com/xxshady/altv-xts-boilerplate/main/src/client/main.ts'
			),
			axios.get(
				'https://raw.githubusercontent.com/xxshady/altv-xts-boilerplate/main/src/client/tsconfig.json'
			),
			axios.get(
				'https://raw.githubusercontent.com/xxshady/altv-xts-boilerplate/main/src/shared/main.ts'
			),
			axios.get(
				'https://github.com/xxshady/altv-xts-boilerplate/blob/main/src/shared/tsconfig.json'
			)
		])
		.then(
			axios.spread(
				(
					response1,
					response2,
					response3,
					response4,
					response5,
					response6,
					response7
				) => {
					files.push({ 'resource.toml': response1.data });
					files.push({ 'server/main.ts': response2.data });
					files.push({ 'server/tsconfig.json': response3.data });
					files.push({ 'client/main.ts': response4.data });
					files.push({ 'client/tsconfig.json': response5.data });
					files.push({ 'shared/main.ts': response6.data });
					files.push({ 'shared/tsconfig.json': response7.data });
				}
			)
		)
		.catch(error => {
			console.log(chalk.red(error));
		});

	return files;
};
