const { rm, cp, mkdir, exec, echo, env } = require('shelljs');
const chalk = require('chalk');
const npm_package_version = env['npm_package_version'];

console.log(chalk.green('1. remove old coverage reports...'));
rm('-rf', 'coverage');
rm('-rf', '.nyc_output');

console.log(chalk.green('2. run test and collect new coverage...'));
exec('nyc --reporter=html npm test');


console.log(chalk.green('3. archive coverage report by version...'));
mkdir('-p', `coverage_archive/${npm_package_version}`);
cp('-r', 'coverage/*', `coverage_archive/${npm_package_version}`);

console.log(chalk.green('4. open coverage report for preview...'));
exec('npm-run-all --parallel cover:serve cover:open');
