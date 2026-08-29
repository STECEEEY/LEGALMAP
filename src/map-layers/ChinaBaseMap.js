// src/map-layers/ChinaBaseMap.js
import chinaGeoJSONUrl from '../data/china.geojson?url'

/**
 * 加载中国底图（省份边界）
 * @param {Object} map - Maptiler 地图实例
 * @param {Object} options - 配置选项
 * @param {string} options.sourceId - 数据源ID，默认 'china-boundary'
 * @param {string} options.fillLayerId - 填充图层ID，默认 'china-province-fill'
 * @param {string} options.lineLayerId - 边界线图层ID，默认 'china-province-line'
 * @param {string} options.borderLayerId - 国界线图层ID，默认 'china-border-line'
 * @param {string} options.fillColor - 填充颜色，默认 '#d4e8f0'
 * @param {number} options.fillOpacity - 填充透明度，默认 0.15
 * @param {string} options.lineColor - 边界线颜色，默认 '#1a2a6c'
 * @param {number} options.lineWidth - 边界线宽度，默认 1.5
 * @param {string} options.borderColor - 国界线颜色，默认 '#b21f1f'
 * @param {number} options.borderWidth - 国界线宽度，默认 2.5
 * @returns {Promise}
 */
export const loadChinaBaseMap = (map, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!map) return reject(new Error('地图未初始化'))

    const {
      sourceId = 'china-boundary',
      fillLayerId = 'china-province-fill',
      lineLayerId = 'china-province-line',
      borderLayerId = 'china-border-line',
      fillColor = '#d4e8f0',
      fillOpacity = 0.15,
      lineColor = '#1a2a6c',
      lineWidth = 1.5,
      lineOpacity = 0.6,
      borderColor = '#b21f1f',
      borderWidth = 2.5,
      borderOpacity = 0.8
    } = options

    // 如果已经加载过，直接 resolve
    if (map.getSource(sourceId)) {
      console.log('✅ 中国底图已存在，跳过加载')
      return resolve()
    }

    fetch(chinaGeoJSONUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        return res.json()
      })
      .then(data => {
        try {
          // 添加数据源
          map.addSource(sourceId, {
            type: 'geojson',
            data: data
          })

          // 添加省份填充层
          map.addLayer({
            id: fillLayerId,
            type: 'fill',
            source: sourceId,
            paint: {
              'fill-color': fillColor,
              'fill-opacity': fillOpacity
            }
          })

          // 添加省份边界线
          map.addLayer({
            id: lineLayerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': lineColor,
              'line-width': lineWidth,
              'line-opacity': lineOpacity
            }
          })

          // 添加国界线（最外层，更突出）
          map.addLayer({
            id: borderLayerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': borderColor,
              'line-width': borderWidth,
              'line-opacity': borderOpacity
            }
          })

          console.log('✅ 中国底图加载完成')
          resolve()
        } catch (err) {
          console.error('❌ 添加中国底图层失败:', err)
          reject(err)
        }
      })
      .catch(err => {
        console.error('❌ 加载中国GeoJSON失败:', err)
        reject(err)
      })
  })
}

/**
 * 移除中国底图
 */
export const removeChinaBaseMap = (map) => {
  if (!map) return
  
  const layerIds = ['china-border-line', 'china-province-line', 'china-province-fill']
  layerIds.forEach(id => {
    if (map.getLayer(id)) map.removeLayer(id)
  })
  
  if (map.getSource('china-boundary')) {
    map.removeSource('china-boundary')
  }
  
  console.log('🗑️ 中国底图已移除')
}