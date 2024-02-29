<template>
  <div class="main">
    <div style="display: flex; justify-content: center; margin-bottom: 1%">
      <el-button type="primary" size="small" @click="doCompare(1)">左对右去重</el-button>
      <el-button type="primary" size="small" @click="doCompare(2)">右对去左重</el-button>
      <el-button type="primary" size="small" @click="reset()">重置</el-button>
      <el-button type="primary" size="small" @click="copy()">复制结果</el-button>
    </div>
    <div class="top">
      <div style="display: flex; margin: 0 auto">
        <div class="text-div">
          <el-input type="textarea" rows="27" resize="none" />
        </div>
        <div class="text-div" style="margin: 0 1rem">
          <el-input type="textarea" rows="27" resize="none" />
        </div>
        <div class="text-div">
          <el-input type="textarea" rows="27" resize="none" readonly />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Test'
}
</script>

<style scoped>
textarea {
  resize: none;
}

.text-div {
  width: 20rem;
  display: block;
}

.main {
  display: block;
}

.top {
  width: 100%;
  display: flex;
}
</style>
