const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Mutation = {
  async createJournal(parent, args, ctx, info) {
    // TODO: Check if they are logged in

    const journal = await ctx.db.mutation.createJournal(
      {
        data: {
          ...args,
          user: {
            connect: {
              id: ctx.response.userId
            }
          }
        }
      },
      info
    );
    return journal;
  },

  async deleteJournal(parent, args, ctx, info) {
    const journal = await ctx.db.mutation.deleteJournal({
      where: {
        id: args.id
      }
    });

    console.log(journal);
    return journal;
  },

  async signup(parent, args, ctx, info) {
    args.email = args.email.toLowerCase();
    const password = await bcrypt.hash(args.password, 11);
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ["USER"] }
        }
      },
      info
    );
    // create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // Send the token back to the user via a cookie in the response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 24 * 365 // Keep the user signed in for 1 year
    });
    return user;
  },

  login: async (parent, args, ctx, info) => {
    const user = await ctx.db.query.user(
      {
        where: {
          email: args.email.toLowerCase()
        }
      },
      "{ id name email permissions password }"
    );
    if (!user || !bcrypt.compareSync(args.password, user.password)) {
      throw Error("The email address or password is wrong.");
    }
    // create JWT token
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // Send the token back to the user via a cookie in the response
    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // Keep the user signed in for 1 year
    });
    delete user.password;
    return user;
  },

  signout: (parent, args, ctx, info) => {
    ctx.response.clearCookie("token");
    return { message: "Success" };
  }
};

module.exports = Mutation;
