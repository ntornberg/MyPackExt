import React from 'react';
import { createRoot } from 'react-dom/client';

const App: React.FC = () => {
    return (
        <div style={{ padding: '1rem' }}>
            <h2>📚 MyPack Enhancer</h2>
            <p>React injected into MyPack via Chrome Extension!</p>
        </div>
    );
};
/*type CourseInfo = {
    courseID : string;
}*/
let userId : string;
const cookieObserver = new MutationObserver(() => {
    chrome.runtime.sendMessage({ type: "GET_COOKIES" }, (cookies) => {
        if (chrome.runtime.lastError) {
            console.error("Message failed:", chrome.runtime.lastError.message);
            return;
        }
        const targetCookie = cookies.find((cookie: any) => cookie.name === 'PS_LOGINLIST');
        if (targetCookie) {
            console.log(targetCookie.value);
            userId = targetCookie.value.substring(targetCookie.value.lastIndexOf("/") + 1);


        }else{
            console.log("Failed To find Cookie")
        }
    });
});
cookieObserver.observe(document.body, {childList: true, subtree: true});

function form_url(userId: string, courseId :string) : string{
    const base = "https://portalsp.acs.ncsu.edu/psc/" + userId;
    return base + "/EMPLOYEE/NCSIS/s/WEBLIB_ENROLL.ISCRIPT1.FieldFormula.IScript_getClassSearchResults?crseId=" + courseId;


}

/*const GetCourseDetails: React.FC<CourseInfo> = ({courseID}) =>{

const [data,setData] = useState<any>(null);

    useEffect(() => {
        fetch('')
    }, []);
}*/
const mount = document.createElement('div');
mount.id = 'mypack-sidebar';
Object.assign(mount.style, {
    position: 'fixed',
    top: '0',
    right: '0',
    width: '300px',
    height: '100%',
    backgroundColor: '#fff',
    zIndex: '999999',
    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
});

document.body.appendChild(mount);
const root = createRoot(mount);
root.render(<App />);
/*
#shoppingCartTable_wrapper
#scheduleTable_wrapper
#scheduleTable_wrapper
 */
const courseObserver = new MutationObserver(() => {
    const iframe = document.querySelector('#win8divPSPAGECONTAINER > iframe') as HTMLIFrameElement; // or any ID
    if (!iframe || !iframe.contentDocument) return;
    const iframeDoc = iframe?.contentDocument;
    const courseSpans = iframeDoc?.querySelectorAll('span.showCourseDetailsLink');
    const scheduled_courses = iframeDoc?.querySelectorAll('#scheduleTable_wrapper');
    if(courseSpans) {
        courseSpans.forEach((span, index) => {
            const dataset = (span as HTMLElement).dataset;

            console.log(`Span ${index}`);
            console.log(`  Course: ${dataset.course}`);
            console.log(`  Title: ${dataset.course_title}`);
            console.log(`  ID: ${dataset.crse_id}`);
            console.log(`  Offer #: ${dataset.crse_offer_nbr}`);
            if(dataset.crse_id != null) {
                const rq_url = form_url(userId, dataset.crse_id);
                console.log(rq_url);
            }
        });
    }
});

courseObserver.observe(document.body, {childList: true, subtree: true});
const observer2 = new MutationObserver((mutations) => {
    mutations.forEach(m => {
        console.log("DOM changed:", m);
    });
});
observer2.observe(document.body, { childList: true, subtree: true });
