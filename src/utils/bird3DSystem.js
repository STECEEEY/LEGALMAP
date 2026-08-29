// src/utils/bird3DSystem.js
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

export class Bird3DSystem {
  constructor(map) {
    this.map = map
    this.scene = null
    this.camera = null
    this.renderer = null
    this.mixer = null
    this.birdModel = null
    this.ground = null
    this.isRunning = false
    this.animationFrame = null
    this.time = 0
    
    // 鼠标/手势位置
    this.targetX = 0.5
    this.targetY = 0.5
    
    // 鸟的当前位置（3D空间）
    this.birdPos = { x: 0, y: 0, z: 0 }
  }

  initialize() {
    console.log('🐦 ===== 3D飞鸟系统初始化 =====')
    
    if (!this.map) {
      console.error('❌ map 不存在')
      return
    }

    const container = this.map.getContainer()
    
    // ========== 场景 ==========
    this.scene = new THREE.Scene()
    this.scene.background = null
    
    // ========== 相机（透视相机，3D效果） ==========
    const aspect = container.clientWidth / container.clientHeight
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000)
    this.camera.position.set(0, 3, 6)
    this.camera.lookAt(0, 0, 0)
    
    // ========== 渲染器（开启阴影） ==========
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.top = '0'
    this.renderer.domElement.style.left = '0'
    this.renderer.domElement.style.pointerEvents = 'none'
    this.renderer.domElement.style.zIndex = '20'
    container.appendChild(this.renderer.domElement)

    // ========== 灯光 ==========
    // 主光源（投射阴影）
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2)
    dirLight.position.set(5, 10, 7)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 1024
    dirLight.shadow.mapSize.height = 1024
    dirLight.shadow.camera.near = 0.5
    dirLight.shadow.camera.far = 20
    dirLight.shadow.camera.left = -5
    dirLight.shadow.camera.right = 5
    dirLight.shadow.camera.top = 5
    dirLight.shadow.camera.bottom = -5
    this.scene.add(dirLight)

    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    this.scene.add(ambientLight)

    // 补光
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
    fillLight.position.set(-3, 2, -5)
    this.scene.add(fillLight)

    // ========== 地面（接收阴影） ==========
    // 用圆形透明平面，只接收阴影
    const groundGeometry = new THREE.CircleGeometry(2, 32)
    const groundMaterial = new THREE.ShadowMaterial({
      opacity: 0.3,
      color: 0x000000
    })
    this.ground = new THREE.Mesh(groundGeometry, groundMaterial)
    this.ground.rotation.x = -Math.PI / 2
    this.ground.position.y = -1
    this.ground.receiveShadow = true
    this.scene.add(this.ground)

    // ========== 加载3D鸟模型 ==========
    this.loadBirdModel()

    window.addEventListener('resize', () => this.resize())
    
    this.isRunning = true
    this.animate()
    
    console.log('🐦 ===== 3D飞鸟系统初始化完成 =====')
  }

  // ========== 加载鸟模型 ==========
  loadBirdModel() {
    const loader = new GLTFLoader()
    
    // 显示加载状态
    console.log('📦 加载鸟模型...')
    
    loader.load(
      '/models/bird.glb',
      (gltf) => {
        console.log('✅ 鸟模型加载成功')
        
        this.birdModel = gltf.scene
        
        // 让所有网格投射阴影
        this.birdModel.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true
            node.receiveShadow = true
            // 如果材质需要响应光照，确保是 Standard 或 Phong
            if (node.material) {
              node.material.roughness = 0.7
              node.material.metalness = 0.1
            }
          }
        })
        
        // 初始位置
        this.birdModel.position.set(0, 0.5, 0)
        this.birdModel.scale.set(0.5, 0.5, 0.5)
        
        this.scene.add(this.birdModel)
        
        // 播放动画
        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.birdModel)
          const action = this.mixer.clipAction(gltf.animations[0])
          action.play()
          console.log('🎬 鸟动画已播放')
        } else {
          console.warn('⚠️ 模型没有动画')
        }
        
        console.log('✅ 3D鸟加载完成')
      },
      (progress) => {
        // 加载进度
        const percent = (progress.loaded / progress.total * 100).toFixed(0)
        console.log(`📦 加载中: ${percent}%`)
      },
      (error) => {
        console.error('❌ 鸟模型加载失败:', error)
      }
    )
  }

  // ========== 更新目标位置 ==========
  updateTarget(x, y) {
    this.targetX = x
    this.targetY = y
  }

  // ========== 动画循环 ==========
  animate() {
    if (!this.isRunning) return
    
    this.time += 0.02
    
    // 更新鸟的位置（在屏幕空间中跟随鼠标）
    if (this.birdModel) {
      // 把屏幕坐标映射到3D空间
      // x: 0-1 → -2 到 2
      // y: 0-1 → -1.5 到 1.5 (因为屏幕是横向的)
      const targetX3D = (this.targetX - 0.5) * 4
      const targetY3D = -(this.targetY - 0.5) * 2.5
      
      // 平滑跟随
      this.birdPos.x += (targetX3D - this.birdPos.x) * 0.05
      this.birdPos.y += (targetY3D - this.birdPos.y) * 0.05
      
      // 添加盘旋偏移
      const hoverX = Math.sin(this.time * 0.5) * 0.3
      const hoverY = Math.cos(this.time * 0.7) * 0.15
      const hoverZ = Math.sin(this.time * 0.3) * 0.2
      
      this.birdModel.position.x = this.birdPos.x + hoverX
      this.birdModel.position.y = this.birdPos.y + 0.5 + hoverY
      this.birdModel.position.z = hoverZ
      
      // 让鸟朝向运动方向
      this.birdModel.rotation.y = Math.atan2(
        this.birdPos.x - this.birdModel.position.x,
        hoverZ - this.birdModel.position.z
      ) * 0.5
      
      // 轻微倾斜（模拟转弯）
      this.birdModel.rotation.z = -this.birdPos.x * 0.1
    }
    
    // 更新动画混合器
    if (this.mixer) {
      this.mixer.update(0.02)
    }
    
    // 更新相机（跟随鸟的Y轴，保持视角）
    this.camera.position.x = this.birdPos.x * 0.3
    this.camera.lookAt(this.birdPos.x * 0.2, 0.2, 0)
    
    this.renderer.render(this.scene, this.camera)
    this.animationFrame = requestAnimationFrame(() => this.animate())
  }

  // ========== 窗口大小变化 ==========
  resize() {
    if (!this.map) return
    const container = this.map.getContainer()
    const aspect = container.clientWidth / container.clientHeight
    this.camera.aspect = aspect
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(container.clientWidth, container.clientHeight)
  }

  // ========== 停止 ==========
  stop() {
    this.isRunning = false
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
    if (this.renderer) {
      this.renderer.domElement.remove()
      this.renderer = null
    }
    console.log('🐦 3D飞鸟系统已停止')
  }
}
