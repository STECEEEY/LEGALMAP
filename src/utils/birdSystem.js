// src/utils/birdSystem.js
import * as THREE from 'three'

export class BirdSystem {
  constructor(map) {
    this.map = map
    this.scene = null
    this.camera = null
    this.renderer = null
    this.birds = []
    this.isRunning = false
    this.animationFrame = null
    this.time = 0
    
    this.targetX = 0.5
    this.targetY = 0.5
    
    this.birdCount = 15
    this.followSpeed = 0.04
  }

  initialize() {
    console.log('🐦 ===== 飞鸟系统初始化 =====')
    
    if (!this.map) {
      console.error('❌ map 不存在')
      return
    }

    const container = this.map.getContainer()
    
    this.scene = new THREE.Scene()
    this.scene.background = null
    
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    this.camera.position.z = 1
    
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    })
    this.renderer.setSize(container.clientWidth, container.clientHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.top = '0'
    this.renderer.domElement.style.left = '0'
    this.renderer.domElement.style.pointerEvents = 'none'
    this.renderer.domElement.style.zIndex = '20'
    container.appendChild(this.renderer.domElement)

    // 🔥 加载视频纹理
    this.videoTexture = this.createVideoTexture()
    
    // 等待视频加载完成后创建鸟群
    this.videoTexture.image.addEventListener('loadeddata', () => {
      console.log('✅ 视频加载完成，开始创建鸟群')
      this.createFlock()
    })
    
    // 如果视频已经加载完成，直接创建
    if (this.videoTexture.image.readyState >= 2) {
      this.createFlock()
    }

    window.addEventListener('resize', () => this.resize())
    
    this.isRunning = true
    this.animate()
    
    console.log('🐦 ===== 飞鸟系统初始化完成 =====')
  }

  // ========== 🔥 创建视频纹理 ==========
  createVideoTexture() {
    // 创建 video 元素
    const video = document.createElement('video')
    video.src = '/videos/bird.mp4'
    video.muted = true
    video.loop = true
    video.autoplay = true
    video.playsInline = true
    video.play()
    
    const texture = new THREE.VideoTexture(video)
    texture.needsUpdate = true
    console.log('✅ 视频纹理加载成功')
    return texture
  }

  // ========== 创建鸟群 ==========
  createFlock() {
    const texture = this.videoTexture
    
    for (let i = 0; i < this.birdCount; i++) {
      const x = Math.random() * 2 - 1
      const y = Math.random() * 2 - 1
      
      // 不同鸟大小不同
      const baseSize = 0.06 + Math.random() * 0.1
      
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9 + Math.random() * 0.1,
        color: 0xffffff
      })
      
      const sprite = new THREE.Sprite(material)
      sprite.position.set(x, y, 0)
      sprite.scale.set(baseSize, baseSize, 1)
      
      sprite.userData = {
        targetX: x,
        targetY: y,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.4,
        baseSize: baseSize,
        flapPhase: Math.random() * Math.PI * 2
      }
      
      this.scene.add(sprite)
      this.birds.push(sprite)
      
      // ===== 倒影 =====
      const reflectionMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.15 + Math.random() * 0.1,
        color: 0x888888
      })
      
      const reflection = new THREE.Sprite(reflectionMaterial)
      reflection.position.set(x, y - baseSize * 3, -0.01)
      reflection.scale.set(baseSize * 1.2, baseSize * 0.25, 1)
      reflection.userData.parent = sprite
      
      this.scene.add(reflection)
    }
    
    console.log(`✅ 创建了 ${this.birds.length} 只动画小鸟`)
  }

  // ========== 更新目标位置 ==========
  updateTarget(x, y) {
    this.targetX = x * 2 - 1
    this.targetY = -(y * 2 - 1)
  }

  // ========== 动画循环 ==========
  animate() {
    if (!this.isRunning) return
    
    this.time += 0.02
    
    // 🔥 更新视频纹理（关键！）
    if (this.videoTexture) {
      this.videoTexture.needsUpdate = true
    }
    
    this.birds.forEach((bird) => {
      const ud = bird.userData
      
      const offsetX = Math.sin(this.time * ud.speed + ud.phase) * 0.2
      const offsetY = Math.cos(this.time * ud.speed * 0.7 + ud.phase * 1.3) * 0.15
      
      const targetX = this.targetX + offsetX
      const targetY = this.targetY + offsetY
      
      ud.targetX += (targetX - ud.targetX) * this.followSpeed
      ud.targetY += (targetY - ud.targetY) * this.followSpeed
      
      bird.position.x += (ud.targetX - bird.position.x) * 0.08
      bird.position.y += (ud.targetY - bird.position.y) * 0.08
      
      // 大小轻微脉动（模拟远近）
      const pulse = 1 + Math.sin(this.time * 2 + ud.flapPhase) * 0.05
      const currentSize = ud.baseSize * pulse
      bird.scale.x = currentSize
      bird.scale.y = currentSize
      
      // 倒影
      const reflections = this.scene.children.filter(
        child => child.isSprite && child.userData.parent === bird
      )
      reflections.forEach(ref => {
        ref.position.x = bird.position.x
        ref.position.y = bird.position.y - ud.baseSize * 3
        const refSize = currentSize * 1.2
        ref.scale.x = refSize
        ref.scale.y = refSize * 0.25
      })
    })
    
    this.renderer.render(this.scene, this.camera)
    this.animationFrame = requestAnimationFrame(() => this.animate())
  }

  resize() {
    if (!this.map) return
    const container = this.map.getContainer()
    this.renderer.setSize(container.clientWidth, container.clientHeight)
  }

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
    if (this.videoTexture) {
      this.videoTexture.image.pause()
      this.videoTexture.image.src = ''
      this.videoTexture = null
    }
    console.log('🐦 飞鸟系统已停止')
  }
}
