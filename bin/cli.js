#!/usr/bin/env node

import { Command } from 'commander';
import { initialAction } from '../src/actions/start.js';

const program = new Command();

program
	.name('kick-dl')
	.version('2.0.0')
	.description(
		'CLI tool for easily downloading VODs and Clips from kick.com'
	)
	.option('-c, --channel <channel>', 'Channel name to download from')
	.option('-t, --type <type>', 'Content type: vod or clip', /^(vod|clip)$/i)
	.option('-i, --interactive', 'Use interactive mode')
	.option('-n, --number <number>', 'Content number to download (1-based index)')
	.option('--list', 'List available content without downloading')
	.action(async (options) => {
		await initialAction(options);
	});

program.command('start')
	.option('-c, --channel <channel>', 'Channel name to download from')
	.option('-t, --type <type>', 'Content type: vod or clip', /^(vod|clip)$/i)
	.option('-i, --interactive', 'Use interactive mode')
	.option('-n, --number <number>', 'Content number to download (1-based index)')
	.option('--list', 'List available content without downloading')
	.action(async (options) => {
		await initialAction(options);
	});

program.parse(process.argv);
