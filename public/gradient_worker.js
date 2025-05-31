const s = new MutationObserver((t) => {
  for (let a of t)
    document.querySelector('[id="app"]') && (s.disconnect(), chrome.runtime.sendMessage({ type: "gradient_loaded" }), console.log("Gradient loaded"), i());
});
s.observe(document.body, { childList: !0, subtree: !0 });
function i() {
  chrome.runtime.onMessage.addListener((t, a, o) => {
    if (t.type === "get_gradient_data") {
      const r = t.data, d = "https://gradient.ncsu.edu/api/course-distributions?", e = new URLSearchParams();
      if (e.append("semester[]", "7"), e.append("semester[]", "8"), e.append("semester[]", "1"), e.append("semester[]", "6"), e.append("course", r.course), r.instructor.length > 0)
        for (let n of r.instructor)
          e.append("instructor[]", n);
      e.append("years[]", "2024"), e.append("years[]", "2023"), e.append("years[]", "2022"), e.append("years[]", "2021"), fetch(d + e.toString()).then(async (n) => {
        const c = await n.json();
        o({ success: !0, data: c });
      });
    }
  });
}
