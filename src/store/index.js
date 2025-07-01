import Vue from "vue";
import Vuex from "vuex";
import user from './modules/user';
Vue.use(Vuex);

const actions = {};
const mutations = {
    handleUser(state, userInfo) {
        state.userInfo = userInfo;
        state.name = userInfo.staffName;
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
    },
    outUser(state) {
        state.userInfo = {};
        state.name = '';
        localStorage.removeItem("userInfo");
    }
};
const state = {
    title: "潍坊市矿业资源审批系统",
    menuTitle: "潍坊市矿业资源审批系统",
    userInfo: JSON.parse(localStorage.getItem("userInfo"))
};
const modules = {
    user
}
const getters = {
    userInfo(state) {
        return state.userInfo;
    }
};
export default new Vuex.Store({
    actions,
    mutations,
    state,
    modules,
    getters
})
