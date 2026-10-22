import { act,cleanup,fireEvent,render,screen,waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach,beforeEach,expect,it,vi } from 'vitest';
import AdminImageField from './AdminImageField';
import { api, post } from '../utils/api';
vi.mock('../utils/api',()=>({api:vi.fn(),post:vi.fn()}));
beforeEach(()=>{post.mockReset();api.mockReset();});
afterEach(cleanup);
it('uploads a dropped photo and returns the stored image address',async()=>{
 post.mockResolvedValue({url:'/api/assets/photo'});const change=vi.fn();const busy=vi.fn();
 render(<AdminImageField label="Member photo" onChange={change} onBusyChange={busy}/>);
 const file=new File(['photo'],'member.webp',{type:'image/webp'});
 fireEvent.drop(screen.getByLabelText('Upload member photo').closest('label'),{dataTransfer:{files:[file]}});
 await waitFor(()=>expect(change).toHaveBeenCalledWith('/api/assets/photo'));
 expect(post.mock.calls[0][0]).toBe('/admin/files');
 expect(post.mock.calls[0][1].get('purpose')).toBe('image');
 expect(post.mock.calls[0][1].get('file')).toBe(file);
 expect(busy.mock.calls).toEqual([[true],[false]]);
});
it.each([['text/plain',1,'Choose a PNG, JPEG or WebP image.'],['image/png',10*1024*1024+1,'Choose an image smaller than 10 MB.']])('rejects an invalid upload before sending it (%s)',async(type,size,message)=>{
 render(<AdminImageField onChange={vi.fn()}/>);
 const file=new File(['image'],'file',{type});Object.defineProperty(file,'size',{value:size});
 fireEvent.change(screen.getByLabelText('Upload image'),{target:{files:[file]}});
 expect(await screen.findByRole('alert')).toHaveTextContent(message);expect(post).not.toHaveBeenCalled();
});
it('keeps the existing photo when an upload fails',async()=>{
 post.mockRejectedValue(new Error('Upload failed.'));const change=vi.fn();
 render(<AdminImageField value="/logo.jpg" onChange={change}/>);
 fireEvent.change(screen.getByLabelText('Upload image'),{target:{files:[new File(['image'],'image.png',{type:'image/png'})]}});
 expect(await screen.findByRole('alert')).toHaveTextContent('We couldn’t complete that request. Please try again.');
 expect(change).not.toHaveBeenCalled();expect(screen.getByRole('img')).toHaveAttribute('src','/logo.jpg');
 expect(screen.getByLabelText('Upload image')).not.toBeDisabled();
});

function EditableImage() {
 const [value,setValue]=useState('/api/assets/original');
 return <AdminImageField label="Card image" value={value} onChange={setValue}/>;
}

it('replaces an uploaded image with an online link and updates the preview without uploading',()=>{
 render(<EditableImage/>);
 const link=screen.getByRole('textbox',{name:'Card image online image link'});
 expect(link).toBeVisible();expect(link).toHaveValue('');
 expect(screen.getByAltText('Card image preview')).toHaveAttribute('src','/api/assets/original');
 expect(screen.getByText('OR use an online image link')).toBeVisible();
 expect(screen.queryByText('Choose an uploaded image')).not.toBeInTheDocument();
 expect(screen.queryByText('Use an existing image address')).not.toBeInTheDocument();
 fireEvent.change(link,{target:{value:'https://images.example.com/photo.jpg'}});
 expect(link).toHaveValue('https://images.example.com/photo.jpg');expect(link).toBeValid();
 expect(screen.getByAltText('Card image preview')).toHaveAttribute('src','https://images.example.com/photo.jpg');
 expect(api).not.toHaveBeenCalled();expect(post).not.toHaveBeenCalled();
 fireEvent.change(link,{target:{value:''}});
 expect(screen.queryByAltText('Card image preview')).not.toBeInTheDocument();
});

it('locks the link while uploading and replaces it only when the upload succeeds',async()=>{
 let finish;post.mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));
 render(<EditableImage/>);
 const link=screen.getByRole('textbox',{name:'Card image online image link'});
 fireEvent.change(link,{target:{value:'https://images.example.com/photo.jpg'}});
 fireEvent.change(screen.getByLabelText('Upload card image'),{target:{files:[new File(['image'],'image.png',{type:'image/png'})]}});
 expect(link).toBeDisabled();expect(link).toHaveValue('https://images.example.com/photo.jpg');
 await act(async()=>finish({url:'/api/assets/replacement'}));
 expect(link).toBeEnabled();expect(link).toHaveValue('');
 expect(screen.getByAltText('Card image preview')).toHaveAttribute('src','/api/assets/replacement');
});

it.each(['not a URL','http://images.example.com/photo.jpg','javascript:alert(1)'])('rejects an invalid online image link: %s',value=>{
 render(<EditableImage/>);
 const link=screen.getByRole('textbox',{name:'Card image online image link'});
 fireEvent.change(link,{target:{value}});
 expect(link).toBeInvalid();
});
