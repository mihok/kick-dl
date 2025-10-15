import { spawn } from 'child_process';
import pathToFfmpeg from 'ffmpeg-static';
import { DEFAULT_DOWNLOAD_OPTIONS } from '../config/index.js';

export const Downloader = (
	confirm = false,
	url,
	options = DEFAULT_DOWNLOAD_OPTIONS
) => {
	return new Promise((resolve, reject) => {
		if (!confirm) {
			resolve({
				status: false,
				message: 'Download canceled',
			});
		}

		console.log(`[DEBUG] Download URL: ${url}`);
		console.log(`[DEBUG] Download options:`, options);

		const args = [
			'-y',
			'-i',
			url,
			'-threads',
			'0',
			'-c',
			'copy',
			'-progress',
			'pipe:1',
			`${options.name}.mp4`,
		];

		const command = pathToFfmpeg;
		console.log(`[DEBUG] FFmpeg command: ${command} ${args.join(' ')}`);
		
		const ffmpegProcess = spawn(command, args);
		let stderrOutput = '';

		ffmpegProcess.stdout.on('data', (data) => {
			const output = data.toString();
			console.log(output);

			// TODO: Custom progress bar

			/*
			const timeMatch = output.match(/out_time=\s*(\d{2}:\d{2}:\d{2}\.\d{6})/);
 			const sizeMatch = output.match(/total_size=\s*(\d+)/);

			if (timeMatch && sizeMatch) {
   // Extraer los valores
   			const outTime = timeMatch[1];
   			const totalSize = parseInt(sizeMatch[1], 10);
			const [hours, minutes, seconds] = outTime.split(':');
			const timeInSeconds = parseInt(hours, 10) * 3600 + parseInt(minutes, 10) * 60 + parseFloat(seconds);
			const estimatedTotalSize = 52428800;
   			const estimatedTotalTime = 120;
			const progressTime = (timeInSeconds / estimatedTotalTime) * 100;
   			const progressSize = (totalSize / estimatedTotalSize) * 100;
   			console.log(`Progress (Tiempo): ${progressTime.toFixed(2)}%`);
   			console.log(`Progress (Tamaño): ${progressSize.toFixed(2)}%`);
			
 			} */
		});

		ffmpegProcess.stderr.on('data', (data) => {
			const output = data.toString();
			stderrOutput += output;
			console.log(`[FFmpeg stderr] ${output}`);
		});

		ffmpegProcess.on('close', (code) => {
			console.log(`[DEBUG] FFmpeg process exited with code: ${code}`);
			if (code !== 0) {
				reject({
					status: false,
					message: `Download failed with exit code ${code}. Error: ${stderrOutput}`,
				});
			}

			resolve({
				status: true,
				message: `Download completed: ${options.name}.mp4`,
			});
		});

		ffmpegProcess.on('error', (error) => {
			console.log(`[DEBUG] FFmpeg process error:`, error);
			reject({
				status: false,
				message: `FFmpeg process error: ${error.message}`,
			});
		});
	});
};
