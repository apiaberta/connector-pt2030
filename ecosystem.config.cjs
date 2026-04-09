module.exports = {
  apps: [{
    name: 'apiaberta-pt2030',
    script: 'src/index.js',
    cwd: '/data/apiaberta/connector-pt2030',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3014
    }
  }]
};
