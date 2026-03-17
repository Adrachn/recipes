import { defineField, defineType } from 'sanity';
import {
  MEAL_CATEGORIES,
  DIFFICULTY_LEVELS,
  KEYWORD_OPTIONS,
} from '../../lib/recipeTaxonomy';

export const recipe = defineType({
  name: 'recipe',
  title: 'Recipe',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Recipe Name',
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
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true, // Allows for better image cropping
      },
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string',
      options: {
        list: DIFFICULTY_LEVELS,
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'prepTime',
      title: 'Prep Time (minutes)',
      type: 'number',
    }),
    defineField({
      name: 'cookTime',
      title: 'Cook Time (minutes)',
      type: 'number',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      description:
        'Primary categories for meal planning and filtering. These will appear as icons.',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: MEAL_CATEGORIES,
        layout: 'grid',
      },
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'keywords',
      title: 'Dietary & style tags',
      description:
        'Used for recipe search and meal planner filters. Pick from the list (same options as in the app).',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: KEYWORD_OPTIONS,
        layout: 'tags',
      },
    }),
    defineField({
      name: 'servings',
      title: 'Servings',
      type: 'number',
    }),
    defineField({
      name: 'ingredients',
      title: 'Ingredients',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'name',
              title: 'Name',
              type: 'string',
            },
            {
              name: 'quantity',
              title: 'Quantity',
              type: 'string',
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'instructions',
      title: 'Instructions',
      type: 'array',
      of: [{ type: 'block' }], // 'block' allows for rich text editing
      validation: (Rule) => Rule.required(),
    }),
  ],
});
