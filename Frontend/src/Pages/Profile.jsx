import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { StatePage } from '../Components/StateView';

export default function Profile() {
  const {profile}=useAuth();
  if(profile)return <Navigate to="/admin/account" replace/>;
  return <StatePage kind="access" title="Your club profile." description="Member profiles aren’t available online yet. You can access your approved courses through the learning area, or contact the club about your membership." actions={[{label:'Open learning area',to:'/learn'},{label:'Contact the club',href:'mailto:info@arpc.club',secondary:true}]}/>;
}
