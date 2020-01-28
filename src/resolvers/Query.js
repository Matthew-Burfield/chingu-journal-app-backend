const { forwardTo } = require("prisma-binding");
const bcrypt = require("bcrypt");

const Query = {
  me: (parent, args, ctx, info) => {
    const { userId } = ctx.response;
    if (!userId) {
      return null;
    }
    return ctx.db.query.user(
      {
        where: { id: userId }
      },
      info
    );
  },

  journals: (parent, args, ctx, info) => {
    const { userId } = ctx.response;
    if (!userId) {
      return [];
    }
    return ctx.db.query.journals({
      where: {
        user: {
          id: userId
        }
      }
    });
  }
};

module.exports = Query;
