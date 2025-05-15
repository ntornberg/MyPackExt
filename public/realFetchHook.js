(() => {
    if (window.__myPackHookLoaded) {
        return;
    }
    window.__myPackHookLoaded = true;

    const OriginalXHR = window.XMLHttpRequest;
    const keywords = [
        "_getClassSearchResults",
        "_getShopCartTableData",
        "_getScheduleTableData",
        "_getScheduleCalEvents",
        "_getCustomCalEvents",
        "_getCustEventsTableData",
        "_getPlanTermTableData",
        "_getShopCartCalEvents",
    ];

    const receiverPromise = (function () {
        if (window.top.__receiverPromise) return window.top.__receiverPromise;

        return (window.top.__receiverPromise = new Promise((resolve) => {
            if (window.top.__receiverReady) return resolve(true);

            window.top.addEventListener("message", (ev) => {
                if (
                    ev.data?.type === "RECEIVER_READY" &&
                    ev.data.source === "content-script"
                ) {
                    window.top.__receiverReady = true;
                    resolve(true);
                }
            });
        }));
    })();

    class InterceptedXHR extends OriginalXHR {
        open(method, url, ...rest) {
            this._url = url;
            return super.open(method, url, ...rest);
        }

        send(...args) {
            this.addEventListener("load", async function () {
                try {
                    const matchedKeyword = keywords.find((keyword) =>
                        this._url.includes(keyword)
                    );
                    if (matchedKeyword) {
                        let data = JSON.parse(this.responseText);
                        if (matchedKeyword === "_getClassSearchResults") {
                            data = data.data;
                        }
                        if (matchedKeyword === "_getCustEventsTableData") {
                            data = data.data;
                        }
                        if (matchedKeyword === "_getScheduleTableData") {
                            data = data.data;
                        }
                        if (matchedKeyword === "_getShopCartTableData") {
                            data = data.data;
                        }
                        if (matchedKeyword === "_getPlanTermTableData") {
                            data = data.data;
                        }

                        const ok = await receiverPromise;
                        window.top.postMessage(
                            {
                                source: "realFetchHook",
                                type: "CLASS_DATA",
                                payload: { data: data, responseType: matchedKeyword },
                            },
                            "*"
                        );
                    }
                } catch (err) {
                    // Silently fail without logging
                }
            });

            return super.send(...args);
        }
    }

    window.XMLHttpRequest = InterceptedXHR;
})();
