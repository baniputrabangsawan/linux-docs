import type { CollectionEntry } from 'astro:content';
import type { z } from 'astro/zod';
import type { docsSchemaExtension } from '../lib/schema';

/** Bentuk field tambahan. Tipe halaman memakai CollectionEntry agar tidak menulis ulang metadata Starlight. */
export type DocsExtension = z.infer<typeof docsSchemaExtension>;
export type DocsEntry = CollectionEntry<'docs'>;
export type DocsData = DocsEntry['data'];
