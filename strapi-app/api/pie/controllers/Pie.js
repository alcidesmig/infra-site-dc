'use strict';

/**
 * Pie.js controller
 *
 * @description: A set of functions called "actions" for managing `Pie`.
 */

module.exports = {

  /**
   * Retrieve pie records.
   *
   * @return {Object|Array}
   */

  find: async (ctx, next, { populate } = {}) => {
    if (ctx.query._q) {
      return strapi.services.pie.search(ctx.query);
    } else {
      return strapi.services.pie.fetchAll(ctx.query, populate);
    }
  },

  /**
   * Retrieve a pie record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.pie.fetch(ctx.params);
  },

  /**
   * Count pie records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.pie.count(ctx.query);
  },

  /**
   * Create a/an pie record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.pie.add(ctx.request.body);
  },

  /**
   * Update a/an pie record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.pie.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an pie record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.pie.remove(ctx.params);
  }
};
