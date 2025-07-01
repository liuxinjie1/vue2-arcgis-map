import {
  UserLoginInfo
} from "@/api/Login";
import {
  getToken,
  setToken,
  removeToken
} from "@/utils/auth";
const user = {
  state: {
    token: getToken(),
    userInfo: {},
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token;
    },
    SET_USER_INFO: (state, userInfo) => {
      state.userInfo = userInfo;
    },
  },

  actions: {

    UserLoginInfo({
      commit
    }, userInfo) {
      return new Promise((resolve, reject) => {
        UserLoginInfo(userInfo)
              .then(res => {
                if (res.code == 200) {
                  setToken('auth_token', res.result.auth_token);
                  resolve(res.result);
                } else {
                  reject(res.message);
                }
              })
              .catch(error => {
                reject("系统内部异常，请联系管理员处理！");
              });
      });
    },
    // 退出系统
    LogOut({
      commit,
      state
    }) {
      return new Promise((resolve, reject) => {
        logout(state.token)
          .then(() => {
            commit("SET_TOKEN", "");
            commit("SET_USER_INFO", "");
            removeToken("auth_token");
            localStorage.clear();
            resolve();
          })
          .catch(error => {
            reject(error);
          });
      });
    },

  }
}

export default user;
