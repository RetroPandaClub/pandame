#!/usr/bin/env node

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PATH_FROM_ROOT: string = join(process.cwd(), 'src');
const PATH_TO_EN_JSON: string = join(PATH_FROM_ROOT, 'lib', 'i18n', 'en.json');
const PATH_TO_OUTPUT_DIR: string = join(PATH_FROM_ROOT, 'lib', 'types');
const PATH_TO_OUTPUT: string = join(PATH_TO_OUTPUT_DIR, 'i18n.d.ts');

type TranslationValues = { [key: string]: string | TranslationValues };

/**
 * Generates TypeScript interfaces from the English translation file.
 */
const generateTypes = async (): Promise<void> => {
	if (!existsSync(PATH_TO_EN_JSON)) {
		console.log(
			`The translation file at ${PATH_TO_EN_JSON} does not exist. Please add it and try again.`
		);
		return;
	}

	if (!existsSync(PATH_TO_OUTPUT_DIR)) {
		console.log(`The output file directory at ${PATH_TO_OUTPUT_DIR} does not exist. Creating it now...`);
		mkdirSync(PATH_TO_OUTPUT_DIR, { recursive: true });
	}

	const { default: en }: { default: TranslationValues } = await import(PATH_TO_EN_JSON, {
		assert: { type: 'json' }
	});

	const mapValues = (values: TranslationValues): string[] =>
		Object.entries(values).reduce<string[]>(
			(acc, [key, value]) => [
				...acc,
				`${key}: ${typeof value === 'object' ? `{${mapValues(value).join('')}}` : 'string'};`
			],
			[]
		);

	const data = Object.entries(en).map(([key, values]) => ({
		key,
		name: `I18n${key.charAt(0).toUpperCase()}${key.slice(1)}`,
		values: mapValues(values as TranslationValues)
	}));

	const lang = `lang: Languages;`;

	const main = `\n\ninterface I18n {${lang}${data.map(({ key, name }) => `${key}: ${name};`).join('')}}`;
	const interfaces: string = data
		.map(({ name, values }) => `\n\ninterface ${name} {${values.join('')}}`)
		.join('');

	const comment = `/**\n* Auto-generated definitions file ("npm run i18n")\n*/`;

	writeFileSync(PATH_TO_OUTPUT, `${comment}${interfaces}${main}`);
};

await generateTypes();
