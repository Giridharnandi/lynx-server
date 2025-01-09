#!/usr/bin/env node
import { program } from 'commander';
import axios from 'axios';
import ora from 'ora';
import chalk from 'chalk';

program
  .name('lynx')
  .description('Lynx CLI for secure local development')
  .version('1.0.0');

program
  .command('start')
  .description('Start a secure HTTPS tunnel to your local server')
  .requiredOption('--key <key>', 'Your Lynx API key')
  .option('--port <port>', 'Local server port', '3000')
  .action(async (options) => {
    const spinner = ora('Starting HTTPS tunnel...').start();

    try {
      const response = await axios.post('http://localhost:4000/api/tunnel/start', {
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
        spinner.start('Stopping tunnel...');
        try {
          await axios.post('http://localhost:4000/api/tunnel/stop', {
            tunnelId: response.data.tunnelId
          }, {
            headers: {
              'x-api-key': options.key
            }
          });
          spinner.succeed('Tunnel stopped successfully');
          process.exit(0);
        } catch (error) {
          spinner.fail('Failed to stop tunnel');
          process.exit(1);
        }
      });
    } catch (error) {
      spinner.fail(chalk.red('Failed to start tunnel'));
      console.error('\nError:', error.response?.data?.error || error.message);
      process.exit(1);
    }
  });

program.parse();