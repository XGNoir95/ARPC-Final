import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api, post, API_BASE } from '../utils/api';
import { userMessage } from '../utils/userMessages';
import { downloadFile } from '../utils/download';
import LearningCourse from '../Components/LearningCourse';
import StateView, { Notice, statePrimary, stateSecondary, stateFocus } from '../Components/StateView';

export default function Learning() {
  const location=useLocation();const navigate=useNavigate();const signin=useRef(null);const revision=useRef(0);
  const [area,setArea]=useState(null);const [course,setCourse]=useState('');const [content,setContent]=useState(null);const [lesson,setLesson]=useState('');
  const [loading,setLoading]=useState(true);const [courseLoading,setCourseLoading]=useState(false);const [accessError,setAccessError]=useState(null);const [courseError,setCourseError]=useState(null);
  const [attempt,setAttempt]=useState(0);const [courseAttempt,setCourseAttempt]=useState(0);const [notice,setNotice]=useState(null);const [busy,setBusy]=useState(false);
  useEffect(()=>{
    let active=true;const version=revision.current;const token=new URLSearchParams(location.search).get('token');
    const load=async()=>{
      try{
        if(token){if(!signin.current||signin.current.token!==token)signin.current={token,promise:post('/learning/signin',{token})};await signin.current.promise;if(!active)return;navigate('/learn',{replace:true});}
        const result=await api('/learning');if(!result?.learner||!Array.isArray(result.courses))throw new Error('Invalid learning response');
        if(active&&version===revision.current){setArea(result);setAccessError(null);}
      }catch(error){if(active&&version===revision.current){setAccessError(error);if([401,403].includes(error.status)){setArea(null);setContent(null);setCourse('');}}}finally{if(active&&version===revision.current)setLoading(false);}
    };load();return()=>{active=false;};
  },[location.search,navigate,attempt]);
  useEffect(()=>{
    if(!course)return;let active=true;
    api(`/learning/${encodeURIComponent(course)}`).then(result=>{
      if(!Array.isArray(result?.lessons)||!Array.isArray(result.completed))throw new Error('Invalid course response');
      if(active){setContent(result);setLesson(result.lessons[0]?._id||'');setCourseError(null);}
    }).catch(error=>{if(active)setCourseError(error);}).finally(()=>{if(active)setCourseLoading(false);});
    return()=>{active=false;};
  },[course,courseAttempt]);
  const refresh=()=>{setLoading(true);setAccessError(null);setAttempt(value=>value+1);};
  const retryCourse=()=>{setCourseLoading(true);setCourseError(null);setCourseAttempt(value=>value+1);};
  const choose=id=>{if(busy||id===course)return;setCourse(id);setContent(null);setCourseError(null);setCourseLoading(true);setNotice(null);};
  const completed=content?.completed.includes(lesson);
  const total=content?.lessons.length||0;
  const complete=async()=>{setBusy(true);setNotice(null);try{const result=await post(`/learning/${encodeURIComponent(course)}/complete/${lesson}`,{completed:!completed});if(!Array.isArray(result?.completed))throw new Error('Invalid progress response');setContent(value=>({...value,completed:result.completed}));}catch(error){setNotice({error:true,message:userMessage(error,'We couldn’t update your progress. Please try again.')});}finally{setBusy(false);}};
  const logout=async()=>{setBusy(true);try{await post('/learning/logout');revision.current++;setLoading(false);setArea(null);setContent(null);setCourse('');setAccessError(null);setNotice(null);}catch(error){setNotice({error:true,message:userMessage(error)});}finally{setBusy(false);}};
  const download=async(event,path)=>{event.preventDefault();if(busy)return;setBusy(true);setNotice(null);try{await downloadFile(path);}catch(error){if(error.status===401){setArea(null);setContent(null);setCourse('');setAccessError(error);}else setNotice({error:true,message:userMessage(error)});}finally{setBusy(false);}};
  const accessForm=<div className="mx-auto max-w-xl rounded-3xl border border-ink/15 bg-surface p-6 sm:p-10"><h1 className="font-garamond text-4xl font-semibold">Return to your learning.</h1><p className="mt-3 text-base leading-7 text-muted">Use the email from your approved course enrollment. We’ll send you a private sign-in link.</p>
    {accessError&&<div className="mt-5"><Notice tone="info">{userMessage(accessError,'Request a new access link below to continue.')}</Notice></div>}
    <form className="mt-7" onSubmit={async event=>{event.preventDefault();const email=new FormData(event.currentTarget).get('email');setBusy(true);setNotice(null);try{await post('/learning/access',{email});setNotice({message:'If you have an approved course enrollment, you’ll receive an access link. Check your inbox and spam folder.'});}catch(error){setNotice({error:true,message:userMessage(error,'We couldn’t send your access link. Please try again.')});}finally{setBusy(false);}}}>
      <label className="block text-base font-semibold">Email address<input name="email" type="email" required autoComplete="email" className="mt-2 block min-h-13 w-full rounded-lg border border-ink/20 bg-field px-4 py-3 text-base focus:outline-2 focus:outline-offset-2 focus:outline-ink"/></label><button disabled={busy} className={`${statePrimary} mt-6 w-full`}>{busy?'Please wait…':'Email my access link'}</button>
    </form></div>;
  return <section className="min-h-svh bg-soft px-5 py-6 text-ink sm:px-10 sm:py-10">
    <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-b border-ink/20 pb-5"><Link to="/" className={`rounded font-garamond text-3xl font-semibold ${stateFocus}`}>ARPC Learning</Link>{area&&<button disabled={busy} className={stateSecondary} onClick={logout}>Sign out</button>}</header>
    <div className="mx-auto max-w-7xl py-8">
      {notice&&<div className="mb-6"><Notice tone={notice.error?'error':'success'} title={notice.error?'Please try again.':'Check your inbox.'}>{notice.message}</Notice></div>}
      {loading?<StateView kind="loading" title="Opening your learning area…" description="We’re getting your courses and progress."/>:!area?(accessError&&![400,401,403,404,410].includes(accessError.status)?<StateView kind="error" title="We couldn’t open your learning area." description="Please try again in a moment. Your course progress hasn’t changed." actions={[{label:'Try again',onClick:refresh},{label:'Browse programmes',to:'/catalogue',secondary:true}]}/>:accessForm):<>
        {accessError&&<div className="mb-6"><Notice tone="info" title="Course updates are temporarily unavailable." action={{label:'Try again',onClick:refresh}}>You can still browse the course information already loaded.</Notice></div>}
        <h1 className="font-garamond text-4xl font-semibold">Welcome, {area.learner.fullName}.</h1><p className="mt-3 text-base leading-7 text-muted">Your approved courses, lessons and learning materials.</p>
        {!area.courses.length?<div className="mt-8"><StateView kind="learning" title="No courses available yet." description="Your approved course enrollments will appear here. If you’ve already enrolled, contact the club for help." actions={[{label:'Browse courses',to:'/catalogue'},{label:'Refresh courses',onClick:refresh,secondary:true}]}/></div>:<>
          <div className="mt-8 flex flex-wrap gap-3" role="group" aria-label="Your courses">{area.courses.map(item=><button key={item.id} disabled={busy} className={course===item.id?statePrimary:stateSecondary} aria-pressed={course===item.id} onClick={()=>choose(item.id)}>{item.title}</button>)}</div>
          <div className="mt-8">{!course?<StateView kind="learning" title="Choose a course to continue." description="Select a course above to open its lessons, learning materials and your progress."/>:courseLoading?<StateView kind="loading" title="Loading your lessons…" description="We’re opening this course."/>:courseError?<StateView kind="error" title="We couldn’t load these lessons." description="Please try again to open this course." actions={[{label:'Try again',onClick:retryCourse}]}/>:content&&!total?<StateView kind="learning" title="No lessons available yet." description="This course is available to you, but no lessons have been shared yet. Please check back later or open another course."/>:content&&<LearningCourse course={course} content={content} lesson={lesson} onSelect={setLesson} onComplete={complete} onDownload={download} busy={busy}/>}</div>
        </>}
      </>}
    </div>
  </section>;
}
