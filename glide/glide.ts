glide.o.hint_size = '12px';
glide.prefs.set('glide.firefox.taskbar.badge.enabled', true);
// glide.o.native_tabs = 'autohide';

type PaletteAction = {
    label: string;
    description: string;
    aliases: string[];
    execute(): Promise<void> | void;
};

// GitHub helper functions
function parse_github_pr(url: URL): { owner: string; repo: string; prNumber: string } | null {
    const match = url.pathname.match(/^\/([^/]+)\/([^/]+)\/pull\/(\d+)(?:\/.*)?$/);
    if (!match) return null;
    const [, owner, repo, prNumber] = match;
    if (!owner || !repo || !prNumber) return null;
    return {
        owner,
        repo,
        prNumber,
    };
}

function parse_github_branch(url: URL): { owner: string; repo: string; branch: string } | null {
    const match = url.pathname.match(/^\/([^/]+)\/([^/]+)\/tree\/([^/]+)(?:\/.*)?$/);
    if (!match) return null;
    const [, owner, repo, branch] = match;
    if (!owner || !repo || !branch) return null;
    return {
        owner,
        repo,
        branch: decodeURIComponent(branch),
    };
}

function parse_github_repo(url: URL): { owner: string; repo: string } | null {
    const match = url.pathname.match(/^\/([^/]+)\/([^/]+)(?:\/.*)?$/);
    if (!match) return null;
    const [, owner, repo] = match;
    if (!owner || !repo) return null;

    // Exclude obvious non-repo top-level pages.
    const excluded = new Set([
        'about',
        'account',
        'codespaces',
        'collections',
        'contact',
        'customer-stories',
        'enterprise',
        'events',
        'explore',
        'features',
        'home',
        'issues',
        'login',
        'marketplace',
        'models',
        'new',
        'notifications',
        'orgs',
        'pricing',
        'pulls',
        'search',
        'security',
        'settings',
        'signup',
        'sponsors',
        'topics',
        'trending',
    ]);
    if (excluded.has(owner.toLowerCase())) return null;

    return { owner, repo };
}

function normalize_text(value: string): string {
    return value.toLowerCase().trim();
}

//* GitHub-specific palette actions.
//* Actions are decided based on what page type was detected:
//* - Repo actions (issues / pulls / actions / clone URLs)
//* - PR actions (checks / files changed / copy refs)
//* - Branch actions (copy branch name)
function github_palette_actions(url: URL): PaletteAction[] {
    const actions: PaletteAction[] = [];
    const pr = parse_github_pr(url);
    const branch = parse_github_branch(url);
    const repo = parse_github_repo(url);

    if (repo) {
        const repoBase = `${url.origin}/${repo.owner}/${repo.repo}`;
        const sshClone = `git clonegit@github.com:${repo.owner}/${repo.repo}.git`;
        const httpsClone = `git clone https://github.com/${repo.owner}/${repo.repo}.git`;

        actions.push(
            {
                label: 'Open repo pull requests',
                description: `Open ${repo.owner}/${repo.repo} pull requests`,
                aliases: ['repo', 'pulls', 'prs'],
                async execute() {
                    await browser.tabs.update({ url: `${repoBase}/pulls` });
                },
            },
            {
                label: 'Open repo issues',
                description: `Open ${repo.owner}/${repo.repo} issues`,
                aliases: ['repo', 'issues', 'bugs'],
                async execute() {
                    await browser.tabs.update({ url: `${repoBase}/issues` });
                },
            },
            {
                label: 'Open repo actions',
                description: `Open ${repo.owner}/${repo.repo} actions`,
                aliases: ['repo', 'actions', 'ci', 'workflow'],
                async execute() {
                    await browser.tabs.update({ url: `${repoBase}/actions` });
                },
            },
            {
                label: 'Copy SSH clone URL',
                description: sshClone,
                aliases: ['copy', 'clone', 'ssh', 'git'],
                execute() {
                    return navigator.clipboard.writeText(sshClone);
                },
            },
            {
                label: 'Copy HTTPS clone URL',
                description: httpsClone,
                aliases: ['copy', 'clone', 'https', 'git'],
                execute() {
                    return navigator.clipboard.writeText(httpsClone);
                },
            },
        );
    }

    if (pr) {
        const prBase = `${url.origin}/${pr.owner}/${pr.repo}/pull/${pr.prNumber}`;
        const prRef = `refs/pull/${pr.prNumber}/head`;
        const prShort = `${pr.owner}/${pr.repo}#${pr.prNumber}`;

        actions.push(
            {
                label: 'Open PR checks',
                description: `Open checks for PR #${pr.prNumber}`,
                aliases: ['checks', 'ci', 'status', 'pipeline'],
                async execute() {
                    await browser.tabs.update({ url: `${prBase}/checks` });
                },
            },
            {
                label: 'Jump to files changed',
                description: `Open changed files for PR #${pr.prNumber}`,
                aliases: ['files', 'diff', 'changes', 'patch'],
                async execute() {
                    await browser.tabs.update({ url: `${prBase}/files` });
                },
            },
            {
                label: 'Copy PR git ref',
                description: `${prRef} to clipboard`,
                aliases: ['copy', 'pr ref', 'git ref', 'checkout'],
                execute() {
                    return navigator.clipboard.writeText(prRef);
                },
            },
            {
                label: 'Copy PR short reference',
                description: `${prShort} to clipboard`,
                aliases: ['copy', 'reference', 'issue style', 'short'],
                execute() {
                    return navigator.clipboard.writeText(prShort);
                },
            },
        );
    }

    if (branch) {
        actions.push({
            label: 'Copy branch name',
            description: `${branch.branch} to clipboard`,
            aliases: ['copy', 'branch', 'git', 'head'],
            execute() {
                return navigator.clipboard.writeText(branch.branch);
            },
        });
    }

    actions.push({
        label: 'Copy current URL',
        description: 'Copy page URL to clipboard',
        aliases: ['copy', 'url', 'link'],
        execute() {
            return navigator.clipboard.writeText(url.toString());
        },
    });

    return actions;
}

