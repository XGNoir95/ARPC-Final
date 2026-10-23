import { createContext, useContext } from 'react';
import { post } from '../utils/api';
export const AuthContext=createContext({profile:null,status:'guest',error:'',refresh:async()=>null,acceptSession:()=>{},signOut:all=>post(all?'/auth/logout-all':'/auth/logout')});
export const useAuth=()=>useContext(AuthContext);
