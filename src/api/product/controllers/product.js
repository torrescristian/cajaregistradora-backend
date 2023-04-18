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
      populate: ['stock_per_product', 'categories'],
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
      populate: ['stock_per_product', 'categories'],
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
    const user = ctx.state.user;

    // create product
    const createdProduct = await super.create(ctx);

    // get store of owner
    const store = await strapi.db.query(createControllerKey('store')).findOne({
      where: {
        owner: user.id,
      },
    });

    const productId = createdProduct.data.id;
    const storeId = store.id;

    // set store in product
    await strapi.db.query(createControllerKey('product')).update({
      data: {
        store: storeId,
      },
      where: {
        id: productId,
      },
    });

    // create stock-per-product and relate it to product
    await strapi.db.query(createControllerKey('stock-per-product')).create({
      data: {
        product: productId,
      },
    });

    ctx.send(createdProduct);
  },
}));
