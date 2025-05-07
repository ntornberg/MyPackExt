console.log("back loaded")
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(sender);

    if (message.type === "GET_COOKIES") {
        chrome.cookies.getAll({}, (cookies) => {
            console.log(cookies);
            sendResponse(cookies);
        });
        return true;
    }
});