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
/*let userId : string;
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
});*/
/*cookieObserver.observe(document.body, {childList: true, subtree: true});*/

/*function form_url(userId: string, courseId :string) : string{
    const base = "https://portalsp.acs.ncsu.edu/psc/" + userId;
    return base + "/EMPLOYEE/NCSIS/s/WEBLIB_ENROLL.ISCRIPT1.FieldFormula.IScript_getClassSearchResults?crseId=" + courseId;


}*/

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
#shoppingCartTable
#scheduleTable_wrapper
#scheduleTable
#plannerTable_wrapper
#plannerTable
#requiredCoursesTable
#gepRequirementsTable
 */
type Course ={
    title : string;
    id : string;
    abr : string;
    instructor: string;
}

const courses: Course[] = [];
/*const courseObserver = new MutationObserver(() => {*/
/** Resolves with a reference to the iframe element */
console.log("Started");


function waitForScheduleTable(): Promise<Element> {
    console.log("Waiting for element");
    return new Promise(resolve => {
        const iframe = document.querySelector<HTMLIFrameElement>('[id$="divPSPAGECONTAINER"] iframe')?.contentDocument;
        if(iframe){
            const existing = iframe.querySelector('#scheduleTable');
            if(existing){
                return resolve(existing);
            }
        }

        const mo = new MutationObserver(() => {
            const iframe = document.querySelector<HTMLIFrameElement>('[id$="divPSPAGECONTAINER"] iframe')?.contentDocument;
            if(iframe){
                const found = iframe.querySelector('#scheduleTable');
                if(found){
                    mo.disconnect();
                    resolve(found);
                }
            }

        });
        mo.observe(document, { childList: true, subtree: true });
    });
}
function waitForCart(): Promise<Element> {
    console.log("Waiting for element");
    return new Promise(resolve => {
        const iframe = document.querySelector<HTMLIFrameElement>('[id$="divPSPAGECONTAINER"] iframe')?.contentDocument;
        if(iframe){
            const existing = iframe.querySelector('#classSearchTable');
            if(existing){
                return resolve(existing);
            }
        }

        const mo = new MutationObserver(() => {
            const iframe = document.querySelector<HTMLIFrameElement>('[id$="divPSPAGECONTAINER"] iframe')?.contentDocument;
            if(iframe){
                const found = iframe.querySelector('#classSearchTable');
                if(found){
                    mo.disconnect();
                    resolve(found);
                }
            }

        });
        mo.observe(document, { childList: true, subtree: true });
    });
}

(async () => {
    const scheduleElement = await waitForScheduleTable();

    scrapeScheduleTable(scheduleElement);
})();

/*});*/
function scrapeScheduleTable(scheduleTable : Element){
    const courseSpans = scheduleTable?.querySelectorAll('span.showCourseDetailsLink');
    const scheduled_courses = scheduleTable?.querySelectorAll('tbody > tr');
    if(scheduled_courses?.length){ // All courses
        const filtered_classes = Array.from(scheduled_courses).filter(el => el.classList.contains("child")); // Excludes headers

        filtered_classes.forEach((elem) =>{  // All lower rows of the schedule table, section,type,days,time,etc.
            const tbl = (elem as HTMLElement)
            const inner_table = tbl.querySelector('[id^="scheduleInner_"]') // Inner table (Gets through nesting)
            if (!inner_table) {
                console.log("No inner schedule table detected");
                return;
            } // Null check

            const class_row = inner_table.querySelector('tbody > tr'); // Gets first row of inner table (the only row)
            if (!class_row) {

                console.log("No class rows detected");
                return;
            } // Null check
            const class_data_list = class_row.querySelectorAll('td'); // Gets all cells in the row
            let cTitle : string = "";
            let cId : string = "";
            let cAbr : string = "";
            let cIns : string = "";
            class_data_list.forEach((class_item) =>{ // Loop through class tooltip
                if((class_item as HTMLElement).className == 'sect'){
                    const section_details_container = class_item.querySelector('[id^="section_details"]');

                    if (!section_details_container) return; // Null check
                    const details_list = section_details_container.querySelectorAll('div') ?? "";
                    cTitle = details_list.item(0).textContent ?? "";
                    cId = details_list.item(2).querySelector('.classDetailValue')?.textContent ?? "";
                    cIns = details_list.item(9).querySelector('.classDetailValue')?.textContent ?? "";
                }else{
                    console.log("Section row not found");
                }
            });
            if (!cTitle || !cId || !cIns) return; // Null check
            cAbr = cTitle.trim().split(/\s-+/)[0];
            const course: Course = {
                title: cTitle,
                id: cId,
                abr: cAbr,
                instructor: cIns,
            }
            console.log(course);
            courses.push(course);
        });
    }else{
        console.log("No selected courses found")
    }
    if(courseSpans) {
        courseSpans.forEach((span, index) => {
            const dataset = (span as HTMLElement).dataset;

            console.log(`Span ${index}`);
            console.log(`  Course: ${dataset.course}`);
            console.log(`  Title: ${dataset.course_title}`);
            console.log(`  ID: ${dataset.crse_id}`);
            console.log(`  Offer #: ${dataset.crse_offer_nbr}`);
            /*if(dataset.crse_id != null) {
                const rq_url = form_url(userId, dataset.crse_id);
                console.log(rq_url);
            }*/
        });
    }

}
const planner_courses: Course[] = [];
function scrapePlanner (plannerTable : Element){
const selected_classes = plannerTable.querySelectorAll('tbody > tr');
const filtered_classes = Array.from(selected_classes).filter(el => el.classList.contains("child")); // Removes header

    filtered_classes.forEach((class_item : Element) =>{
        let cAbr = "";
        let cIns = "";
        const class_details = class_item.querySelector('[id^="searchResultsInner"]');
        const class_detail_body = class_details.querySelector('tbody > tr');
        cIns = class_detail_body.querySelector('[data-label="INSTRUCTOR"]')?.textContent ?? "";
        const class_header = class_item.previousElementSibling.querySelectorAll('td');
        cAbr = class_header.item(1).textContent ?? "";

    });
}