// Fallback actions for non-GitHub pages
function default_palette_actions(url: URL): PaletteAction[] {
    return [
        {
            label: 'Copy current URL',
            description: 'Copy page URL to clipboard',
            aliases: ['copy', 'url', 'link'],
            execute() {
                return navigator.clipboard.writeText(url.toString());
            },
        },
        {
            label: 'Reload tab',
            description: 'Reload current page',
            aliases: ['refresh', 'reload'],
            execute() {
                return glide.excmds.execute('reload');
            },
        },
    ];
}

function build_palette_option(action: PaletteAction): glide.CommandLineCustomOption {
    return {
        label: action.label,
        description: action.description,
        matches({ input }) {
            const needle = normalize_text(input);
            if (!needle) return true;
            const haystacks = [action.label, action.description, ...action.aliases].map(
                normalize_text,
            );
            return haystacks.some((value) => value.includes(needle));
        },
        render() {
            return DOM.create_element('div', {
                style: {
                    display: 'grid',
                    gridTemplateColumns: 'minmax(220px, auto) 1fr',
                    gap: '12px',
                    alignItems: 'center',
                },
                children: [
                    DOM.create_element('span', {
                        style: {
                            fontWeight: '600',
                        },
                        children: [action.label],
                    }),
                    DOM.create_element('span', {
                        style: {
                            opacity: '0.75',
                        },
                        children: [action.description],
                    }),
                ],
            });
        },
        execute: async () => {
            await action.execute();
            await glide.commandline.close();
        },
    };
}

async function show_contextual_palette() {
    const url = glide.ctx.url;
    const isGithub = url.hostname === 'github.com';
    const actions = isGithub ? github_palette_actions(url) : default_palette_actions(url);
    const options = actions.map(build_palette_option);
    const title = isGithub ? `GitHub actions (${url.pathname})` : `Page actions (${url.hostname})`;

    await glide.commandline.show({
        title,
        input: '',
        options,
    });
}

glide.excmds.create(
    {
        name: 'context_palette',
        description: 'Open contextual command palette',
    },
    async () => {
        await show_contextual_palette();
    },
);

glide.keymaps.set(
    'normal',
    '<leader>p',
    async () => {
        await show_contextual_palette();
    },
    {
        description: 'Open contextual command palette',
    },
);

//* Split view with the tab to the right
glide.keymaps.set(
    'normal',
    '<C-w>v',
    async ({ tab_id }) => {
        const all_tabs = await glide.tabs.query({ currentWindow: true });
        const current_index = all_tabs.findIndex((t) => t.id === tab_id);
        const other = all_tabs[current_index + 1];
        if (!other) {
            throw new Error('No next tab');
        }
        glide.unstable.split_views.create([tab_id, other]);
    },
    {
        description: 'Create a split view with the tab to the right',
    },
);
