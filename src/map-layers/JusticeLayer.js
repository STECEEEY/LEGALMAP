// src/map-layers/JusticeLayer.js

/**
 * 法治抵达山海 - 公益诉讼追责路径图
 * 点击地图触发右侧弹窗，展示法治路径流程图
 */

// ============================================================
// 案件数据
// ============================================================

const CASE_DATA = {
  title: '法治抵达山海',
  subtitle: '陕西首例个人非法组织穿越秦岭核心保护区民事公益诉讼案',
  imagePath: '/images/legalroad.png',
  stats: {
    totalTrips: 25,
    totalPeople: 148,
    totalFee: '30,894',
    compensation: '10,000'
  },
  timeline: [
    { phase: '违法组织', label: '西安（线上招募）', desc: '2024.1-2025.6，苏某通过网络招募参与者' },
    { phase: '违法实施', label: '秦岭核心保护区', desc: '组织进入太白山、牛背梁等自然保护区穿越露营' },
    { phase: '检察介入', label: '检察机关调查', desc: '提起民事公益诉讼，申请诉前禁止令' },
    { phase: '法院审理', label: '法院审理', desc: '2025.9.16，西安铁路运输中级法院当庭宣判' },
    { phase: '判决结果', label: '停止侵害 · 赔偿修复 · 公开道歉', desc: '判令停止组织穿越、赔偿1万元修复费、公开道歉' }
  ],
  laws: [
    '《陕西省秦岭生态环境保护条例》第十八条',
    '《中华人民共和国自然保护区条例》第二十七条',
    '《中华人民共和国民事诉讼法》第五十八条',
    '《中华人民共和国民法典》第一千二百二十九条',
    '《中华人民共和国环境保护法》第六十四条'
  ],
  quote: '法律不仅在城市，也抵达群山深处'
};

// ============================================================
// 核心导出函数
// ============================================================

