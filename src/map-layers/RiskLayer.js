// src/map-layers/RiskLayer.js

/**
 * 环境风险地图图层 - 二维热力图 + 透明交互层
 * 数据来源：全国生态脆弱区保护规划纲要
 */

// ============================================================
// 一、生态脆弱区（8大区域）
// ============================================================

var fragileEcoPoints = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [118.5, 46.5] },
      properties: {
        type: 'fragile',
        regionId: 'fragile-1',
        name: '东北林草交错生态脆弱区',
        provinces: '内蒙古、河北',
        description: '生态过渡带特征明显，群落结构复杂，环境异质性大，对外界反应敏感。包含北极泰加林、沙地樟子松林、疏林草甸、草甸草原等生态系统。',
        riskLevel: 'high',
        weight: 0.85,
        threatFactors: '气候变化、过度放牧、森林砍伐',
        ecosystem: '北极泰加林、沙地樟子松林、疏林草甸、草甸草原'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [110.0, 42.0] },
      properties: {
        type: 'fragile',
        regionId: 'fragile-2',
        name: '北方农牧交错生态脆弱区',
        provinces: '内蒙古、吉林、辽宁、河北、山西、陕西、宁夏、甘肃',
        description: '气候干旱，水资源短缺，土壤结构疏松，植被覆盖度低，容易受风蚀、水蚀和人为活动的强烈影响。',
        riskLevel: 'severe',
        weight: 0.95,
        threatFactors: '干旱缺水、土地荒漠化、过度开垦',
        ecosystem: '典型草原、荒漠草原、疏林沙地、农田'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [87.0, 42.5] },
      properties: {
        type: 'fragile',
        regionId: 'fragile-3',
        name: '西北荒漠绿洲交接生态脆弱区',
        provinces: '新疆、甘肃、青海、内蒙古',
        description: '典型荒漠绿洲过渡区，年降水量少、蒸发量大，水资源极度短缺，土壤瘠薄，植被稀疏，风沙活动强烈，土地荒漠化严重。',
        riskLevel: 'severe',
        weight: 0.95,
        threatFactors: '水资源短缺、荒漠化扩展、风沙灾害',
        ecosystem: '高山亚高山冻原、高寒草甸、荒漠胡杨林、荒漠灌丛'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [115.5, 26.5] },
      properties: {
        type: 'fragile',
        regionId: 'fragile-4',
        name: '南方红壤丘陵山地生态脆弱区',
        provinces: '浙江、福建、江西、湖南、湖北、江苏',
        description: '土层较薄，肥力瘠薄，人为活动强烈，土地严重过垦，土壤质量下降明显。暴雨频繁、强度大，地表水蚀严重。',
        riskLevel: 'high',
        weight: 0.80,
        threatFactors: '水土流失、森林砍伐、土地退化',
        ecosystem: '亚热带红壤丘陵山地森林、热性灌丛及草山草坡'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [106.0, 24.5] },
      properties: {
        type: 'fragile',
        regionId: 'fragile-5',
        name: '西南岩溶山地石漠化生态脆弱区',
        provinces: '四川、贵州、云南、重庆、广西',
        description: '全年降水量大，融水侵蚀严重，岩溶山地土层薄，成土过程缓慢。水土流失严重，山体滑坡、泥石流灾害频繁发生。',
        riskLevel: 'severe',
        weight: 0.92,
        threatFactors: '石漠化、水土流失、地质灾害',
        ecosystem: '喀斯特岩溶地貌生态系统、喀斯特森林'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [101.0, 29.0] },
      properties: {
        type: 'fragile',
        regionId: 'fragile-6',
        name: '西南山地农牧交错生态脆弱区',
        provinces: '四川、云南、贵州',
        description: '地形起伏大、地质结构复杂，水热条件垂直变化明显，土层发育不全，土壤瘠薄，植被稀疏。生态退化明显。',
        riskLevel: 'high',
        weight: 0.82,
        threatFactors: '生态退化、过度开发、自然灾害',
        ecosystem: '亚热带高山针叶林、高寒草甸、热性灌丛草地'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [90.0, 32.5] },
      properties: {
        type: 'fragile',
        regionId: 'fragile-7',
        name: '青藏高原复合侵蚀生态脆弱区',
        provinces: '西藏、青海',
        description: '地势高寒，气候恶劣，自然条件严酷，植被稀疏，具有明显的风蚀、水蚀、冻蚀等多种土壤侵蚀现象。',
        riskLevel: 'severe',
        weight: 0.90,
        threatFactors: '冻土退化、冰川消融、生态退化',
        ecosystem: '高原冰川、雪线及冻原、高寒草甸、河流湿地'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [120.0, 31.0] },
      properties: {
        type: 'fragile',
        regionId: 'fragile-8',
        name: '沿海水陆交接带生态脆弱区',
        provinces: '东部沿海诸省（市）',
        description: '潮汐、台风及暴雨等气候灾害频发，土壤含盐量高，植被单一，防护效果差。',
        riskLevel: 'high',
        weight: 0.78,
        threatFactors: '台风风暴潮、海平面上升、湿地退化',
        ecosystem: '滨海堤岸林、滨海三角洲及滩涂湿地、近海水域'
      }
    }
  ]
}

