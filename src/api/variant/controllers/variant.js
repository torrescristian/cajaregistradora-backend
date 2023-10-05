// @ts-check
'use strict';

/**
 * variant controller
 */

const {
  createControllerKey,
  findPageInStore,
  findOneInStore,
} = require('../../../../libs/utils');

const MODEL_KEY = 'variant';

const CONTROLLER_KEY = createControllerKey(MODEL_KEY);

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(CONTROLLER_KEY, ({ strapi }) => ({
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
    const createdVariant = await super.create(ctx);

    const variantId = createdVariant.data.id;

    await strapi.db.query(createControllerKey('stock-per-variant')).create({
      data: {
        variantId: variantId,
        store: store.id
      },
    });

    ctx.send(createdVariant);
  },
  async find(ctx) {
    const variants = await findPageInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      orderBy: {
        id: 'desc',
      },
    });

    if (!variants) {
      return ctx.throw(404, 'Variants not found');
    }

    ctx.send(variants);
  },
  async findOne(ctx) {
    const variant = await findOneInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
    });

    if (!variant) {
      return ctx.throw(404, 'Variant not found');
    }

    ctx.send(variant);
  },
}));

