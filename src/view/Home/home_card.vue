<template>
  <div class="home-card">
    <div class="logout-btn" @click="logout">退出登录</div>
    <div class="settings-btn" @click="gosetting">系统后台</div>

    <div class="page-header">
      <div class="header-content">
        <h1>林业一体化管理平台</h1>
        <div class="sub-title">Forest Integrated Management Platform</div>
        <div class="header-divider"></div>
      </div>
    </div>
    <div class="card-container">
      <div class="card-row">
        <div
          class="card-item"
          v-for="(item, index) in cardList"
          :key="index"
          @click="handleCardClick(item)"
          :style="{ animationDelay: index * 0.2 + 's' }"
        >
          <div class="card-content" :class="item.className">
            <div class="card-icon">
              <img :src="item.icon" alt="" />
              <div class="icon-effect"></div>
            </div>
            <div class="card-info">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
            <div class="card-bg">
              <div class="bg-effect"></div>
            </div>
            <div class="hover-effect"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomeCard",
  data() {
    return {
      cardList: [
        {
          title: "督查执法",
          description: "林业执法监督管理系统",
          icon: require("@/assets/image/home/law.png"),
          path: "/Main",
          className: "law-card",
        },
        {
          title: "林长网格",
          description: "林长制网格化管理平台",
          icon: require("@/assets/image/home/wangge.png"),
          path: "/commandDispatch",
          className: "grid-card",
        },
        {
          title: "领导驾驶舱",
          description: "林业数据可视化平台",
          icon: require("@/assets/image/home/jiashicang.png"),
          path: "/screenstatistics",
          className: "dashboard-card",
        },
        {
          title: "监测预警",
          description: "林业监测预警系统",
          icon: require("@/assets/image/home/jiance.png"),
          path: "/commandDispatchLZZ",
          className: "monitor-card",
        },
        {
          title: "三维一张图",
          description: "林业三维可视化平台",
          icon: require("@/assets/image/home/sanweilindi.png"),
          path: "https://sdzrzy.cn:9912/home",
          className: "map3d-card",
        },
      ],
    };
  },
  methods: {
    handleCardClick(item) {
      let userinfo = localStorage.getItem("userInfo");
      if (!userinfo) {
        this.$message.error("请先登录");
        this.$router.push("/login");
        return;
      }
      window.open(item.path, "_blank");
    },
    logout() {
      this.$confirm("确定退出登录吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          localStorage.clear();
          sessionStorage.clear();
          this.$router.push("/login");
        })
        .catch(() => {});
    },
    gosetting() {
      let userinfo = localStorage.getItem("userInfo");
      if (!userinfo) {
        this.$message.error("请先登录");
        this.$router.push("/login");
        return;
      }
      window.open("/layermanage", "_blank");
    },
  },
};
</script>

