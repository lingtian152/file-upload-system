import { createStore } from 'vuex'

function parseJwt(token) {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null
        const decodedPayload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
        return JSON.parse(decodedPayload)
    } catch {
        return null
    }
}

function getUsernameFromCookie() {
    const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith('__Session__='))
        ?.split('=')[1]

    if (!cookie) return null
    const payload = parseJwt(cookie)
    return payload?.username || payload?.sub || null
}

export default createStore({
    state() {
        return {
            username: getUsernameFromCookie(),
        }
    },
    mutations: {
        setUsername(state, name) {
            state.username = name
        },
        clearUser(state) {
            state.username = null
            document.cookie = '__Session__=; path=/; max-age=0'
        },
    },
    actions: {
        loginSuccess({ commit }, name) {
            commit('setUsername', name)
        },
        logout({ commit }) {
            commit('clearUser')
        },
    },
})
