import Vue from 'vue'
import Vuex from 'vuex'
import AuthService from '../services/AuthService'
import firebase from 'firebase'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loadedTasks: [],
    user: null,
    selectedDate: new Date(),
    error: null,
    timerId: null,
    loading: false,
    activeTask: null
  },
  mutations: {
    createTask (state, payload) {
      state.loadedTasks.push(payload)
    },
    updateTask (state, payload) {
      const task = state.loadedTasks.find(task => {
        return task.id === payload.id
      })
      if (payload.name) {
        task.name = payload.name
      }
      if (payload.timeTask) {
        task.timeTask = payload.timeTask
      }
      if (payload.status) {
        task.status = payload.status
      }
    },
    deleteTask (state, id) {
      state.loadedTasks.some((element, index) => {
        if (element.id === id) {
          state.loadedTasks.splice(index, 1)
          return element
        }
      })
    },
    createSubtask (state, payload) {
      const task = state.loadedTasks.find(currentTask => currentTask.id === payload.taskId)
      task.subtasks.push(payload)
    },
    updateSubtask (state, payload) {
      const task = state.loadedTasks.find(currentTask => currentTask.id === payload.taskId)
      let subtask = task.subtasks.find(currentSubtask => currentSubtask.id === payload.id)
      if (payload.name) {
        subtask.name = payload.name
      }
      if (payload.hasOwnProperty('status')) {
        subtask.status = payload.status
      }
    },
    deleteSubtask (state, id) {
      state.loadedTasks.some((task, index, array) => {
        task.subtasks.some((subtask, index) => {
          if (subtask.id === id) {
            task.subtasks.splice(index, 1)
            return subtask
          }
        })
      })
    },
    setLoadedTasks (state, payload) {
      state.loadedTasks = payload
    },
    setUser (state, payload) {
      state.user = payload
    },
    setSelectedDate (state, payload) {
      state.selectedDate = payload
    },
    setError (state, payload) {
      state.error = payload
    },
    setLoading (state, payload) {
      state.loading = payload
    },
    clearError (state) {
      state.error = null
    },
    setActiveTask (state, payload) {
      state.activeTask = payload
    }
  },
  actions: {
    updateSelectedDate ({commit}, payload) {
      commit('setSelectedDate', payload)
      this.dispatch('loadTasks')
    },
    loadTasks ({commit, getters}) {
      commit('setLoading', true)
      firebase.database().ref('tasks').once('value')
        .then((data) => {
          const obj = data.val()
          const tasks = []
          const date = getters.selectedDate.toISOString().slice(0, 10)
          for (let key in obj) {
            if (obj[key].dateId === date && obj[key].userId === getters.user.id) {
              let task = {
                id: key,
                name: obj[key].name,
                description: obj[key].description,
                timeCreate: obj[key].timeCreate,
                play: obj[key].play,
                timeTask: obj[key].timeTask,
                status: obj[key].status,
                subtasks: [],
                userId: obj[key].userId,
                dateId: obj[key].dateId
              }
              if (obj[key].subtasksId) {
                this.dispatch('loadSubtasks', key).then((subtasksArray) => {
                  task.subtasks = subtasksArray
                })
              }
              tasks.push(task)
            }
          }
          commit('setLoadedTasks', tasks)
          commit('setLoading', false)
        })
        .catch(
          (err) => {
            console.log(err)
            commit('setLoading', false)
          }
        )
    },
    createTask ({commit, getters}) {
      const task = {
        name: 'task name',
        description: '',
        timeCreate: new Date().toISOString(),
        play: false,
        timeTask: 0,
        status: true,
        subtasks: [],
        userId: getters.user.id,
        dateId: getters.selectedDate.toISOString().slice(0, 10),
        subtasksId: []
      }
      let key
      firebase.database().ref('tasks').push(task)
        .then((data) => {
          key = data.key
          return key
        })
        .then(() => {
          task['id'] = key
          commit('createTask', task)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    deleteTask ({commit}, taskData) {
      firebase.database().ref('tasks/' + taskData.id).remove()
        .then(() => {
          taskData.subtasks.forEach((subtask) => {
            this.dispatch('deleteSubtask', {taskId: taskData.id, subtaskId: subtask.id})
          })
          commit('deleteTask', taskData.id)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    updateTaskData ({commit}, payload) {
      const updateObj = {}
      if (payload.name) {
        updateObj.name = payload.name
      }
      if (payload.timeTask) {
        updateObj.timeTask = payload.timeTask
      }
      if (payload.hasOwnProperty('status')) {
        updateObj.status = payload.status
      }
      firebase.database().ref('tasks').child(payload.id).update(updateObj)
        .then(() => {
          commit('updateTask', payload)
        })
        .catch(error => {
          console.log(error)
        })
    },
    loadSubtasks ({commit}, taskId) {
      const subtasks = []
      firebase.database().ref('subtasks').once('value')
        .then((data) => {
          const obj = data.val()
          for (let key in obj) {
            if (obj[key].taskId === taskId) {
              subtasks.push({
                id: key,
                name: obj[key].name,
                status: obj[key].status,
                taskId: obj[key].taskId
              })
            }
          }
        })
        .catch(
          (err) => {
            console.log(err)
          }
        )
      return subtasks
    },
    createSubtask ({commit, getters}, taskData) {
      const subtask = {
        name: 'subtask name',
        status: false,
        taskId: taskData.id
      }
      let key
      firebase.database().ref('subtasks').push(subtask)
        .then((data) => {
          key = data.key
          return key
        })
        .then(() => {
          subtask.id = key
          this.dispatch('addSubtaskToTask', subtask)
          commit('createSubtask', subtask)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    updateSubtaskData ({commit}, payload) {
      const updateObj = {}
      if (payload.taskId) {
        updateObj.taskId = payload.taskId
      }
      if (payload.name) {
        updateObj.name = payload.name
      }
      if (payload.hasOwnProperty('status')) {
        updateObj.status = payload.status
      }
      firebase.database().ref('subtasks').child(payload.id).update(updateObj)
        .then(() => {
          commit('updateSubtask', payload)
        })
        .catch(error => {
          console.log(error)
        })
    },
    deleteSubtask ({commit}, subtaskInfo) {
      firebase.database().ref('subtasks/' + subtaskInfo.subtaskId).remove()
        .then(() => {
          firebase.database().ref('tasks/' + subtaskInfo.taskId + '/subtasksId/' + subtaskInfo.subtaskId).remove()
          commit('deleteSubtask', subtaskInfo.subtaskId)
        })
        .catch((err) => {
          console.log(err)
        })
    },
    addSubtaskToTask ({commit}, subtask) {
      const subtaskInfo = {}
      subtaskInfo[subtask.id] = true
      firebase.database().ref('tasks/' + subtask.taskId + '/subtasksId').update(subtaskInfo)
        .catch((err) => {
          console.log(err)
        })
    },
    signUserUp ({commit}, payload) {
      AuthService.signUp(payload.email, payload.password)
        .then((user) => {
          const newUser = {
            id: user.uid
          }
          commit('setUser', newUser)
        })
        .catch((err) => {
          console.log(err)
          commit('setError', err)
        })
    },
    signUserIn ({commit}, payload) {
      AuthService.signIn(payload.email, payload.password)
        .then((user) => {
          const currentUser = {
            id: user.uid
          }
          commit('setUser', currentUser)
        })
        .catch((err) => {
          console.log(err)
          commit('setError', err)
        })
    },
    autoSign ({commit}, payload) {
      commit('setUser', {id: payload.uid})
    },
    logout ({commit}) {
      AuthService.signOut()
      commit('setUser', null)
    },
    clearError ({commit}) {
      commit('clearError')
    },
    setActiveTask ({commit}, payload) {
      commit('setActiveTask', payload)
    }
  },
  getters: {
    loadedTasks (state) {
      return state.loadedTasks
    },
    selectedDate (state) {
      return state.selectedDate
    },
    user (state) {
      return state.user
    },
    loading (state) {
      return state.loading
    },
    error (state) {
      return state.error
    },
    activeTask (state) {
      return state.activeTask
    }
  }
})
