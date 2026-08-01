const { execSync } = require('child_process');
try {
    const lsTree = execSync('git ls-tree -r HEAD', { cwd: 'c:/Users/Prasad/Desktop/certicrafttt' }).toString();
    require('fs').writeFileSync('git-files.txt', lsTree);
} catch (e) {
    require('fs').writeFileSync('git-files.txt', e.toString());
}
