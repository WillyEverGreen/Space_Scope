import { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Float, Html, Stars } from "@react-three/drei";
import * as THREE from "three";

// NASA Blue Marble Earth textures (public domain, served via unpkg CDN)
const EARTH_TEXTURE =
  "https://unpkg.com/three-globe@2.41.12/example/img/earth-blue-marble.jpg";
const EARTH_BUMP =
  "https://unpkg.com/three-globe@2.41.12/example/img/earth-topology.png";
const EARTH_SPECULAR =
  "https://unpkg.com/three-globe@2.41.12/example/img/earth-water.png";

const EarthModel = () => {
  const earthRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const [earthMap, bumpMap, specularMap] = useLoader(THREE.TextureLoader, [
    EARTH_TEXTURE,
    EARTH_BUMP,
    EARTH_SPECULAR,
  ]);

  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <group>
      {/* Earth sphere with real NASA textures */}
      <mesh ref={earthRef} castShadow receiveShadow>
        <sphereGeometry args={[8, 128, 128]} />
        <meshStandardMaterial
          map={earthMap}
          bumpMap={bumpMap}
          bumpScale={0.04}
          roughnessMap={specularMap}
          roughness={0.85}
          metalness={0.15}
          envMapIntensity={0.5}
        />
      </mesh>

      {/* Inner atmospheric glow */}
      <mesh scale={1.012}>
        <sphereGeometry args={[8, 64, 64]} />
        <meshBasicMaterial
          color="#a8d8f5"
          transparent
          opacity={0.05}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>

      {/* Atmospheric glow - middle layer */}
      <mesh ref={glowRef} scale={1.02}>
        <sphereGeometry args={[8, 64, 64]} />
        <meshPhongMaterial
          color="#6db8f2"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          depthWrite={false}
          emissive={new THREE.Color("#4a9fd9")}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Atmospheric rim light - outer */}
      <mesh ref={atmosphereRef} scale={1.035}>
        <sphereGeometry args={[8, 64, 64]} />
        <meshPhongMaterial
          color="#88c5f5"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
          emissive={new THREE.Color("#5eb0e8")}
          emissiveIntensity={0.15}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

const MoonModel = () => {
  const moonRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * 0.25;
    if (orbitRef.current) {
      orbitRef.current.rotation.y = time;
    }
    if (moonRef.current) {
      moonRef.current.rotation.y += 0.003;
    }
  });

  // Orbit ring
  const orbitRingGeometry = useMemo(() => {
    return new THREE.RingGeometry(13.8, 14, 128);
  }, []);

  return (
    <>
      {/* Subtle orbit path ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <primitive object={orbitRingGeometry} attach="geometry" />
        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Moon orbit group */}
      <group ref={orbitRef}>
        <mesh ref={moonRef} position={[14, 0, 0]}>
          <sphereGeometry args={[1.2, 48, 48]} />
          <meshPhongMaterial
            color="#d4d4d4"
            emissive="#3a3a3a"
            emissiveIntensity={0.2}
            shininess={2}
          />
        </mesh>
      </group>
    </>
  );
};

const Loader = () => (
  <Html center>
    <div
      style={{ color: "#6366f1", fontSize: "14px", fontWeight: 500 }}
      className="animate-pulse"
    >
      Loading Earth...
    </div>
  </Html>
);

const Earth = () => {
  return (
    <div className="relative w-[400px] h-[400px] md:w-[550px] md:h-[550px] lg:w-[650px] lg:h-[650px] flex items-center justify-center">
      <Canvas
        className="w-full h-full block"
        camera={{ position: [0, 0, 28], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={<Loader />}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[12, 5, 8]}
            intensity={3}
            color="#ffffff"
            castShadow
          />
          <hemisphereLight args={["#ffffff", "#4a90d9", 0.5]} />
          <pointLight position={[-10, 0, -8]} intensity={0.5} color="#5a8fbd" />

          <Float speed={0.8} rotationIntensity={0.15} floatIntensity={0.3}>
            <EarthModel />
            <MoonModel />
          </Float>

          {/* Background stars */}
          <Stars
            radius={100}
            depth={50}
            count={2000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Earth;
