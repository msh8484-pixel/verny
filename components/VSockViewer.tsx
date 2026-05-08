"use client";

import { useRef, useEffect, useState, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

function SockMesh({ imageSrc, fading }: { imageSrc: string; fading: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(imageSrc);

  // aspect ratio 유지 (이미지 비율 ~0.55 : 1)
  const W = 2.2;
  const H = 3.6;

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += delta * 0.35;
    meshRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.12;
  });

  return (
    <mesh ref={meshRef} rotation={[0, 0.3, 0]}>
      {/* 앞면 */}
      <boxGeometry args={[W, H, 0.04]} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={fading ? 0 : 1}
        roughness={0.35}
        metalness={0.05}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

function Scene({ imageSrc }: { imageSrc: string }) {
  const [current, setCurrent] = useState(imageSrc);
  const [fading, setFading] = useState(false);
  const { gl } = useThree();

  useEffect(() => {
    gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }, [gl]);

  useEffect(() => {
    if (imageSrc === current) return;
    setFading(true);
    const t = setTimeout(() => {
      setCurrent(imageSrc);
      setFading(false);
    }, 220);
    return () => clearTimeout(t);
  }, [imageSrc, current]);

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 5, 4]} intensity={1.8} castShadow />
      <directionalLight position={[-3, -2, -3]} intensity={0.4} color="#C9A84C" />
      <Environment preset="studio" />
      <SockMesh imageSrc={current} fading={fading} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2.8}
        maxPolarAngle={Math.PI / 1.6}
        autoRotate={false}
      />
    </>
  );
}

export default function VSockViewer({ imageSrc }: { imageSrc: string }) {
  return (
    <div style={{ width: "100%", aspectRatio: "3/4", borderRadius: 6, overflow: "hidden", cursor: "grab" }}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 38 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <Suspense fallback={null}>
          <Scene imageSrc={imageSrc} />
        </Suspense>
      </Canvas>
    </div>
  );
}
