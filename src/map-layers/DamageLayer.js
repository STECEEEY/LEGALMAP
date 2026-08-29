// src/map-layers/DamageLayer.js

/**
 * 被踩踏的山脉 - 生态损害的空间扩散
 * 展示非法穿越造成的生态损害链条
 * 数据来源：陕西省首例个人组织非法穿越案（2024.1-2025.6）
 */

import 涉事保护区数据Url from '../data/涉事保护区.geojson?url';

// ============================================================
// 涉事地点坐标
// ============================================================

const DAMAGE_SITES = [
  { name: '鳌山', lng: 107.32, lat: 33.98, damageLevel: 'severe', type: 'vegetation' },
  { name: '顶棚梁', lng: 107.75, lat: 34.05, damageLevel: 'severe', type: 'vegetation' },
  { name: '光头山', lng: 108.45, lat: 33.85, damageLevel: 'high', type: 'vegetation' },
  { name: '鹿角梁', lng: 108.48, lat: 33.78, damageLevel: 'high', type: 'vegetation' },
  { name: '东梁', lng: 108.42, lat: 33.82, damageLevel: 'moderate', type: 'vegetation' },
  { name: '大坪梁', lng: 108.52, lat: 33.75, damageLevel: 'moderate', type: 'vegetation' },
  { name: '草链岭', lng: 109.82, lat: 34.28, damageLevel: 'moderate', type: 'vegetation' },
  { name: '王屋咀', lng: 108.38, lat: 33.88, damageLevel: 'moderate', type: 'vegetation' }
];

// ============================================================
// 损害类型配置 - 淡雅配色
// ============================================================

const DAMAGE_TYPES = {
  'vegetation': { label: '植被踩踏区', color: '#528c7e', desc: '踩踏植被、折损林木' },
  'campfire': { label: '生火露营点', color: '#bad66e', desc: '生火做饭、营地破坏' },
  'waste': { label: '垃圾遗留点', color: '#748a9e', desc: '丢弃垃圾、污染环境' },
  'wildlife': { label: '野生动物干扰区', color: '#c8b5df', desc: '惊扰栖息、影响繁衍' },
  'water': { label: '水源扰动区', color: '#7a9ba8', desc: '污染水源、影响水质' }
};

// ============================================================
// 统计数据
// ============================================================

const STATS = {
  totalTrips: 25,
  totalPeople: 148,
  totalFee: 30894,
  timeRange: '2024年1月 - 2025年6月'
};

// ============================================================
// 生成损害点
// ============================================================

function generateDamagePoints() {
  const points = [];
  const types = Object.keys(DAMAGE_TYPES);

  DAMAGE_SITES.forEach((site) => {
    const count = site.damageLevel === 'severe' ? 8 + Math.floor(Math.random() * 5) :
                  site.damageLevel === 'high' ? 5 + Math.floor(Math.random() * 5) :
                  3 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const offsetLng = (Math.random() - 0.5) * 0.08;
      const offsetLat = (Math.random() - 0.5) * 0.08;
      const weight = site.damageLevel === 'severe' ? 0.85 + Math.random() * 0.15 :
                     site.damageLevel === 'high' ? 0.65 + Math.random() * 0.2 :
                     0.35 + Math.random() * 0.3;
      points.push({
        siteName: site.name,
        lng: site.lng + offsetLng,
        lat: site.lat + offsetLat,
        type: type,
        label: DAMAGE_TYPES[type].label,
        color: DAMAGE_TYPES[type].color,
        weight: weight,
        damageLevel: site.damageLevel,
        description: `${DAMAGE_TYPES[type].desc} - ${site.name}周边`
      });
    }
  });
  return points;
}

const damagePoints = generateDamagePoints();

// ============================================================
// 核心导出函数
// ============================================================

