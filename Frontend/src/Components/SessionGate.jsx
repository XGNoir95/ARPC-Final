import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PageSkeleton from './PageSkeleton';
import { useLocation } from 'react-router-dom';
import { StatePage } from './StateView';
export default function SessionGate({children,mode}) {
 const {profile,status,error,refresh}=useAuth();const {pathname}=useLocation();
 if(status==='checking')return <><PageSkeleton pathname={pathname}/><p role="status" className="sr-only">Checking your session…</p></>;
 if(status==='error')return <StatePage standalone={mode==='guest'||pathname==='/learn'} kind="error" title="We couldn’t check your session." description={error || 'Please try again to continue. Your account details haven’t changed.'} actions={[{label:'Try again',onClick:refresh}, {label:'Go to home',to:'/',secondary:true}]}/>;
 if(profile&&mode==='guest')return <Navigate to="/admin" replace/>;
 if(profile&&mode==='applicant')return <StatePage standalone={pathname==='/learn'} kind="access" title="Manage the club from your workspace." description="You’re signed in as an administrator. Membership applications and programme enrollment are for participants." actions={[{label:'Open admin workspace',to:'/admin'}, {label:'Browse programmes',to:'/catalogue',secondary:true}]}/>;
 return children;
}
