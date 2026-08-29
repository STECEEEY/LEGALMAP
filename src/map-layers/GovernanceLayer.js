// src/map-layers/GovernanceLayer.js
import { departmentData } from '@/data/departments'
import { batchGeocode } from '@/utils/geocoder'

let cachedDepartments = null
let animationFrameId = null
let animationTime = 0

const bezierPoint = (t, p0, p1, p2, p3) => {
  const mt = 1 - t
  const x = mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0]
  const y = mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1]
  return [x, y]
}

const getArcControlPoints = (start, end) => {
  const mid = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  const len = Math.sqrt(dx * dx + dy * dy)
  
  const offset = Math.min(len * 0.15, 0.3)
  const perpX = -dy / len * offset
  const perpY = dx / len * offset
  
  const p1 = [mid[0] + perpX * 0.6, mid[1] + perpY * 0.6]
  const p2 = [mid[0] + perpX * 0.3, mid[1] + perpY * 0.3]
  
  return { p1, p2 }
}

export const loadGovernanceLayer = async (map, statusMessage) => {
  return new Promise(async (resolve, reject) => {
    if (!map) return reject('地图未初始化')
    
    try {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      
      const layerIds = [
        'governance-nodes-layer',
        'governance-nodes-icon-layer',
        'governance-lines-layer',
        'governance-labels-layer',
        'governance-flow-layer',
        'governance-flow-glow-layer'
      ]
      layerIds.forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id)
      })
      ;['governance-nodes', 'governance-lines', 'governance-flow'].forEach(id => {
        if (map.getSource(id)) map.removeSource(id)
      })
      
      let departments = cachedDepartments
      if (!departments) {
        if (statusMessage) statusMessage.value = '正在获取环保部门位置...'
        departments = await batchGeocode(departmentData)
        cachedDepartments = departments
      }
      
      const validDepartments = departments.filter(d => d.lng !== null)
      
      if (validDepartments.length === 0) {
        console.warn('没有获取到有效的部门坐标')
        return resolve()
      }
      
      const features = validDepartments.map(d => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [d.lng, d.lat] },
        properties: {
          name: d.name,
          province: d.province,
          address: d.formattedAddress || d.address,
          type: 'department'
        }
      }))
      
      const CENTER = [116.4, 39.9]
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: CENTER },
        properties: {
          name: '中华人民共和国生态环境部',
          province: '中央',
          address: '北京市东城区东长安街12号',
          type: 'central'
        }
      })
      
      const nodes = { type: 'FeatureCollection', features }
      
      // 静态连接线（弧线）
      const lineFeatures = validDepartments.map(d => {
        const start = CENTER
        const end = [d.lng, d.lat]
        const { p1, p2 } = getArcControlPoints(start, end)
        
        const points = []
        const steps = 50
        for (let i = 0; i <= steps; i++) {
          const t = i / steps
          points.push(bezierPoint(t, start, p1, p2, end))
        }
        
        return {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: points
          },
          properties: { from: '中央', to: d.name }
        }
      })
      
      const connections = { type: 'FeatureCollection', features: lineFeatures }
      
      // ===== 添加节点数据源 =====
      map.addSource('governance-nodes', { type: 'geojson', data: nodes })
      
      // ===== 中央节点：墨绿色圆点（替代红色） =====
      map.addLayer({
        id: 'governance-nodes-layer',
        type: 'circle',
        source: 'governance-nodes',
        filter: ['==', ['get', 'type'], 'central'],
        paint: {
          'circle-radius': 20,
          'circle-color': '#528c7e',
          'circle-opacity': 0.85,
          'circle-stroke-width': 4,
          'circle-stroke-color': '#ffffff'
        }
      })
      
      // ===== 地方部门节点：淡雅绿色圆点（替代原先绿色） =====
      map.addLayer({
        id: 'governance-nodes-icon-layer',
        type: 'circle',
        source: 'governance-nodes',
        filter: ['==', ['get', 'type'], 'department'],
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 6, 10, 10],
          'circle-color': '#bad66e',
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      })
      
      // ===== 标签：显示名称 - 中国风字体 + 淡雅配色 =====
      map.addLayer({
        id: 'governance-labels-layer',
        type: 'symbol',
        source: 'governance-nodes',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['NotoSansCJKsc-Regular', 'SourceHanSerifSC-Regular', 'serif'],
          'text-size': ['match', ['get', 'type'], 'central', 16, 'department', 12, 10],
          'text-offset': [0, 1.8],
          'text-anchor': 'top',
          'text-allow-overlap': false
        },
        paint: {
          'text-color': ['match', ['get', 'type'], 'central', '#528c7e', 'department', '#748a9e', '#528c7e'],
          'text-halo-color': '#ffffff',
          'text-halo-width': 3,
          'text-halo-blur': 1
        }
      })
      
      // ===== 静态连接线（淡雅灰蓝） =====
      map.addSource('governance-lines', { type: 'geojson', data: connections })
      map.addLayer({
        id: 'governance-lines-layer',
        type: 'line',
        source: 'governance-lines',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#748a9e',
          'line-width': ['interpolate', ['linear'], ['zoom'], 5, 2.5, 10, 3.5],
          'line-opacity': 0.35,
          'line-blur': 1.5
        }
      })
      
      // ===== 动态流动线（淡雅光泽） =====
      map.addSource('governance-flow', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })
      
      map.addLayer({
        id: 'governance-flow-glow-layer',
        type: 'line',
        source: 'governance-flow',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': [
            'interpolate',
            ['linear'],
            ['get', 'progress'],
            0, 'rgba(82, 140, 126, 0.02)',
            0.3, 'rgba(82, 140, 126, 0.25)',
            0.5, 'rgba(82, 140, 126, 0.4)',
            0.7, 'rgba(82, 140, 126, 0.25)',
            1, 'rgba(82, 140, 126, 0.02)'
          ],
          'line-width': ['interpolate', ['linear'], ['zoom'], 5, 14, 8, 20, 10, 28],
          'line-opacity': 0.5,
          'line-blur': ['interpolate', ['linear'], ['zoom'], 5, 8, 8, 12, 10, 16]
        }
      })
      
      map.addLayer({
        id: 'governance-flow-layer',
        type: 'line',
        source: 'governance-flow',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': [
            'interpolate',
            ['linear'],
            ['get', 'progress'],
            0, 'rgba(186, 214, 110, 0.05)',
            0.3, '#bad66e',
            0.5, '#528c7e',
            0.7, '#bad66e',
            1, 'rgba(186, 214, 110, 0.05)'
          ],
          'line-width': ['interpolate', ['linear'], ['zoom'], 5, 3.5, 8, 5, 10, 7],
          'line-opacity': 0.85,
          'line-blur': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 8, 1, 10, 1.5]
        }
      })
      
      startFlowAnimation(map, CENTER, validDepartments)
      
      if (statusMessage) statusMessage.value = `已加载 ${validDepartments.length} 个环保部门`
      console.log(`治理体系图层加载完成，共 ${validDepartments.length} 个节点`)
      resolve()
      
    } catch (err) {
      console.error('加载治理体系图层失败:', err)
      reject(err)
    }
  })
}

