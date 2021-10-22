const AdminBro = require("admin-bro");
const AdminBroExpress = require("@admin-bro/express");
const AdminBroMongoose = require("@admin-bro/mongoose");
const User = require("../models/users");
const Video = require("../models/videos");
const Comment = require("../models/comments");
const Discussion = require("../models/discussions");
const Log = require("../models/logs");
const Heuristic = require("../models/heuristics");

const sidebarGroups = {
  user: {
    name: "User Management",
    icon: "User",
  },
  video: {
    name: "Video Management",
    icon: "VideoChat",
  },
  chat: {
    name: "Discussion Management",
    icon: "Chat",
  },
  heuristic: {
    name: "Heuristics Management",
    icon: "Catalog",
  },
  log: {
    name: "Logs Management",
    icon: "Catalog",
  },
};

AdminBro.registerAdapter(AdminBroMongoose);
const adminBro = new AdminBro({
  resources: [
    {
      resource: User,
      options: {
        parent: sidebarGroups.user,
      },
    },
    {
      resource: Video,
      options: {
        parent: sidebarGroups.video,
      },
    },
    {
      resource: Comment,
      options: {
        parent: sidebarGroups.chat,
      },
    },
    {
      resource: Discussion,
      options: {
        parent: sidebarGroups.chat,
      },
    },
    {
      resource: Heuristic,
      options: {
        parent: sidebarGroups.heuristic,
      },
    },
    {
      resource: Log,
      options: {
        parent: sidebarGroups.log,
      },
    },
  ],
  rootPath: "/admin",
  branding: {
    companyName: "COUX Admin",
    softwareBrothers: false,
  },
  pages: {
    Colab: {
      component: AdminBro.bundle("../admin/Colab"),
    },
  },
});
const adminRouter = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  cookieName: process.env.ADMIN_COOKIE_NAME || "coux-admin",
  cookiePassword: process.env.ADMIN_COOKIE_PASS || "coux-admin-pass",
  authenticate: async (email, password) => {
    const user = await User.findByCredentials(email, password);
    if (user) {
      if (user.isAdmin && user.isVerified) {
        return user;
      }
      return null;
    }
    return null;
  },
});

module.exports = { adminBro, adminRouter };
