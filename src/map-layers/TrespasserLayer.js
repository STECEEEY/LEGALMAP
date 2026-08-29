// src/map-layers/TrespasserLayer.js

/**
 * 越界者图层 - 非法穿越秦岭核心保护区
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
// 备用坐标
// ============================================================

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
  '鳌山': '位于太白山国家级自然保护区',
  '光头山': '位于牛背梁国家级自然保护区',
  '鹿角梁': '秦岭核心保护区',
  '东梁': '秦岭核心保护区',
  '大坪梁': '秦岭核心保护区',
  '草链岭': '秦岭核心保护区',
  '王屋咀': '秦岭核心保护区'
};

// ============================================================
// 工具函数：高德地理编码
// ============================================================

async function geocodeAddress(address) {
  const fullAddress = `${SEARCH_REGION}${address}`;
  const url = `${AMAP_GEOCODE_URL}?address=${encodeURIComponent(fullAddress)}&key=${AMAP_API_KEY}&output=JSON`;
  
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

    // ============================================================
    // 1. 限制地图缩放范围
    // ============================================================
    
    map.setMinZoom(6);
    map.setMaxZoom(14);
    
    if (map.getZoom() < 6) {
      map.flyTo({
        center: [108.5, 34.0],
        zoom: 7,
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
        // 查找陕西省
        let shaanxiFeature = null;
        
        // 尝试通过 properties.name 查找
        if (chinaData.features) {
          for (const feature of chinaData.features) {
            const props = feature.properties;
            // 尝试多种可能的属性名
            const name = props.name || props.NAME || props.省份 || props.province || props.省 || '';
            if (name.includes('陕西') || name.includes('陕') || name.includes('Shaanxi')) {
              shaanxiFeature = feature;
              console.log('✅ 找到陕西省:', name);
              break;
            }
          }
        }

        // 如果没找到，打印一些属性名供调试
        if (!shaanxiFeature && chinaData.features && chinaData.features.length > 0) {
          console.log('📋 前3个要素的属性名:', chinaData.features.slice(0, 3).map(f => Object.keys(f.properties || {})));
        }

        // ============================================================
        // 3. 高亮陕西省
        // ============================================================

        if (shaanxiFeature) {
          const shaanxiSourceId = 'shaanxi-source';
          const shaanxiFillId = 'shaanxi-fill';
          const shaanxiLineId = 'shaanxi-line';
          const shaanxiLabelId = 'shaanxi-label';

          if (map.getLayer(shaanxiLabelId)) map.removeLayer(shaanxiLabelId);
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

          // 陕西省填充
          map.addLayer({
            id: shaanxiFillId,
            type: 'fill',
            source: shaanxiSourceId,
            paint: {
              'fill-color': '#FFD54F',
              'fill-opacity': 0.12,
              'fill-outline-color': 'rgba(255, 213, 79, 0.3)'
            }
          });

          // 陕西省边界线
          map.addLayer({
            id: shaanxiLineId,
            type: 'line',
            source: shaanxiSourceId,
            paint: {
              'line-color': '#F9A825',
              'line-width': 2.5,
              'line-opacity': 0.7,
              'line-dasharray': [6, 4]
            }
          });

          // 陕西省名称标签
          map.addLayer({
            id: shaanxiLabelId,
            type: 'symbol',
            source: shaanxiSourceId,
            layout: {
              'text-field': '陕西省',
              'text-font': ['NotoSansCJKsc-Regular'],
              'text-size': 18,
              'text-offset': [0, 0],
              'text-allow-overlap': true,
              'text-anchor': 'center'
            },
            paint: {
              'text-color': '#F57F17',
              'text-halo-color': 'rgba(255,255,255,0.9)',
              'text-halo-width': 4,
              'text-halo-blur': 2,
              'text-weight': 'bold'
            }
          });

          console.log('✅ 陕西省高亮完成');
        } else {
          console.warn('⚠️ 未在china.geojson中找到陕西省');
        }

        // ============================================================
        // 4. 加载保护区数据
        // ============================================================

        return Promise.all([
          fetch(保护区数据Url),
          fetch(涉事保护区数据Url)
        ]).then(async ([保护区响应, 涉事保护区响应]) => {
          if (!保护区响应.ok) {
            throw new Error(`加载保护区.geojson失败: ${保护区响应.status}`);
          }
          if (!涉事保护区响应.ok) {
            throw new Error(`加载涉事保护区.geojson失败: ${涉事保护区响应.status}`);
          }

          const 保护区数据 = await 保护区响应.json();
          const 涉事保护区数据 = await 涉事保护区响应.json();

          console.log('📊 保护区数据:', 保护区数据.features?.length || 0, '个要素');
          console.log('📊 涉事保护区数据:', 涉事保护区数据.features?.length || 0, '个要素');

          // ============================================================
          // 5. 所有保护区（只描边不填色）
          // ============================================================

          const allReserves = {
            type: 'FeatureCollection',
            features: [
              ...(保护区数据.features || []),
              ...(涉事保护区数据.features || [])
            ]
          };

          console.log('📊 所有保护区合计:', allReserves.features.length, '个要素');

          if (allReserves.features.length > 0) {
            const reserveAllSourceId = 'reserve-all-source';
            const reserveAllLineId = 'reserve-all-line';

            if (map.getLayer(reserveAllLineId)) map.removeLayer(reserveAllLineId);
            if (map.getSource(reserveAllSourceId)) map.removeSource(reserveAllSourceId);

            map.addSource(reserveAllSourceId, {
              type: 'geojson',
              data: allReserves
            });

            // 所有保护区 - 只描边不填色
            map.addLayer({
              id: reserveAllLineId,
              type: 'line',
              source: reserveAllSourceId,
              paint: {
                'line-color': '#78909C',
                'line-width': 1.2,
                'line-opacity': 0.5,
                'line-dasharray': [4, 4]
              }
            });

            console.log('✅ 所有保护区加载完成（仅描边）');

            // ============================================================
            // 6. 陕西省内的保护区显示名称
            // ============================================================

            // 获取陕西省边界用于判断
            const shaanxiCoords = shaanxiFeature?.geometry?.coordinates;
            let shaanxiBounds = null;
            if (shaanxiCoords) {
              // 计算陕西省的包围盒
              let allCoords = [];
              if (shaanxiCoords[0] && shaanxiCoords[0][0] && Array.isArray(shaanxiCoords[0][0])) {
                shaanxiCoords[0].forEach(c => allCoords.push(c));
              } else if (shaanxiCoords[0] && Array.isArray(shaanxiCoords[0])) {
                shaanxiCoords.forEach(c => allCoords.push(c));
              }
              if (allCoords.length > 0) {
                let minLng = Infinity, maxLng = -Infinity;
                let minLat = Infinity, maxLat = -Infinity;
                allCoords.forEach(c => {
                  if (c[0] < minLng) minLng = c[0];
                  if (c[0] > maxLng) maxLng = c[0];
                  if (c[1] < minLat) minLat = c[1];
                  if (c[1] > maxLat) maxLat = c[1];
                });
                shaanxiBounds = { minLng, maxLng, minLat, maxLat };
                console.log('📍 陕西省范围:', shaanxiBounds);
              }
            }

            // 筛选陕西省内的保护区
            const shaanxiReserves = allReserves.features.filter(feature => {
              if (!shaanxiBounds) return false;
              const coords = feature.geometry.coordinates;
              // 取多边形中心点
              let lngSum = 0, latSum = 0, count = 0;
              if (coords[0] && coords[0][0] && Array.isArray(coords[0][0])) {
                coords[0].forEach(c => {
                  lngSum += c[0];
                  latSum += c[1];
                  count++;
                });
              } else if (coords[0] && Array.isArray(coords[0])) {
                coords.forEach(c => {
                  lngSum += c[0];
                  latSum += c[1];
                  count++;
                });
              }
              if (count === 0) return false;
              const centerLng = lngSum / count;
              const centerLat = latSum / count;
              return centerLng > shaanxiBounds.minLng && centerLng < shaanxiBounds.maxLng &&
                     centerLat > shaanxiBounds.minLat && centerLat < shaanxiBounds.maxLat;
            });

            console.log('📍 陕西省内保护区:', shaanxiReserves.length, '个');

            if (shaanxiReserves.length > 0) {
              const shaanxiReserveSourceId = 'shaanxi-reserve-source';
              const shaanxiReserveLabelId = 'shaanxi-reserve-label';

              if (map.getLayer(shaanxiReserveLabelId)) map.removeLayer(shaanxiReserveLabelId);
              if (map.getSource(shaanxiReserveSourceId)) map.removeSource(shaanxiReserveSourceId);

              map.addSource(shaanxiReserveSourceId, {
                type: 'geojson',
                data: {
                  type: 'FeatureCollection',
                  features: shaanxiReserves
                }
              });

              map.addLayer({
                id: shaanxiReserveLabelId,
                type: 'symbol',
                source: shaanxiReserveSourceId,
                layout: {
                  'text-field': ['get', 'name'],
                  'text-font': ['NotoSansCJKsc-Regular'],
                  'text-size': 12,
                  'text-offset': [0, -1.2],
                  'text-allow-overlap': false,
                  'text-anchor': 'center'
                },
                paint: {
                  'text-color': '#37474F',
                  'text-halo-color': 'rgba(255,255,255,0.9)',
                  'text-halo-width': 3,
                  'text-halo-blur': 1
                }
              });

              console.log(`✅ 陕西省内 ${shaanxiReserves.length} 个保护区显示名称`);
            }
          } else {
            console.warn('⚠️ 没有找到任何保护区数据');
          }

          // ============================================================
          // 7. 通过高德 API 获取地标点坐标
          // ============================================================

          console.log('📍 正在获取地标点坐标...');

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
              description: LANDMARK_DESCRIPTIONS[name] || '秦岭核心保护区'
            });
          });

          console.log(`📍 地标点: API成功 ${apiSuccessCount}/${landmarkNames.length}`);

          if (landmarkPoints.length === 0) {
            throw new Error('无法获取任何地标点坐标');
          }

          // ============================================================
          // 8. 加载地标点（带名称标注）
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

          // 地标点
          map.addLayer({
            id: landmarksLayerId,
            type: 'circle',
            source: landmarksSourceId,
            paint: {
              'circle-radius': 10,
              'circle-color': '#E53935',
              'circle-opacity': 0.9,
              'circle-stroke-width': 2,
              'circle-stroke-color': '#FFFFFF',
              'circle-pitch-alignment': 'map'
            }
          });

          // 地标点发光
          map.addLayer({
            id: 'landmarks-glow',
            type: 'circle',
            source: landmarksSourceId,
            paint: {
              'circle-radius': 20,
              'circle-color': '#E53935',
              'circle-opacity': 0.15,
              'circle-blur': 1,
              'circle-pitch-alignment': 'map'
            }
          });

          // 地标点名称标注
          map.addLayer({
            id: landmarksLabelId,
            type: 'symbol',
            source: landmarksSourceId,
            layout: {
              'text-field': ['get', 'name'],
              'text-font': ['NotoSansCJKsc-Regular'],
              'text-size': 12,
              'text-offset': [0, 1.8],
              'text-allow-overlap': false,
              'text-anchor': 'top',
              'text-weight': 'bold'
            },
            paint: {
              'text-color': '#E53935',
              'text-halo-color': 'rgba(255,255,255,0.95)',
              'text-halo-width': 3,
              'text-halo-blur': 1
            }
          });

          console.log(`✅ ${landmarkPoints.length} 个地标点加载完成`);

          // ============================================================
          // 9. 交互事件 (Popup)
          // ============================================================

          if (popup) {
            console.log('✅ Popup 已传入，绑定交互事件');

            // 地标点悬停
            map.on('mouseenter', landmarksLayerId, function(e) {
              var features = map.queryRenderedFeatures(e.point, { layers: [landmarksLayerId] });
              if (features && features.length > 0) {
                var props = features[0].properties;
                map.getCanvas().style.cursor = 'pointer';

                var html = 
  '<div style="' +
    'font-family: \'思源宋体\', \'Source Han Serif SC\', \'Noto Serif SC\', \'SimSun\', serif;' +
    'padding: 12px 6px;' +
    'max-width: 300px;' +
    'background: #fdf8ed;' +
    'border-radius: 10px;' +
    'box-shadow: 0 4px 20px rgba(82, 140, 126, 0.15);' +
  '">' +
    '<div style="' +
      'font-size:17px;' +
      'font-weight:600;' +
      'color:#528c7e;' +
      'border-bottom:2px solid #c8b5df;' +
      'padding-bottom:10px;' +
      'margin-bottom:10px;' +
      'letter-spacing:1px;' +
    '">' +
      props.name +
    '</div>' +
    '<div style="' +
      'font-size:14px;' +
      'color:#5a6a7a;' +
      'line-height:1.9;' +
      'letter-spacing:0.3px;' +
    '">' +
      (props.description || '秦岭核心保护区') +
    '</div>' +
    '<div style="' +
      'font-size:12px;' +
      'color:#aab5bf;' +
      'margin-top:10px;' +
      'border-top:1px solid #e8edf0;' +
      'padding-top:10px;' +
      'letter-spacing:0.3px;' +
    '">' +
      '禁止非法穿越' +
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
          }

          if (onClick) {
            map.on('click', landmarksLayerId, function(e) {
              var features = map.queryRenderedFeatures(e.point, { layers: [landmarksLayerId] });
              if (features && features.length > 0) {
                onClick(features[0].properties, e);
              }
            });
          }

          console.log('✅ 越界者图层全部加载完成');
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
// 移除越界者图层
// ============================================================

export const removeTrespasserLayer = function(map) {
  if (!map) return;

  map.setMinZoom(null);
  map.setMaxZoom(null);

  var layerIds = [
    'shaanxi-fill',
    'shaanxi-line',
    'shaanxi-label',
    'reserve-all-line',
    'shaanxi-reserve-label',
    'landmarks-layer',
    'landmarks-glow',
    'landmarks-label'
  ];

  var sourceIds = [
    'shaanxi-source',
    'reserve-all-source',
    'shaanxi-reserve-source',
    'landmarks-source'
  ];

  layerIds.forEach(function(id) {
    if (map.getLayer(id)) map.removeLayer(id);
  });

  sourceIds.forEach(function(id) {
    if (map.getSource(id)) map.removeSource(id);
  });

  map.off('mouseenter', 'landmarks-layer');
  map.off('mouseleave', 'landmarks-layer');
  map.off('click', 'landmarks-layer');

  console.log('🗑️ 越界者图层已移除');
};