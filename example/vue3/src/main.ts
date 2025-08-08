import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
// import screenRecord from "../../../packages/screenRecord/src/index";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

// import whisperMonitor, { plugins } from "../../../v2/dist/bundle.js";

// const { clickPlugin } = plugins;

// console.log(plugins);

import "../../../dist/whisperMonitor.js";

const app = createApp(App);

// app.config.errorHandler = (err, vm, info) => {
//   console.log(err, vm, info);
// };

const { clickPlugin, jsErrorPlugin, promiseErrorPlugin } =
  window.WhisperMonitor?.plugins ?? {};
app.use(router);
app.use(window.WhisperMonitor, {
  breadcrumbOptions: {
    enable: true,
  },
  reportOptions: {
    url: "http://localhost:8090/reportData",
    method: "xhr",
    payloadType: "json",
    globalData: {
      userInfo: {
        name: "张三",
        age: 18,
      },
      projectInfo: {
        projectName: "项目A",
        projectId: "123456",
      },
    },
  },
  plugins: [clickPlugin, jsErrorPlugin, promiseErrorPlugin],
});

// app.use(plugin, { message: "Custom Plugin Initialized!" });
app.use(ElementPlus);
app.mount("#app");
