const Query = {
  journals(parent, args, ctx, info) {
    return [
      {
        id: 1,
        title: "First entry",
        body: "This is the first entry"
      },
      {
        id: 2,
        title: "Second entry",
        body: "This is the sencond entry"
      }
    ];
  }
};

module.exports = Query;
