import React from 'react'
import Hero from '../Components/Home/Hero'
import About from '../Components/Home/About'
import FeaturedEvents from '../Components/Home/FeaturedEvents'
import Quote from '../Components/Home/Quote'
import Sponsors from '../Components/Home/Sponsors'
const Home = () => {
  return (
    <div className='text-black'>
        <Hero />
        <About />
        <FeaturedEvents />
        <Quote />
        <Sponsors />
    </div>
  )
}

export default Home
