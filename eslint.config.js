import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default tseslint.config(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	...tseslint.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: tseslint.parser
			}
		}
	},
	{
		files: ['*.ts'],
		rules: {
			'prefer-const': 'error'
		}
	},
	{
		// Tracked-but-not-linted paths (gitignored ones come from `includeIgnoreFile` above).
		ignores: ['static/', 'src/declarations/']
	},
	{
		rules: {
			'@typescript-eslint/consistent-type-definitions': 'error',
			'@typescript-eslint/no-inferrable-types': 'error',
			// '@typescript-eslint/no-unnecessary-type-assertion': 'error',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			],
			// '@typescript-eslint/prefer-nullish-coalescing': 'error',
			// '@typescript-eslint/prefer-reduce-type-parameter': 'error',
			'arrow-body-style': ['warn', 'as-needed'],
			curly: 'error',
			'no-console': ['error', { allow: ['error', 'warn'] }],
			'no-continue': 'warn',
			'no-delete-var': 'error',
			'no-else-return': ['warn', { allowElseIf: false }],
			'no-unused-vars': 'off',
			'prefer-template': 'error',
			'require-await': 'error',
			// External / user-supplied URLs are bound to `<a href>` here; the
			// SvelteKit `resolve()` helper is meant for in-app navigation.
			'svelte/no-navigation-without-resolve': 'off'
		}
	},
	{
		plugins: {
			import: importPlugin
		},
		rules: {
			'import/no-duplicates': ['error', { 'prefer-inline': true }],
			'import/no-relative-parent-imports': 'error'
		}
	},
	{
		files: ['**/*.svelte', '*.svelte'],
		rules: {
			'import/order': ['error', { alphabetize: { order: 'asc' } }],
			'import/no-duplicates': ['error', { 'prefer-inline': true }]
		}
	},
	{
		// Quality gate. Today's violations are baselined in eslint-suppressions.json;
		// a fixed one must be pruned (`npx eslint . --prune-suppressions`), so the
		// baseline only shrinks.
		files: ['src/**/*.ts', 'src/**/*.svelte'],
		ignores: ['src/lib/types/i18n.d.ts'],
		rules: {
			complexity: ['error', 10],
			'max-depth': ['error', 3],
			'max-params': ['error', 3],
			'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-non-null-assertion': 'error'
		}
	},
	{
		// UI reaches canisters only through services, and generated types only through $lib/types.
		files: ['src/routes/**', 'src/lib/components/**'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: [
								'$declarations',
								'$declarations/*',
								'$lib/api/*',
								'$lib/canisters/*',
								'$lib/actors/*',
								'$root',
								'$root/*'
							],
							message: 'Go through $lib/services and $lib/types.'
						}
					]
				}
			]
		}
	},
	{
		// Utils stay pure.
		files: ['src/lib/utils/**'],
		rules: {
			'no-restricted-imports': [
				'error',
				{
					patterns: [
						{
							group: [
								'$declarations',
								'$declarations/*',
								'$lib/api/*',
								'$lib/canisters/*',
								'$lib/actors/*',
								'$lib/services/*',
								'$lib/stores/*',
								'$root',
								'$root/*'
							],
							message: 'Utils are pure: no I/O, no stores, generated types only through $lib/types.'
						}
					]
				}
			]
		}
	},
	{
		// CLI scripts report progress on stdout.
		files: ['scripts/**/*.ts', 'scripts/**/*.mjs'],
		rules: {
			'no-console': 'off'
		}
	}
);
