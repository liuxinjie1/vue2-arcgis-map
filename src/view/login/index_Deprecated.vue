<template>
  <div class="body" v-loading="loading">
    <div class="top">
      <span>新泰市森林资源督察执法平台</span>
    </div>
    <div class="content">
      <el-card class="logincar">
        <div slot="header" class="clearfix">
          <span>账户登录 </span>
          <span> USER LOGIN</span>
        </div>
        <el-form
          ref="loginForm"
          :model="loginForm"
          class="demo-ruleForm"
          :rules="rules"
          @keyup.enter.native="loginBtn()"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="el-icon-user"
            ></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              placeholder="请输入密码"
              :type="ispassword ? 'password' : 'text'"
            >
              <i
                slot="prefix"
                class="el-input__icon el-icon-view"
                @click="ispassword = !ispassword"
              ></i>
            </el-input>
          </el-form-item>
        </el-form>
        <el-button style="width: 100%" type="success" @click="loginBtn">登录</el-button>
      </el-card>
    </div>
    <div class="foot"></div>
  </div>
</template>
<script>
import md5 from "js-md5";
export default {
  // mixins: [AutoResize],
  data() {
    return {
      loading: false,
      ispassword: true,
      loginForm: {
        username: "",
        password: "",
        staues: 1,
      },
      checked: false,
      rules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 3,
            max: 25,
            message: "长度在 3 到 25 个字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  created() {},
  mounted() {},
  methods: {
    loginBtn() {
      if (this.loading == false) {
        this.loading = true;
        console.log(this.loginForm);
        this.$refs.loginForm.validate((valid) => {
          if (valid) {
            let _this = this;
            var userForm = JSON.stringify(_this.loginForm);
            var loginuserForm = JSON.parse(userForm);
            loginuserForm.password = md5(loginuserForm.password);
            _this.$store
              .dispatch("UserLoginInfo", loginuserForm)
              .then((res) => {
                let data = res;
                data["password"] = loginuserForm.password;
                _this.$store.commit("handleUser", data);
                _this.loading = false;
                console.log(data);
                _this.$router.push({
                  path: "/foresmanagement",
                });
                _this.$message({
                  message: "登陆成功",
                  type: "success",
                });
              })
              .catch((msg) => {
                _this.loading = false;
                _this.errorMsg = msg;
                _this.$message({
                  message: msg,
                  type: "error",
                });
              })
              .finally((res) => {
                _this.loading = false;
              });
          }
        });
        this.loading = false;
      }
    },
  },
};
</script>
<style lang="scss" scoped>
@import "../../components/style/login";
</style>
 