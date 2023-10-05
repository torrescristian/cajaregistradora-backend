// @ts-check
'use strict';

/**
 * promo controller
 */
const {
  createControllerKey,
  findPageInStore,
  findOneInStore,
} = require('../../../../libs/utils');

const MODEL_KEY = 'promo';

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
      return ctx.throw(404, 'Promo not found');
    }

    ctx.request.body.data.store = store.id;
    const createdOrder = await super.create(ctx);

    ctx.send(createdOrder);
  },
  async find(ctx) {
    const promos = await findPageInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
      orderBy: {
        id: 'desc',
      },
    });

    if (!promos) {
      return ctx.throw(404, 'Promo not found');
    }

    ctx.send(promos);
  },
  async findOne(ctx) {
    const promos = await findOneInStore({
      strapi,
      key: CONTROLLER_KEY,
      ctx,
    });

    if (!promos) {
      return ctx.throw(404, 'Promos not found');
    }

    ctx.send(promos);
  },
}));
