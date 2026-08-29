// src/map-layers/EcoRedlineLayer.js
import ecoRedlineUrl from '../data/eco_redline.geojson?url'

/**
 * 加载生态红线地图（带纹理图案）- 无描边
 * @param {Object} map - Maptiler 地图实例
 * @param {Object} options - 配置选项
 * @param {string} options.layerId - 图层标识，用于生成唯一ID，默认 'eco-redline'
 * @param {string} options.texturePath - 纹理图片路径，默认 '/images/eco-redline-texture.png'
 * @param {number} options.fillOpacity - 填充透明度，默认 0.7
 * @param {boolean} options.useTexture - 是否使用纹理，默认 true
 * @returns {Promise}
 */
export const loadEcoRedlineLayer = (map, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!map) return reject(new Error('地图未初始化'))

    const {
      layerId = 'eco-redline',
      texturePath = '/images/eco-redline-texture.png',
      fillOpacity = 0.7,
      useTexture = true
    } = options

    const sourceId = `${layerId}-source`
    const fillLayerId = `${layerId}-fill`
    const lineLayerId = `${layerId}-line`
    const imageId = `${layerId}-pattern`

    // 如果已经加载过，先移除旧的
    if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId)
    if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId)
    if (map.getSource(sourceId)) map.removeSource(sourceId)
    if (map.hasImage(imageId)) map.removeImage(imageId)

    // ===== 加载纹理图片 =====
    const loadTexture = () => {
      return new Promise((resolveImg, rejectImg) => {
        if (!useTexture) {
          resolveImg(null)
          return
        }

        // 检查是否已存在图片
        if (map.hasImage(imageId)) {
          resolveImg(true)
          return
        }

        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = texturePath

        img.onload = () => {
          try {
            map.addImage(imageId, img)
            resolveImg(true)
          } catch (err) {
            rejectImg(err)
          }
        }

        img.onerror = () => {
          console.warn(`纹理图片加载失败: ${texturePath}，使用纯色降级`)
          resolveImg(null)
        }
      })
    }

    // ===== 加载 GeoJSON 数据 =====
    const loadGeoJSON = () => {
      return new Promise((resolveData, rejectData) => {
        fetch(ecoRedlineUrl)
          .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
            return res.json()
          })
          .then(data => resolveData(data))
          .catch(err => rejectData(err))
      })
    }

    // ===== 执行加载 =====
    Promise.all([loadTexture(), loadGeoJSON()])
      .then(([textureLoaded, geoData]) => {
        try {
          // 添加数据源
          map.addSource(sourceId, {
            type: 'geojson',
            data: geoData
          })

          // 添加填充层
          const fillPaint = {
            'fill-opacity': fillOpacity
          }

          if (useTexture && textureLoaded) {
            fillPaint['fill-pattern'] = imageId
          } else {
            // 降级方案：使用纯色
            fillPaint['fill-color'] = '#528c7e'
          }

          map.addLayer({
            id: fillLayerId,
            type: 'fill',
            source: sourceId,
            paint: fillPaint
          })

          // ============================================================
          // 边界线：完全透明（不显示描边）
          // ============================================================
          map.addLayer({
            id: lineLayerId,
            type: 'line',
            source: sourceId,
            paint: {
              'line-color': 'rgba(82, 140, 126, 0)',
              'line-width': 0,
              'line-opacity': 0
            }
          })

          console.log(`生态红线图层 "${layerId}" 加载完成（无描边）`)
          resolve()
        } catch (err) {
          console.error('添加生态红线图层失败:', err)
          reject(err)
        }
      })
      .catch(err => {
        console.error('加载生态红线数据失败:', err)
        reject(err)
      })
  })
}

/**
 * 移除生态红线图层
 */
export const removeEcoRedlineLayer = (map, layerId = 'eco-redline') => {
  if (!map) return

  const sourceId = `${layerId}-source`
  const fillLayerId = `${layerId}-fill`
  const lineLayerId = `${layerId}-line`
  const imageId = `${layerId}-pattern`

  if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId)
  if (map.getLayer(lineLayerId)) map.removeLayer(lineLayerId)
  if (map.getSource(sourceId)) map.removeSource(sourceId)
  if (map.hasImage(imageId)) map.removeImage(imageId)

  console.log(`生态红线图层 "${layerId}" 已移除`)
}