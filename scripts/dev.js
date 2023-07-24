const { spawn } = require('child_process');

spawn('npm', ['run', 'build', '--', '--watch'])
  .stdout
  .pipe(process.stdout);
spawn('npm', ['link'])
  .stdout
  .pipe(process.stdout);

const close = () => {
  spawn('npm', ['unlink'])
    .stdout
    .pipe(process.stdout)
    .on('end', process.exit);
};

process.on('SIGHUP', close);
process.on('SIGINT', close);
process.on('SIGTERM', close);
