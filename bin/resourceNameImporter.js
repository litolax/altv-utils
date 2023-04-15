const chalk = require('chalk');
const fs = require('fs');
const TOML = require('@iarna/toml');

const rootPath = process.cwd();
const noSpecialCharactersRegex = /^[^!@#$%^&*()+\-=\[\]{};':"\\|,.<>\/?]*$/;
const noNumbersRegex = /[^0-9]/;

function start() {
	console.log(chalk.greenBright('| Resource-Name-Importer started |'));

	let tomlPath = rootPath.concat('/server.toml');
	let resourcesPath = rootPath.concat('/resources');

	if (!fs.existsSync(tomlPath)) {
		console.log(
			chalk.red(
				'- server.toml file was not found, please run this util from root server directory'
			)
		);
		process.exit(0);
	}

	if (!fs.existsSync(resourcesPath)) {
		console.log(
			chalk.red(
				'- resources folder was not found, please run this util from root server directory'
			)
		);
		process.exit(0);
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

module.exports = {
	start
};
