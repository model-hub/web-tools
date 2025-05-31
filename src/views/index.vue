<template>
  <div style="display: flex; justify-content: center; margin-top: 10rem">
    <el-button type="primary" @click="goPage('compare')">文本对比</el-button>
    <el-button type="primary" @click="goPage('vin')">车架号</el-button>
    <el-button type="primary" @click="goPage('json')">Json</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    goPage(path) {
      this.$router.push({ path: path })
    }
  }
}
</script>

<style scoped></style>
