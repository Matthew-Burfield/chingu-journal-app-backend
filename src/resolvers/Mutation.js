const Mutation = {
  async createJournal(parent, args, ctx, info) {
    // TODO: Check if they are logged in

    const journal = await ctx.db.mutation.createJournal(
      {
        data: {
          ...args
        }
      },
      info
    );
    return journal;
  }
};

module.exports = Mutation;
