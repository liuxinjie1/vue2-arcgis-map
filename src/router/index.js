import VueRouter from 'vue-router';

// 解决编程式路由往同一地址跳转时会报错的情况
const originalPush = VueRouter.prototype.push;
const originalReplace = VueRouter.prototype.replace;

// push
VueRouter.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalPush.call(this, location, onResolve, onReject);
  return originalPush.call(this, location).catch(err => err);
};

//replace
VueRouter.prototype.replace = function push(location, onResolve, onReject) {
  if (onResolve || onReject)
    return originalReplace.call(this, location, onResolve, onReject);
  return originalReplace.call(this, location).catch(err => err);
};
export const RouterList = [
  {
    path: '/Login',
    component: resolve => require(['../view/login/index'], resolve),
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    component: resolve => require(['../view/Home/home_card'], resolve),
    meta: { requiresAuth: false }
  },

  {
    path: '/map',
    component: resolve => require(['../view/map'], resolve),
    meta: { requiresAuth: false }
  },
  {
    path: '/settingMain',
    component: resolve => require(['../view/main/setting'], resolve),
    meta: { requiresAuth: false },
    children: [


    ]

  },
  {
    path: '/Main',
    component: resolve => require(['../view/main/index'], resolve),
    meta: { requiresAuth: false },
    redirect: '/home_map',
    children: [

      {
        path: '/home_map',
        component: resolve => require(['../view/Home/home_map'], resolve),
        meta: { requiresAuth: false }
      }


    ]
  },
  {
    path: '/login',
    component: resolve => require(['../view/login/index'], resolve),
    meta: { requiresAuth: false }
  },
  { path: '*', redirect: '/login' }
]
export default new VueRouter({
  mode: 'history',
  routes: RouterList
})