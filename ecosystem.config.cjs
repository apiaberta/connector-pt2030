module.exports = {
  apps: [
    {
      name: 'apiaberta-prr',
      script: 'src/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3014,
      },
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000
    }
  ]
}
