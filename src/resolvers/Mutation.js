const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const sharedCookieOptions = {
  httpOnly: true,
  maxAge: 1000 * 60 * 60 * 24 * 365 // Keep the user signed in for 1 year
};

const COOKIE_OPTIONS =
  process.env.NODE_ENV === "development"
    ? {
        ...sharedCookieOptions
      }
    : {
        ...sharedCookieOptions,
        sameSite: "None",
        secure: true
      };

const createToken = userId => jwt.sign({ userId }, process.env.APP_SECRET);

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
    const token = createToken(user.id);
    ctx.response.cookie("token", token, COOKIE_OPTIONS);
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
    const token = createToken(user.id);
    ctx.response.cookie("token", token, COOKIE_OPTIONS);
    delete user.password;
    return user;
  },

  signout: (parent, args, ctx, info) => {
    ctx.response.clearCookie("token");
    return { message: "Success" };
  }
};

module.exports = Mutation;
