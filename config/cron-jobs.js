// @ts-check

const { createControllerKey } = require('../libs/utils');

module.exports = {
  notifyLowStock: {
    task: async ({ strapi }) => {
      console.log('----------------------------------------------------------');
      const page = await strapi.db
        .query(createControllerKey('variant'))
        .findPage({
          where: {
            product: {
              isService: false,
            },
          },
          populate: ['stock_per_variant', 'product', 'store'],
          pageSize: 1000
        });

      const nonServiceVariants = page.results;

      const lowStockVariants = nonServiceVariants.filter(
        ({ minimum_stock, stock_per_variant: { stock } }) => {
          return (stock || 0) < (minimum_stock || 0);
        }
      );

      const promises = await Promise.all(lowStockVariants.map(v => {
        return strapi.db.query(createControllerKey('notification')).create({
          data: {
            description: `El producto ${v.product.name} - ${v.name} tiene poco stock`,
            seen: false,
            store: v.store.id
          },
        });
      }))

      console.log({ promises });
    },
    options: {
      rule: '0 0 * * *',
    },
  },
};
