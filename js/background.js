let wfdListTotal = [];
// 接收 content.js 发过来的数据
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "saveWords") {
    convertToJsonAndDownload(request.data, "scallop_word_list.json");

  } else if (request.type === "saveWordsDetail") {
    convertToJsonAndDownload(request.data, "scallop_word_detail_list.json");

  } else if (request.type === "wfdListToJson") {
    convertToJsonAndDownload(wfdListTotal, "alpaca_wfd_list.json");
  }else if (request.type === "wfdListAdd") {
    wfdListTotal = wfdListTotal.concat(request.data);
  }



  function convertToJsonAndDownload(data, fileName) {
    // 把数据转成 JSON 字符串
    const jsonStr = JSON.stringify(data, null, 2);
    // 创建一个 TXT 文件
    const blob = new Blob([jsonStr], {
      type: "text/plain"
    });
    // 生成可下载的链接
    const url = URL.createObjectURL(blob);
    // 创建一个隐藏的 <a> 标签来触发下载
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    // 触发下载
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // 释放链接资源
    URL.revokeObjectURL(url);

  }

});