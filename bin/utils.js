import { spawn } from 'child_process';
import TOML from '@iarna/toml';
import fs from 'fs';
import path from 'path';
import prompts from 'prompts';
import chalk from 'chalk';

export function startAltV(response, altvPath) {
    let tomlPath = path.join(altvPath, 'altv.toml');
    var data = TOML.parse(fs.readFileSync(tomlPath));
    data.debug = response.debug;
    data.branch = response.branch;
    fs.writeFileSync(tomlPath, TOML.stringify(data));

    const args = [];
    if (response.noupdate) args.push('-noupdate');
    args.push("-skipprocesscheck");
    if (response.connecturl) {args.push('-connecturl'); args.push('altv://connect/' + response.connecturl);}
    const child = spawn(path.join(altvPath, './altv.exe'), args, {
        detached: true,
        stdio: ['ignore', 'ignore', 'ignore']
    });
    child.unref();
}

export async function getAltVPath(prevPath)
{
    let altvPath = prevPath;
	if (!fs.existsSync(altvPath)) {
		altvPath = (await prompts({
			type: 'text',
			name: 'altvpath',
			initial : '',
			message: chalk.red('- no altv.exe found, please enter alt:V path:')
		})).altvpath;
		console.log(
			chalk.cyan(
				'- altVPath: ' + altvPath +
				'.\n- It will be saved and will be used on another start up.'
			)
		);
	}
    return altvPath;
}

export async function presetPrompt(isPreset, prev) {
    const branches = { release: 0, rc: 1, dev: 2 };
    const preset = await prompts([
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

    if (isPreset) {
        Object.assign(
            preset,
            await prompts([
                {
                    type: 'text',
                    name: 'connecturl',
                    message: 'Input url that you want to connect on start',
                    hint: 'Input url',
                    initial: prev?.connecturl ?? ''
                },
                {
                    type: 'text',
                    name: 'presetname',
                    message: 'Input name for your preset',
                    hint: 'Input name',
                    initial: prev?.presetname ?? ''
                }]))
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