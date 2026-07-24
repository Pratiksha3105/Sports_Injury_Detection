import api from './api'

export async function loginRequest(email, password) {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)

  const { data } = await api.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data // { access_token, refresh_token, token_type }
}

export async function registerRequest(payload) {
  // payload: { full_name, email, password, role, phone? }
  const { data } = await api.post('/auth/register', payload)
  return data
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/users/me')
  return data
}

export function logoutLocal() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}
