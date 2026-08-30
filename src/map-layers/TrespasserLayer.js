// src/map-layers/TrespasserLayer.js

/**
 * 越界者图层 - 非法穿越秦岭核心保护区
 * 包含：流动路径动画 + 越界点网状连接
 */

import 保护区数据Url from '../data/保护区.geojson?url';
import 涉事保护区数据Url from '../data/涉事保护区.geojson?url';
import chinaGeoJSONUrl from '../data/china.geojson?url';

// ============================================================
// 高德地图 API 配置
// ============================================================

const AMAP_API_KEY = 'd8af8724a9dd15ca3f117b7d0adaab8a';
const AMAP_GEOCODE_URL = 'https://restapi.amap.com/v3/geocode/geo';

// 地标点名称列表
const landmarkNames = ['鳌山', '光头山', '鹿角梁', '东梁', '大坪梁', '草链岭', '王屋咀'];
const SEARCH_REGION = '陕西';

// ============================================================
// 越界路径数据 - 模拟非法穿越轨迹
// ============================================================

const TRESPASS_ROUTES = [
  {
    id: 'route-1',
    name: '非法穿越路径 ①',
    description: '从黄柏塬进入，突破保护区边界，最终到达鳌山',
    start: { name: '黄柏塬', lng: 107.18, lat: 33.72 },
    waypoints: [
      { lng: 107.35, lat: 33.80 },
      { lng: 107.52, lat: 33.85 },
      { lng: 107.70, lat: 33.92 },
    ],
    end: { name: '鳌山', lng: 107.32, lat: 33.98 },
    color: '#FF5722',
    trespassPoints: [
      { lng: 107.42, lat: 33.82, label: '⚠️ 首次越界' },
      { lng: 107.58, lat: 33.88, label: '⚠️ 深入核心区' },
    ]
  },
  {
    id: 'route-2',
    name: '非法穿越路径 ②',
    description: '从宁陕县进入，突破牛背梁保护区边界，最终到达光头山',
    start: { name: '宁陕县', lng: 108.75, lat: 33.45 },
    waypoints: [
      { lng: 108.60, lat: 33.55 },
      { lng: 108.50, lat: 33.65 },
    ],
    end: { name: '光头山', lng: 108.45, lat: 33.85 },
    color: '#E91E63',
    trespassPoints: [
      { lng: 108.58, lat: 33.52, label: '⚠️ 越界点' },
      { lng: 108.48, lat: 33.70, label: '⚠️ 深入核心区' },
    ]
  },
  {
    id: 'route-3',
    name: '非法穿越路径 ③',
    description: '从柞水县进入，突破保护区边界，最终到达大坪梁',
    start: { name: '柞水县', lng: 109.35, lat: 33.35 },
    waypoints: [
      { lng: 109.15, lat: 33.50 },
      { lng: 109.05, lat: 33.60 },
    ],
    end: { name: '大坪梁', lng: 108.52, lat: 33.75 },
    color: '#FF9800',
    trespassPoints: [
      { lng: 109.10, lat: 33.52, label: '⚠️ 越界点' },
    ]
  }
];

// ============================================================
// 收集所有越界点（用于网络连接）
// ============================================================

const getAllTrespassPoints = () => {
  const points = [];
  TRESPASS_ROUTES.forEach(route => {
    route.trespassPoints.forEach(p => {
      points.push({
        lng: p.lng,
        lat: p.lat,
        label: p.label,
        routeName: route.name,
        color: route.color
      });
    });
  });
  return points;
};

const FALLBACK_COORDS = {
  '鳌山': { lng: 107.32, lat: 33.98 },
  '光头山': { lng: 108.45, lat: 33.85 },
  '鹿角梁': { lng: 108.48, lat: 33.78 },
  '东梁': { lng: 108.42, lat: 33.82 },
  '大坪梁': { lng: 108.52, lat: 33.75 },
  '草链岭': { lng: 109.82, lat: 34.28 },
  '王屋咀': { lng: 108.38, lat: 33.88 }
};

const LANDMARK_DESCRIPTIONS = {
  '鳌山': '位于太白山国家级自然保护区\n⚠️ 非法穿越者最终到达点',
  '光头山': '位于牛背梁国家级自然保护区\n⚠️ 非法穿越者最终到达点',
  '鹿角梁': '秦岭核心保护区\n⚠️ 非法穿越者最终到达点',
  '东梁': '秦岭核心保护区\n⚠️ 非法穿越者最终到达点',
  '大坪梁': '秦岭核心保护区\n⚠️ 非法穿越者最终到达点',
  '草链岭': '秦岭核心保护区\n⚠️ 非法穿越者最终到达点',
  '王屋咀': '秦岭核心保护区\n⚠️ 非法穿越者最终到达点'
};

// ============================================================
// 工具函数：贝塞尔曲线
// ============================================================

