import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import { ContentContext } from '../../ContentContext';
import Hero from './Hero';
import About from './About';
import FeaturedEvents from './FeaturedEvents';
import { defaultHero } from '../../utils/homeContent';

const show=(element,data)=>render(<MemoryRouter><ContentContext.Provider value={{home:[],programmes:[],...data}}>{element}</ContentContext.Provider></MemoryRouter>);

it('keeps the Arabic greeting visible for older hero records', () => {
  show(<Hero/>, { home: [{ id: 'hero', title: 'Welcome', description: 'Club introduction' }] });
  expect(screen.getByText(defaultHero.arabicGreeting)).toHaveAttribute('dir', 'rtl');
});

it('uses the published Arabic greeting on every hero image', () => {
  show(<Hero/>, { home: [{ id: 'hero', arabicGreeting: 'أهلاً وسهلاً بكم' }] });
  expect(screen.getByText('أهلاً وسهلاً بكم')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: '02: Image 2' }));
  expect(screen.getByText('أهلاً وسهلاً بكم')).toBeVisible();
  expect(screen.queryByText(defaultHero.arabicGreeting)).not.toBeInTheDocument();
});

it('uses the published image count and switches each image’s caption with its photo',()=>{
  show(<Hero/>,{home:[{id:'hero',title:'Default title',description:'Default intro',slides:[{id:'a',name:'Campus',image:'/a.jpg',title:'Campus headline',description:'Campus intro'},{id:'b',name:'Service',image:'/b.jpg',title:'Service headline',description:'Service intro'},{id:'c',name:'Shared',image:'/c.jpg',title:'',description:''}]}]});
  expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Campus headline');
  fireEvent.click(screen.getByRole('button',{name:'02: Service'}));
  expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Service headline');
  expect(screen.getByText('Service intro')).toBeVisible();
  fireEvent.click(screen.getByRole('button',{name:'03: Shared'}));
  expect(screen.getByRole('heading',{level:1})).toHaveTextContent('Campus headline');
  expect(screen.getByText('Campus intro')).toBeVisible();
});

it('renders custom About card labels, summaries, expanded text and destinations',()=>{
  show(<About/>,{home:[{id:'about-us',title:'Our campus community',label:'Meet the members',summary:'Our short introduction',description:'Our full introduction',image:'/custom.jpg',link:'/gallery',linkLabel:'Our photographs'}]});
  expect(screen.getByText('Meet the members')).toBeVisible();
  expect(screen.getByText('Our short introduction')).toBeVisible();
  fireEvent.click(screen.getByRole('button',{name:'Our campus community'}));
  const region=screen.getByRole('region',{name:'Our campus community'});
  expect(within(region).getByText('Our full introduction')).toBeVisible();
  expect(within(region).getByRole('link',{name:'Our photographs'})).toHaveAttribute('href','/gallery');
});

it('uses the correct application route and facts for every featured kind',()=>{
  const programmes=[{id:'event',kind:'events',title:'A gathering',description:'Event description',date:'2026-12-01',time:'15:00',location:'Campus',image:'/logo.jpg'},{id:'webinar',kind:'webinars',title:'An online discussion',description:'Webinar description',date:'2026-12-02',time:'16:00',location:'Online',image:'/logo.jpg'},{id:'course',kind:'courses',title:'A course',description:'Course description',fee:0,duration:'Four weeks',pace:'Weekly',image:'/logo.jpg'}];
  show(<FeaturedEvents/>,{programmes,home:[{id:'featured',title:'Coming up at the club',selections:[{id:'event',kind:'events'},{id:'webinar',kind:'webinars'},{id:'course',kind:'courses'},{id:'membership',kind:'membership'}]}]});
  expect(screen.getByRole('heading',{level:2})).toHaveTextContent('Coming up at the club');
  expect(screen.getByRole('link',{name:'Register now'})).toHaveAttribute('href','/enroll/events/event');
  fireEvent.click(screen.getByRole('button',{name:'Go to featured item 2'}));
  expect(screen.getByRole('link',{name:'Register now'})).toHaveAttribute('href','/enroll/webinars/webinar');
  fireEvent.click(screen.getByRole('button',{name:'Go to featured item 3'}));
  expect(screen.getByRole('link',{name:'Register now'})).toHaveAttribute('href','/enroll/courses/course');
  expect(within(screen.getByRole('article')).getByText('Four weeks')).toBeVisible();
  fireEvent.click(screen.getByRole('button',{name:'Go to featured item 4'}));
  expect(screen.getByRole('link',{name:'Apply for membership'})).toHaveAttribute('href','/join');
});
