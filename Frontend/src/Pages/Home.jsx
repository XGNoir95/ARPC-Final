import React from 'react'
import Hero from '../Components/Home/Hero'
import About from '../Components/Home/About'
import FeaturedEvents from '../Components/Home/FeaturedEvents'
import Sponsors from '../Components/Home/Sponsors'
const Home = () => {
  return (
    <div className='text-black'>
        <Hero />
        <About />
        <FeaturedEvents />
        <Sponsors />
    </div>
  )
}

export default Home