const bezierPoint = (t, p0, p1, p2, p3) => {
  const mt = 1 - t;
  const x = mt * mt * mt * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t * t * t * p3[0];
  const y = mt * mt * mt * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t * t * t * p3[1];
  return [x, y];
};

const getArcControlPoints = (start, end) => {
  const mid = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2];
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const len = Math.sqrt(dx * dx + dy * dy);
  
  const offset = Math.min(len * 0.15, 0.3);
  const perpX = -dy / len * offset;
  const perpY = dx / len * offset;
  
  const p1 = [mid[0] + perpX * 0.6, mid[1] + perpY * 0.6];
  const p2 = [mid[0] + perpX * 0.3, mid[1] + perpY * 0.3];
  
  return { p1, p2 };
};

// ============================================================
// 工具函数：高德地理编码
// ============================================================

async function geocodeAddress(address) {
  const fullAddress = `${SEARCH_REGION}${address}`;
  const url = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(fullAddress)}&key=${AMAP_API_KEY}&output=JSON`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
      const location = data.geocodes[0].location.split(',').map(Number);
      console.log(`✅ ${address} → [${location[0]}, ${location[1]}]`);
      return { lng: location[0], lat: location[1] };
    } else {
      console.warn(`⚠️ 未找到 "${fullAddress}"`);
      return null;
    }
  } catch (error) {
    console.error(`❌ 地理编码失败 (${address}):`, error);
    return null;
  }
}

// ============================================================
// 动画状态
// ============================================================

let animationFrameId = null;
let animationTime = 0;

// ============================================================
// 核心导出函数
// ============================================================

export const loadTrespasserLayer = (map, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!map) return reject(new Error('地图未初始化'));

    const {
      onHover = null,
      onClick = null,
      popup = null
    } = options;

    // 停止旧动画
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    // ============================================================
    // 1. 限制地图缩放范围
    // ============================================================
    
    map.setMinZoom(6);
    map.setMaxZoom(14);
    
    if (map.getZoom() < 6) {
      map.flyTo({
        center: [108.5, 34.0],
        zoom: 8,
        duration: 1000
      });
    }

    // ============================================================
    // 2. 加载中国 GeoJSON 并提取陕西省
    // ============================================================

    fetch(chinaGeoJSONUrl)
      .then(res => {
        if (!res.ok) throw new Error(`加载china.geojson失败: ${res.status}`);
        return res.json();
      })
      .then(chinaData => {
        let shaanxiFeature = null;
        
        if (chinaData.features) {
          for (const feature of chinaData.features) {
            const props = feature.properties;
            const name = props.name || props.NAME || props.省份 || props.province || props.省 || '';
            if (name.includes('陕西') || name.includes('陕') || name.includes('Shaanxi')) {
              shaanxiFeature = feature;
              console.log('✅ 找到陕西省:', name);
              break;
            }
          }
        }

        // ============================================================
        // 3. 高亮陕西省（较淡）
        // ============================================================

        if (shaanxiFeature) {
          const shaanxiSourceId = 'shaanxi-source';
          const shaanxiFillId = 'shaanxi-fill';
          const shaanxiLineId = 'shaanxi-line';

          if (map.getLayer(shaanxiLineId)) map.removeLayer(shaanxiLineId);
          if (map.getLayer(shaanxiFillId)) map.removeLayer(shaanxiFillId);
          if (map.getSource(shaanxiSourceId)) map.removeSource(shaanxiSourceId);

          map.addSource(shaanxiSourceId, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [shaanxiFeature]
            }
          });

          map.addLayer({
            id: shaanxiFillId,
            type: 'fill',
            source: shaanxiSourceId,
            paint: {
              'fill-color': '#FFD54F',
              'fill-opacity': 0.06,
              'fill-outline-color': 'rgba(255, 213, 79, 0.2)'
            }
          });

          map.addLayer({
            id: shaanxiLineId,
            type: 'line',
            source: shaanxiSourceId,
            paint: {
              'line-color': '#F9A825',
              'line-width': 1.5,
              'line-opacity': 0.4,
              'line-dasharray': [6, 4]
            }
          });

          console.log('✅ 陕西省高亮完成');
        }

        // ============================================================
        // 4. 加载保护区数据
        // ============================================================

        return Promise.all([
          fetch(保护区数据Url),
          fetch(涉事保护区数据Url)
        ]).then(async ([保护区响应, 涉事保护区响应]) => {
          if (!保护区响应.ok) throw new Error(`加载保护区.geojson失败: ${保护区响应.status}`);
          if (!涉事保护区响应.ok) throw new Error(`加载涉事保护区.geojson失败: ${涉事保护区响应.status}`);

          const 保护区数据 = await 保护区响应.json();
          const 涉事保护区数据 = await 涉事保护区响应.json();

          const allReserves = {
            type: 'FeatureCollection',
            features: [
              ...(保护区数据.features || []),
              ...(涉事保护区数据.features || [])
            ]
          };

          console.log('📊 所有保护区合计:', allReserves.features.length, '个要素');

          // ============================================================
          // 5. 保护区 - 蓝色填充（无描边）
          // ============================================================

          if (allReserves.features.length > 0) {
            const reserveSourceId = 'reserve-source';
            const reserveFillId = 'reserve-fill';

            if (map.getLayer(reserveFillId)) map.removeLayer(reserveFillId);
            if (map.getSource(reserveSourceId)) map.removeSource(reserveSourceId);

            map.addSource(reserveSourceId, {
              type: 'geojson',
              data: allReserves
            });

            // 保护区填充 - 淡蓝色（无描边）
            map.addLayer({
              id: reserveFillId,
              type: 'fill',
              source: reserveSourceId,
              paint: {
                'fill-color': '#E3F2FD',
                'fill-opacity': 0.75,
                'fill-outline-color': 'rgba(66, 165, 245, 0.6)'
              }
            });
// 保护区描边 - 蓝色实线
map.addLayer({
  id: 'reserve-outline',
  type: 'line',
  source: reserveSourceId,
  paint: {
    'line-color': '#42A5F5',
    'line-width': 2,
    'line-opacity': 0.2
  }
});
            console.log('✅ 保护区加载完成（蓝色填充，无描边）');
          }

          // ============================================================
          // 6. 获取地标点坐标（最终到达点）
          // ============================================================

          const geoPromises = landmarkNames.map(name => geocodeAddress(name));
          const geoResults = await Promise.all(geoPromises);

          const landmarkPoints = [];
          let apiSuccessCount = 0;

          landmarkNames.forEach((name, index) => {
            const apiResult = geoResults[index];
            let coords;

            if (apiResult) {
              coords = apiResult;
              apiSuccessCount++;
            } else if (FALLBACK_COORDS[name]) {
              coords = FALLBACK_COORDS[name];
              console.warn(`⚠️ ${name}: 使用备用坐标`);
            } else {
              console.error(`❌ ${name}: 无法获取坐标`);
              return;
            }

            landmarkPoints.push({
              name: name,
              lng: coords.lng,
              lat: coords.lat,
              description: LANDMARK_DESCRIPTIONS[name] || '秦岭核心保护区\n⚠️ 非法穿越者最终到达点'
            });
          });

          console.log(`📍 地标点: API成功 ${apiSuccessCount}/${landmarkNames.length}`);

          // ============================================================
          // 7. 加载地标点（橙色警告标记）
          // ============================================================

          const landmarksSourceId = 'landmarks-source';
          const landmarksLayerId = 'landmarks-layer';
          const landmarksLabelId = 'landmarks-label';

          const landmarksGeoJSON = {
            type: 'FeatureCollection',
            features: landmarkPoints.map(p => ({
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [p.lng, p.lat]
              },
              properties: {
                name: p.name,
                description: p.description
              }
            }))
          };

          if (map.getLayer(landmarksLabelId)) map.removeLayer(landmarksLabelId);
          if (map.getLayer('landmarks-glow')) map.removeLayer('landmarks-glow');
          if (map.getLayer(landmarksLayerId)) map.removeLayer(landmarksLayerId);
          if (map.getSource(landmarksSourceId)) map.removeSource(landmarksSourceId);

          map.addSource(landmarksSourceId, {
            type: 'geojson',
            data: landmarksGeoJSON
          });

          // 终点标记 - 橙色
          map.addLayer({
            id: landmarksLayerId,
            type: 'circle',
            source: landmarksSourceId,
            paint: {
              'circle-radius': 14,
              'circle-color': '#FF8F00',
              'circle-opacity': 0.9,
              'circle-stroke-width': 3,
              'circle-stroke-color': '#FFFFFF',
              'circle-pitch-alignment': 'map'
            }
          });

          // 发光脉冲
          map.addLayer({
            id: 'landmarks-glow',
            type: 'circle',
            source: landmarksSourceId,
            paint: {
              'circle-radius': 28,
              'circle-color': '#FF8F00',
              'circle-opacity': 0.10,
              'circle-blur': 1,
              'circle-pitch-alignment': 'map'
            }
          });

          // 名称标注
          map.addLayer({
            id: landmarksLabelId,
            type: 'symbol',
            source: landmarksSourceId,
            layout: {
              'text-field': ['format', 
                ['get', 'name'], '\n', 
                {}, '📍 越界终点', {'font-scale': 0.7}
              ],
              'text-font': ['NotoSansCJKsc-Regular'],
              'text-size': 13,
              'text-offset': [0, 2.2],
              'text-allow-overlap': false,
              'text-anchor': 'top',
              'text-weight': 'bold'
            },
            paint: {
              'text-color': '#E65100',
              'text-halo-color': 'rgba(255,255,255,0.95)',
              'text-halo-width': 4,
              'text-halo-blur': 1
            }
          });

          console.log(`✅ ${landmarkPoints.length} 个越界终点标记加载完成`);

          // ============================================================
          // 8. 构建越界路径数据
          // ============================================================

          const allTrespassPoints = getAllTrespassPoints();

          // ============================================================
          // 9. 静态路径线 + 网络连接线
          // ============================================================

          const routesSourceId = 'routes-source';
          const routesLineId = 'routes-line';
          const routesStaticId = 'routes-static';

          // 路径线
          const routesFeatures = TRESPASS_ROUTES.map(route => {
            const coordinates = [
              [route.start.lng, route.start.lat],
              ...route.waypoints.map(w => [w.lng, w.lat]),
              [route.end.lng, route.end.lat]
            ];
            return {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: coordinates
              },
              properties: {
                id: route.id,
                name: route.name,
                description: route.description,
                color: route.color,
                type: 'route'
              }
            };
          });

          // 网络连接线 - 弯曲红色实线
          const networkFeatures = [];
          for (let i = 0; i < allTrespassPoints.length; i++) {
            for (let j = i + 1; j < allTrespassPoints.length; j++) {
              const p1 = allTrespassPoints[i];
              const p2 = allTrespassPoints[j];
              const start = [p1.lng, p1.lat];
              const end = [p2.lng, p2.lat];
              const { p1: cp1, p2: cp2 } = getArcControlPoints(start, end);
              
              const points = [];
              const steps = 30;
              for (let k = 0; k <= steps; k++) {
                const t = k / steps;
                points.push(bezierPoint(t, start, cp1, cp2, end));
              }
              
              networkFeatures.push({
                type: 'Feature',
                geometry: {
                  type: 'LineString',
                  coordinates: points
                },
                properties: {
                  type: 'network'
                }
              });
            }
          }

          if (map.getLayer(routesLineId)) map.removeLayer(routesLineId);
          if (map.getLayer(routesStaticId)) map.removeLayer(routesStaticId);
          if (map.getSource(routesSourceId)) map.removeSource(routesSourceId);

          map.addSource(routesSourceId, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [...routesFeatures, ...networkFeatures]
            }
          });

          // 静态底层线网（灰色细线，作为底层参考）
          map.addLayer({
            id: routesStaticId,
            type: 'line',
            source: routesSourceId,
            paint: {
              'line-color': [
                'case',
                ['==', ['get', 'type'], 'network'], 'rgba(200, 200, 200, 0.3)',
                'rgba(200, 200, 200, 0.15)'
              ],
              'line-width': [
                'case',
                ['==', ['get', 'type'], 'network'], 1,
                1
              ],
              'line-opacity': 0.5,
              'line-dasharray': [1, 0]
            }
          });

          // 上层彩色路径 + 红色网络
          map.addLayer({
            id: routesLineId,
            type: 'line',
            source: routesSourceId,
            paint: {
              'line-color': [
                'case',
                ['==', ['get', 'type'], 'network'], '#D32F2F',
                ['get', 'color']
              ],
              'line-width': [
                'case',
                ['==', ['get', 'type'], 'network'], 2.5,
                3
              ],
              'line-opacity': [
                'case',
                ['==', ['get', 'type'], 'network'], 0.6,
                0.5
              ],
              'line-dasharray': [
                'case',
                ['==', ['get', 'type'], 'network'], [1, 0],
                [8, 4]
              ]
            }
          });

          console.log(`✅ ${TRESPASS_ROUTES.length} 条越界路径 + ${networkFeatures.length} 条网络连接线加载完成`);

          // ============================================================
          // 10. 流动动画线
          // ============================================================

          const flowSourceId = 'trespass-flow';
          const flowLayerId = 'trespass-flow-layer';
          const flowGlowId = 'trespass-flow-glow';

          map.addSource(flowSourceId, {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] }
          });

          map.addLayer({
            id: flowGlowId,
            type: 'line',
            source: flowSourceId,
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            },
            paint: {
              'line-color': [
                'interpolate',
                ['linear'],
                ['get', 'progress'],
                0, 'rgba(255, 87, 34, 0.02)',
                0.3, 'rgba(255, 87, 34, 0.15)',
                0.5, 'rgba(255, 152, 0, 0.25)',
                0.7, 'rgba(255, 87, 34, 0.15)',
                1, 'rgba(255, 87, 34, 0.02)'
              ],
              'line-width': ['interpolate', ['linear'], ['zoom'], 5, 12, 8, 18, 10, 24],
              'line-opacity': 0.4,
              'line-blur': ['interpolate', ['linear'], ['zoom'], 5, 6, 8, 10, 10, 14]
            }
          });

          map.addLayer({
            id: flowLayerId,
            type: 'line',
            source: flowSourceId,
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            },
            paint: {
              'line-color': [
                'interpolate',
                ['linear'],
                ['get', 'progress'],
                0, 'rgba(255, 87, 34, 0.05)',
                0.3, '#FF8F00',
                0.5, '#E65100',
                0.7, '#FF8F00',
                1, 'rgba(255, 87, 34, 0.05)'
              ],
              'line-width': ['interpolate', ['linear'], ['zoom'], 5, 3, 8, 4.5, 10, 6],
              'line-opacity': 0.8,
              'line-blur': ['interpolate', ['linear'], ['zoom'], 5, 0.5, 8, 1, 10, 1.5]
            }
          });

          // ============================================================
          // 11. 越界点标记（橙色小点）
          // ============================================================

          const trespassPointId = 'trespass-points';
          const trespassFeatures = allTrespassPoints.map(p => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [p.lng, p.lat]
            },
            properties: {
              label: p.label,
              routeName: p.routeName,
              color: p.color
            }
          }));

          const trespassSourceId = 'trespass-points-source';
          
          if (map.getLayer(trespassPointId)) map.removeLayer(trespassPointId);
          if (map.getSource(trespassSourceId)) map.removeSource(trespassSourceId);

          map.addSource(trespassSourceId, {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: trespassFeatures
            }
          });

          map.addLayer({
            id: trespassPointId,
            type: 'circle',
            source: trespassSourceId,
            paint: {
              'circle-radius': 7,
              'circle-color': '#FF8F00',
              'circle-opacity': 0.85,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#FFFFFF'
            }
          });

          console.log(`✅ ${trespassFeatures.length} 个越界点标记加载完成`);

          // ============================================================
          // 12. 启动流动动画
          // ============================================================

          startFlowAnimation(map, TRESPASS_ROUTES);

          // ============================================================
          // 13. 添加图例卡片
          // ============================================================

          // ============================================================
// 13. 添加图例卡片（可拖动）
// ============================================================

const legendId = 'trespasser-legend';
const oldLegend = document.getElementById(legendId);
if (oldLegend) oldLegend.remove();

const legend = document.createElement('div');
legend.id = legendId;
legend.style.cssText = `
  position: fixed;
  bottom: 120px;
  right: 20px;
  z-index: 100;
  background: rgba(255, 248, 235, 0.92);
  backdrop-filter: blur(8px);
  padding: 16px 18px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(139, 115, 85, 0.10);
  border: 1px solid rgba(180, 120, 60, 0.10);
  font-family: '华文楷体', 'KaiTi', 'PingFang SC', serif;
  min-width: 180px;
  max-width: 220px;
  cursor: grab;
  user-select: none;
  touch-action: none;
