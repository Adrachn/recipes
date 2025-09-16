import { type SchemaTypeDefinition } from 'sanity';

import { recipe } from './recipe';
import { recipePack } from './recipePack';

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [recipe, recipePack],
};
