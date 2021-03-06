import Vue from 'vue'
import Router from 'vue-router'
import AuthGuard from './auth-guard'

import SignUp from '../components/Auth/SignUp.vue'
import TimeTracker from '../components/TimeTracker/TimeTracker.vue'

Vue.use(Router)

export default new Router({
  linkActiveClass: 'active',
  linkExactActiveClass: 'active',
  routes: [
    {
      path: '/time-tracker',
      component: TimeTracker,
      beforeEnter: AuthGuard
    },
    {
      path: '/signup',
      component: SignUp
    }
  ]
})