// ============================================================
// 二、高污染工业带
// ============================================================

var industrialPoints = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [117.0, 39.5] },
      properties: {
        type: 'industrial',
        name: '京津冀工业带',
        level: 'severe',
        description: '钢铁、化工、火电、建材产业密集区，PM2.5年均浓度长期超标，是全国大气污染最严重的区域之一。',
        mainIndustries: '钢铁、化工、火电、建材',
        weight: 0.98,
        riskLevel: 'severe',
        aqi: '85+'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [120.8, 31.2] },
      properties: {
        type: 'industrial',
        name: '长三角工业带',
        level: 'high',
        description: '电子信息、化工、机械制造、纺织业高度密集，VOCs排放量大，臭氧污染问题突出。',
        mainIndustries: '电子信息、化工、机械制造、纺织',
        weight: 0.92,
        riskLevel: 'high',
        aqi: '70-85'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [113.5, 23.0] },
      properties: {
        type: 'industrial',
        name: '珠三角工业带',
        level: 'high',
        description: '电子制造、纺织服装、化工产业高度集中，臭氧和细颗粒物复合型污染突出。',
        mainIndustries: '电子制造、纺织服装、化工',
        weight: 0.88,
        riskLevel: 'high',
        aqi: '65-80'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [119.0, 36.5] },
      properties: {
        type: 'industrial',
        name: '山东半岛工业带',
        level: 'moderate',
        description: '石化、建材、冶金、农副产品加工产业聚集区，区域性复合污染特征明显。',
        mainIndustries: '石化、建材、冶金、农副产品加工',
        weight: 0.72,
        riskLevel: 'moderate',
        aqi: '60-75'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [105.0, 30.0] },
      properties: {
        type: 'industrial',
        name: '成渝工业带',
        level: 'moderate',
        description: '电子信息、汽车制造、化工、装备制造产业集中区，区域性大气污染问题日益突出。',
        mainIndustries: '电子信息、汽车制造、化工、装备制造',
        weight: 0.68,
        riskLevel: 'moderate',
        aqi: '55-70'
      }
    }
  ]
}

// ============================================================
// 三、气候风险区
// ============================================================

var climatePoints = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [115.5, 36.5] },
      properties: {
        type: 'climate',
        subType: 'flood',
        name: '华北平原洪水高风险区',
        description: '海河流域核心区域，降水季节分配不均，历史上多次发生严重洪涝灾害。',
        riskLevel: 'high',
        weight: 0.85,
        riskIndex: 88,
        threatFactors: '极端降水、河道淤积、城市化加剧径流'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [114.5, 29.5] },
      properties: {
        type: 'climate',
        subType: 'flood',
        name: '长江中下游洪水高风险区',
        description: '长江流域核心区域，江湖密布，1998年特大洪水曾造成严重损失。',
        riskLevel: 'severe',
        weight: 0.92,
        riskIndex: 92,
        threatFactors: '江湖关系变化、城市化、极端降水'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [84.5, 38.0] },
      properties: {
        type: 'climate',
        subType: 'desertification',
        name: '塔克拉玛干沙漠化扩展区',
        description: '极端干旱地区，年均降水量不足50mm，沙漠化年扩展率超过1%。',
        riskLevel: 'severe',
        weight: 0.95,
        riskIndex: 95,
        threatFactors: '气候变化、水资源过度开发、风沙活动'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [119.5, 24.5] },
      properties: {
        type: 'climate',
        subType: 'typhoon',
        name: '东南沿海台风风暴潮高风险区',
        description: '台风登陆最频繁的区域，年均受台风影响3-5次，风暴潮威胁沿海城市安全。',
        riskLevel: 'high',
        weight: 0.86,
        riskIndex: 86,
        threatFactors: '台风频发、海平面上升、风暴潮叠加'
      }
    },
    {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [107.0, 35.5] },
      properties: {
        type: 'climate',
        subType: 'desertification',
        name: '黄土高原水土流失与荒漠化区',
        description: '黄土高原腹地，水土流失严重，植被覆盖度低，土地荒漠化持续扩展。',
        riskLevel: 'high',
        weight: 0.80,
        riskIndex: 82,
        threatFactors: '水土流失、植被破坏、不合理土地利用'
      }
    }
  ]
}

// ============================================================
// 工具函数
// ============================================================

