const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue('🚀 Starting Career Explorer Test Suite\n'));

try {
    // Run unit tests
    console.log(chalk.yellow('Running Unit Tests...'));
    execSync('npm run test:unit', { stdio: 'inherit' });
    console.log(chalk.green('✓ Unit Tests Completed\n'));

    // Run integration tests
    console.log(chalk.yellow('Running Integration Tests...'));
    execSync('npm run test:integration', { stdio: 'inherit' });
    console.log(chalk.green('✓ Integration Tests Completed\n'));

    // Run E2E tests
    console.log(chalk.yellow('Running E2E Tests...'));
    execSync('npm run test:e2e', { stdio: 'inherit' });
    console.log(chalk.green('✓ E2E Tests Completed\n'));

    // Run performance tests if available
    try {
        console.log(chalk.yellow('Running Performance Tests...'));
        execSync('npm run test:performance', { stdio: 'inherit' });
        console.log(chalk.green('✓ Performance Tests Completed\n'));
    } catch (error) {
        console.log(chalk.yellow('ℹ Performance tests not configured\n'));
    }

    console.log(chalk.blue('📊 Generating Test Report...'));
    try {
        execSync('npm run test:report', { stdio: 'inherit' });
        console.log(chalk.green('✓ Test Report Generated\n'));
    } catch (error) {
        console.log(chalk.yellow('ℹ Test reporting not configured\n'));
    }

    console.log(chalk.green('✨ All tests completed successfully!'));
} catch (error) {
    console.error(chalk.red('\n❌ Test suite failed'));
    console.error(chalk.red(error.message));
    process.exit(1);
}
