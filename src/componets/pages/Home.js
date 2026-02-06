
import Carousel from './EventCarousel'
import AboutUs from './AboutUs'
import Activity from "../pages/activity_event/Activity"
import Organisation from './Organisation'
import Events from './Events'

import ShowFeedback from './homefeedback/ShowFeedback'



function Home() {
  return (
    <div className='main'>
<Carousel />
<AboutUs />
<Organisation />
<Events/>
<ShowFeedback />
<Activity isHomePage={true} />

    </div>
  )
}

export default Home