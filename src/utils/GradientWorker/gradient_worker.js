chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if(message.type === "open_gradient"){
        chrome.tabs.create({url: "https://gradient.ncsu.edu/"});
        sendResponse({success: true});
    }
});