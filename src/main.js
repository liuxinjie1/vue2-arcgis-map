import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router';
import router from "./router";
import * as echarts from 'echarts';
import ElementUI from 'element-ui';
import store from './store';
import 'element-ui/lib/theme-chalk/index.css';
import splitPane from 'vue-splitpane';
import "./assets/icon/iconfont.css"; //引入阿里巴巴矢量图标库
import './assets/Alimamafont/font.css'//引入阿里巴巴字体库
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import './components/style/_globals.scss';  // 引入 SCSS 文件

import { getToken, removeToken } from "@/utils/auth";
import VueAMap from 'vue-amap';
import "echarts-gl";
import "echarts-liquidfill";
import {
    selectDictLabel,
    resetForm,
    handleTree
} from "@/utils/utils";
import service from '@/utils/requestlocal.js';
import { v4 as uuidv4 } from 'uuid';
import './assets/styles/icons.css'


// 富文本插件相关
import './utils/ue/ueditor.config'
import './utils/ue/ueditor.all.min'
import './utils/ue/lang/zh-cn/zh-cn'
import './utils/ue/ueditor.parse.min'

import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// require styles 引入样式
// vue2



Vue.component('split-pane', splitPane);
Vue.prototype.handleTree = handleTree;
Vue.use(ElementUI);
Vue.use(VueRouter);
Vue.use(VueAMap)
Vue.use(VueQuillEditor)

Vue.prototype.resetForm = resetForm;
Vue.config.productionTip = false;

Vue.prototype.$bus = new Vue();
Vue.prototype.$echarts = echarts;
Vue.prototype.$http = service
Vue.prototype.$uuid = uuidv4;
Vue.prototype.selectDictLabel = selectDictLabel;
Vue.prototype.msgSuccess = function (msg) {
    this.$message({ showClose: true, message: msg, type: "success" });
};

VueAMap.initAMapApiLoader({
    key: '770dc2b5c16a8df5b83ea035dd5c3415',
    plugin: ['AMap.PlaceSearch'],
    v: '1.4.4'
})

window._AMapSecurityConfig = {
    securityJsCode: '63eaa41b7b5b319761f65b03af47081e' // 高德Web端安全密钥
}


NProgress.configure({ showSpinner: false });
router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth == false)) {
        next() // 确保一定要调用 next()
    } else {
        if (getToken('auth_token')) {
            if (to.path === "/login") {
                removeToken('auth_token')
                next()
                NProgress.done();
            } else {
                var userLs = JSON.parse(window.localStorage.getItem('userInfo'));
                // to要进入的目标路由,到哪去Erom离开的路由,哪来的savePosition内容
                //判断是否需要缓存
                // if (to.path == '/projectlist' && from.path =='/projectInformation') {
                //     to.meta.keepAlive = true;  // 让 列表页 缓存，即不刷新
                // } else {
                //     to.meta.keepAlive = false;  // 让 列表页 即不缓存，刷新
                // }
                if (userLs != undefined && userLs != null) {
                    next()
                } else {
                    location.href = `/login`;
                }
            }
        } else {
            if (to.path === "/login") {
                next()
                NProgress.done();
            } else {
                location.href = `/login`;
            }

        }
    }

});
new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App),
})
