<template>
  <div class="login-container" v-loading="loading">
    <div class="page-header">
      <div class="header-content">
        <h1>林业一体化管理平台</h1>
        <div class="sub-title">Forest Resources Management Platform</div>
        <div class="header-divider"></div>
      </div>
    </div>
    
    <div class="login-content">
      <div class="login-card">
        <div class="card-header">
          <h2>账户登录</h2>
          <div class="sub-header">USER LOGIN</div>
        </div>
        
        <el-form
          ref="loginForm"
          :model="loginForm"
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
          
          <el-button type="primary" @click="loginBtn" class="login-btn">登录</el-button>
        </el-form>
      </div>
    </div>
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
                  path: "/home",
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
.login-container {
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #1a2a6c, #152238);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .page-header {
    width: 100%;
    padding: 30px 0;
    background: linear-gradient(90deg, 
      rgba(255,255,255,0) 0%,
      rgba(255,255,255,0.05) 25%,
      rgba(255,255,255,0.1) 50%,
      rgba(255,255,255,0.05) 75%,
      rgba(255,255,255,0) 100%
    );
    
    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
      padding: 0 20px;

      h1 {
        color: #fff;
        font-size: 36px;
        font-weight: 600;
        margin: 0;
        letter-spacing: 2px;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        animation: titleSlideDown 1s ease-out forwards;
      }

      .sub-title {
        color: rgba(255,255,255,0.7);
        font-size: 18px;
        margin-top: 10px;
        font-family: 'Arial', sans-serif;
        letter-spacing: 1px;
        animation: titleSlideUp 1s ease-out forwards;
      }

      .header-divider {
        width: 60%;
        height: 2px;
        margin: 20px auto 0;
        background: linear-gradient(90deg,
          rgba(255,255,255,0) 0%,
          rgba(255,255,255,0.5) 50%,
          rgba(255,255,255,0) 100%
        );
        animation: dividerExpand 1.2s ease-out forwards;
      }
    }
  }

  .login-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;

    .login-card {
      width: 400px;
      padding: 40px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 15px;
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
      animation: cardSlideUp 0.8s ease-out forwards;

      .card-header {
        text-align: center;
        margin-bottom: 30px;

        h2 {
          font-size: 24px;
          color: #fff;
          margin: 0;
          font-weight: 600;
          background: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0.8));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sub-header {
          color: rgba(255,255,255,0.7);
          font-size: 14px;
          margin-top: 5px;
          letter-spacing: 1px;
        }
      }

      .el-form {
        .el-form-item {
          margin-bottom: 25px;

          .el-input {
            .el-input__inner {
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.2);
              color: #fff;
              height: 45px;
              border-radius: 8px;
              transition: all 0.3s ease;

              &:focus {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 255, 255, 0.3);
                box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
              }

              &::placeholder {
                color: rgba(255, 255, 255, 0.5);
              }
            }

            .el-input__prefix {
              color: rgba(255, 255, 255, 0.7);
            }
          }
        }

        .login-btn {
          width: 100%;
          height: 45px;
          background: linear-gradient(135deg, 
            rgba(41, 128, 185, 0.8), 
            rgba(0, 79, 159, 0.9)
          );
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          margin-top: 10px;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(41, 128, 185, 0.4);
          }

          &:active {
            transform: translateY(0);
          }
        }
      }
    }
  }
}

@keyframes cardSlideUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes titleSlideDown {
  0% {
    opacity: 0;
    transform: translateY(-50px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes titleSlideUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes dividerExpand {
  0% {
    opacity: 0;
    transform: scaleX(0);
  }
  100% {
    opacity: 1;
    transform: scaleX(1);
  }
}
</style>
 