`;

legend.innerHTML = `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;cursor:grab;">
    <div style="font-size:15px;font-weight:700;color:#3a2a1a;letter-spacing:1px;">📖 图 例</div>
    <div style="font-size:11px;color:#8a7a6a;letter-spacing:0.5px;">↕ 拖动</div>
  </div>
  <div style="border-bottom:2px solid rgba(180,120,60,0.15);margin-bottom:10px;"></div>
  
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
    <span style="display:inline-block;width:20px;height:14px;background:#E3F2FD;border:2px solid rgba(66,165,245,0.2);border-radius:3px;"></span>
    <span style="font-size:12px;color:#4a3a2a;">保护区</span>
  </div>
  
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
    <span style="display:inline-block;width:20px;height:3px;background:#FF8F00;border-radius:2px;"></span>
    <span style="font-size:12px;color:#4a3a2a;">⬤ 流动穿越路径</span>
  </div>
  
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
    <span style="display:inline-block;width:14px;height:14px;background:#FF8F00;border:2px solid white;border-radius:50%;"></span>
    <span style="font-size:12px;color:#4a3a2a;">越界终点</span>
  </div>
  
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
    <span style="display:inline-block;width:10px;height:10px;background:#FF8F00;border:2px solid white;border-radius:50%;"></span>
    <span style="font-size:12px;color:#4a3a2a;">越界发生点</span>
  </div>
  
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
    <span style="display:inline-block;width:20px;height:3px;background:#D32F2F;border-radius:2px;"></span>
    <span style="font-size:12px;color:#4a3a2a;">越界点网络（红色实线）</span>
  </div>
  
  <div style="margin-top:10px;padding-top:10px;border-top:1px dashed rgba(180,120,60,0.15);font-size:11px;color:#8a7a6a;text-align:center;line-height:1.6;">
    📍 橙色标记 = 非法穿越痕迹<br>
    ⬤ 流动光点 = 越界者行进方向
  </div>
