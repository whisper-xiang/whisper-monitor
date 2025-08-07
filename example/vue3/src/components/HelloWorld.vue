<script setup lang="ts">
import { ref } from 'vue';

const tableData = ref([]);

const codeErr = () => {
  getTableData()
  let a = undefined;
  if (a.length) {
    console.log("1");
  }
};

const resourceError = () => {
  let script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://abc.com/index.js';
  document.body.appendChild(script);
}

const getTableData = () => {
  setTimeout(() => {
    fetch(`http://localhost:8090/getErrorList`)
      .then((response) => response.json())
      .then((res) => {
        console.log(res, "res");
        tableData.value = res.data;
      });
  }, 500);
};

const promiseErr = () => {
  new Promise(resolve => {
    let person = {};
    person.name.age();
    resolve();
  });
}

const xhrError = () => {
  let ajax = new XMLHttpRequest();
  ajax.open('GET', 'https://abc.com/test/api');
  ajax.setRequestHeader('content-type', 'application/json');
  ajax.onreadystatechange = function () {
    if (ajax.readyState == 4) {
    }
    if (ajax.status === 200 || ajax.status === 304) {
      console.log('ajax', ajax);
    }
  };
  ajax.send();
  ajax.addEventListener('loadend', () => { });
}

const visible = ref(false);
const playScreen = () => {
  visible.value = true;
  new rrwebPlayer({
    target: document.getElementById('revert'),
    props: {
      events,
      UNSAFE_replayCanvas: true
    }
  });
}

const unhandledrejection = () => {
  new Promise((resolve, reject) => {
    reject('Something went wrong');
  }).then(result => {
    console.log(result);
  });
}
</script>

<template>
  <el-button type="primary" @click="codeErr">js错误</el-button>
  <el-button type="danger" @click="promiseErr">promise错误</el-button>
  <el-button type="info" @click="xhrError">xhr请求报错</el-button>
  <el-button type="primary">点击触发</el-button>
  <el-button type="success" @click="playScreen">播放录屏</el-button>
  <el-button type="success" @click="unhandledrejection">unhandledrejection</el-button>
  <el-button type="danger" @click="resourceError">加载资源报错</el-button>

  <!-- <el-button type="primary" @click="performance">performance</el-button> -->
  <!-- <el-button type="success" @click="asyncError">异步错误</el-button> -->
  <!-- <el-button type="danger" @click="promiseErr">promise错误</el-button>
  <el-button type="info" @click="xhrError">xhr请求报错</el-button>
  <el-button type="warning" @click="fetchError">fetch请求报错</el-button> -->


  <div id="revert" ref="revert"></div>
  <!-- <el-dialog title="性能监控" :visible.sync="visible">
    <div id="revert" ref="revert" style="width: 80vw; height: 10vh;"></div>
  </el-dialog> -->

  <el-table :data="tableData" style="width: 100%">
    <el-table-column prop="name" label="Name" />
    <el-table-column prop="age" label="Age" />
  </el-table>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}

#revert {
  width: 100%;
  display: flex;
}
</style>
