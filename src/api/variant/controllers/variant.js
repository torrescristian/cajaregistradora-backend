// @ts-check
'use strict';

/**
 * variant controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const {
  findPageInStore,
  findOneInStore,
  createControllerKey,
  STORE_LOCATIONS,
} = require('../../../../libs/utils');

const CONTROLLER_KEY = createControllerKey('variant');

const populate = ['product', 'stock_per_variant', 'categories', 'product.store', 'store'];

module.exports = createCoreController(CONTROLLER_KEY, ({ strapi }) => ({
  async find(ctx) {
    const products = await findPageInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      populate,
      storeLocation: 'product_store',
    });

    return ctx.send(products);
  },

  async findOne(ctx) {
    const product = await findOneInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      populate,
      storeLocation: STORE_LOCATIONS.PRODUCT_STORE,
    });

    if (!product) {
      return ctx.throw(404, 'Product not found');
    }

    return ctx.send(product);
  },

  async update(ctx) {
    const variant = await findOneInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      populate: [],
      storeLocation: STORE_LOCATIONS.PRODUCT_STORE,
    });

    if (!variant) {
      return ctx.throw(404, 'Variat not found');
    }

    const updatedVariant = await super.update(ctx);
    ctx.send(updatedVariant);
  },

  async create(ctx) {
    // create product
    const createdVariant = await super.create(ctx);

    const variantId = createdVariant.data.id;

    await strapi.db.query(createControllerKey('stock-per-variant')).create({
      data: {
        variantId: variantId,
      },
    });

    ctx.send(createdVariant);
  },
}));
