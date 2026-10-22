import React from 'react'
import Hero from '../Components/Home/Hero'
import About from '../Components/Home/About'
import FeaturedEvents from '../Components/Home/FeaturedEvents'
import Sponsors from '../Components/Home/Sponsors'
import { useContent } from '../ContentContext'
import { ContentNotice } from '../Components/ContentFeedback'
import { publicPageFrame } from '../Components/PublicLayout.styles'
const Home = () => {
  const content=useContent();
  return (
    <div className='text-ink'>
        <Hero />
        {content?.error&&content?.hasData&&<div className={`${publicPageFrame} pt-6`}><ContentNotice content={content}/></div>}
        <About />
        <FeaturedEvents />
        <Sponsors />
    </div>
  )
}

export default Home
