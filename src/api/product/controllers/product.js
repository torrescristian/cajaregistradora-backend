// @ts-check
'use strict';

/**
 * product controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const {
  findPageInStore,
  findOneInStore,
  createControllerKey,
} = require('../../../../libs/utils');

const CONTROLLER_KEY = createControllerKey('product');

module.exports = createCoreController(CONTROLLER_KEY, ({ strapi }) => ({
  async find(ctx) {
    const products = await findPageInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      populate: ['categories'],
      orderBy: {
        name: 'asc',
      },
    });

    return ctx.send(products);
  },

  async findOne(ctx) {
    const product = await findOneInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      populate: ['categories'],
    });

    if (!product) {
      return ctx.throw(404, 'Product not found');
    }

    return ctx.send(product);
  },

  async update(ctx) {
    const product = await findOneInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      populate: [],
    });

    if (!product) {
      return ctx.throw(404, 'Product not found');
    }

    const updatedProduct = await super.update(ctx);
    ctx.send(updatedProduct);
  },

  async create(ctx) {
    const userId = ctx.state.user.id;

    const store = await strapi.db.query(createControllerKey('store')).findOne({
      where: {
        $or: [
          {
            owner: {
              id: userId,
            },
          },
          {
            employees: [userId],
          },
        ],
      },
    });

    if (!store) {
      return ctx.throw(404, 'Store not found');
    }

    ctx.request.body.data.store = store.id;

    // create product
    const createdProduct = await super.create(ctx);

    ctx.send(createdProduct);
  },
}));