`;

document.body.appendChild(legend);

// ===== 拖动功能 =====
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

const onMouseDown = (e) => {
  // 只响应左键
  if (e.button !== 0) return;
  
  // 如果点击的是内部交互元素（如滚动条），不触发拖动
  if (e.target.closest('a') || e.target.closest('button')) return;
  
  isDragging = true;
  const rect = legend.getBoundingClientRect();
  dragOffsetX = e.clientX - rect.left;
  dragOffsetY = e.clientY - rect.top;
  legend.style.cursor = 'grabbing';
  legend.style.transition = 'none';
  e.preventDefault();
};

const onMouseMove = (e) => {
  if (!isDragging) return;
  
  let x = e.clientX - dragOffsetX;
  let y = e.clientY - dragOffsetY;
  
  // 边界限制 - 防止拖出屏幕
  const rect = legend.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width - 10;
  const maxY = window.innerHeight - rect.height - 10;
  x = Math.max(10, Math.min(maxX, x));
  y = Math.max(10, Math.min(maxY, y));
  
  legend.style.left = x + 'px';
  legend.style.top = y + 'px';
  legend.style.right = 'auto';
  legend.style.bottom = 'auto';
};

const onMouseUp = () => {
  if (isDragging) {
    isDragging = false;
    legend.style.cursor = 'grab';
    legend.style.transition = 'box-shadow 0.2s';
  }
};

// 鼠标事件
legend.addEventListener('mousedown', onMouseDown);
document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseup', onMouseUp);

// 触屏事件（移动端支持）
let touchId = null;

const onTouchStart = (e) => {
  const touch = e.touches[0];
  if (!touch) return;
  
  // 如果点击的是内部交互元素，不触发拖动
  if (e.target.closest('a') || e.target.closest('button')) return;
  
  touchId = touch.identifier;
  const rect = legend.getBoundingClientRect();
  dragOffsetX = touch.clientX - rect.left;
  dragOffsetY = touch.clientY - rect.top;
  legend.style.transition = 'none';
  e.preventDefault();
};

const onTouchMove = (e) => {
  let touch = null;
  for (const t of e.touches) {
    if (t.identifier === touchId) {
      touch = t;
      break;
    }
  }
  if (!touch) return;
  
  let x = touch.clientX - dragOffsetX;
  let y = touch.clientY - dragOffsetY;
  
  const rect = legend.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width - 10;
  const maxY = window.innerHeight - rect.height - 10;
  x = Math.max(10, Math.min(maxX, x));
  y = Math.max(10, Math.min(maxY, y));
  
  legend.style.left = x + 'px';
  legend.style.top = y + 'px';
  legend.style.right = 'auto';
  legend.style.bottom = 'auto';
  e.preventDefault();
};

const onTouchEnd = () => {
  touchId = null;
  legend.style.transition = 'box-shadow 0.2s';
};

legend.addEventListener('touchstart', onTouchStart, { passive: false });
legend.addEventListener('touchmove', onTouchMove, { passive: false });
legend.addEventListener('touchend', onTouchEnd);

// 存储清理函数
legend._cleanup = () => {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('mouseup', onMouseUp);
  legend.removeEventListener('mousedown', onMouseDown);
  legend.removeEventListener('touchstart', onTouchStart);
  legend.removeEventListener('touchmove', onTouchMove);
  legend.removeEventListener('touchend', onTouchEnd);
};

console.log('✅ 图例卡片已添加（可拖动）');

          // ============================================================
          // 14. 交互事件 (Popup)
          // ============================================================

          if (popup) {
            // 保护区填充悬停显示名称
            map.on('mouseenter', 'reserve-fill', function(e) {
              const features = map.queryRenderedFeatures(e.point, { layers: ['reserve-fill'] });
              if (features && features.length > 0) {
                const props = features[0].properties;
                map.getCanvas().style.cursor = 'pointer';
                
                const name = props.name || props.名称 || '自然保护区';
                
                const html = 
'<div style="' +
  'font-family: \'思源宋体\', \'Source Han Serif SC\', serif;' +
  'padding: 12px 16px;' +
  'max-width: 260px;' +
  'background: #fdf8ed;' +
  'border-radius: 12px;' +
  'border-left: 4px solid #42A5F5;' +
  'box-shadow: 0 4px 20px rgba(66, 165, 245, 0.12);' +
'">' +
  '<div style="font-size:16px;font-weight:700;color:#1565C0;">🏞️ ' + name + '</div>' +
  '<div style="font-size:12px;color:#5a6a7a;margin-top:6px;">自然保护区</div>' +
'</div>';

                popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
                if (onHover) onHover(props, e);
              }
            });

            map.on('mouseleave', 'reserve-fill', function() {
              map.getCanvas().style.cursor = '';
              popup.remove();
              if (onHover) onHover(null);
            });

            // 地标点悬停
            map.on('mouseenter', landmarksLayerId, function(e) {
              const features = map.queryRenderedFeatures(e.point, { layers: [landmarksLayerId] });
              if (features && features.length > 0) {
                const props = features[0].properties;
                map.getCanvas().style.cursor = 'pointer';

                const html = 
  '<div style="' +
    'font-family: \'思源宋体\', \'Source Han Serif SC\', serif;' +
    'padding: 14px 16px;' +
    'max-width: 320px;' +
    'background: #fdf8ed;' +
    'border-radius: 12px;' +
    'border-left: 4px solid #FF8F00;' +
    'box-shadow: 0 4px 20px rgba(255, 143, 0, 0.12);' +
  '">' +
    '<div style="' +
      'font-size:18px;' +
      'font-weight:700;' +
      'color:#E65100;' +
      'border-bottom:2px solid #c8b5df;' +
      'padding-bottom:10px;' +
      'margin-bottom:10px;' +
      'letter-spacing:1px;' +
    '">' +
      '📍 ' + props.name +
    '</div>' +
    '<div style="' +
      'font-size:13px;' +
      'color:#5a6a7a;' +
      'line-height:1.9;' +
      'letter-spacing:0.3px;' +
      'white-space:pre-line;' +
    '">' +
      (props.description || '秦岭核心保护区\n⚠️ 非法穿越者最终到达点') +
    '</div>' +
    '<div style="' +
      'margin-top:12px;' +
      'padding-top:12px;' +
      'border-top:2px solid #FF8F00;' +
      'font-size:13px;' +
      'color:#E65100;' +
      'font-weight:600;' +
      'letter-spacing:0.5px;' +
    '">' +
      '⚠️ 非法穿越 · 已突破保护区边界' +
    '</div>' +
  '</div>';

                popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
                if (onHover) onHover(props, e);
              }
            });

            map.on('mouseleave', landmarksLayerId, function() {
              map.getCanvas().style.cursor = '';
              popup.remove();
              if (onHover) onHover(null);
            });

            // 路径悬停
            map.on('mouseenter', routesLineId, function(e) {
              const features = map.queryRenderedFeatures(e.point, { layers: [routesLineId] });
              if (features && features.length > 0) {
                const props = features[0].properties;
                map.getCanvas().style.cursor = 'pointer';
                
                // 网络线悬停
                if (props.type === 'network') {
                  const html = 
  '<div style="' +
    'font-family: \'思源宋体\', \'Source Han Serif SC\', serif;' +
    'padding: 12px 16px;' +
    'max-width: 260px;' +
    'background: #fdf8ed;' +
    'border-radius: 12px;' +
    'border-left: 4px solid #D32F2F;' +
    'box-shadow: 0 4px 20px rgba(211, 47, 47, 0.10);' +
  '">' +
    '<div style="font-size:15px;font-weight:700;color:#D32F2F;">🕸️ 越界点网络</div>' +
    '<div style="font-size:12px;color:#5a6a7a;margin-top:6px;">红色实线 = 越界点之间的关联</div>' +
  '</div>';
                  popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
                  return;
                }
                
                // 路径线悬停
                const html = 
  '<div style="' +
    'font-family: \'思源宋体\', \'Source Han Serif SC\', serif;' +
    'padding: 14px 16px;' +
    'max-width: 280px;' +
    'background: #fdf8ed;' +
    'border-radius: 12px;' +
    'border-left: 4px solid ' + props.color + ';' +
    'box-shadow: 0 4px 20px rgba(0,0,0,0.08);' +
  '">' +
    '<div style="' +
      'font-size:16px;' +
      'font-weight:700;' +
      'color:' + props.color + ';' +
      'border-bottom:2px solid #e8edf0;' +
      'padding-bottom:8px;' +
      'margin-bottom:8px;' +
    '">' +
      '🚶 ' + props.name +
    '</div>' +
    '<div style="font-size:13px;color:#5a6a7a;line-height:1.8;">' +
      props.description +
    '</div>' +
    '<div style="' +
      'margin-top:10px;' +
      'padding-top:10px;' +
      'border-top:1px solid #e8edf0;' +
      'font-size:12px;' +
      'color:#E65100;' +
    '">' +
      '⚠️ 已越界进入保护区核心区域' +
    '</div>' +
  '</div>';

                popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
                if (onHover) onHover(props, e);
              }
            });

            map.on('mouseleave', routesLineId, function() {
              map.getCanvas().style.cursor = '';
              popup.remove();
              if (onHover) onHover(null);
            });

            // 越界点悬停
            map.on('mouseenter', trespassPointId, function(e) {
              const features = map.queryRenderedFeatures(e.point, { layers: [trespassPointId] });
              if (features && features.length > 0) {
                const props = features[0].properties;
                map.getCanvas().style.cursor = 'pointer';

                const html = 
  '<div style="' +
    'font-family: \'思源宋体\', \'Source Han Serif SC\', serif;' +
    'padding: 12px 16px;' +
    'max-width: 260px;' +
    'background: #fdf8ed;' +
    'border-radius: 12px;' +
    'border-left: 4px solid #FF8F00;' +
    'box-shadow: 0 4px 20px rgba(255, 143, 0, 0.12);' +
  '">' +
    '<div style="' +
      'font-size:15px;' +
      'font-weight:700;' +
      'color:#E65100;' +
    '">' +
      '🚨 ' + (props.label || '越界点') +
    '</div>' +
    '<div style="font-size:12px;color:#5a6a7a;margin-top:6px;">' +
      (props.routeName || '') +
    '</div>' +
  '</div>';

                popup.setLngLat(e.lngLat).setHTML(html).addTo(map);
              }
            });

            map.on('mouseleave', trespassPointId, function() {
              map.getCanvas().style.cursor = '';
              popup.remove();
            });
          }

          if (onClick) {
            map.on('click', landmarksLayerId, function(e) {
              const features = map.queryRenderedFeatures(e.point, { layers: [landmarksLayerId] });
              if (features && features.length > 0) {
                onClick(features[0].properties, e);
              }
            });
          }

          console.log('✅ 越界者图层全部加载完成（流动路径 + 网络连接 + 图例 + Popup）');
          resolve();

        });
      })
      .catch(error => {
        console.error('❌ 加载越界者图层失败:', error);
        reject(error);
      });
  });
};

// ============================================================
// 流动动画函数
// ============================================================

const startFlowAnimation = (map, routes) => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  animationTime = 0;
  const speed = 0.008;
  
  const animate = () => {
    animationTime += speed;
    
    const flowFeatures = routes.map((route, index) => {
      const start = [route.start.lng, route.start.lat];
      const end = [route.end.lng, route.end.lat];
      
      const allPoints = [
        start,
        ...route.waypoints.map(w => [w.lng, w.lat]),
        end
      ];
      
      let totalLength = 0;
      const segments = [];
      for (let i = 0; i < allPoints.length - 1; i++) {
        const dx = allPoints[i+1][0] - allPoints[i][0];
        const dy = allPoints[i+1][1] - allPoints[i][1];
        const len = Math.sqrt(dx*dx + dy*dy);
        segments.push(len);
        totalLength += len;
      }
      
      const offset = (index / routes.length) * 2.0;
      let progress = (animationTime + offset) % 1;
      
      let targetDist = progress * totalLength;
      let currentPos = allPoints[0];
      let cumDist = 0;
      
      for (let i = 0; i < segments.length; i++) {
        if (targetDist <= cumDist + segments[i]) {
          const t = (targetDist - cumDist) / segments[i];
          currentPos = [
            allPoints[i][0] + (allPoints[i+1][0] - allPoints[i][0]) * t,
            allPoints[i][1] + (allPoints[i+1][1] - allPoints[i][1]) * t
          ];
          break;
        }
        cumDist += segments[i];
        if (i === segments.length - 1) {
          currentPos = allPoints[allPoints.length - 1];
        }
      }
      
      const trailLength = 0.15;
      let trailDist = Math.max(0, targetDist - trailLength * totalLength);
      let trailPos = allPoints[0];
      cumDist = 0;
      
      for (let i = 0; i < segments.length; i++) {
        if (trailDist <= cumDist + segments[i]) {
          const t = (trailDist - cumDist) / segments[i];
          trailPos = [
            allPoints[i][0] + (allPoints[i+1][0] - allPoints[i][0]) * t,
            allPoints[i][1] + (allPoints[i+1][1] - allPoints[i][1]) * t
          ];
          break;
        }
        cumDist += segments[i];
        if (i === segments.length - 1) {
          trailPos = allPoints[allPoints.length - 1];
        }
      }
      
      return {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [trailPos, currentPos]
        },
        properties: {
          progress: progress,
          routeId: route.id
        }
      };
    });
    
    const flowSource = map.getSource('trespass-flow');
    if (flowSource) {
      flowSource.setData({
        type: 'FeatureCollection',
        features: flowFeatures
      });
    }
    
    animationFrameId = requestAnimationFrame(animate);
  };
  
  animate();
};

// ============================================================
// 移除越界者图层
// ============================================================

export const removeTrespasserLayer = function(map) {
  if (!map) return;

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  map.setMinZoom(null);
  map.setMaxZoom(null);

  const layerIds = [
    'shaanxi-fill',
    'shaanxi-line',
    'reserve-fill',
    'landmarks-layer',
    'landmarks-glow',
    'landmarks-label',
    'routes-line',
    'routes-static',
    'trespass-flow-layer',
    'trespass-flow-glow',
    'trespass-points'
  ];

  const sourceIds = [
    'shaanxi-source',
    'reserve-source',
    'landmarks-source',
    'routes-source',
    'trespass-flow',
    'trespass-points-source'
  ];

  layerIds.forEach(function(id) {
    if (map.getLayer(id)) map.removeLayer(id);
  });

  sourceIds.forEach(function(id) {
    if (map.getSource(id)) map.removeSource(id);
  });

  const legend = document.getElementById('trespasser-legend');
  if (legend) {
    if (legend._cleanup) legend._cleanup();
    legend.remove();  // ← 删除图例
  }

  map.off('mouseenter', 'reserve-fill');
  map.off('mouseleave', 'reserve-fill');
  map.off('mouseenter', 'landmarks-layer');
  map.off('mouseleave', 'landmarks-layer');
  map.off('mouseenter', 'routes-line');
  map.off('mouseleave', 'routes-line');
  map.off('mouseenter', 'trespass-points');
  map.off('mouseleave', 'trespass-points');
  map.off('click', 'landmarks-layer');

  console.log('🗑️ 越界者图层已移除');
};
