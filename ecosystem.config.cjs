/* global __dirname */
module.exports = {
  apps: [
    {
      name: 'hm-os-tailscaled',
      script: 'scripts/start-tailscaled.sh',
      interpreter: '/usr/bin/bash',
      cwd: __dirname,
      autorestart: true,
      restart_delay: 3000,
      max_restarts: 20,
      out_file: '/opt/data/logs/hm-os/tailscaled.out.log',
      error_file: '/opt/data/logs/hm-os/tailscaled.err.log',
    },
    {
      name: 'hm-os-api',
      script: 'scripts/start-hm-os.sh',
      interpreter: '/usr/bin/bash',
      cwd: __dirname,
      autorestart: true,
      restart_delay: 2000,
      max_restarts: 20,
      out_file: '/opt/data/logs/hm-os/api.out.log',
      error_file: '/opt/data/logs/hm-os/api.err.log',
      env: { NODE_ENV: 'production' },
    },
  ],
};
