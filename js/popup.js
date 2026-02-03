// 给按钮添加点击事件监听
document.getElementById('startBtn').addEventListener('click', () => {
    // 获取当前激活的标签页
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        // 向当前标签页的content script发送消息
        chrome.tabs.sendMessage(
            tabs[0].id,  // 当前标签页ID
            {action: "startExecution"},  // 发送的消息内容
            (response) => {
                if (chrome.runtime.lastError) {
                    console.log("无法发送消息，可能content script未加载");
                    return;
                }
                console.log("收到回应:", response);
            }
        );
    });
});


// 给按钮添加点击事件监听
document.getElementById('getDetailBtn').addEventListener('click', () => {
    // 获取当前激活的标签页
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        // 向当前标签页的content script发送消息
        chrome.tabs.sendMessage(
            tabs[0].id,  // 当前标签页ID
            {action: "readLocalFile"},  // 发送的消息内容
            (response) => {
                if (chrome.runtime.lastError) {
                    console.log("无法发送消息，可能content script未加载");
                    return;
                }
                console.log("收到回应:", response);
            }
        );
    });
});


// 给按钮添加点击事件监听
document.getElementById('PteWfd').addEventListener('click', () => {
    // 获取当前激活的标签页
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        // 向当前标签页的content script发送消息
        chrome.tabs.sendMessage(
            tabs[0].id,  // 当前标签页ID
            {action: "PteWfdStart"},  // 发送的消息内容
            (response) => {
                if (chrome.runtime.lastError) {
                    console.log("无法发送消息，可能content script未加载");
                    return;
                }
                console.log("收到回应:", response);
            }
        );
    });
});
