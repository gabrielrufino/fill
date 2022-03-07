'use strict'

import child_process from 'child_process'

child_process
  .spawn('npm', ['run', 'build', '--', '--watch'])
  .stdout
  .pipe(process.stdout)
child_process
  .spawn('npm', ['link'])
  .stdout
  .pipe(process.stdout)

const close = () => {
  child_process
    .spawn('npm', ['unlink'])
    .stdout
    .pipe(process.stdout)
  process.exit()
}

process.on('SIGHUP', close)
process.on('SIGINT', close)
process.on('SIGTERM', close)
