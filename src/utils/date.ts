import dayjs from 'dayjs'

export function formatTime(timestamp: number): string {
  return dayjs(timestamp).format('HH:mm')
}

export function formatDate(timestamp: number, format = 'YYYY-MM-DD'): string {
  return dayjs(timestamp).format(format)
}

export function formatDateTime(timestamp: number): string {
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm')
}

export function getDateLabel(timestamp: number): string {
  const day = dayjs(timestamp)
  const today = dayjs().startOf('day')

  const diff = today.diff(day.startOf('day'), 'day')
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff === 2) return '前天'
  return day.format('M月D日')
}

export function now(): number {
  return Date.now()
}

/**
 * 获取月份的日历网格数据
 * @param year 年份
 * @param month 月份 (1-12)
 * @returns 日历网格数据，包含日期、是否本月、是否今天
 */
export function getCalendarMonth(year: number, month: number): Array<{
  date: Date
  day: number
  isCurrentMonth: boolean
  isToday: boolean
}> {
  const result: Array<{
    date: Date
    day: number
    isCurrentMonth: boolean
    isToday: boolean
  }> = []

  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 获取本月第一天是星期几（0=周日）
  const startWeekday = firstDay.getDay()

  // 填充上月末尾日期
  for (let i = startWeekday - 1; i >= 0; i--) {
    const date = new Date(year, month - 2, lastDay.getDate() - i)
    result.push({
      date,
      day: date.getDate(),
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime()
    })
  }

  // 填充本月日期
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month - 1, i)
    result.push({
      date,
      day: i,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime()
    })
  }

  // 填充下月初日期，补齐6行
  const remaining = 42 - result.length
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month, i)
    result.push({
      date,
      day: i,
      isCurrentMonth: false,
      isToday: date.getTime() === today.getTime()
    })
  }

  return result
}

/**
 * 获取日期的开始时间戳（00:00:00）
 */
export function getStartOfDay(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * 获取日期的结束时间戳（23:59:59）
 */
export function getEndOfDay(date: Date): number {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}

/**
 * 获取月份的第一天时间戳
 */
export function getMonthStart(year: number, month: number): number {
  return new Date(year, month - 1, 1, 0, 0, 0, 0).getTime()
}

/**
 * 获取月份的最后一天时间戳
 */
export function getMonthEnd(year: number, month: number): number {
  return new Date(year, month, 0, 23, 59, 59, 999).getTime()
}

/**
 * 获取年份的第一天时间戳
 */
export function getYearStart(year: number): number {
  return new Date(year, 0, 1, 0, 0, 0, 0).getTime()
}

/**
 * 获取年份的最后一天时间戳
 */
export function getYearEnd(year: number): number {
  return new Date(year, 11, 31, 23, 59, 59, 999).getTime()
}

/**
 * 获取星期几的中文名称
 */
export function getWeekdayName(date: Date): string {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
  return weekdays[date.getDay()]
}