export const loadJusticeLayer = (map, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!map) return reject(new Error('地图未初始化'));

    const { onHover = null, onClick = null, popup = null } = options;

    // ============================================================
    // 1. 设置地图范围
    // ============================================================

    map.setMinZoom(6);
    map.setMaxZoom(14);

    map.flyTo({
      center: [108.7, 34.1],
      zoom: 8.5,
      duration: 1200
    });

    // ============================================================
    // 2. 添加秦岭保护区背景 - 淡雅配色
    // ============================================================

    const qinlingArea = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [106.5, 32.5], [107.5, 32.5], [108.5, 32.5], [109.5, 33.0],
          [110.5, 33.5], [111.0, 34.0], [110.5, 34.5], [109.5, 34.8],
          [108.5, 35.0], [107.5, 35.0], [106.5, 34.5], [106.0, 34.0],
          [105.5, 33.5], [106.0, 33.0], [106.5, 32.5]
        ]]
      },
      properties: { name: '秦岭区域' }
    };

    const qinlingSourceId = 'justice-qinling-source';
    const qinlingFillId = 'justice-qinling-fill';
    const qinlingLineId = 'justice-qinling-line';

    if (map.getLayer(qinlingLineId)) map.removeLayer(qinlingLineId);
    if (map.getLayer(qinlingFillId)) map.removeLayer(qinlingFillId);
    if (map.getSource(qinlingSourceId)) map.removeSource(qinlingSourceId);

    map.addSource(qinlingSourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [qinlingArea]
      }
    });

    map.addLayer({
      id: qinlingFillId,
      type: 'fill',
      source: qinlingSourceId,
      paint: {
        'fill-color': '#528c7e',
        'fill-opacity': 0.04
      }
    });

    map.addLayer({
      id: qinlingLineId,
      type: 'line',
      source: qinlingSourceId,
      paint: {
        'line-color': 'rgba(82, 140, 126, 0.12)',
        'line-width': 1,
        'line-dasharray': [4, 4]
      }
    });

    // ============================================================
    // 3. 在地图上添加"法治路径"入口标记 - 淡雅配色
    // ============================================================

    const entryPoint = { lng: 108.7, lat: 34.1 };

    const entrySourceId = 'justice-entry-source';
    const entryLayerId = 'justice-entry-layer';
    const entryLabelId = 'justice-entry-label';

    if (map.getLayer(entryLabelId)) map.removeLayer(entryLabelId);
    if (map.getLayer('justice-entry-inner')) map.removeLayer('justice-entry-inner');
    if (map.getLayer(entryLayerId)) map.removeLayer(entryLayerId);
    if (map.getSource(entrySourceId)) map.removeSource(entrySourceId);

    map.addSource(entrySourceId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [entryPoint.lng, entryPoint.lat]
          },
          properties: {
            name: '点击查看法治路径'
          }
        }]
      }
    });

    map.addLayer({
      id: entryLayerId,
      type: 'circle',
      source: entrySourceId,
      paint: {
        'circle-radius': 30,
        'circle-color': '#528c7e',
        'circle-opacity': 0.10,
        'circle-blur': 0.5,
        'circle-pitch-alignment': 'map'
      }
    });

    map.addLayer({
      id: 'justice-entry-inner',
      type: 'circle',
      source: entrySourceId,
      paint: {
        'circle-radius': 14,
        'circle-color': '#528c7e',
        'circle-opacity': 0.75,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#FFFFFF',
        'circle-pitch-alignment': 'map'
      }
    });

    map.addLayer({
      id: entryLabelId,
      type: 'symbol',
      source: entrySourceId,
      layout: {
        'text-field': '点击查看\n法治路径',
        'text-font': ['NotoSansCJKsc-Regular', 'SourceHanSerifSC-Regular', 'serif'],
        'text-size': 14,
        'text-offset': [0, -2.5],
        'text-allow-overlap': true,
        'text-ignore-placement': true,
        'text-anchor': 'bottom',
        'text-line-height': 1.4,
      },
      paint: {
        'text-color': '#528c7e',
        'text-halo-color': 'rgba(255,255,255,0.92)',
        'text-halo-width': 4,
        'text-halo-blur': 2
      }
    });

    // ============================================================
    // 4. 弹窗管理
    // ============================================================

    let modalInstance = null;

    function closeModal() {
      if (modalInstance) {
        if (modalInstance._escHandler) {
          document.removeEventListener('keydown', modalInstance._escHandler);
        }
        modalInstance.remove();
        modalInstance = null;
      }
    }

    function openModal() {
      closeModal();

      // ============================================================
      // 5. 创建右侧滑出弹窗 - 淡雅配色
      // ============================================================

      var overlay = document.createElement('div');
      overlay.id = 'justice-modal';
      overlay.style.cssText = [
        'position: fixed',
        'top: 0',
        'left: 0',
        'width: 100%',
        'height: 100%',
        'z-index: 9999',
        'background: rgba(82, 140, 126, 0.12)',
        'backdrop-filter: blur(3px)',
        'display: flex',
        'align-items: stretch',
        'justify-content: flex-end',
        'font-family: "思源宋体", "Source Han Serif SC", "Noto Serif SC", "SimSun", serif'
      ].join(';');

      // ============================================================
      // 6. 右侧面板（可滚动）
      // ============================================================

      var panel = document.createElement('div');
      panel.style.cssText = [
        'background: #faf8f5',
        'width: 580px',
        'max-width: 92vw',
        'height: 100%',
        'display: flex',
        'flex-direction: column',
        'box-shadow: -4px 0 32px rgba(82, 140, 126, 0.10)',
        'animation: slideInRight 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
        'position: relative'
      ].join(';');

      // 滑入动画
      var style = document.createElement('style');
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .justice-scroll {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .justice-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .justice-scroll::-webkit-scrollbar-thumb {
          background: #528c7e;
          border-radius: 4px;
        }
        .close-btn:hover {
          background: rgba(255,255,255,0.2) !important;
          transform: scale(1.05);
        }
        .stat-card {
          background: rgba(255,255,255,0.10);
          border-radius: 6px;
          padding: 4px 12px;
          text-align: center;
          flex: 1;
          min-width: 44px;
        }
        .law-tag {
          display: inline-block;
          background: #f0f4f0;
          color: #528c7e;
          padding: 2px 12px;
          border-radius: 12px;
          font-size: 11px;
          margin: 2px 6px 2px 0;
          border: 1px solid rgba(82, 140, 126, 0.10);
        }
        .timeline-item {
          position: relative;
          padding-left: 20px;
          border-left: 2px solid #c8b5df;
          padding-bottom: 14px;
        }
        .timeline-item:last-child {
          border-left: none;
          padding-bottom: 0;
        }
        .timeline-item::before {
          content: '';
          position: absolute;
          left: -6px;
          top: 4px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #528c7e;
          border: 2px solid white;
          box-shadow: 0 0 0 2px #528c7e;
        }
        .timeline-item.completed::before {
          background: #bad66e;
          box-shadow: 0 0 0 2px #bad66e;
        }
        .full-width-img {
          width: 100%;
          height: auto;
          display: block;
        }
      `;
      document.head.appendChild(style);

      // ============================================================
      // 7. 头部 - 淡雅配色
      // ============================================================

      var header = document.createElement('div');
      header.style.cssText = [
        'background: #528c7e',
        'padding: 18px 28px 14px',
        'color: white',
        'flex-shrink: 0',
        'position: sticky',
        'top: 0',
        'z-index: 10'
      ].join(';');
      header.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <div style="font-size:20px;font-weight:600;letter-spacing:2px;">${CASE_DATA.title}</div>
            <div style="font-size:12px;opacity:0.8;margin-top:3px;letter-spacing:0.5px;">${CASE_DATA.subtitle}</div>
          </div>
          <button id="justice-modal-close" class="close-btn" style="
            background: rgba(255,255,255,0.08);
            border: 1px solid rgba(255,255,255,0.15);
            color: white;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          ">✕</button>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
          <div class="stat-card"><div style="font-size:16px;font-weight:600;">${CASE_DATA.stats.totalTrips}</div><div style="font-size:9px;opacity:0.7;letter-spacing:0.3px;">非法穿越次数</div></div>
          <div class="stat-card"><div style="font-size:16px;font-weight:600;">${CASE_DATA.stats.totalPeople}</div><div style="font-size:9px;opacity:0.7;letter-spacing:0.3px;">参与人数</div></div>
          <div class="stat-card"><div style="font-size:16px;font-weight:600;">${CASE_DATA.stats.totalFee}</div><div style="font-size:9px;opacity:0.7;letter-spacing:0.3px;">收费金额</div></div>
          <div class="stat-card" style="background:rgba(186,214,110,0.20);"><div style="font-size:16px;font-weight:600;color:#bad66e;">${CASE_DATA.stats.compensation}</div><div style="font-size:9px;opacity:0.7;letter-spacing:0.3px;">修复赔偿</div></div>
        </div>
      `;

      // ============================================================
      // 8. 滚动内容区域
      // ============================================================

      var scrollContainer = document.createElement('div');
      scrollContainer.className = 'justice-scroll';
      scrollContainer.style.cssText = [
        'flex: 1',
        'overflow-y: auto',
        'overflow-x: hidden',
        'padding: 0'
      ].join('');

      // ============================================================
      // 9. 图片 - 宽度100%，高度自适应
      // ============================================================

      var imageSection = document.createElement('div');
      imageSection.style.cssText = [
        'padding: 16px 24px 12px',
        'background: #faf8f5',
        'border-bottom: 1px solid #e8edf0'
      ].join('');

      var imgWrapper = document.createElement('div');
      imgWrapper.style.cssText = [
        'background: white',
        'border-radius: 6px',
        'overflow: hidden',
        'box-shadow: 0 1px 8px rgba(82, 140, 126, 0.06)',
        'border: 1px solid #e8edf0'
      ].join('');

      var img = document.createElement('img');
      img.src = CASE_DATA.imagePath;
      img.alt = '法治路径流程图';
      img.className = 'full-width-img';
      img.style.cssText = 'width:100%;height:auto;display:block;';
      
      img.onerror = function() {
        this.style.display = 'none';
        var fallback = document.createElement('div');
        fallback.style.cssText = 'padding:30px;color:#748a9e;text-align:center;font-size:14px;letter-spacing:0.5px;';
        fallback.innerHTML = '图片加载失败<br><span style="font-size:12px;color:#aab5bf;">请检查 public/images/legalroad.png</span>';
        imgWrapper.appendChild(fallback);
      };

      imgWrapper.appendChild(img);
      imageSection.appendChild(imgWrapper);

      // ============================================================
      // 10. 文字内容 - 淡雅配色
      // ============================================================

      var textSection = document.createElement('div');
      textSection.style.cssText = [
        'padding: 16px 28px 28px',
        'color: #5a6a7a'
      ].join('');

      var timelineHTML = `
        <div style="font-size:15px;font-weight:600;color:#528c7e;margin-bottom:12px;letter-spacing:1px;border-bottom:2px solid #c8b5df;padding-bottom:8px;">法治路径</div>
        ${CASE_DATA.timeline.map((item, idx) => `
          <div class="timeline-item ${idx === CASE_DATA.timeline.length - 1 ? 'completed' : ''}" style="border-left-color: ${idx === CASE_DATA.timeline.length - 1 ? '#bad66e' : '#c8b5df'};">
            <div style="display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;">
              <span style="font-weight:600;color:#528c7e;font-size:14px;letter-spacing:0.5px;">${item.label}</span>
              <span style="font-size:11px;color:#aab5bf;letter-spacing:0.3px;">${item.phase}</span>
            </div>
            <div style="font-size:13px;color:#5a6a7a;margin-top:2px;line-height:1.6;letter-spacing:0.3px;">${item.desc}</div>
          </div>
        `).join('')}
      `;

      var lawsHTML = `
        <div style="margin-top:16px;padding-top:14px;border-top:1px solid #e8edf0;">
          <div style="font-size:13px;font-weight:600;color:#748a9e;margin-bottom:6px;letter-spacing:0.5px;">法律依据</div>
          <div>
            ${CASE_DATA.laws.map(law => `<span class="law-tag">${law}</span>`).join('')}
          </div>
        </div>
      `;

      var quoteHTML = `
        <div style="
          margin-top:16px;
          padding-top:14px;
          border-top:2px solid #c8b5df;
          text-align:center;
          font-size:17px;
          font-weight:600;
          color:#528c7e;
          letter-spacing:2px;
          padding-bottom:4px;
        ">
          ${CASE_DATA.quote}
        </div>
      `;

      textSection.innerHTML = timelineHTML + lawsHTML + quoteHTML;

      // ============================================================
      // 11. 组装
      // ============================================================

      scrollContainer.appendChild(imageSection);
      scrollContainer.appendChild(textSection);

      panel.appendChild(header);
      panel.appendChild(scrollContainer);
      overlay.appendChild(panel);

      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
          closeModal();
        }
      });

      document.body.appendChild(overlay);

      // ============================================================
      // 12. 关闭按钮
      // ============================================================

      var closeBtn = document.getElementById('justice-modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
          e.stopPropagation();
          closeModal();
        });
      }

      var escHandler = function(e) {
        if (e.key === 'Escape') {
          closeModal();
        }
      };
      document.addEventListener('keydown', escHandler);
      overlay._escHandler = escHandler;

      modalInstance = overlay;
    }

    // ============================================================
    // 13. 绑定点击事件
    // ============================================================

    var clickTargets = [entryLayerId, 'justice-entry-inner'];

    clickTargets.forEach(function(targetId) {
      map.on('click', targetId, function(e) {
        openModal();
      });

      map.on('mouseenter', targetId, function(e) {
        map.getCanvas().style.cursor = 'pointer';
      });

      map.on('mouseleave', targetId, function(e) {
        map.getCanvas().style.cursor = '';
      });
    });

    console.log('法治路径图层加载完成');
    resolve();
  });
};

// ============================================================
// 移除图层
// ============================================================

export const removeJusticeLayer = function(map) {
  if (!map) return;

  map.setMinZoom(null);
  map.setMaxZoom(null);

  var layerIds = [
    'justice-qinling-fill',
    'justice-qinling-line',
    'justice-entry-layer',
    'justice-entry-inner',
    'justice-entry-label'
  ];

  var sourceIds = [
    'justice-qinling-source',
    'justice-entry-source'
  ];

  layerIds.forEach(function(id) {
    if (map.getLayer(id)) map.removeLayer(id);
  });

  sourceIds.forEach(function(id) {
    if (map.getSource(id)) map.removeSource(id);
  });

  map.off('click', 'justice-entry-layer');
  map.off('click', 'justice-entry-inner');
  map.off('mouseenter', 'justice-entry-layer');
  map.off('mouseleave', 'justice-entry-layer');

  var modal = document.getElementById('justice-modal');
  if (modal) {
    if (modal._escHandler) {
      document.removeEventListener('keydown', modal._escHandler);
    }
    modal.remove();
  }

  console.log('法治路径图层已移除');
};