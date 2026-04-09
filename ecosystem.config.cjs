module.exports = {
  apps: [{
    name: 'apiaberta-pt2030',
    script: 'src/index.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    env: {
      NODE_ENV: 'production',
      PORT: 3014
    }
  }]
}
