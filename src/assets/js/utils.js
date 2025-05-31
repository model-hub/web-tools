/**
 * 通用的复制文本方法，支持移动端
 * @param {string} text 要复制的文本
 * @returns {Promise<void>}
 */
export const copyText = (text) => {
  return new Promise((resolve, reject) => {
    // 优先使用 navigator.clipboard API
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(resolve)
        .catch(() => {
          // 如果 clipboard API 失败，回退到传统方法
          fallbackCopyText(text, resolve, reject)
        })
    } else {
      // 在不支持 clipboard API 的环境中使用传统方法
      fallbackCopyText(text, resolve, reject)
    }
  })
}

/**
 * 传统的复制文本方法
 * @param {string} text 要复制的文本
 * @param {Function} resolve Promise resolve 函数
 * @param {Function} reject Promise reject 函数
 */
const fallbackCopyText = (text, resolve, reject) => {
  try {
    // 创建临时文本区域
    const textArea = document.createElement('textarea')
    textArea.value = text
    
    // 设置样式使其不可见
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    
    // 选择文本
    textArea.focus()
    textArea.select()
    
    // 执行复制命令
    const successful = document.execCommand('copy')
    textArea.remove()
    
    if (successful) {
      resolve()
    } else {
      reject(new Error('复制失败'))
    }
  } catch (err) {
    reject(err)
  }
} 