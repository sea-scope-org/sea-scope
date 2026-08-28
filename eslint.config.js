//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config';
import prettierConfig from 'eslint-config-prettier';
import eslintPluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss';
import prettierPlugin from 'eslint-plugin-prettier/recommended';

export default [
    ...tanstackConfig,
    {
        plugins: {
            'better-tailwindcss': eslintPluginBetterTailwindcss,
        },
        settings: {
            'better-tailwindcss': {
                entryPoint: 'src/styles.css',
            },
        },
        rules: {
            'import/no-cycle': 'off',
            // Override TanStack's import/order: alphabetize within groups, and keep
            // `import type` with its module path (not a trailing type-only group).
            'import/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
                    alphabetize: { order: 'asc', caseInsensitive: true },
                },
            ],
            // Member names inside `{ a, b }` — declaration order is owned by import/order.
            'sort-imports': [
                'error',
                {
                    ignoreCase: true,
                    ignoreDeclarationSort: true,
                    ignoreMemberSort: false,
                },
            ],
            '@typescript-eslint/array-type': 'off',
            '@typescript-eslint/no-deprecated': 'error',
            '@typescript-eslint/require-await': 'off',
            'pnpm/json-enforce-catalog': 'off',
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        {
                            group: ['lucide-react'],
                            importNamePattern: '^(?!.*Icon$)(?!type )',
                            message: 'Use the Icon-suffixed variant from lucide-react (e.g., CheckIcon instead of Check).',
                        },
                    ],
                },
            ],
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'MemberExpression[object.name="process"][property.name="env"]',
                    message:
                        'Do not read process.env directly. Use environmentVariablesCreate() from src/server/env/environmentVariablesCreate.ts.',
                },
            ],
            // Same as Tailwind IntelliSense `suggestCanonicalClasses` — see docs/conventions.md.
            'better-tailwindcss/enforce-canonical-classes': 'error',
            // Companion: canonical autofix can leave doubled spaces when classes collapse.
            'better-tailwindcss/no-unnecessary-whitespace': 'error',
        },
    },
    {
        files: ['src/server/env/environmentVariablesCreate.ts', 'scripts/migrationsCheck.ts', 'scripts/migrationsReconcile.ts'],
        rules: {
            'no-restricted-syntax': 'off',
        },
    },
    prettierConfig,
    prettierPlugin,
    {
        ignores: [
            'eslint.config.js',
            'prettier.config.ts',
            'src/server/graphql/generated.ts',
            'src/web/graphql/generated.ts',
            'src/routeTree.gen.ts',
            'storybook-static',
            '.output',
            '.tanstack',
            '.nitro',
            '.vinxi',
            '.wrangler',
            'dist',
            'dist-ssr',
            'drizzle',
        ],
    },
];
