module.exports = {
  apps: [
    {
      name: 'commerzbank-backend',
      script: './backend/server.js',
      cwd: '/home/candi/commerzbank',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'commerzbank-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/candi/commerzbank',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        BROWSER: 'none'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        BROWSER: 'none'
      },
      watch: false,
      max_memory_restart: '1G',
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
