'use strict';

/**
 * Tag.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

// Public dependencies.
const _ = require('lodash');
const { convertRestQueryParams, buildQuery } = require('strapi-utils');

module.exports = {

  /**
   * Promise to fetch all tags.
   *
   * @return {Promise}
   */

  fetchAll: (params, populate) => {
    const filters = convertRestQueryParams(params);
  
    const populateOpt = populate || Tag.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias);
  
    return buildQuery({
      model: Tag,
      filters,
      populate: populateOpt,
    });
  },

  /**
   * Promise to fetch a/an tag.
   *
   * @return {Promise}
   */

  fetch: (params) => {
    // Select field to populate.
    const populate = Tag.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    return Tag
      .findOne(_.pick(params, _.keys(Tag.schema.paths)))
      .populate(populate);
  },

  /**
   * Promise to count tags.
   *
   * @return {Promise}
   */

  count: (params) => {
    const filters = convertRestQueryParams(params);
  
    return buildQuery({
      model: Tag,
      filters: { where: filters.where },
    })
      .count();
  },

  /**
   * Promise to add a/an tag.
   *
   * @return {Promise}
   */

  add: async (values) => {
    // Extract values related to relational data.
    const relations = _.pick(values, Tag.associations.map(ast => ast.alias));
    const data = _.omit(values, Tag.associations.map(ast => ast.alias));

    // Create entry with no-relational data.
    const entry = await Tag.create(data);

    // Create relational data and return the entry.
    return Tag.updateRelations({ _id: entry.id, values: relations });
  },

  /**
   * Promise to edit a/an tag.
   *
   * @return {Promise}
   */

  edit: async (params, values) => {
    // Extract values related to relational data.
    const relations = _.pick(values, Tag.associations.map(a => a.alias));
    const data = _.omit(values, Tag.associations.map(a => a.alias));

    // Update entry with no-relational data.
    const entry = await Tag.updateOne(params, data, { multi: true });

    // Update relational data and return the entry.
    return Tag.updateRelations(Object.assign(params, { values: relations }));
  },

  /**
   * Promise to remove a/an tag.
   *
   * @return {Promise}
   */

  remove: async params => {
    // Select field to populate.
    const populate = Tag.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    // Note: To get the full response of Mongo, use the `remove()` method
    // or add spent the parameter `{ passRawResult: true }` as second argument.
    const data = await Tag
      .findOneAndRemove(params, {})
      .populate(populate);

    if (!data) {
      return data;
    }

    await Promise.all(
      Tag.associations.map(async association => {
        if (!association.via || !data._id || association.dominant) {
          return true;
        }

        const search = _.endsWith(association.nature, 'One') || association.nature === 'oneToMany' ? { [association.via]: data._id } : { [association.via]: { $in: [data._id] } };
        const update = _.endsWith(association.nature, 'One') || association.nature === 'oneToMany' ? { [association.via]: null } : { $pull: { [association.via]: data._id } };

        // Retrieve model.
        const model = association.plugin ?
          strapi.plugins[association.plugin].models[association.model || association.collection] :
          strapi.models[association.model || association.collection];

        return model.update(search, update, { multi: true });
      })
    );

    return data;
  },

  /**
   * Promise to search a/an tag.
   *
   * @return {Promise}
   */

  search: async (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('tag', params);
    // Select field to populate.
    const populate = Tag.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    const $or = Object.keys(Tag.attributes).reduce((acc, curr) => {
      switch (Tag.attributes[curr].type) {
        case 'integer':
        case 'float':
        case 'decimal':
          if (!_.isNaN(_.toNumber(params._q))) {
            return acc.concat({ [curr]: params._q });
          }

          return acc;
        case 'string':
        case 'text':
        case 'password':
          return acc.concat({ [curr]: { $regex: params._q, $options: 'i' } });
        case 'boolean':
          if (params._q === 'true' || params._q === 'false') {
            return acc.concat({ [curr]: params._q === 'true' });
          }

          return acc;
        default:
          return acc;
      }
    }, []);

    return Tag
      .find({ $or })
      .sort(filters.sort)
      .skip(filters.start)
      .limit(filters.limit)
      .populate(populate);
  }
};
