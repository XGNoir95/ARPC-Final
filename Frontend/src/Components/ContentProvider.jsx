import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ContentContext } from '../ContentContext';
import { api, post } from '../utils/api';
import { userMessage } from '../utils/userMessages';
const collections=['programmes','gallery','teams','sponsors','home'];
export default function ContentProvider({children}) {
  const [data,setData]=useState(null);const [error,setError]=useState('');const [attempt,setAttempt]=useState(0);const [refreshing,setRefreshing]=useState(true);const location=useLocation();
  // The workspace already loads and refreshes its own collections. Moving
  // between its sections does not require another copy of the public content.
  const contentPath=/^\/admin(?:\/|$)/.test(location.pathname)?'/admin':location.pathname;
  const retry=useCallback(()=>{setRefreshing(true);setError('');setAttempt(n=>n+1);},[]);
  useEffect(()=>{const controller=new AbortController();let active=true;const timeout=setTimeout(()=>controller.abort(),12000);
    api('/public/content',{signal:controller.signal}).then(value=>{
      if(!value||!collections.every(key=>Array.isArray(value[key])&&value[key].every(item=>item&&typeof item==='object')))throw new Error('Invalid content response');
      if(active){setData(value);setError('');}
    }).catch(e=>{if(active)setError(userMessage(e,'We couldn’t load the latest club information. Please try again.'));}).finally(()=>{clearTimeout(timeout);if(active)setRefreshing(false);});
    return()=>{active=false;clearTimeout(timeout);controller.abort();};
  },[attempt,contentPath]);
  useEffect(()=>{if(/^\/(?:$|catalogue$|gallery$|team$|join$|enroll\/)/.test(location.pathname))post('/analytics/view',{path:location.pathname}).catch(()=>{});},[location.pathname]);
  const context={programmes:[],gallery:[],teams:[],sponsors:[],home:[],...data,loading:!data&&refreshing,hasData:data!==null,refreshing,error,retry};
  return <ContentContext.Provider value={context}>{children}</ContentContext.Provider>;
}
