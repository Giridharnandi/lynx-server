import axios from 'axios';
import ora from 'ora';
import chalk from 'chalk';

export async function startTunnel(options) {
  const spinner = ora('Starting HTTPS tunnel...').start();

  try {
    const response = await axios.post('http://lynx-seven.vercel.app/api/tunnel/start', {
      port: options.port
    }, {
      headers: {
        'x-api-key': options.key
      }
    });

    spinner.succeed(chalk.green('HTTPS tunnel started successfully!'));
    console.log('\nYour secure HTTPS URL:');
    console.log(chalk.blue(response.data.url));
    console.log('\nTunnel ID:', response.data.tunnelId);
    console.log('\nPress Ctrl+C to stop the tunnel');

    // Handle cleanup on exit
    process.on('SIGINT', async () => {
      await stopTunnel(response.data.tunnelId, options.key, spinner);
    });
  } catch (error) {
    spinner.fail(chalk.red('Failed to start tunnel'));
    console.error('\nError:', error.response?.data?.error || error.message);
    process.exit(1);
  }
}

async function stopTunnel(tunnelId, apiKey, spinner) {
  spinner.start('Stopping tunnel...');
  try {
    await axios.post('http://lynx-seven.vercel.app/api/tunnel/stop', {
      tunnelId
    }, {
      headers: {
        'x-api-key': apiKey
      }
    });
    spinner.succeed('Tunnel stopped successfully');
    process.exit(0);
  } catch (error) {
    spinner.fail('Failed to stop tunnel');
    process.exit(1);
  }
}
