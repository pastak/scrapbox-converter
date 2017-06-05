// Scroll the terminal to here
process.stdout.write('\x1bc')

// Render the date when the tests are run
console.log('# ' + new Date())
