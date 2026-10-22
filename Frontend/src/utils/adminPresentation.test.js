import { expect,it } from 'vitest';
import { pageName } from './adminPresentation';
it.each([['/','Home'],['/join','Membership application'],['/gallery?album=1','Gallery'],['/team/','Panel'],['/enroll/courses/private-id','Course enrollment'],['/enroll/events/event-id','Event enrollment'],['/unrecognised/private-id','Other website pages']])('gives %s a readable analytics label', (path,name)=>expect(pageName(path)).toBe(name));
