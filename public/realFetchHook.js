(() => {
    console.log("🔥 realFetchHook injected");

    const OriginalXHR = window.XMLHttpRequest;

    class InterceptedXHR extends OriginalXHR {
        open(method, url, ...rest) {
            this._url = url;
            return super.open(method, url, ...rest);
        }

        send(...args) {
            this.addEventListener("load", function () {
                try {
                    if (
                        this._url.includes("_getClassSearchResults") || this._url.includes("_getShopCartTableData") || this._url.includes("_getScheduleTableData") || this._url.includes("_getScheduleTableData") || this._url.includes("_getClassSearchResults") || this._url.includes("_getShopCartTableData") || this._url.includes("_getScheduleTableData") || this._url.includes("_getScheduleTableData") || this._url.includes("_getClassSearchResults") || this._url.includes("_getShopCartTableData") || this._url.includes("_getScheduleTableData") || this._url.includes("_getShopCartCalEvents") || this._url.includes("_getClassSearchResults") || this._url.includes("_getShopCartTableData") || this._url.includes("_getScheduleTableData") || this._url.includes("_getShopCartCalEvents") || this._url.includes("_getClassSearchResults") || this._url.includes("_getShopCartTableData") || this._url.includes("_getScheduleTableData") || this._url.includes("_getScheduleCalEvents") || this._url.includes("_getClassSearchResults") || this._url.includes("_getShopCartTableData") || this._url.includes("_getScheduleTableData") || this._url.includes("_getScheduleCalEvents") || this._url.includes("_getClassSearchResults") || this._url.includes("_getShopCartTableData") || this._url.includes("_getScheduleTableData") || this._url.includes("_getScheduleCalEvents") || this._url.includes("_getClassSearchResults") || this._url.includes("_getShopCartTableData") || this._url.includes("_getScheduleTableData") || this._url.includes("_getCustomCalEvents") || this._url.includes("_getClassSearchResults") || this._url.includes("_getShopCartTableData") || this._url.includes("_getScheduleTableData") || this._url.includes("_getCustomCalEvents") || this._url.includes("_getClassSearchResults") || this._url.includes("_getShopCartTableData") || this._url.includes("_getScheduleTableData") || this._url.includes("_getCustomCalEvents") || this._url.includes("_getClassSearchResults") || this._url.includes("_getShopCartTableData") || this._url.includes("_getScheduleTableData") || this._url.includes("_getCustEventsTableData")
                    ) {
                        console.log("✅ Matched target request to:", this._url);
                        console.log("📄 Response (truncated):", this.responseText.slice(0, 300));
                    }
                } catch (err) {
                    console.warn("❌ Failed to intercept XHR:", err);
                }
            });

            return super.send(...args);
        }
    }

    window.XMLHttpRequest = InterceptedXHR;
})();
