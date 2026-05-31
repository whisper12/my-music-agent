import { createApp } from 'vue'
import App from './App.vue'
import './styles/reset.scss'
import './styles/themes.scss'
import './styles/global.scss'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faMusic,
  faSun,
  faMoon,
  faPlay,
  faPause,
  faBackward,
  faForward,
  faVolumeHigh,
  faPaperPlane,
  faRobot,
  faUser,
  faRotateRight
} from '@fortawesome/free-solid-svg-icons'

// Add icons to library
library.add(
  faMusic,
  faSun,
  faMoon,
  faPlay,
  faPause,
  faBackward,
  faForward,
  faVolumeHigh,
  faPaperPlane,
  faRobot,
  faUser,
  faRotateRight
)

const app = createApp(App)

app.component('font-awesome-icon', FontAwesomeIcon)
app.mount('#app')
