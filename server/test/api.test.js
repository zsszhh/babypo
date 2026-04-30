import { describe, it, before, after } from 'node:test'
import assert from 'node:assert'
import { spawn } from 'node:child_process'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SERVER_DIR = resolve(__dirname, '..')
const BASE = 'http://localhost:34567/api/v1'
const TEST_DB = resolve(SERVER_DIR, 'data', 'test-babypoop.db')

let serverProcess

function request(path, options = {}) {
  const url = `${BASE}${path}`
  const { headers: optHeaders, ...rest } = options
  return fetch(url, {
    headers: { 'Content-Type': 'application/json', ...optHeaders },
    ...rest,
  }).then(async (res) => {
    const data = await res.json()
    return { status: res.status, data }
  })
}

let token = ''
let babyId = 1
let recordId = null

describe('BabyPoopTracker API', () => {
  before(async () => {
    // 清理旧测试数据库
    if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB)

    // 启动测试服务器
    serverProcess = spawn('node', ['src/index.js'], {
      cwd: SERVER_DIR,
      env: {
        ...process.env,
        PORT: '34567',
        DB_PATH: TEST_DB,
        JWT_SECRET: 'test-secret',
        PASSWORD: '123456',
      },
      stdio: 'pipe',
    })

    // 等待服务器就绪
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(BASE + '/auth/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
        if (res.status === 401) break
      } catch {}
      await new Promise((r) => setTimeout(r, 500))
    }
  })

  after(() => {
    if (serverProcess) {
      serverProcess.kill('SIGTERM')
    }
  })

  // ── Auth ──
  describe('Auth', () => {
    it('应拒绝空密码', async () => {
      const { status, data } = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password: '' }),
      })
      assert.strictEqual(status, 401)
      assert.strictEqual(data.success, false)
    })

    it('应拒绝错误密码', async () => {
      const { status, data } = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password: 'wrong' }),
      })
      assert.strictEqual(status, 401)
      assert.strictEqual(data.success, false)
    })

    it('应正确登录并返回 token', async () => {
      const { status, data } = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password: '123456' }),
      })
      assert.strictEqual(status, 200)
      assert.strictEqual(data.success, true)
      assert.ok(data.data.token)
      token = data.data.token
    })

    it('应验证有效 token', async () => {
      const { status, data } = await request('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
      })
      assert.strictEqual(status, 200)
      assert.strictEqual(data.success, true)
    })

    it('应拒绝无效 token', async () => {
      const { status, data } = await request('/auth/verify', {
        method: 'POST',
        body: JSON.stringify({ token: 'invalid' }),
      })
      assert.strictEqual(status, 401)
      assert.strictEqual(data.success, false)
    })
  })

  // ── Babies ──
  describe('Babies', () => {
    it('应返回默认宝宝列表', async () => {
      const { status, data } = await request('/babies', {
        headers: { Authorization: `Bearer ${token}` },
      })
      assert.strictEqual(status, 200)
      assert.strictEqual(data.success, true)
      assert.ok(Array.isArray(data.data))
      assert.strictEqual(data.data.length, 1)
      assert.strictEqual(data.data[0].name, '宝宝')
      babyId = data.data[0].id
    })

    it('应创建新宝宝', async () => {
      const { status, data } = await request('/babies', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: '小明', birthdate: Date.now(), gender: 'male' }),
      })
      assert.strictEqual(status, 201)
      assert.strictEqual(data.success, true)
      assert.ok(data.data.id)
    })

    it('应拒绝无认证请求', async () => {
      const { status, data } = await request('/babies')
      assert.strictEqual(status, 401)
      assert.strictEqual(data.success, false)
    })
  })

  // ── Records ──
  describe('Records', () => {
    it('应创建记录', async () => {
      const { status, data } = await request('/records', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          babyId,
          timestamp: Date.now(),
          type: 'type4',
          color: 'brown',
          amount: 'medium',
          note: '测试记录',
          operatorName: '妈妈',
        }),
      })
      assert.strictEqual(status, 201)
      assert.strictEqual(data.success, true)
      assert.ok(data.data.id)
      recordId = data.data.id
    })

    it('应获取记录列表', async () => {
      const { status, data } = await request(`/records?babyId=${babyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      assert.strictEqual(status, 200)
      assert.strictEqual(data.success, true)
      assert.ok(data.data.records.length >= 1)
    })

    it('应获取单条记录', async () => {
      const { status, data } = await request(`/records/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      assert.strictEqual(status, 200)
      assert.strictEqual(data.success, true)
      assert.strictEqual(data.data.type, 'type4')
    })

    it('应更新记录', async () => {
      const { status, data } = await request(`/records/${recordId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: 'type3' }),
      })
      assert.strictEqual(status, 200)
      assert.strictEqual(data.success, true)
    })

    it('应拒绝创建无 type 的记录', async () => {
      const { status, data } = await request('/records', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ babyId, timestamp: Date.now() }),
      })
      assert.strictEqual(status, 400)
      assert.strictEqual(data.success, false)
    })

    it('应软删除记录', async () => {
      const { status, data } = await request(`/records/${recordId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      assert.strictEqual(status, 200)
      assert.strictEqual(data.success, true)
    })

    it('已删除记录不应出现在列表中', async () => {
      const { status, data } = await request(`/records?babyId=${babyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      assert.strictEqual(status, 200)
      const found = data.data.records.some((r) => r.id === recordId)
      assert.strictEqual(found, false)
    })

    it('应支持日期筛选', async () => {
      const start = Date.now() - 86400000
      const end = Date.now() + 86400000
      const { status, data } = await request(
        `/records?babyId=${babyId}&startDate=${start}&endDate=${end}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      assert.strictEqual(status, 200)
      assert.strictEqual(data.success, true)
    })

    it('应支持分页', async () => {
      const { status, data } = await request(`/records?babyId=${babyId}&page=1&pageSize=5`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      assert.strictEqual(status, 200)
      assert.ok(data.data.records.length <= 5)
      assert.ok(data.data.total !== undefined)
    })
  })

  // ── Sync ──
  describe('Sync', () => {
    it('应推送上送记录', async () => {
      const { status, data } = await request('/sync/push', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          records: [
            {
              localId: 'local-1',
              babyId,
              timestamp: Date.now(),
              type: 'type1',
              color: 'yellow',
              amount: 'small',
              operatorName: '爸爸',
              createdAt: Date.now(),
              updatedAt: Date.now(),
            },
          ],
        }),
      })
      assert.strictEqual(status, 200)
      assert.strictEqual(data.success, true)
      assert.ok(data.data, '应返回 data 字段')
      assert.ok(Array.isArray(data.data.mapping), 'mapping 应为数组')
      assert.strictEqual(data.data.mapping[0]?.localId, 'local-1')
      assert.ok(data.data.mapping[0]?.serverId)
    })

    it('应拉取同步数据', async () => {
      const { status, data } = await request('/sync/pull', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ babyId, lastSyncTime: 0 }),
      })
      assert.strictEqual(status, 200)
      assert.strictEqual(data.success, true)
      assert.ok(Array.isArray(data.data.records))
      assert.ok(Array.isArray(data.data.deletedIds))
      assert.ok(data.data.serverTime)
    })
  })

  // ── Statistics ──
  describe('Statistics', () => {
    it('应返回统计摘要', async () => {
      const { status, data } = await request(`/statistics/summary?babyId=${babyId}&days=7`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      assert.strictEqual(status, 200)
      assert.strictEqual(data.success, true)
      assert.ok(typeof data.data.totalCount === 'number')
      assert.ok(typeof data.data.avgPerDay === 'number')
      assert.ok(data.data.typeDistribution)
      assert.ok(data.data.colorDistribution)
    })

    it('应返回 30 天统计', async () => {
      const { status, data } = await request(`/statistics/summary?babyId=${babyId}&days=30`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      assert.strictEqual(status, 200)
      assert.strictEqual(data.success, true)
    })

    it('应处理无效 days 参数（使用默认值）', async () => {
      const { status, data } = await request(`/statistics/summary?babyId=${babyId}&days=abc`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      assert.strictEqual(status, 200)
      assert.strictEqual(data.success, true)
    })
  })

  // ── Export ──
  describe('Export', () => {
    it('应导出 JSON', async () => {
      const url = `${BASE}/export/json?babyId=${babyId}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      assert.strictEqual(res.status, 200)
      assert.ok(res.headers.get('content-type').startsWith('application/json'))
    })

    it('应导出 CSV', async () => {
      const url = `${BASE}/export/csv?babyId=${babyId}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      assert.strictEqual(res.status, 200)
      const text = await res.text()
      assert.ok(text.includes('类型'))
      assert.ok(text.includes('颜色'))
    })

    it('应拒绝未认证导出', async () => {
      const res = await fetch(`${BASE}/export/json?babyId=${babyId}`)
      assert.strictEqual(res.status, 401)
    })
  })
})