export const loadDamageLayer = (map, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!map) return reject(new Error('地图未初始化'));

    const {
      onHover = null,
      onClick = null,
      popup = null
    } = options;

    // ============================================================
    // 1. 自动缩放至秦岭区域
    // ============================================================
    
    map.setMinZoom(6);
    map.setMaxZoom(14);
    
    map.flyTo({
      center: [108.3, 34.0],
      zoom: 8.5,
      duration: 1200
    });

    // ============================================================
    // 2. 加载保护区数据
    // ============================================================

    fetch(涉事保护区数据Url)
      .then(res => {
        if (!res.ok) throw new Error(`加载涉事保护区失败: ${res.status}`);
        return res.json();
      })
      .then(reserveData => {
        // ============================================================
        // 3. 添加保护区背景 - 淡雅配色
        // ============================================================

        const reserveSourceId = 'damage-reserve-source';
        const reserveFillId = 'damage-reserve-fill';
        const reserveLineId = 'damage-reserve-line';

        if (map.getLayer(reserveLineId)) map.removeLayer(reserveLineId);
        if (map.getLayer(reserveFillId)) map.removeLayer(reserveFillId);
        if (map.getSource(reserveSourceId)) map.removeSource(reserveSourceId);

        map.addSource(reserveSourceId, {
          type: 'geojson',
          data: reserveData
        });

        map.addLayer({
          id: reserveFillId,
          type: 'fill',
          source: reserveSourceId,
          paint: {
            'fill-color': '#528c7e',
            'fill-opacity': 0.04
          }
        });

        map.addLayer({
          id: reserveLineId,
          type: 'line',
          source: reserveSourceId,
          paint: {
            'line-color': 'rgba(82, 140, 126, 0.15)',
            'line-width': 0.8,
            'line-dasharray': [3, 4]
          }
        });

        // ============================================================
        // 4. 热力图 - 配色不变
        // ============================================================

        const heatmapSourceId = 'damage-heatmap-source';
        const heatmapLayerId = 'damage-heatmap-layer';

        const heatmapData = {
          type: 'FeatureCollection',
          features: damagePoints.map(p => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [p.lng, p.lat]
            },
            properties: {
              weight: p.weight,
              type: p.type,
              damageLevel: p.damageLevel
            }
          }))
        };

        if (map.getLayer(heatmapLayerId)) map.removeLayer(heatmapLayerId);
        if (map.getSource(heatmapSourceId)) map.removeSource(heatmapSourceId);

        map.addSource(heatmapSourceId, {
          type: 'geojson',
          data: heatmapData
        });

        map.addLayer({
          id: heatmapLayerId,
          type: 'heatmap',
          source: heatmapSourceId,
          paint: {
            'heatmap-weight': ['get', 'weight'],
            'heatmap-radius': [
              'interpolate',
              ['linear'],
              ['zoom'],
              6, 50,
              8, 70,
              10, 90,
              12, 120
            ],
            'heatmap-opacity': [
              'interpolate',
              ['linear'],
              ['zoom'],
              6, 0.85,
              8, 0.75,
              12, 0.65
            ],
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(0, 0, 0, 0)',
              0.1, 'rgba(200, 230, 200, 0.2)',
              0.25, 'rgba(255, 220, 100, 0.4)',
              0.45, 'rgba(255, 180, 50, 0.6)',
              0.65, 'rgba(255, 120, 30, 0.8)',
              0.85, 'rgba(200, 60, 20, 0.9)',
              1, 'rgba(150, 0, 0, 1)'
            ]
          }
        });

        console.log('损害热力图加载完成');

        // ============================================================
        // 5. 方块点标记 - 使用图例颜色
        // ============================================================

        const markersSourceId = 'damage-markers-source';
        const markersLayerId = 'damage-markers-layer';
        const markersLabelId = 'damage-markers-label';

        const markersData = {
          type: 'FeatureCollection',
          features: damagePoints.map(p => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [p.lng, p.lat]
            },
            properties: {
              siteName: p.siteName,
              type: p.type,
              label: p.label,
              color: p.color,
              description: p.description,
              damageLevel: p.damageLevel
            }
          }))
        };

        if (map.getLayer(markersLabelId)) map.removeLayer(markersLabelId);
        if (map.getLayer(markersLayerId)) map.removeLayer(markersLayerId);
        if (map.getSource(markersSourceId)) map.removeSource(markersSourceId);

        map.addSource(markersSourceId, {
          type: 'geojson',
          data: markersData
        });

        // 方块点 - 使用图例对应的颜色
        map.addLayer({
          id: markersLayerId,
          type: 'circle',
          source: markersSourceId,
          paint: {
            'circle-radius': 6,
            'circle-color': ['get', 'color'],
            'circle-opacity': 0.85,
            'circle-stroke-width': 1.5,
            'circle-stroke-color': 'rgba(255,255,255,0.8)',
            'circle-pitch-alignment': 'map'
          }
        });

        // 点位名称标注 - 中国风字体
        map.addLayer({
          id: markersLabelId,
          type: 'symbol',
          source: markersSourceId,
          layout: {
            'text-field': ['get', 'siteName'],
            'text-font': ['NotoSansCJKsc-Regular', 'SourceHanSerifSC-Regular', 'serif'],
            'text-size': 11,
            'text-offset': [0, 1.4],
            'text-allow-overlap': false,
            'text-anchor': 'top'
          },
          paint: {
            'text-color': '#528c7e',
            'text-halo-color': 'rgba(255,255,255,0.92)',
            'text-halo-width': 2.5,
            'text-halo-blur': 1
          }
        });

        console.log(`${damagePoints.length} 个损害点加载完成`);

        // ============================================================
        // 6. 损害扩散链条 - 淡雅配色
        // ============================================================

        const chainSourceId = 'damage-chain-source';
        const chainLayerId = 'damage-chain-layer';
        const chainGlowId = 'damage-chain-glow';

        const chainPoints = [
          [107.32, 33.98],
          [107.75, 34.05],
          [108.42, 33.82],
          [108.48, 33.78],
          [108.45, 33.85],
          [108.52, 33.75],
          [108.38, 33.88],
          [109.82, 34.28]
        ];

        const chainData = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: chainPoints
          }
        };

        if (map.getLayer(chainGlowId)) map.removeLayer(chainGlowId);
        if (map.getLayer(chainLayerId)) map.removeLayer(chainLayerId);
        if (map.getSource(chainSourceId)) map.removeSource(chainSourceId);

        map.addSource(chainSourceId, {
          type: 'geojson',
          data: chainData
        });

        map.addLayer({
          id: chainGlowId,
          type: 'line',
          source: chainSourceId,
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#528c7e',
            'line-width': 20,
            'line-opacity': 0.06,
            'line-blur': 12
          }
        });

        map.addLayer({
          id: chainLayerId,
          type: 'line',
          source: chainSourceId,
          layout: {
            'line-cap': 'round',
            'line-join': 'round'
          },
          paint: {
            'line-color': '#748a9e',
            'line-width': 2,
            'line-opacity': 0.35,
            'line-dasharray': [8, 6]
          }
        });

        // ============================================================
        // 7. 交互事件 - 淡雅配色弹窗
        // ============================================================

        if (popup) {
          map.on('mouseenter', markersLayerId, function(e) {
            var features = map.queryRenderedFeatures(e.point, { layers: [markersLayerId] });
            if (features && features.length > 0) {
              var props = features[0].properties;
              map.getCanvas().style.cursor = 'pointer';

              var damageLabels = {
                'severe': '严重损害',
                'high': '高度损害',
                'moderate': '中度损害'
              };

              var html = 
  '<div style="' +
    'font-family: \'思源宋体\', \'Source Han Serif SC\', \'Noto Serif SC\', \'SimSun\', serif;' +
    'padding: 12px 6px;' +
    'max-width: 320px;' +
    'background: #fdf8ed;' +
    'border-radius: 10px;' +
    'box-shadow: 0 4px 20px rgba(82, 140, 126, 0.15);' +
  '">' +
    '<div style="' +
      'font-size: 17px;' +
      'font-weight: 600;' +
      'color: #528c7e;' +
      'border-bottom: 2px solid #c8b5df;' +
      'padding-bottom: 10px;' +
      'margin-bottom: 10px;' +
      'letter-spacing: 1px;' +
    '">' +
      props.label +
    '</div>' +
    '<div style="' +
      'font-size: 14px;' +
      'color: #5a6a7a;' +
      'line-height: 1.9;' +
      'letter-spacing: 0.3px;' +
    '">' +
      props.description +
    '</div>' +
    '<div style="' +
      'font-size: 13px;' +
      'color: #748a9e;' +
      'margin-top: 8px;' +
    '">' +
      '损害等级：' + (damageLabels[props.damageLevel] || props.damageLevel) +
    '</div>' +
    '<div style="' +
      'font-size: 12px;' +
      'color: #aab5bf;' +
      'margin-top: 10px;' +
      'border-top: 1px solid #e8edf0;' +
      'padding-top: 10px;' +
    '">' +
      props.siteName +
    '</div>' +
  '</div>';

              popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
              if (onHover) onHover(props, e);
            }
          });

          map.on('mouseleave', markersLayerId, function() {
            map.getCanvas().style.cursor = '';
            popup.remove();
            if (onHover) onHover(null);
          });
        }

        if (onClick) {
          map.on('click', markersLayerId, function(e) {
            var features = map.queryRenderedFeatures(e.point, { layers: [markersLayerId] });
            if (features && features.length > 0) {
              onClick(features[0].properties, e);
            }
          });
        }

        // ============================================================
        // 8. 添加图例 - 淡雅配色
        // ============================================================

        var existingLegend = document.getElementById('damage-legend');
        if (existingLegend) {
          existingLegend.remove();
        }

        var legendContainer = document.createElement('div');
        legendContainer.id = 'damage-legend';
        legendContainer.style.cssText = [
          'position: fixed',
          'bottom: 120px',
          'right: 20px',
          'z-index: 100',
          'background: rgba(255,255,255,0.92)',
          'padding: 16px 20px',
          'border-radius: 8px',
          'box-shadow: 0 2px 16px rgba(82, 140, 126, 0.12)',
          'min-width: 160px',
          'max-width: 240px',
          'backdrop-filter: blur(6px)',
          'border: 1px solid rgba(200, 181, 223, 0.25)',
          'font-family: "思源宋体", "Source Han Serif SC", "Noto Serif SC", "SimSun", serif',
          'font-size: 12px'
        ].join(';');

        var legendHTML = 
          '<div style="' +
            'font-size: 14px;' +
            'font-weight: 600;' +
            'color: #528c7e;' +
            'border-bottom: 2px solid #c8b5df;' +
            'padding-bottom: 8px;' +
            'margin-bottom: 10px;' +
            'letter-spacing: 1px;' +
          '">生态损害类型</div>';

        Object.keys(DAMAGE_TYPES).forEach(function(key) {
          var item = DAMAGE_TYPES[key];
          legendHTML += 
            '<div style="display:flex;align-items:center;gap:10px;padding:4px 0;color:#5a6a7a;">' +
              '<span style="' +
                'display:inline-block;' +
                'width:14px;' +
                'height:14px;' +
                'border-radius:2px;' +
                'background:' + item.color + ';' +
                'border:1px solid rgba(82,140,126,0.15);' +
                'flex-shrink:0;' +
              '"></span>' +
              '<span style="letter-spacing:0.5px;">' + item.label + '</span>' +
            '</div>';
        });

        legendHTML += 
          '<div style="height:1px;background:#e8edf0;margin:8px 0;"></div>' +
          '<div style="font-size:11px;color:#748a9e;line-height:1.8;letter-spacing:0.3px;">' +
            '非法穿越：<strong style="color:#528c7e;">' + STATS.totalTrips + '</strong> 次<br>' +
            '参与人数：<strong style="color:#528c7e;">' + STATS.totalPeople + '</strong> 人<br>' +
            '收费：<strong style="color:#528c7e;">' + STATS.totalFee.toLocaleString() + '</strong> 元' +
          '</div>' +
          '<div style="' +
            'margin-top:8px;' +
            'padding-top:8px;' +
            'border-top:1px solid #e8edf0;' +
            'font-size:10px;' +
            'color:#aab5bf;' +
            'text-align:center;' +
            'line-height:1.5;' +
            'letter-spacing:0.3px;' +
          '">' +
            '基于 2024年1月—2025年6月 数据' +
          '</div>';

        legendContainer.innerHTML = legendHTML;

        var mapContainer = map.getContainer();
        if (mapContainer) {
          mapContainer.appendChild(legendContainer);
        } else {
          document.body.appendChild(legendContainer);
        }

        console.log('生态损害图层全部加载完成');
        resolve();

      })
      .catch(error => {
        console.error('加载生态损害图层失败:', error);
        reject(error);
      });
  });
};

// ============================================================
// 移除图层
// ============================================================

export const removeDamageLayer = function(map) {
  if (!map) return;

  map.setMinZoom(null);
  map.setMaxZoom(null);

  var layerIds = [
    'damage-reserve-fill',
    'damage-reserve-line',
    'damage-heatmap-layer',
    'damage-markers-layer',
    'damage-markers-label',
    'damage-chain-layer',
    'damage-chain-glow'
  ];

  var sourceIds = [
    'damage-reserve-source',
    'damage-heatmap-source',
    'damage-markers-source',
    'damage-chain-source'
  ];

  layerIds.forEach(function(id) {
    if (map.getLayer(id)) map.removeLayer(id);
  });

  sourceIds.forEach(function(id) {
    if (map.getSource(id)) map.removeSource(id);
  });

  map.off('mouseenter', 'damage-markers-layer');
  map.off('mouseleave', 'damage-markers-layer');
  map.off('click', 'damage-markers-layer');

  var legend = document.getElementById('damage-legend');
  if (legend) {
    legend.remove();
  }

  console.log('生态损害图层已移除');
};