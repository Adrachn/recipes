import { defineField, defineType } from 'sanity';

export const recipePack = defineType({
  name: 'recipePack',
  title: 'Recipe Pack',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Pack Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'recipes',
      title: 'Recipes',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'recipe' }],
        },
      ],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
});