const startFlowAnimation = (map, center, departments) => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  
  animationTime = 0
  const speed = 0.006
  
  const animate = () => {
    animationTime += speed
    
    const flowFeatures = departments.map((d, index) => {
      const start = center
      const end = [d.lng, d.lat]
      
      const { p1, p2 } = getArcControlPoints(start, end)
      
      const offset = (index / departments.length) * 1.5
      let progress = (animationTime + offset) % 1
      
      const currentPos = bezierPoint(progress, start, p1, p2, end)
      
      const trailLength = 0.2
      const trailStart = Math.max(0, progress - trailLength)
      const trailPos = bezierPoint(trailStart, start, p1, p2, end)
      
      return {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [trailPos, currentPos]
        },
        properties: {
          progress: progress
        }
      }
    })
    
    const flowSource = map.getSource('governance-flow')
    if (flowSource) {
      flowSource.setData({
        type: 'FeatureCollection',
        features: flowFeatures
      })
    }
    
    animationFrameId = requestAnimationFrame(animate)
  }
  
  animate()
}

export const removeGovernanceLayer = (map) => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = null
  }
  
  if (!map) return
  
  const layerIds = [
    'governance-nodes-layer',
    'governance-nodes-icon-layer',
    'governance-lines-layer',
    'governance-labels-layer',
    'governance-flow-layer',
    'governance-flow-glow-layer'
  ]
  layerIds.forEach(id => {
    if (map.getLayer(id)) map.removeLayer(id)
  })
  ;['governance-nodes', 'governance-lines', 'governance-flow'].forEach(id => {
    if (map.getSource(id)) map.removeSource(id)
  })
  
  console.log('治理体系图层已移除')
}