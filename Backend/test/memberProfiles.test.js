import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contentSchemas } from '../src/validation.js';

const team = members => ({id:'team',label:'Club team',description:'Our people.',members:[{id:'member',name:'Club Member',...members}]});
test('team validation preserves and normalizes LinkedIn and GitHub profiles',()=>{
 const member=contentSchemas.teams.parse(team({linkedin:'club-member',github:'@club-dev'})).members[0];
 assert.equal(member.linkedin,'https://www.linkedin.com/in/club-member');
 assert.equal(member.github,'https://github.com/club-dev');
 const legacy=contentSchemas.teams.parse(team({})).members[0];
 assert.equal(legacy.linkedin,'');assert.equal(legacy.github,'');
});
test('team validation rejects script links, impersonating hosts, credentials and non-profile paths',()=>{
 for(const github of ['javascript:alert(1)','http://github.com/user','https://github.com.evil.test/user','https://user:password@github.com/user','https://github.com/user/repository','https://github.com/a%2Fb'])assert.equal(contentSchemas.teams.safeParse(team({github})).success,false,github);
 assert.equal(contentSchemas.teams.safeParse(team({linkedin:'https://linkedin.com/company/club'})).success,false);
});