<style lang="scss" scoped>
.home-card {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #217ce4, #023ead);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  .logout-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    cursor: pointer;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    animation: titleSlideDown 1s ease-out forwards;
    &:hover {
      color: rgb(0, 153, 255);
    }
  }
  .settings-btn {
    position: absolute;
    top: 20px;
    left: 20px;
    cursor: pointer;
    color: #fff;
    font-size: 18px;
    font-weight: 600;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    animation: titleSlideDown 1s ease-out forwards;
    &:hover {
      color: rgb(0, 153, 255);
    }
  }

  .page-header {
    width: 100%;
    padding: 30px 0;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.05) 25%,
      rgba(255, 255, 255, 0.1) 50%,
      rgba(255, 255, 255, 0.05) 75%,
      rgba(255, 255, 255, 0) 100%
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
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        animation: titleSlideDown 1s ease-out forwards;
      }

      .sub-title {
        color: rgba(255, 255, 255, 0.7);
        font-size: 18px;
        margin-top: 10px;
        font-family: "Arial", sans-serif;
        letter-spacing: 1px;
        animation: titleSlideUp 1s ease-out forwards;
      }

      .header-divider {
        width: 60%;
        height: 2px;
        margin: 20px auto 0;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.5) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: dividerExpand 1.2s ease-out forwards;
      }
    }
  }

  .card-container {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 20px;

    .card-row {
      width: 100%;
      max-width: 1800px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 20px;
      padding: 20px;
      perspective: 2000px;
    }

    .card-item {
      cursor: pointer;
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-10px);

        .hover-effect {
          opacity: 1;
        }

        .icon-effect {
          transform: scale(1.2);
        }

        .bg-effect {
          transform: scale(1.1);
        }
      }
    }

    .card-content {
      height: 280px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      transform-style: preserve-3d;
      transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 30px 15px;
      position: relative;
      overflow: hidden;

      &::before {
        content: "";
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(
          to bottom right,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.1) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        transform: rotate(-45deg);
        z-index: 1;
        transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        pointer-events: none;
        opacity: 0;
      }

      &:hover {
        transform: translateY(-20px) rotateX(10deg);
        box-shadow: 0 25px 45px rgba(0, 0, 0, 0.3);

        &.law-card {
          box-shadow: 0 25px 45px rgba(41, 128, 185, 0.3);
        }

        &.grid-card {
          box-shadow: 0 25px 45px rgba(46, 204, 113, 0.3);
        }

        &.dashboard-card {
          box-shadow: 0 25px 45px rgba(155, 89, 182, 0.3);
        }

        &.monitor-card {
          box-shadow: 0 25px 45px rgba(230, 126, 34, 0.3);
        }

        &.map3d-card {
          box-shadow: 0 25px 45px rgba(52, 152, 219, 0.3);
        }

        &::before {
          animation: shine 1.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .card-icon {
          transform: translateZ(30px) scale(1.1);
        }

        .card-info {
          transform: translateZ(20px);
        }
      }

      .card-icon {
        position: relative;
        z-index: 2;
        width: 90px;
        height: 90px;
        margin-bottom: 25px;
        transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      .card-info {
        position: relative;
        z-index: 2;
        text-align: center;
        transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);

        h3 {
          font-size: 24px;
          margin-bottom: 12px;
          font-weight: 600;
          background: linear-gradient(
            to right,
            #ffffff,
            rgba(255, 255, 255, 0.8)
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        p {
          font-size: 14px;
          line-height: 1.4;
          color: rgba(255, 255, 255, 0.8);
          max-width: 200px;
          margin: 0 auto;
        }
      }

      .card-bg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;

        .bg-effect {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(
            circle at center,
            rgba(255, 255, 255, 0.1) 0%,
            transparent 70%
          );
          transition: transform 0.3s ease;
        }
      }

      .hover-effect {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          45deg,
          transparent,
          rgba(255, 255, 255, 0.1),
          transparent
        );
        opacity: 0;
        transition: opacity 0.3s ease;
      }
    }

    // 为每个卡片设置不同的渐变背景
    .law-card {
      background: linear-gradient(
        135deg,
        rgba(41, 128, 185, 0.8),
        rgba(0, 79, 159, 0.9)
      );
      border-color: rgba(41, 128, 185, 0.5);
    }

    .grid-card {
      background: linear-gradient(
        135deg,
        rgba(46, 204, 113, 0.8),
        rgba(0, 148, 68, 0.9)
      );
      border-color: rgba(46, 204, 113, 0.5);
    }

    .dashboard-card {
      background: linear-gradient(
        135deg,
        rgba(155, 89, 182, 0.8),
        rgba(108, 52, 131, 0.9)
      );
      border-color: rgba(155, 89, 182, 0.5);
    }

    .monitor-card {
      background: linear-gradient(
        135deg,
        rgba(230, 126, 34, 0.8),
        rgba(175, 96, 26, 0.9)
      );
      border-color: rgba(230, 126, 34, 0.5);
    }

    .map3d-card {
      background: linear-gradient(
        135deg,
        rgba(52, 152, 219, 0.8),
        rgba(26, 96, 147, 0.9)
      );
      border-color: rgba(52, 152, 219, 0.5);
    }
  }
}

// 修改响应式布局
@media screen and (max-width: 1600px) {
  .card-container {
    .card-row {
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
    }
  }
}

@media screen and (max-width: 1200px) {
  .card-container {
    .card-row {
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
  }
}

@media screen and (max-width: 768px) {
  .card-container {
    .card-row {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .card-content {
      height: 240px;

      .card-icon {
        width: 70px;
        height: 70px;
        margin-bottom: 20px;
      }

      .card-info {
        h3 {
          font-size: 20px;
        }

        p {
          font-size: 13px;
        }
      }
    }
  }
}

// 添加动画
@keyframes rotateIn {
  0% {
    opacity: 0;
    transform: perspective(2000px) rotateY(180deg) translateZ(100px);
  }
  50% {
    opacity: 0.5;
    transform: perspective(2000px) rotateY(90deg) translateZ(50px);
  }
  100% {
    opacity: 1;
    transform: perspective(2000px) rotateY(0) translateZ(0);
  }
}

@keyframes float {
  0%,
  5% {
    transform: translateY(0) rotateY(0) translateZ(0);
  }
  50% {
    transform: translateY(-20px) rotateY(10deg) translateZ(20px);
  }
  100% {
    transform: translateY(0) rotateY(0) translateZ(0);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.card-item {
  animation: rotateIn 0.8s ease-out forwards, float 6s ease-in-out infinite;
  opacity: 0;
  transform-origin: left center;

  &:nth-child(even) {
    transform-origin: right center;
    animation: rotateIn 0.8s ease-out forwards, float 6s ease-in-out infinite;
    animation-direction: normal, normal;
  }
}

.icon-effect {
  animation: pulse 2s ease-in-out infinite;
}

.card-content {
  &::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      to bottom right,
      rgba(255, 255, 255, 0.2) 0%,
      rgba(255, 255, 255, 0.05) 40%,
      transparent 50%,
      rgba(255, 255, 255, 0.05) 60%,
      rgba(255, 255, 255, 0.2) 100%
    );
    transform: rotate(-45deg);
    animation: shine 3s ease-in-out infinite;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }
}

@keyframes shine {
  0% {
    transform: rotate(-45deg) translateX(-200%);
  }
  100% {
    transform: rotate(-45deg) translateX(200%);
  }
}

.card-icon {
  img {
    animation: iconRotate 0.8s ease-out backwards;
  }
}

@keyframes iconRotate {
  0% {
    opacity: 0;
    transform: rotate(-180deg) scale(0.5);
  }
  100% {
    opacity: 1;
    transform: rotate(0) scale(1);
  }
}

.card-info {
  h3,
  p {
    animation: slideIn 0.8s ease-out backwards;
  }

  p {
    animation-delay: 0.2s;
  }
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

// 添加标题动画
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
