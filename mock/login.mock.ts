import { defineMock } from "./base";

export default defineMock([
  // 添加用户登录接口
  {
    url: "user/login",
    method: ["POST"],
    body: {
      code: "00000",
      data: {
        accessToken: "mock-token",
        refreshToken: "mock-refresh-token",
        tokenType: "Bearer",
        expiresIn: 7200,
      },
      msg: "登录成功",
    },
  },

  // 添加获取用户信息接口
  {
    url: "account/info",
    method: ["GET"],
    body: {
      code: "00000",
      data: {
        userId: "2",
        username: "admin",
        nickname: "系统管理员",
        avatar: "https://foruda.gitee.com/images/1723603502796844527/03cdca2a_716974.gif",
        roles: ["ADMIN"],
        perms: ["*:*:*"],
      },
      msg: "获取用户信息成功",
    },
  },

  // 添加退出登录接口
  {
    url: "account/logout",
    method: ["POST"],
    body: {
      code: "00000",
      data: {},
      msg: "退出登录成功",
    },
  },
]);
