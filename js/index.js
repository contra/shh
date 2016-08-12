// play the song
var audio = document.createElement('video')
audio.loop = true
audio.autoplay = true
audio.src = 'res/song.mp3'
audio.play()

// set the stage
var camera = new THREE.PerspectiveCamera(55, 1080/ 720, 20, 3000)
camera.position.z = 1000

var scene = new THREE.Scene()

// make video
var video = document.createElement('video')
video.loop = true
video.muted = true
video.src = 'res/fits.mp4'
video.play()

// make texture
var videoTexture = new THREE.Texture(video)
videoTexture.minFilter = THREE.LinearFilter
videoTexture.magFilter = THREE.LinearFilter

var videoMaterial = new THREE.MeshBasicMaterial({
	map: videoTexture
})

// add plane
var planeGeometry = new THREE.PlaneGeometry(1080, 720, 1, 1)
var plane = new THREE.Mesh(planeGeometry, videoMaterial)
scene.add(plane)
plane.z = 0
plane.scale.x = plane.scale.y = 1.45

// init
var renderer = new THREE.WebGLRenderer()
renderer.setSize(80, 600)
document.body.appendChild(renderer.domElement)

// create shader passes
var shaderTime = 0
var renderPass = new THREE.RenderPass(scene, camera)
var badTVPass = new THREE.ShaderPass(THREE.BadTVShader)
var rgbPass = new THREE.ShaderPass(THREE.RGBShiftShader)
var filmPass = new THREE.ShaderPass(THREE.FilmShader)
var staticPass = new THREE.ShaderPass(THREE.StaticShader)
var copyPass = new THREE.ShaderPass(THREE.CopyShader)

// set up shader pass params
badTVPass.uniforms.distortion.value = 3.0
badTVPass.uniforms.distortion2.value = 0.5
badTVPass.uniforms.speed.value = 0.01
badTVPass.uniforms.rollSpeed.value = 0.03

staticPass.uniforms.amount.value = 0.1
staticPass.uniforms.size.value = 4.0

rgbPass.uniforms.amount.value = 0.04
rgbPass.uniforms.angle.value = 2.0

filmPass.uniforms.sCount.value = 800
filmPass.uniforms.sIntensity.value = 0.9
filmPass.uniforms.nIntensity.value = 0.4
filmPass.uniforms.grayscale.value = 0

// create composer
var composer = new THREE.EffectComposer(renderer)
composer.addPass(renderPass)
composer.addPass(filmPass)
composer.addPass(badTVPass)
composer.addPass(rgbPass)
composer.addPass(staticPass)
composer.addPass(copyPass)
copyPass.renderToScreen = true

// set the sizing and listen for changes
window.addEventListener('resize', onResize, false)
onResize()
animate()

function animate() {
	shaderTime += 0.1

	badTVPass.uniforms.time.value = shaderTime
	filmPass.uniforms.time.value = shaderTime
	staticPass.uniforms.time.value = shaderTime

	if (videoTexture && video.readyState === video.HAVE_ENOUGH_DATA) {
		videoTexture.needsUpdate = true
	}

	requestAnimationFrame(animate)
  composer.render(0.1)
}

function onResize() {
	renderer.setSize(window.innerWidth, window.innerHeight)
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
}
