import { expect, it } from 'vitest';
import { memberProfileUrl } from './memberProfiles';

it.each([
 ['github','@club-member','https://github.com/club-member'],
 ['github','github.com/club-member','https://github.com/club-member'],
 ['linkedin','club-member','https://www.linkedin.com/in/club-member'],
 ['linkedin','https://linkedin.com/in/club-member/?trk=profile','https://www.linkedin.com/in/club-member'],
 ['github','',''],
])('normalizes %s profile %s', (service,input,url)=>expect(memberProfileUrl(service,input)).toBe(url));

it.each(['javascript:alert(1)','http://github.com/user','https://github.com.evil.test/user','https://user:password@github.com/user','https://github.com/user/project','https://github.com/','https://linkedin.com/in/user','https://github.com/a%2Fb'])('rejects a non-profile GitHub address: %s', value=>expect(memberProfileUrl('github',value)).toBeNull());
