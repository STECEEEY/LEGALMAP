// src/utils/geocoder.js
// 🔥 请替换为你的高德 Web 服务 API Key
const AMAP_KEY = '4d95a8667039c3e5bb3ddb03ce1c71b8'

export const geocodeAddress = async (address) => {
  const url = `https://restapi.amap.com/v3/geocode/geo?address=${encodeURIComponent(address)}&key=${AMAP_KEY}&output=JSON`
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.status === '1' && data.geocodes && data.geocodes.length > 0) {
      const location = data.geocodes[0].location.split(',')
      return {
        lng: parseFloat(location[0]),
        lat: parseFloat(location[1]),
        formattedAddress: data.geocodes[0].formatted_address
      }
    } else {
      console.warn(`地址解析失败: ${address}`, data.info)
      return null
    }
  } catch (error) {
    console.error(`地理编码请求失败: ${address}`, error)
    return null
  }
}

export const batchGeocode = async (dataList, delay = 300) => {
  console.log(`📍 开始批量地理编码，共 ${dataList.length} 条`)
  const results = []
  
  for (const item of dataList) {
    const geoData = await geocodeAddress(item.address)
    results.push({
      ...item,
      lng: geoData?.lng || null,
      lat: geoData?.lat || null,
      formattedAddress: geoData?.formattedAddress || null
    })
    await new Promise(resolve => setTimeout(resolve, delay))
  }
  
  const successCount = results.filter(r => r.lng !== null).length
  console.log(`✅ 地理编码完成: ${successCount}/${results.length} 成功`)
  return results
}