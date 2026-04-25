const args = process.argv.slice(2);

if (args[0] === 'add') {
  import('./add.js').then(({ runAdd }) => runAdd(args[1])).catch(err => { console.error(err); process.exit(1); });
} else if (args[0] === 'list' || args[0] === 'skills') {
  import('./add.js').then(({ runList }) => runList()).catch(err => { console.error(err); process.exit(1); });
} else {
  import('./cli.js').then(({ run }) => run()).catch(err => { console.error(err); process.exit(1); });
}
