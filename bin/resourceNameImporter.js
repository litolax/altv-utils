import chalk from 'chalk';
import fs from 'fs';
import TOML from '@iarna/toml';

const rootPath = process.cwd();

const noSpecialCharactersRegex = /^[^!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]*$/;
const noNumbersRegex = /[^0-9]/;

export default function resourceNameImporter() {
	console.log(chalk.greenBright('| Resource-Name-Importer started |'));

	let tomlPath = rootPath.concat('/server.toml');
	let resourcesPath = rootPath.concat('/resources');

	if (!fs.existsSync(tomlPath)) {
		console.log(
			chalk.red(
				'- server.toml file was not found, please run this util from root server directory'
			)
		);

		return;
	}

	if (!fs.existsSync(resourcesPath)) {
		console.log(
			chalk.red(
				'- resources folder was not found, please run this util from root server directory'
			)
		);

		return;
	}

	console.log(chalk.cyan('- server.toml file found'));
	console.log(chalk.cyan('- resources folder found'));

	let tomlData = TOML.parse(fs.readFileSync(tomlPath));
	let updatedResources = [];

	updatedResources = fs
		.readdirSync(resourcesPath)
		.filter(
			e =>
				noNumbersRegex.test(e[0]) &&
				noSpecialCharactersRegex.test(e) &&
				!tomlData.resources.includes(e)
		);

	console.log(
		chalk.cyan(`- successfully found ${updatedResources.length} resources`)
	);

	tomlData.resources = [...updatedResources, ...tomlData.resources];

	fs.writeFileSync(tomlPath, TOML.stringify(tomlData));

	console.log(chalk.cyan('- server.toml was successfully modifed'));
	console.log(chalk.greenBright('| Resource-Name-Importer finished |'));
}
