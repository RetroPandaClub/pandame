import {
	type AssertDeleteAsset,
	type AssertDeleteDoc,
	type AssertSetDoc,
	type AssertUploadAsset,
	defineAssert,
	defineHook,
	type OnDeleteAsset,
	type OnDeleteDoc,
	type OnDeleteFilteredAssets,
	type OnDeleteFilteredDocs,
	type OnDeleteManyAssets,
	type OnDeleteManyDocs,
	type OnSetDoc,
	type OnSetManyDocs,
	type OnUploadAsset
} from '@junobuild/functions';

// All the available hooks and assertions for your Datastore and Storage are scaffolded by default in this module.
// However, if you don’t have to implement all of them, for example to improve readability or reduce unnecessary logic,
// you can selectively delete the features you do not need.

export const onSetDoc = defineHook<OnSetDoc>({
	collections: [],
	run: async (_context) => {}
});

export const onSetManyDocs = defineHook<OnSetManyDocs>({
	collections: [],
	run: async (_context) => {}
});

export const onDeleteDoc = defineHook<OnDeleteDoc>({
	collections: [],
	run: async (_context) => {}
});

export const onDeleteManyDocs = defineHook<OnDeleteManyDocs>({
	collections: [],
	run: async (_context) => {}
});

export const onDeleteFilteredDocs = defineHook<OnDeleteFilteredDocs>({
	collections: [],
	run: async (_context) => {}
});

export const onUploadAsset = defineHook<OnUploadAsset>({
	collections: [],
	run: async (_context) => {}
});

export const onDeleteAsset = defineHook<OnDeleteAsset>({
	collections: [],
	run: async (_context) => {}
});

export const onDeleteManyAssets = defineHook<OnDeleteManyAssets>({
	collections: [],
	run: async (_context) => {}
});

export const onDeleteFilteredAssets = defineHook<OnDeleteFilteredAssets>({
	collections: [],
	run: async (_context) => {}
});

export const assertSetDoc = defineAssert<AssertSetDoc>({
	collections: [],
	assert: (_context) => {}
});

export const assertDeleteDoc = defineAssert<AssertDeleteDoc>({
	collections: [],
	assert: (_context) => {}
});

export const assertUploadAsset = defineAssert<AssertUploadAsset>({
	collections: [],
	assert: (_context) => {}
});

export const assertDeleteAsset = defineAssert<AssertDeleteAsset>({
	collections: [],
	assert: (_context) => {}
});
