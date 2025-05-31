const observer = new MutationObserver((mutations) => {
    for(let _ of mutations){
        if(document.querySelector('[id="app"]')){
            observer.disconnect();
            chrome.runtime.sendMessage({type: "gradient_loaded"});
            console.log("Gradient loaded");
            get_gradient_data();
            return true;
        }
    }
});

observer.observe(document.body, {childList: true, subtree: true});
function get_gradient_data(){
  console.log("waiting for get_gradient_data");
    chrome.runtime.onMessage.addListener((message,_,sendResponse)=>{
        console.log("get_gradient_data",message);
        if(message.type === "get_gradient_data"){
            const data = message.data;
            const url = "https://gradient.ncsu.edu/api/course-distributions?";
            const params = new URLSearchParams();
            params.append("subject",data.subject);
            params.append("semester[]","7");
            params.append("semester[]","8");
            params.append("semester[]","1");
            params.append("semester[]","6");
            params.append("course",data.course);
            if(data.instructor.length > 0){
                for(let instructor of data.instructor){
                    params.append("instructor[]",instructor);
                }
            }
            params.append("years[]","2024");
            params.append("years[]","2023");
            params.append("years[]","2022");
            params.append("years[]","2021");
            fetch(url + params.toString()).then(async (response) => {
                console.log("gradient_data",response);
                const json = await response.json();
                console.log("gradient_data",json);
                sendResponse({success: true, data: json});
            }).catch(error => {
                console.error("Error fetching gradient data:", error);
                sendResponse({success: false, error: error.toString()});
            });
            
            return true; // Keep message channel open for async response
        }
    });
}