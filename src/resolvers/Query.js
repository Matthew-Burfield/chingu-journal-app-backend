const { forwardTo } = require("prisma-binding");

const Query = {
  journals: forwardTo("db")
};

module.exports = Query;
