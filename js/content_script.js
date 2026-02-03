console.log("已注入content");

let wordsDetailData = [];

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 判断消息类型
  if (request.action === "startExecution") {
    console.log("收到开始执行的信号");

    // 这里编写需要执行的操作
    startMyTask();

    // 可以向popup返回响应
    sendResponse({
      status: "已开始执行"
    });
  }
  // 新增：处理读取本地文件的请求，并查询单词详情
  else if (request.action === "readLocalFile") {
    readAndProcessLocalFile();
    sendResponse({
      status: "已开始读取本地文件并查询单词详情"
    });
  } else if (request.action === "PteWfdStart") {
    pteWfdStart();
    sendResponse({
      status: "已开始爬取PteWfd"
    });
  }
});



// 要执行的任务函数
async function startMyTask() {
  console.log("开始执行");

  let currentPage = 0;
  let wordIndex = 1;
  let wordsData = [];
  let firstWord = "";



  while (true) {

    while (true) {
      console.log(firstWord);

      await wait(10);

      console.log(getFirstWord());

      if (getFirstWord() != firstWord) {
        firstWord = getFirstWord();
        console.log(1);
        break;
      }
    }
    console.log(2);
    let words = document.querySelectorAll(".index_wordName__3VqeJ");

    // 遍历这些元素，把单词内容和序号存到数组里
    words.forEach(element => {
      wordsData.push({
        index: wordIndex,
        content: element.textContent.trim()
      });
      wordIndex++;
    });
    if (!goToNextPage()) {
      break;
    }

  }


  // 把数据发给后台脚本
  chrome.runtime.sendMessage({
    type: "saveWords",
    data: wordsData
  });
}

// 读取本地JSON文件并处理
async function readAndProcessLocalFile() {

  // 创建文件选择对话框
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.json';

  fileInput.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        // 解析JSON数据
        const wordsData = JSON.parse(e.target.result);

        // 遍历输出单词
        console.log("===== 从本地文件读取的单词 =====");
        if (Array.isArray(wordsData)) {
          for (const word of wordsData) {
            //查询并爬取每个单词详情
            queryWordDetail(word);
            await wait(300);
            // break;
          }
          console.log(`共读取到 ${wordsData.length} 个单词`);
          // 把数据发给后台脚本
          chrome.runtime.sendMessage({
            type: "saveWordsDetail",
            data: wordsDetailData
          });
        } else {
          console.error("JSON文件格式不正确，应为数组");
        }
      } catch (error) {
        console.error("解析JSON文件失败:", error);
      }
    };

    reader.readAsText(file);
  };

  // 触发文件选择对话框
  fileInput.click();
}

async function queryWordDetail(word) {
  console.log(word.index + "," + word.content);
  let inputElement = document.querySelector(".input");
  let usPhonetic = "";
  let ukPhonetic = "";
  let meaning = "";

  if (inputElement) {
    // 1. 先点击输入框，获取焦点
    inputElement.focus();

    // 2. 清空原有内容并设置新单词（确保输入框处于活跃状态）
    inputElement.value = word.content;

    // 3.触发输入事件（关键：通知页面内容已变化）
    inputElement.dispatchEvent(new Event("input", {
      bubbles: true
    }));


    // 4. 点击查询
    await wait(10);
    let submitBtn = document.querySelector(".submit");
    if (submitBtn) {

      //4.1反复点击submit，直到查询页打开
      while (true) {
        let headword = document.querySelector(".head-word");
        if (headword && headword.textContent == word.content) {
          break;
        }
        submitBtn.click();
        await wait(10);
      }

      //4.2存储音标
      const pronunciationItems = document.querySelectorAll(".pronunciationItem");

      // 遍历每个发音项
      for (const item of pronunciationItems) {
        // 检查是否是美式发音（标题为US）
        const title = item.querySelector(".pronunciationItem-title");
        if (title && title.textContent.trim() === "US") {
          // 提取音标内容
          const phoneticElement = item.querySelector(".pronunciationItem-content");
          if (phoneticElement) {
            usPhonetic = phoneticElement.textContent.trim(); // 返回美式音标，如 /ɑːn/
            console.log(usPhonetic);
          }
        } else if (title.textContent.trim() === "UK") {
          // 提取音标内容
          const phoneticElement = item.querySelector(".pronunciationItem-content");
          if (phoneticElement) {
            ukPhonetic = phoneticElement.textContent.trim(); // 返回yiing式音标，如 /ɑːn/
            console.log(ukPhonetic);
          }
        }
      }

      // 4.3储存意思
      let chineses = document.querySelectorAll(".sensesItem");
      if (chineses) {
        for (const chinese of chineses) {
          console.log("chinese:", chinese)
          meaning = meaning + chinese.textContent + "\n";
        }
        meaning = meaning.slice(0, -1);
      }
      console.log("meaning:" + meaning);
    }
    console.log(`已点击输入框并搜索: ${word.content}`);
  } else {
    console.error("未找到class为'input'的输入框元素");
  }



  wordsDetailData.push({
    index: word.index,
    name: word.content,
    ukPhonetic: ukPhonetic,
    usPhonetic: usPhonetic,
    meaning: meaning
  });

}


