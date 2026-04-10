process.chdir(__dirname);
require('child_process').spawn(
  '/opt/homebrew/bin/node',
  ['./node_modules/vite/bin/vite.js', ...process.argv.slice(2)],
  { stdio: 'inherit', cwd: __dirname, env: { ...process.env, PATH: '/opt/homebrew/bin:' + process.env.PATH } }
);
