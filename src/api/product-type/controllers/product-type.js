// @ts-check
'use strict';

/**
 * product-type controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

const {
  findPageInStore,
  findOneInStore,
  createControllerKey,
} = require('../../../../libs/utils');

const CONTROLLER_KEY = createControllerKey('product-type');

module.exports = createCoreController(CONTROLLER_KEY, ({ strapi }) => ({
  async find(ctx) {
    const productsTypes = await findPageInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      orderBy: {
        name: 'asc',
      },
    });

    return ctx.send(productsTypes);
  },

  async findOne(ctx) {
    const productType = await findOneInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
    });

    if (!productType) {
      return ctx.throw(404, 'Product type not found');
    }

    return ctx.send(productType);
  },

  async update(ctx) {
    const productType = await findOneInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      populate: [],
    });

    if (!productType) {
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

    // create productType
    const createdProductType = await super.create(ctx);

    ctx.send(createdProductType);
  },
}));