function getRiskLevelLabel(level) {
  var map = {
    'severe': '严重风险',
    'high': '高风险',
    'moderate': '中等风险'
  }
  return map[level] || level
}

function getRiskLevelColor(level) {
  var map = {
    'severe': '#748a9e',
    'high': '#528c7e',
    'moderate': '#bad66e'
  }
  return map[level] || '#aab5bf'
}

// ============================================================
// 核心导出函数 - 热力图 + 透明交互层
// ============================================================

export var loadRiskLayer = function(map, options) {
  options = options || {}
  
  return new Promise(function(resolve, reject) {
    if (!map) return reject(new Error('地图未初始化'))

    var onHover = options.onHover || null
    var onClick = options.onClick || null
    var types = options.types || ['fragile', 'industrial', 'climate']
    var onLegendReady = options.onLegendReady || null
    var popup = options.popup || null

    // 合并所有数据
    var allFeatures = []
    var sourceId = 'risk-source'
    var heatmapLayerId = 'risk-heatmap-layer'
    var interactionLayerId = 'risk-interaction-layer'

    if (types.indexOf('fragile') !== -1) {
      allFeatures = allFeatures.concat(fragileEcoPoints.features)
    }
    if (types.indexOf('industrial') !== -1) {
      allFeatures = allFeatures.concat(industrialPoints.features)
    }
    if (types.indexOf('climate') !== -1) {
      allFeatures = allFeatures.concat(climatePoints.features)
    }

    // 移除旧图层
    if (map.getLayer(interactionLayerId)) map.removeLayer(interactionLayerId)
    if (map.getLayer(heatmapLayerId)) map.removeLayer(heatmapLayerId)
    if (map.getSource(sourceId)) map.removeSource(sourceId)

    // 添加数据源
    map.addSource(sourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: allFeatures
      }
    })

    // ===== 1. 热力图图层（配色保持不变） =====
    map.addLayer({
      id: heatmapLayerId,
      type: 'heatmap',
      source: sourceId,
      paint: {
        'heatmap-weight': ['get', 'weight'],
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4, 80,
          6, 110,
          8, 140,
          10, 170,
          12, 200
        ],
        'heatmap-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4, 0.9,
          8, 0.8,
          12, 0.7
        ],
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0, 0, 0, 0)',
          0.05, 'rgba(255, 255, 200, 0.15)',
          0.15, 'rgba(255, 220, 100, 0.35)',
          0.3, 'rgba(255, 180, 50, 0.55)',
          0.5, 'rgba(255, 120, 30, 0.75)',
          0.7, 'rgba(220, 60, 20, 0.85)',
          0.85, 'rgba(180, 20, 10, 0.95)',
          1, 'rgba(120, 0, 0, 1)'
        ]
      }
    })

    // ===== 2. 透明 circle 图层（专门用于交互） =====
    map.addLayer({
      id: interactionLayerId,
      type: 'circle',
      source: sourceId,
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          4, 60,
          6, 85,
          8, 110,
          10, 140,
          12, 170
        ],
        'circle-color': 'rgba(0, 0, 0, 0)',
        'circle-opacity': 0
      }
    })

    console.log('热力图加载完成，共 ' + allFeatures.length + ' 个风险点')

    // 图例数据（淡雅配色）
    if (onLegendReady) {
      onLegendReady({
        title: '环境风险等级',
        types: [
          { id: 'severe', label: '严重风险', color: '#b71c1c', description: '生态破坏严重 / 污染高度集中 / 灾害频发' },
          { id: 'high', label: '高风险', color: '#e65100', description: '生态脆弱明显 / 污染较严重 / 风险较高' },
          { id: 'moderate', label: '中等风险', color: '#f57f17', description: '存在一定生态压力 / 需持续关注' }
        ],
        categories: [
          { id: 'fragile', label: '生态脆弱区', color: '#b71c1c' },
          { id: 'industrial', label: '高污染工业带', color: '#e65100' },
          { id: 'climate', label: '气候风险区', color: '#f57f17' }
        ],
        disclaimer: '生态脆弱区域仅为示意，资料来自《全国生态脆弱区保护规划纲要》'
      })
    }

    // ============================================================
    // 交互事件 - 绑定到透明 circle 图层（淡雅配色弹窗）
    // ============================================================

    if (popup) {
      console.log('Popup 已传入，绑定交互事件到透明图层')

      map.on('mouseenter', interactionLayerId, function(e) {
        var features = map.queryRenderedFeatures(e.point, { layers: [interactionLayerId] })
        if (features && features.length > 0) {
          var props = features[0].properties
          map.getCanvas().style.cursor = 'pointer'

          var typeLabel = {
            'fragile': '生态脆弱区',
            'industrial': '高污染工业带',
            'climate': '气候风险区'
          }[props.type] || props.type

          var riskLabel = getRiskLevelLabel(props.riskLevel)
          var riskColor = getRiskLevelColor(props.riskLevel)

          var extraInfo = ''
          if (props.type === 'fragile') {
            extraInfo = 
              '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:12px;color:#748a9e;border-bottom:1px solid #f0f2f0;">' +
                '<span>威胁因素</span><span style="color:#5a6a7a;">' + (props.threatFactors || '—') + '</span>' +
              '</div>' +
              '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:12px;color:#748a9e;">' +
                '<span>生态系统</span><span style="color:#5a6a7a;">' + (props.ecosystem || '—') + '</span>' +
              '</div>'
          } else if (props.type === 'industrial') {
            extraInfo = 
              '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:12px;color:#748a9e;border-bottom:1px solid #f0f2f0;">' +
                '<span>主要产业</span><span style="color:#5a6a7a;">' + (props.mainIndustries || '—') + '</span>' +
              '</div>' +
              '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:12px;color:#748a9e;">' +
                '<span>AQI范围</span><span style="color:#5a6a7a;">' + (props.aqi || '—') + '</span>' +
              '</div>'
          } else if (props.type === 'climate') {
            extraInfo = 
              '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:12px;color:#748a9e;border-bottom:1px solid #f0f2f0;">' +
                '<span>风险指数</span><span style="color:#5a6a7a;">' + (props.riskIndex || '—') + '</span>' +
              '</div>' +
              '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:12px;color:#748a9e;">' +
                '<span>威胁因素</span><span style="color:#5a6a7a;">' + (props.threatFactors || '—') + '</span>' +
              '</div>'
          }

          var html = 
  '<div style="' +
    'font-family: \'思源宋体\', \'Source Han Serif SC\', \'Noto Serif SC\', \'SimSun\', serif;' +
    'padding: 10px 4px;' +
    'max-width: 340px;' +
    'background: #fdf8ed;' +
    'border-radius: 10px;' +
    'box-shadow: 0 4px 20px rgba(82, 140, 126, 0.15);' +
  '">' +
    '<div style="' +
      'display:flex;' +
      'align-items:center;' +
      'justify-content:space-between;' +
      'border-bottom:2px solid ' + riskColor + ';' +
      'padding-bottom:8px;' +
      'margin-bottom:8px;' +
    '">' +
      '<span style="font-size:16px;font-weight:600;color:#528c7e;letter-spacing:0.5px;">' + props.name + '</span>' +
      '<span style="' +
        'font-size:11px;' +
        'color:white;' +
        'background:' + riskColor + ';' +
        'padding:2px 12px;' +
        'border-radius:10px;' +
        'letter-spacing:0.3px;' +
      '">' + riskLabel + '</span>' +
    '</div>' +
    '<div style="font-size:12px;color:#748a9e;margin-bottom:6px;letter-spacing:0.3px;">' + typeLabel + '</div>' +
    '<div style="font-size:14px;color:#5a6a7a;line-height:1.8;letter-spacing:0.3px;margin-bottom:8px;">' + (props.description || '') + '</div>' +
    extraInfo +
    '<div style="margin-top:8px;padding-top:8px;border-top:1px solid #e8edf0;font-size:10px;color:#aab5bf;text-align:center;letter-spacing:0.3px;">区域仅为示意</div>' +
  '</div>';

          popup.setLngLat(e.lngLat).setHTML(html).addTo(map)
          console.log('Popup 显示:', props.name)

          if (onHover) onHover(props, e)
        }
      })

      map.on('mouseleave', interactionLayerId, function() {
        map.getCanvas().style.cursor = ''
        popup.remove()
        console.log('Popup 移除')
        if (onHover) onHover(null)
      })
    }

    if (onClick) {
      map.on('click', interactionLayerId, function(e) {
        var features = map.queryRenderedFeatures(e.point, { layers: [interactionLayerId] })
        if (features && features.length > 0) {
          if (onClick) onClick(features[0].properties, e)
        }
      })
    }

    resolve()
  })
}

// ============================================================
// 移除风险图层
// ============================================================

export var removeRiskLayer = function(map) {
  if (!map) return

  var heatmapLayerId = 'risk-heatmap-layer'
  var interactionLayerId = 'risk-interaction-layer'
  var sourceId = 'risk-source'

  map.off('mouseenter', interactionLayerId)
  map.off('mouseleave', interactionLayerId)
  map.off('click', interactionLayerId)

  if (map.getLayer(interactionLayerId)) map.removeLayer(interactionLayerId)
  if (map.getLayer(heatmapLayerId)) map.removeLayer(heatmapLayerId)
  if (map.getSource(sourceId)) map.removeSource(sourceId)

  console.log('热力图已移除')
}