#!/usr/bin/env node
import { program } from 'commander';
import axios from 'axios';
import ora from 'ora';
import chalk from 'chalk';
import http from 'http';
import httpProxy from 'http-proxy';

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
      // Create a local proxy server
      const proxy = httpProxy.createProxyServer({
        target: `http://localhost:${options.port}`,
        ws: true
      });

      // Start local server to handle requests
      const server = http.createServer((req, res) => {
        proxy.web(req, res);
      });

      server.on('upgrade', (req, socket, head) => {
        proxy.ws(req, socket, head);
      });

      // Start the local proxy server
      server.listen(0, async () => {
        const localPort = server.address().port;
        
        // Start the tunnel
        const response = await axios.post('https://lynx-seven.vercel.app/api/tunnel/start', {
          port: localPort
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
            await axios.post('https://lynx-seven.vercel.app/api/tunnel/stop', {
              tunnelId: response.data.tunnelId
            }, {
              headers: {
                'x-api-key': options.key
              }
            });
            spinner.succeed('Tunnel stopped successfully');
            server.close();
            process.exit(0);
          } catch (error) {
            spinner.fail('Failed to stop tunnel');
            process.exit(1);
          }
        });
      });
    } catch (error) {
      spinner.fail(chalk.red('Failed to start tunnel'));
      console.error('\nError:', error.response?.data?.error || error.message);
      process.exit(1);
    }
  });

program.parse();