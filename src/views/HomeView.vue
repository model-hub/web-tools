<template>
  <div class="main">
    <div style="display: flex; justify-content: center; margin-bottom: 1%">
      <el-button type="primary" size="small" @click="doCompare(1)">左对右去重</el-button>
      <el-button type="primary" size="small" @click="doCompare(2)">右对去左重</el-button>
      <el-button type="primary" size="small" @click="reset">重置</el-button>
      <el-button type="primary" size="small" @click="copy">复制结果</el-button>
    </div>
    <div class="top">
      <div style="display: flex; margin: 0 auto">
        <div class="text-div">
          <el-input type="textarea" rows="27" resize="none" v-model="left" />
          <div>
            <el-upload
              ref="upload1"
              v-model:file-list="fileList1"
              :limit="1"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleChange1"
            >
              <el-button type="primary" size="small">加载文件</el-button>
            </el-upload>
          </div>
        </div>
        <div class="text-div" style="margin: 0 1rem">
          <el-input type="textarea" rows="27" resize="none" v-model="right" />
          <div>
            <el-upload
              ref="upload2"
              v-model:file-list="fileList2"
              :limit="1"
              :auto-upload="false"
              :show-file-list="false"
              :on-change="handleChange2"
            >
              <el-button type="primary" size="small">加载文件</el-button>
            </el-upload>
          </div>
        </div>
        <div class="text-div">
          <el-input
            ref="result"
            type="textarea"
            rows="27"
            resize="none"
            v-model="result"
            readonly
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      left: '',
      right: '',
      result: '',
      fileList1: [],
      fileList2: []
    }
  },
  created() {
    document.title = '去重工具'
  },
  methods: {
    doCompare(type) {
      let left = this.left
      let right = this.right
      let list = []
      if (type === 1) {
        list = this.compare(left.split('\n'), right.split('\n'))
      } else {
        list = this.compare(right.split('\n'), left.split('\n'))
      }
      let str = ''
      for (let i = 0; i < list.length; i++) {
        str += list[i] + '\n'
      }
      this.result = str
    },
    compare(arr1, arr2) {
      return this.findFirstDiff(this.removeEmpty(arr1), this.removeEmpty(arr2))
    },
    removeEmpty(list) {
      const newList = []
      for (let i = 0; i < list.length; i++) {
        let str = list[i].trim()
        if (str) {
          newList.push(str)
        }
      }
      return newList
    },
    findFirstDiff(first, second) {
      const newArr = []
      for (let i = 0; i < first.length; i++) {
        if (second.indexOf(first[i]) === -1) {
          newArr.push(first[i])
        }
      }
      return newArr
    },
    reset() {
      this.left = ''
      this.right = ''
      this.result = ''
    },
    copy() {
      this.$refs.result.select()
      document.execCommand('copy')
      this.$message.success('复制成功')
    },
    handleChange1(file) {
      const that = this
      const reader = new FileReader()
      reader.readAsText(file.raw)
      reader.onload = function (event) {
        let text = event.target.result
        that.left = text
        that.$refs.upload1.clearFiles()
      }
    },
    handleChange2(file) {
      const that = this
      const reader = new FileReader()
      reader.readAsText(file.raw)
      reader.onload = function (event) {
        let text = event.target.result
        that.right = text
        that.$refs.upload2.clearFiles()
      }
    }
  }
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
