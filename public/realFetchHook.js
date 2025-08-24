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
        if (window.__receiverPromise) return window.__receiverPromise;

        return (window.__receiverPromise = new Promise((resolve) => {
            if (window.__receiverReady) return resolve(true);

            window.addEventListener("message", (ev) => {
                try {
                    if (
                        ev.data?.type === "RECEIVER_READY" &&
                        ev.data.source === "content-script"
                    ) {
                        window.__receiverReady = true;
                        resolve(true);
                    }
                } catch (_) {
                    // ignore
                }
            });

            // Fallback resolve in case message is missed
            setTimeout(() => resolve(true), 2000);
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
                        window.postMessage(
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
