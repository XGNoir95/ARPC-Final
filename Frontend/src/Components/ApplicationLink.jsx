import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
export default function ApplicationLink({children,className,...props}) {
 const {profile,status}=useAuth();if(profile||status==='checking'||status==='error')return <span role="note" title={profile?'Enrollment is reserved for participants. Manage this programme in the admin workspace.':'Checking account access.'} className={`${className} cursor-not-allowed opacity-55`} aria-disabled="true">{profile?'Administrator access':status==='error'?'Account check unavailable':'Checking access…'}</span>;
 return <Link className={className} {...props}>{children}</Link>;
}
