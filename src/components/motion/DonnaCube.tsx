import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useRef, useMemo } from "react"
import * as THREE from "three"

function makeFaceTexture(size = 512) {
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#0d0d0d"
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = "#ffffff"
  ctx.font = `bold ${size * 0.62}px Georgia, 'Times New Roman', serif`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText("D", size / 2, size / 2 + size * 0.05)
  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 8
  return tex
}

function Cube() {
  const mesh = useRef<THREE.Mesh>(null)
  const { pointer } = useThree()
  const target = useRef(new THREE.Vector2())

  const materials = useMemo(() => {
    const tex = makeFaceTexture()
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.38,
      metalness: 0.25,
    })
    return [mat, mat, mat, mat, mat, mat]
  }, [])

  useFrame((_, dt) => {
    if (!mesh.current) return
    target.current.x += (pointer.y * 0.5 - target.current.x) * 0.06
    target.current.y += (pointer.x * 0.6 - target.current.y) * 0.06
    mesh.current.rotation.x = target.current.x + Math.sin(performance.now() * 0.0003) * 0.15
    mesh.current.rotation.y += dt * 0.35
  })

  return (
    <mesh ref={mesh} material={materials}>
      <boxGeometry args={[2.4, 2.4, 2.4]} />
    </mesh>
  )
}

export default function DonnaCube() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.5], fov: 35 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[5, 5, 5]} intensity={1.4} />
      <directionalLight position={[-4, -2, -5]} intensity={0.6} color="#2563EB" />
      <directionalLight position={[0, -3, 3]} intensity={0.35} color="#ffffff" />
      <Cube />
    </Canvas>
  )
}
