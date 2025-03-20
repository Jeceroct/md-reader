<!-- eslint-disable no-useless-escape -->
<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<template>
  <div class="imgPreview">
    <img class="imgPreviewImg" src="" alt="" />
  </div>
  <div class="upload" v-if="isOpen == false">
    拖入或点击打开md文件
    <!-- <el-upload drag action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" accept="text/x-markdown"
      :on-success="uploadMd">
      打开md文件
    </el-upload> -->
    <input id="file" type="file" accept="text/x-markdown" style="display: none;" />
    <!-- <label for="file">
      <span>打开文件</span>
    </label> -->
  </div>
  <div class="container" v-if="isOpen == true">
    <div class="navList"></div>
    <div class="preview"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
// import axios from 'axios'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-light.css'
// import 'mermaid/dist/'

import { Plugins } from '@capacitor/core'
const { SendIntent } = Plugins

import mermaid from 'mermaid'
import path from 'path'

if (SendIntent) {
  SendIntent.addListener('appSendActionIntent', (data: any) => {
    console.log('SendIntent', data)
    if (data.extraType === 'text/plain') {
      console.log('SendIntent', data.extra)
    }
  })
}

const isOpen = ref(false)

const html = ref<String[]>([])
const navList = ref<String[]>([])

const uploadMd = (file: File) => {
  // console.log('onchange')
  html.value = []
  navList.value = []
  isOpen.value = true
  const navListEle = document.querySelector('.navList') as HTMLElement
  if (navListEle) {
    navListEle.innerHTML = ''
  }
  // const fileEle = document.getElementById('file') as HTMLInputElement
  // const file = fileEle?.files?.[0] as File
  if (!file) {
    console.log('no file')
    return
  }
  const reader = new FileReader()
  reader.readAsText(file)

  reader.onload = e => {
    if (!e.target?.result) {
      console.log('no target')
      return
    }
    const text: String = e.target?.result?.toString()
    if (!text) {
      console.log('no text')
      return
    }

    const isPreStart = ref(true)
    const isInPre = ref(false)
    const isTableStart = ref(false)
    const isInTable = ref(false)
    const isTableHr = ref(false)
    const isInBlockquote = ref(false)

    text.split('\n').forEach((item: string) => {
      //如果是空格开头，先把空格去掉
      item = item.trim()
      // 重置表格状态（表结束）
      if (!item.startsWith('| ') && !item.endsWith(' |') && isTableStart.value == true) {
        isInTable.value = false
        isTableStart.value = false
        html.value.push('</tbody></table>')
      }
      // 丢弃表头后一行
      if (isTableHr.value == true) {
        isTableHr.value = false
        return
      }
      // 代码块内部
      if (isInPre.value == true && !item.startsWith('```')) {
        html.value.push(item + '\n')
        return
      }
      // 块盒结束
      if (isInBlockquote.value == true && !item.startsWith('>')) {
        html.value.push('</blockquote>')
        isInBlockquote.value = false
      }

      // 六级标题
      if (item.startsWith('###### ')) {
        html.value.push('<h6 class="nav6"' + 'id="' + item.replace('###### ', '').replace(/"/g, "'").replace(/\*/g, "").replace(/`/g, "") + '">' + item.replace('###### ', '') + '</h6>')
        navList.value.push(item.replace('###### ', '').replace(/"/g, "'").replace(/\*/g, "").replace(/`/g, ""))
      }
      // 五级标题
      else if (item.startsWith('##### ')) {
        html.value.push('<h5 class="nav5"' + 'id="' + item.replace('##### ', '').replace(/"/g, "'").replace(/\*/g, "").replace(/`/g, "") + '">' + item.replace('##### ', '') + '</h5>')
        navList.value.push(item.replace('##### ', '').replace(/"/g, "'").replace(/\*/g, "").replace(/`/g, ""))
      }
      // 四级标题
      else if (item.startsWith('#### ')) {
        html.value.push('<h4 class="nav4"' + 'id="' + item.replace('#### ', '').replace(/"/g, "'").replace(/\*/g, "").replace(/`/g, "") + '">' + item.replace('#### ', '') + '</h4>')
        navList.value.push(item.replace('#### ', '').replace(/"/g, "'").replace(/\*/g, "").replace(/`/g, ""))
      }
      // 三级标题
      else if (item.startsWith('### ')) {
        html.value.push('<h3 class="nav3"' + 'id="' + item.replace('### ', '').replace(/"/g, "'").replace(/\*/g, "").replace(/`/g, "") + '">' + item.replace('### ', '') + '</h3>')
        navList.value.push(item.replace('### ', '').replace(/"/g, "'").replace(/\*/g, "").replace(/`/g, ""))
      }
      // 二级标题
      else if (item.startsWith('## ')) {
        html.value.push('<h2 class="nav2"' + 'id="' + item.replace('## ', '').replace(/"/g, "'").replace(/\*/g, "").replace(/`/g, "") + '">' + item.replace('## ', '') + '</h2>')
        navList.value.push(item.replace('## ', '').replace(/"/g, "'").replace(/\*/g, "").replace(/`/g, ""))
      }
      // 一级标题
      else if (item.startsWith('# ')) {
        html.value.push('<h1 class="nav1"' + 'id="' + item.replace('# ', '').replace(/"/g, "'").replace(/\*/g, "").replace(/`/g, "") + '">' + item.replace('# ', '') + '</h1>')
        navList.value.push(item.replace('# ', '').replace(/"/g, "'").replace(/\*/g, "").replace(/`/g, ""))
      }
      // 无序列表
      else if (item.startsWith('* ')) {
        html.value.push('<li>' + item.replace('* ', '') + '</li>')
      } else if (item.startsWith('- ')) {
        html.value.push('<li>' + item.replace('- ', '') + '</li>')
      } else if (item.startsWith('+ ')) {
        html.value.push('<li>' + item.replace('+ ', '') + '</li>')
      }
      // 块盒
      else if (item.startsWith('>')) {
        if (isInBlockquote.value == false) {
          html.value.push('<blockquote></p>' + item.replace('>', '') + '</p>')
          isInBlockquote.value = true
        } else {
          html.value.push('<p>' + item.replace('>', '') + '</p>')
        }
      }
      // 代码块
      else if (item.startsWith('```')) {
        // console.log('isPreStart.value', isPreStart.value)
        if (isPreStart.value == true) {
          html.value.push('<pre>' + '<span class="lgg">' + item.replace(/[` ]/img, '') + '</span><p>')
          isPreStart.value = false
          isInPre.value = true
        } else {
          html.value.push('</p></pre>')
          isPreStart.value = true
          isInPre.value = false
        }
      }
      // 目录
      else if (item.startsWith('[TOC]')) {
        html.value.push('<div class="mdNavList"><h5>文件目录</h5></div>')
      }
      // 表格
      else if (item.startsWith('| ') && item.endsWith(' |')) {
        if (isInTable.value == false) {
          isTableStart.value = true
        }
        // 表头
        if (isTableStart.value == true && isInTable.value == false) {
          const theads = item.split('|').slice(1, -1).map((item) => {
            return '<th>' + item + '</th>';
          });
          html.value.push('<table><thead><tr>' + theads.join('') + '</tr></thead><tbody>');
          isInTable.value = true
          isTableHr.value = true
        }
        // 表身
        else {
          const trs = item.split('|').slice(1, -1).map((item) => {
            return '<td>' + item + '</td>';
          });
          html.value.push('<tr>' + trs.join('') + '</tr>');
        }
      }
      // 分割线
      else if (item.startsWith('---')) {
        if (isInTable.value == false) {
          html.value.push('<hr />')
        }
      }
      // 脚注
      else if (item.startsWith('[^')) {
        html.value.push('<sup><span>注释</span>' + item.replace('[^', '').replace(']', '') + '</sup>')
      }
      // 普通文本
      else {
        html.value.push('<p>' + item + '</p>')
      }
    })

    // ! 去掉html.value中所有的空字符串
    html.value = html.value.filter(item => item !== '')

    const isInPreTag = ref(false)
    const htmlString = ref<string>('') // 用于存储处理后的 HTML 字符串

    // 应用行内的特殊样式（代码块中的文字不应用特殊样式）
    html.value.forEach((item) => {
      // 检查当前段落是否在 <pre> 标签内
      if (item.startsWith('<pre>')) {
        isInPreTag.value = true;
      } else if (item.endsWith('</pre>')) {
        isInPreTag.value = false;
      }

      if (!isInPreTag.value) {
        // 加粗
        item = item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        item = item.replace(/__(.*?)__/g, '<strong>$1</strong>');

        // 引用
        if (!item.match(/``(.*?)``/g)) {
          item = item.replace(/`(.*?)`/g, '<code>$1</code>');
        } else {
          item = item.replace(/`(.*?)`(.*?)``(.*?)``/g, '<code>$1</code>$2<code>$3</code>');
          item = item.replace(/``(.*?)``(.*?)`(.*?)`/g, '<code>$1</code>$2<code>$3</code>');
          item = item.replace(/``(.*?)``/g, '<code>$1</code>');
        }

        // 斜体
        item = item.replace(/\*(.*?)\*/g, '<em>$1</em>');
        item = item.replace(/_(.*?)_/g, '<em>$1</em>');

        // 删除线
        item = item.replace(/~~(.*?)~~/g, '<del>$1</del>');

        // 图片
        if (item.match(/!\[(.*?)\]\((.*?)\)/g)) {
          item = item.replace(/!\[(.*?)\]\((.*?)\)/g, `<img src="$2" alt="$1" />`);
        }

        // 超链接
        else {
          item = item.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a class="link" href="$2" target="_blank">$1</a>');
        }
      }

      htmlString.value += item;
    });

    // 加载目录
    const preview = document.querySelector('.preview')
    if (!preview) return
    const navListEle = document.querySelector('.navList')
    if (!preview || !navList.value || !navListEle) {
      console.log('preview or navList is null')
    } else {
      preview.innerHTML = htmlString.value
      navList.value.forEach((item) => {
        navListEle?.appendChild(document.createElement('a'))
        const a = navListEle?.lastChild as HTMLElement
        a.innerHTML = item.toString()
        const target = document.getElementById(item.toString());
        if (target?.classList.contains('nav1')) {
          a.style.marginLeft = '0'
        } else if (target?.classList.contains('nav2')) {
          a.style.marginLeft = '20px'
        } else if (target?.classList.contains('nav3')) {
          a.style.marginLeft = '40px'
        } else if (target?.classList.contains('nav4')) {
          a.style.marginLeft = '60px'
        } else if (target?.classList.contains('nav5')) {
          a.style.marginLeft = '80px'
        } else if (target?.classList.contains('nav6')) {
          a.style.marginLeft = '100px'
        }
        a.onclick = () => {
          // a.scrollIntoView({ behavior: 'smooth' });
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }
      })
      // 如果md文件中有目录，则顺便加载到目录中
      const mdNavList = document.querySelector('.mdNavList')
      if (mdNavList) {
        mdNavList.innerHTML += navListEle.innerHTML
      }
    }

    // 在HTML加载完成后初始化mermaid
    preview.innerHTML = htmlString.value
    mermaid.init({
      theme: 'default',
      securityLevel: 'loose',
      startOnLoad: false
    });
    setTimeout(() => {
      mermaid.run({
        querySelector: '.mermaid:not([data-processed])',
        suppressErrors: true
      });
    }, 100)

    // 代码上色
    const preEle = document.querySelectorAll('pre')
    preEle.forEach((item) => {
      const language = item.querySelector('.lgg')?.textContent?.trim()
      const code = item.lastElementChild as HTMLElement
      if (!language || !code || !code.textContent) return

      // 处理mermaid图表
      if (language.toLowerCase() === 'mermaid') {
        const container = document.createElement('div');
        container.className = 'mermaid';
        container.textContent = code.textContent;
        item.appendChild(container);
        mermaid.render(
          `mermaid-${Date.now()}`,
          code.textContent,
          (svgCode) => {
            container.innerHTML = svgCode;
          }
        );
        item.querySelector('.lgg')?.remove()
        code.remove()
        return
      }

      // 其他代码高亮处理
      try {
        code.innerHTML = hljs.highlight(code.textContent, {
          language: language.toLowerCase(),
          ignoreIllegals: true
        }).value
      } catch (e) {
        code.innerHTML = hljs.highlightAuto(code.textContent).value
      }
    })

    // TODO 加载本地图片
    const imgEle = document.querySelectorAll('img')
    imgEle.forEach((item) => {
      if (!item.src.startsWith('http')) {
        const filedir = filePath
        item.src = path.join(filedir, item.src)
      }
    })

    // 图片点击预览
    imgEle.forEach((item) => {
      item.onclick = () => {
        const imgPreview = document.querySelector('.imgPreview') as HTMLElement
        const imgPreviewImg = document.querySelector('.imgPreviewImg')
        if (imgPreview && imgPreviewImg) {
          imgPreview.style.display = 'flex'
          imgPreviewImg.setAttribute('src', item.getAttribute('src') as string)
        }
      }
    })

    // 图片预览再次点击关闭
    const imgPreview = document.querySelector('.imgPreview') as HTMLElement
    imgPreview.onclick = () => {
      imgPreview.style.display = 'none'
    }
  }
}

// 调用fileSystem打开文件的方法
// const pickFile = async () => {
//   const win = window as any
//   const fileHandle = await win.showOpenFilePicker({
//     types: [
//       {
//         description: 'Markdown File',
//         accept: {
//           'text/markdown': ['.md'],
//         },
//       },
//     ],
//     multiple: false,
//   }).catch(() => {
//     console.error('请上传文件');
//   });
//   if (!fileHandle) {
//     return;
//   }
//   console.log(fileHandle);
//   const data = await fileHandle[0].getFile();
//   console.log(data);
//   uploadMd(data);
// }

onMounted(() => {
  // 正常input打开文件的方法
  const fileBtnEle = document.getElementById('file') as HTMLInputElement
  const uploadEle = document.querySelector('.upload')
  if (!fileBtnEle || !uploadEle) return
  uploadEle?.addEventListener('click', () => {
    fileBtnEle.click()
  })

  // 初始化mermaid
  mermaid.initialize({
    startOnLoad: true,
    securityLevel: 'loose',
    theme: 'default'
  })

  const handlerEvents = (e: any) => {
    e.stopPropagation()
    e.preventDefault()
    switch (e.type) {
      case 'dragenter':
        break

      case 'dragover':
        break

      case 'dragleave':
        break

      // 在拖拽区域内松开鼠标（拖放完成/放入文件）
      case 'drop':
        uploadMd(e.dataTransfer.files[0])
        break
      default:
        break
    }
  }
  const appEle = document.querySelector('#app')
  if (appEle) {
    appEle.addEventListener('dragenter', handlerEvents)
    appEle.addEventListener('dragleave', handlerEvents)
    appEle.addEventListener('dragover', handlerEvents)
    appEle.addEventListener('drop', handlerEvents)
  } else console.log("app获取失败")
  fileBtnEle.onchange = () => {
    if (!fileBtnEle.files) return
    uploadMd(fileBtnEle.files[0])
  }
})
</script>

<style>
/* mermaid图表样式 */
pre .mermaid {
  background-color: #fff !important;
  padding: 20px !important;
  margin: 20px 0;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    max-width: 100%;
    height: auto !important;
  }

  .label {
    font-family: 'Trebuchet MS', sans-serif;
  }
}

code {
  background-color: #d5d5d57c;
  padding: 2px 4px;
  margin: 0 2px;
  border-radius: 4px;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 14px;
  color: #000000;
}

h1 {
  font-size: 3em;
}

h2 {
  font-size: 2.2em;
}

h3 {
  font-size: 1.8em;
}

h4 {
  font-size: 1.6em;
}

h5 {
  font-size: 1.4em;
}

h6 {
  font-size: 1.2em;
}

li {
  margin: 5px 0;
}

p {
  margin: 10px 0;
}

a.link {
  color: #333;
  text-decoration: none;
  border-bottom: 1px solid #333;
  /* border-radius: 5px; */
  margin: 0 5px;
  padding: 5px;

  &:hover {
    background-color: #d5d5d57c;
    /* color: #fff; */
  }
}

sup {
  font-size: 0.8em;
  color: #333;

  span {
    background-color: #d5d5d57c;
    padding: 5px;
    border-radius: 5px;
    margin-right: 5px;
  }
}

pre {
  background-color: #d5d5d57c;
  padding: 10px;
  padding-top: 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: auto;
  color: #000000;

  p {
    background-color: #ffffff00 !important;
  }
}

pre .lgg {
  display: flex;
  width: 100%;
  padding: 2px 5px;
  color: #000000;
  border-bottom: 1px solid #000000;
}

blockquote {
  border-left: 4px solid #5e5e5e;
  color: #5e5e5e;
  margin: 20px 10px;
  padding: 0 10px;
}

table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 5px;

  thead {
    background-color: #d5d5d57c;
    padding: 25px 0;
  }

  tbody {
    background-color: #ffffff00;
  }

  th,
  td {
    padding: 5px 0;
  }

  td {
    text-align: center;
    border-right: 1px solid #ccc;
    border-top: 1px solid #ccc;
  }

  td:last-child {
    border-right: 0;
  }

  tr:last-child td {
    border-bottom: 0;
  }

}

img {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 5px;
  max-height: 200px;
  max-width: 200px;
  cursor: pointer;
}

img.imgPreviewImg {
  display: block;
  margin: 0;
  border: 0;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.mdNavList {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 5px 15px;

  background-color: #d5d5d57c;
  border: 1px solid #ccc;
  border-radius: 5px;

  h5 {
    border-bottom: 1px solid #333;
    padding: 5px;
  }

  a {
    color: #333;
    font-size: 0.9em;

    &:hover {
      background-color: #ffffff00;
    }
  }
}

label {
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f5f5f56a;

  span {
    display: flex;
    height: 100%;
    width: 100%;
    justify-content: center;
    align-items: center;
    padding: 10px 20px;
    color: #333;
    font-size: 16px;
    transition: background-color 0.3s ease;

    &:hover {
      background-color: #e5e5e5;
    }
  }
}

.imgPreview {
  position: fixed;
  display: none;
  justify-content: center;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #2b2b2b89;
  z-index: 100;
}

.upload {
  display: flex;
  justify-content: center;
  align-items: center;
  line-height: 1.5;
  cursor: pointer;
  height: 100vh;
  width: 100vw;
  text-align: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  padding: 20px;
  z-index: 99;
  /* background-color: #333; */
  border-bottom: 1px solid #ccc;
}

.container {
  /* margin-top: 15vh; */
  padding: 5vh 0;
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100vh;
}

.navList {
  width: 350px;
  overflow-y: scroll;
  scrollbar-width: none;
  transition: all 0.3s ease;
  border-right: 1px solid #5e5e5e;
  padding-left: 20px;

  a {
    display: block;
    margin-bottom: 10px;
    cursor: pointer;
  }
}

.preview {
  margin-left: 20px;
  width: calc(100% - 350px);
  overflow-y: auto;
  padding: 20px;
}

@media (max-width: 900px) {
  .container {
    height: 100vh;
    margin: 0;
    padding-top: 100px;
  }

  .navList {
    position: fixed;
    top: 0;
    background-color: #ffffff;
    width: 100%;
    padding: 0;
    height: 80px;
    transition: all 0.3s ease;
    border: 1px solid #5e5e5e;

    &:hover {
      height: 50%;
      /* max-height: 50%; */
    }

    &::before {
      content: '目录';
      padding-left: 20px;
      position: fixed;
      display: block;
      width: 100%;
      height: 80px;
      line-height: 80px;
      font-weight: bold;
      font-size: 2.5rem;
      text-align: center;
      border-bottom: 1px solid #5e5e5e;
      color: #5e5e5e;
      background-color: #fff;
    }

    a {
      padding: 0 20px;
      font-size: 1.4em;
    }

    a:first-child {
      margin-top: 100px;
    }
  }

  .preview {
    width: 100%;
    margin-left: 0;
  }
}
</style>
