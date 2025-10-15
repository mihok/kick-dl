import {
	promptChannelName,
	promptContent,
	promptContentType,
	promptDownload,
} from '../utils/prompts.js';
import API from '../api/index.js';
import { formatContent } from '../helpers/index.js';
import { Downloader } from '../lib/downloader.js';

/*const handleExit = () => process.exit(0);
process.on('SIGINT', () => handleExit());
process.on('SIGTERM', () => handleExit());*/

export const initialAction = async (options = {}) => {
	try {
		// Use interactive mode if -i flag is provided or no arguments are given
		const useInteractive = options.interactive || (!options.channel && !options.type);
		
		let channel, contentType, content, confirmDownload;
		
		if (useInteractive) {
			// Interactive mode - use prompts
			channel = await promptChannelName();
			const infoChannel = await API.fetchChannel(channel);
			const { username } = infoChannel.user;
			contentType = await promptContentType(username);
			const contentList = await API.fetchContentList(channel, contentType);
			const formattedContent = formatContent(contentList, contentType);
			content = await promptContent(formattedContent, contentType);
			confirmDownload = await promptDownload(contentType, username);
		} else {
			// Command line mode - use provided arguments
			if (!options.channel) {
				throw new Error('Channel name is required. Use -c or --channel option.');
			}
			
			channel = options.channel.toLowerCase().replace(/\s+/g, '_');
			const infoChannel = await API.fetchChannel(channel);
			const { username } = infoChannel.user;
			
			if (!options.type) {
				throw new Error('Content type is required. Use -t or --type option (vod or clip).');
			}
			
			contentType = options.type.toUpperCase();
			const contentList = await API.fetchContentList(channel, contentType);
			const formattedContent = formatContent(contentList, contentType);
			
			if (options.list) {
				// List mode - show available content
				console.log(`\nAvailable ${contentType}s for ${username}:`);
				formattedContent.forEach((item, index) => {
					console.log(`${index + 1}. ${item.name}`);
					console.log(`   ${item.description}\n`);
				});
				return;
			}
			
			if (options.number) {
				const contentIndex = parseInt(options.number) - 1;
				if (contentIndex < 0 || contentIndex >= formattedContent.length) {
					throw new Error(`Invalid content number. Please choose between 1 and ${formattedContent.length}`);
				}
				content = formattedContent[contentIndex];
			} else {
				// If no number specified, show list and ask for selection
				console.log(`\nAvailable ${contentType}s for ${username}:`);
				formattedContent.forEach((item, index) => {
					console.log(`${index + 1}. ${item.name}`);
					console.log(`   ${item.description}\n`);
				});
				throw new Error('Please specify content number using -n or --number option, or use --list to see available content.');
			}
			
			confirmDownload = true; // Auto-confirm in command line mode
		}
		
		// Sanitize filename for filesystem compatibility
		const sanitizedName = content.name
			.replace(/[<>:"/\\|?*]/g, '_')  // Replace invalid characters with underscore
			.replace(/\s+/g, '_')           // Replace spaces with underscore
			.replace(/_+/g, '_')            // Replace multiple underscores with single
			.replace(/^_|_$/g, '');         // Remove leading/trailing underscores
		
		const statusDownload = await Downloader(confirmDownload, content.value, { name: sanitizedName });
		console.log(statusDownload.message);
	} catch (error) {
		if (error.name === 'ExitPromptError') {
			process.exit(0);
		}

		console.error(`Error: ${error.message}`);
		process.exit(1);
	} finally {
		//console.log('Finished');
	}
};
