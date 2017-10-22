import Vue from 'vue'
import Router from 'vue-router'

import MainPage from '../components/MainPage.vue'
import SignUp from '../components/Auth/SignUp.vue'
import DataSelection from '../components/DataSelection.vue'
import TimeTracker from '../components/TimeTracker/TimeTracker.vue'

Vue.use(Router)

export default new Router({
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
  routes: [
    {
      path: '/',
      component: MainPage
    },
    {
      path: '/signup',
      component: SignUp
    },
    {
      path: '/date',
      component: DataSelection
    },
    {
      path: '/time-tracker',
      component: TimeTracker
    }
  ]
})
