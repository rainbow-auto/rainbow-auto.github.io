import { spawnSync } from 'node:child_process';
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import config from '../site.config.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = process.argv.slice(2);
let dryRun = false;
let message = `Deploy blog: ${new Date().toISOString()}`;

function run(command, argv, { capture = false, allowFailure = false, input } = {}) {
  const result = spawnSync(command, argv, {
    cwd: root,
    encoding: 'utf8',
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : [input === undefined ? 'inherit' : 'pipe', 'inherit', 'inherit'],
    input,
  });
  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    // 不回显远程 URL 或凭据；Git 自身的交互与认证沿用当前环境。
    throw new Error(`${command} ${argv[0]} 未完成，请先解决上方错误后重新部署。`);
  }
  return { status: result.status, output: result.stdout?.trim() ?? '', rawOutput: result.stdout ?? '' };
}

function git(argv, options) { return run('git', argv, options); }

function assertPublicFiles() {
  const tracked = git(['ls-files', '--cached', '-z'], { capture: true }).rawOutput.split('\0');
  const forbidden = tracked.filter(path =>
    /^(?:content\/(?:private|drafts)(?:\/|$)|\.env(?:\.|$))/.test(path));
  if (forbidden.length) {
    throw new Error(`发现被 Git 跟踪的私密文件，部署已停止：\n${forbidden.join('\n')}\n请先将这些文件移出 Git 跟踪，并保留本地副本。`);
  }
}

try {
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dry-run') dryRun = true;
    else if (args[i] === '--message' && args[i + 1]?.trim()) message = args[++i];
    else throw new Error('用法：npm run deploy -- [--dry-run] [--message "提交说明"]');
  }

  const remote = config.deploy?.remote ?? 'origin';
  const branch = config.deploy?.branch ?? 'master';
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(remote)) throw new Error('deploy.remote 必须是 Git remote 名称，例如 origin。');
  git(['check-ref-format', '--branch', branch], { capture: true });
  const gitRoot = git(['rev-parse', '--show-toplevel'], { capture: true }).output;
  if (realpathSync(gitRoot) !== realpathSync(root)) throw new Error('博客目录必须是独立的 Git 仓库。');
  const currentBranch = git(['symbolic-ref', '--quiet', '--short', 'HEAD'], { capture: true }).output;
  if (currentBranch !== branch) throw new Error(`当前分支是 ${currentBranch}，部署分支是 ${branch}。请切换到部署分支或修改 site.config.mjs 的 deploy.branch。`);
  git(['remote', 'get-url', '--push', remote], { capture: true });
  assertPublicFiles();
  if (!dryRun) {
    git(['var', 'GIT_AUTHOR_IDENT'], { capture: true });
    git(['var', 'GIT_COMMITTER_IDENT'], { capture: true });
  }

  console.log(`构建并检查博客，目标：${remote}/${branch}${dryRun ? '（仅检查）' : ''}`);
  run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'check']);
  assertPublicFiles();
  if (dryRun) {
    console.log('\n检查通过。以下公开文件将纳入部署提交：');
    git(['status', '--short', '--', '.', ':!content/private', ':!content/drafts', ':!.env', ':!.env.*']);
    console.log(`正式运行 npm run deploy 将提交这些修改并推送到 ${remote}/${branch}。本次未提交或推送。`);
  } else {
    const files = git(['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { capture: true })
      .rawOutput.split('\0').filter(path => path && !/^(?:content\/(?:private|drafts)(?:\/|$)|\.env(?:\.|$))/.test(path));
    // 用 NUL 分隔的字面路径处理中文、空格及删除项，也避免将私密文件加入索引。
    if (files.length) git(['add', '--all', '--pathspec-from-file=-', '--pathspec-file-nul'], {
      input: files.map(path => `:(literal)${path}\0`).join(''),
    });
    const diff = git(['diff', '--cached', '--quiet'], { allowFailure: true });
    if (diff.status === 1) git(['commit', '-m', message]);
    else if (diff.status !== 0) throw new Error('无法检查待提交的修改，部署已停止。');
    else console.log('没有新的文件修改，推送现有提交。');
    const pushed = git(['push', remote, `HEAD:refs/heads/${branch}`], { allowFailure: true });
    if (pushed.status !== 0) throw new Error('推送未完成，本地提交已保留。请检查 GitHub 登录、网络及远程分支；若远程有新提交，先拉取并合并后重新运行 npm run deploy。');
    console.log('\n已推送到 GitHub。GitHub Actions 将自动构建并发布网站，可在仓库 Actions 页面查看发布进度。');
  }
} catch (error) {
  console.error(`\n部署停止：${error.message}`);
  process.exitCode = 1;
}
