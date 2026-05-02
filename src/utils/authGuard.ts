// 登录跳转标记（用于跳过路由守卫检查）
let isLoggingIn = false

export function setLoggingIn(value: boolean) {
  isLoggingIn = value
}

export function getLoggingIn() {
  return isLoggingIn
}