function getFirstWord() {
  return document.querySelector(".index_wordName__3VqeJ");
}

// 记录当前页码（需要根据页面实际分页元素调整选择器）
function getCurrentPage() {
  // 示例：假设当前页码元素的类名为 "current-page"
  const pageElement = document.querySelector(".index_activePage__Zf_0z");
  return pageElement ? parseInt(pageElement.textContent) : 1;
}



// 修正：通过文本内容查找下一页按钮
function findNextPageButton() {
  // 获取所有li元素
  const allLiElements = document.querySelectorAll("li");

  // 遍历查找包含"下一页"文本的li
  for (let li of allLiElements) {
    if (li.textContent.trim() === "下一页") {
      return li;
    }
  }

  return null; // 未找到
}


// 封装一个等待函数
function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}


// 改进的翻页函数：根据类名判断是否有下一页
function goToNextPage() {
  // 查找下一页按钮
  const nextBtn = findNextPageButton();

  if (!nextBtn) {
    console.log("未找到下一页按钮");
    return false; // 未找到按钮，返回false
  }

  // 检查是否有"最后一页"的类名
  if (nextBtn.classList.contains("index_nomore__1kesd")) {
    console.log("已到达最后一页");
    return false; // 最后一页，返回false
  }

  // 模拟点击下一页（处理各种可能的点击事件）
  try {
    // 方法1：直接调用click()
    nextBtn.click();
    console.log("已点击下一页");
    return true; // 成功点击下一页
  } catch (error) {
    console.error("点击下一页失败:", error);
    return false;
  }
}

async function pteWfdStart() {
  console.log("开始爬取pteWfd");


  while (true) {
    let wfdList = [];
    await wait(300);
    //每一页的逻辑
    let containers = document.querySelectorAll(".q-list");
    let container = containers[containers.length - 1];

    let wfdElems = container.querySelectorAll(".q-item");
    if (wfdElems) {
      for (const wfdElem of wfdElems) {

        //扒左边部分内部的句子
        let left = wfdElem.querySelector(".qTitleLearned");
        if (!left) {
          left = wfdElem.querySelector(".qTitle");
        }

        // let index = left.querySelector(".num").innerText;
        let sentence = left.innerText;
        console.log(sentence);

        //扒右边的星级
        let starString = ""
        let starBar = wfdElem.querySelector(".host-icon");
        console.log(starBar);
        if (starBar) {
          let starsActive = starBar.querySelectorAll(".icon.active");
          console.log(starsActive);
          if (starsActive) {
            let activeLength = starsActive.length;
            if (activeLength === 1) {
              starString = "*";
            } else if (activeLength === 2) {
              starString = "**"
            } else if (activeLength === 3) {
              starString = "***";
            }
          }
        }
        console.log("starString:" + starString);

        //封装json
        wfdList.push({
          "sentence": sentence,
          "importance": starString
        });

      }
      //翻页
      let nextBtn = document.querySelector(".btn-next.is-last");
      console.log("nextBtn");
      console.log(nextBtn);
      if (nextBtn) {
        // console.log(nextBtn.getAttribute("aria-disabled"));
        // console.log(nextBtn.getAttribute("aria-disabled") === "false");
        if (nextBtn.getAttribute("aria-disabled") === "true") {
          chrome.runtime.sendMessage({
            type: "wfdListAdd",
            data: wfdList
          });
          //message提醒background下载
          chrome.runtime.sendMessage({
            type: "wfdListToJson",
          });
          return;
        } else if (nextBtn.getAttribute("aria-disabled") === "false") {
          //message提醒background下载
          chrome.runtime.sendMessage({
            type: "wfdListAdd",
            data: wfdList
          });
          console.log(wfdList);
          // return;
          nextBtn.click();
        }
      } else {
        console.log("not find nextBtn");
        return;
      }
    }

  }




}