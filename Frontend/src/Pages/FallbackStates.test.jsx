import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { ContentContext, useContent } from '../contexts/ContentContext';
import ContentProvider from '../contexts/ContentProvider';
import { ContentNotice } from '../Components/ContentFeedback';
import Catalogue from './Catalogue';
import Gallery from './Gallery';
import Team from './Team';
import { catalogue } from '../data/catalogue';
import { api, post } from '../utils/api';

vi.mock('../utils/api',()=>({api:vi.fn(),post:vi.fn()}));
const empty={programmes:[],gallery:[],teams:[],sponsors:[],home:[]};
beforeEach(()=>{api.mockResolvedValue(empty);post.mockResolvedValue({});});
afterEach(()=>vi.restoreAllMocks());
const renderPage=(Page,overrides={})=>render(<MemoryRouter><ContentContext.Provider value={{...empty,hasData:true,loading:false,error:'',retry:vi.fn(),...overrides}}><Page/></ContentContext.Provider></MemoryRouter>);

it('shows one honest catalogue empty state instead of three failed searches',()=>{
  renderPage(Catalogue);
  expect(screen.getByRole('heading',{name:'No programmes available yet.'})).toBeVisible();
  expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Reset search and filter'})).not.toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Explore the gallery'})).toHaveAttribute('href','/gallery');
});
it('distinguishes an unpublished section from an active search with no matches',()=>{
  renderPage(Catalogue,{programmes:[{...catalogue.courses[0],kind:'courses'}]});
  expect(screen.getByRole('heading',{name:'No events available yet.'})).toBeVisible();
  fireEvent.change(screen.getByRole('searchbox'),{target:{value:'nothing matches this'}});
  expect(screen.getByRole('heading',{name:'No courses match this selection.'})).toBeVisible();
  expect(screen.getAllByRole('button',{name:'Reset search and filter'})).toHaveLength(1);
  fireEvent.click(screen.getByRole('button',{name:'Reset search and filter'}));
  expect(screen.getByRole('button',{name:`Open course folder: ${catalogue.courses[0].title}`})).toBeVisible();
});
it.each([[Gallery,'the gallery'],[Team,'the club teams'],[Catalogue,'the catalogue']])('shows a recoverable data error without exposing server details', (Page,resource)=>{
  const retry=vi.fn();renderPage(Page,{hasData:false,error:'MongoServerError password=/private/database',retry});
  expect(screen.getByRole('heading',{name:`We couldn’t load ${resource}.`})).toBeVisible();
  expect(screen.queryByText(/MongoServerError|private\/database/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Try again'}));expect(retry).toHaveBeenCalledOnce();
});
it('does not show gallery navigation instructions when there are no photos',()=>{
  renderPage(Gallery);
  expect(screen.getByRole('heading',{name:'No photos to display yet.'})).toBeVisible();
  expect(screen.queryByText('Swipe or use the arrows to explore.')).not.toBeInTheDocument();
  expect(screen.getByRole('link',{name:'Explore programmes'})).toHaveAttribute('href','/catalogue');
});
it('gives the panel a visible empty message instead of a blank section',()=>{
  renderPage(Team);
  expect(screen.getByRole('heading',{name:'No team profiles available yet.'})).toBeVisible();
  expect(screen.getByRole('link',{name:'Contact the club'})).toHaveAttribute('href','mailto:info@arpc.club');
});
it('does not confuse initial loading with a published empty album',()=>{
  renderPage(Gallery,{hasData:false,loading:true});
  expect(screen.getByRole('heading',{name:'Loading the gallery…'})).toBeVisible();
  expect(screen.queryByText('No photos to display yet.')).not.toBeInTheDocument();
});

it.each([[Gallery,'No photos to display yet.'],[Team,'No team profiles available yet.'],[Catalogue,'No programmes available yet.']])('keeps a known empty collection visible when an update fails', (Page,title)=>{
  const retry=vi.fn();renderPage(Page,{hasData:true,error:'private refresh failure',retry});
  expect(screen.getByRole('heading',{name:title})).toBeVisible();
  expect(screen.getByText('Updates are temporarily unavailable.')).toBeVisible();
  expect(screen.queryByText('private refresh failure')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Try again'}));expect(retry).toHaveBeenCalledOnce();
});

function ContentProbe(){const content=useContent();return <><p>Photos: {content.gallery.length}</p><p>{content.loading?'Loading':content.hasData?'Loaded':'Unavailable'}</p><p>{content.error}</p><ContentNotice content={content}/><button onClick={content.retry}>Reload content</button></>;}
it('retains successfully loaded content when a refresh fails and can recover',async()=>{
  api.mockResolvedValueOnce({...empty,gallery:[{id:'photo'}]}).mockRejectedValueOnce(new Error('internal socket failure')).mockResolvedValueOnce({...empty,gallery:[{id:'photo'},{id:'new-photo'}]});
  render(<MemoryRouter><ContentProvider><ContentProbe/></ContentProvider></MemoryRouter>);
  await screen.findByText('Photos: 1');fireEvent.click(screen.getByRole('button',{name:'Reload content'}));
  await screen.findByText('Updates are temporarily unavailable.');
  expect(screen.getByText('Photos: 1')).toBeVisible();expect(screen.queryByText(/internal socket/)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Try again'}));
  await screen.findByText('Photos: 2');expect(screen.queryByText('Updates are temporarily unavailable.')).not.toBeInTheDocument();
});
it('rejects malformed content rather than rendering a misleading empty collection',async()=>{
  api.mockResolvedValue({...empty,gallery:null});
  render(<MemoryRouter><ContentProvider><ContentProbe/></ContentProvider></MemoryRouter>);
  await screen.findByText('Unavailable');
  expect(screen.getByText('We couldn’t load the latest club information. Please try again.')).toBeVisible();
  expect(screen.queryByText(/Invalid content response/)).not.toBeInTheDocument();
  await waitFor(()=>expect(api).toHaveBeenCalledTimes(1));
});
