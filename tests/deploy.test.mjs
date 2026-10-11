import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function command(cwd, executable, args) {
  const result = spawnSync(executable, args, { cwd, encoding: 'utf8' });
  if (result.error) throw result.error;
  return result;
}
function git(cwd, ...args) {
  const result = command(cwd, 'git', args);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}
function fixture(t, check = 'node -e "process.exit(0)"') {
  const folder = mkdtempSync(join(tmpdir(), 'blog-deploy-test-'));
  t.after(() => rmSync(folder, { recursive: true, force: true }));
  const repo = join(folder, 'blog');
  const remote = join(folder, 'remote.git');
  mkdirSync(join(repo, 'scripts'), { recursive: true });
  git(folder, 'init', '--bare', '-b', 'master', remote);
  git(repo, 'init', '-b', 'master');
  git(repo, 'config', 'user.name', 'Deploy Test');
  git(repo, 'config', 'user.email', 'test@example.invalid');
  copyFileSync(new URL('../scripts/deploy.mjs', import.meta.url), join(repo, 'scripts/deploy.mjs'));
  writeFileSync(join(repo, 'site.config.mjs'), "export default { deploy: { remote: 'origin', branch: 'master' } };\n");
  writeFileSync(join(repo, 'package.json'), JSON.stringify({ private: true, scripts: { check } }));
  writeFileSync(join(repo, '.gitignore'), 'content/private/\ncontent/drafts/\n.env\n.env.*\ndist/\n');
  writeFileSync(join(repo, 'article.md'), 'Initial article\n');
  git(repo, 'add', '.');
  git(repo, 'commit', '-m', 'Initial blog');
  git(repo, 'remote', 'add', 'origin', remote);
  git(repo, 'push', 'origin', 'master');
  const initial = git(repo, 'rev-parse', 'HEAD');
  return { folder, repo, remote, initial, deploy: (...args) => command(repo, process.execPath, ['scripts/deploy.mjs', ...args]) };
}

test('deploy commits changes and deletions, pushes normally, and excludes private files', t => {
  const { repo, remote, deploy } = fixture(t);
  rmSync(join(repo, 'article.md'));
  writeFileSync(join(repo, 'new.md'), 'New public article\n');
  mkdirSync(join(repo, 'content/private'), { recursive: true });
  mkdirSync(join(repo, 'content/drafts'), { recursive: true });
  writeFileSync(join(repo, 'content/private/secret.md'), 'Private source\n');
  writeFileSync(join(repo, 'content/drafts/draft.md'), 'Draft\n');
  writeFileSync(join(repo, '.env'), 'PRIVATE_VALUE=local\n');
  const result = deploy('--message', 'Update public notes');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git(repo, 'log', '-1', '--format=%s'), 'Update public notes');
  assert.equal(git(remote, 'rev-parse', 'master'), git(repo, 'rev-parse', 'HEAD'));
  const files = git(remote, 'ls-tree', '-r', '--name-only', 'master').split('\n');
  assert.ok(files.includes('new.md'));
  assert.ok(!files.includes('article.md'));
  assert.ok(!files.some(path => path.startsWith('content/private/') || path.startsWith('content/drafts/') || path === '.env'));
  assert.equal(readFileSync(join(repo, 'content/private/secret.md'), 'utf8'), 'Private source\n');
  const count = git(repo, 'rev-list', '--count', 'HEAD');
  assert.equal(deploy().status, 0);
  assert.equal(git(repo, 'rev-list', '--count', 'HEAD'), count, 'unchanged deploy must not make an empty commit');
});

test('dry run checks without staging, committing, or pushing', t => {
  const { repo, remote, initial, deploy } = fixture(t);
  writeFileSync(join(repo, 'article.md'), 'Changed\n');
  const before = git(repo, 'status', '--porcelain');
  const result = deploy('--dry-run');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(git(repo, 'status', '--porcelain'), before);
  assert.equal(git(repo, 'rev-parse', 'HEAD'), initial);
  assert.equal(git(remote, 'rev-parse', 'master'), initial);
});

test('failed checks stop before staging or publication', t => {
  const { repo, remote, initial, deploy } = fixture(t, 'node -e "process.exit(9)"');
  writeFileSync(join(repo, 'article.md'), 'Invalid article\n');
  const result = deploy();
  assert.notEqual(result.status, 0);
  assert.equal(git(repo, 'rev-parse', 'HEAD'), initial);
  assert.equal(git(remote, 'rev-parse', 'master'), initial);
  assert.equal(git(repo, 'diff', '--cached', '--name-only'), '');
});

test('tracked private files are refused even when force-added', t => {
  const { repo, remote, initial, deploy } = fixture(t);
  mkdirSync(join(repo, 'content/private'), { recursive: true });
  writeFileSync(join(repo, 'content/private/secret.md'), 'Never publish\n');
  git(repo, 'add', '--force', 'content/private/secret.md');
  const result = deploy();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /私密文件/);
  assert.equal(git(remote, 'rev-parse', 'master'), initial);
});

test('divergent remote history is preserved on rejected push', t => {
  const { folder, repo, remote, deploy } = fixture(t);
  const other = join(folder, 'other');
  git(folder, 'clone', remote, other);
  git(other, 'config', 'user.name', 'Other Test');
  git(other, 'config', 'user.email', 'other@example.invalid');
  writeFileSync(join(other, 'remote-note.md'), 'Remote changes\n');
  git(other, 'add', '.');
  git(other, 'commit', '-m', 'Remote changes');
  git(other, 'push', 'origin', 'master');
  const remoteHead = git(remote, 'rev-parse', 'master');
  writeFileSync(join(repo, 'article.md'), 'Local changes\n');
  const result = deploy('--message', 'Local changes');
  assert.notEqual(result.status, 0);
  assert.equal(git(remote, 'rev-parse', 'master'), remoteHead);
  assert.equal(git(repo, 'log', '-1', '--format=%s'), 'Local changes');
  assert.match(result.stderr, /本地提交已保留/);
});

test('deployment refuses a branch different from the configured target', t => {
  const { repo, remote, initial, deploy } = fixture(t);
  git(repo, 'checkout', '-b', 'draft-work');
  const result = deploy();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /部署分支/);
  assert.equal(git(remote, 'rev-parse', 'master'), initial);
});
