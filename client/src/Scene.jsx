
import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import * as THREE from 'three';
import { CITIES } from './api.js';

// Pakistan outline coordinates (Longitude, Latitude)
const OUTLINE = [
  [71.5, 36.9],
  [74.5, 37.0],
  [77.8, 35.5],
  [75.9, 34.6],
  [74.3, 34.8],
  [73.8, 34.3],
  [74.3, 33.0],
  [75.3, 32.4],
  [74.6, 31.0],
  [73.9, 30.2],
  [71.9, 29.0],
  [70.5, 28.0],
  [70.1, 26.5],
  [71.1, 24.4],
  [68.2, 23.7],
  [67.4, 24.8],
  [66.7, 25.4],
  [63.5, 25.3],
  [61.6, 25.2],
  [61.6, 26.3],
  [62.8, 27.2],
  [62.8, 29.4],
  [66.2, 29.8],
  [66.4, 31.0],
  [68.0, 31.7],
  [69.3, 31.9],
  [69.5, 33.0],
  [70.3, 33.9],
  [71.1, 34.1],
  [71.3, 35.5]
];

const SCALE = 0.38;

const project = ([lon, lat]) => [
  (lon - 69) * SCALE,
  (lat - 30.5) * SCALE
];

const COLORS = {
  pending: '#ffb020',
  verified: '#3da9fc',
  pledged: '#2cb67d',
  delivered: '#2cb67d',
  alert: '#ff3333'
};

// ---------------- 3D PAKISTAN MAP ----------------

function Land() {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();

    OUTLINE.map(project).forEach(([x, y], index) => {
      if (index === 0) {
        shape.moveTo(x, y);
      } else {
        shape.lineTo(x, y);
      }
    });

    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.32,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.035,
      bevelThickness: 0.04,
      curveSegments: 12
    });

    geo.computeBoundingBox();

    const box = geo.boundingBox;

    // Center map geometry
    geo.translate(
      -(box.max.x + box.min.x) / 2,
      -(box.max.y + box.min.y) / 2,
      0
    );

    return geo;
  }, []);

  return (
    <group>
      {/* Main Pakistan shape */}
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#1265a3"
          roughness={0.4}
          metalness={0.35}
        />

        <Edges color="#7deaff" />
      </mesh>

      {/* Soft ground underneath */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.08, 0]}
      >
        <planeGeometry args={[8, 7]} />

        <meshBasicMaterial
          color="#092b42"
          transparent
          opacity={0.15}
        />
      </mesh>
    </group>
  );
}

// ---------------- CITY PIN ----------------

function Pin({
  city,
  color,
  size = 1,
  pulse = false,
  onPick
}) {
  const ring = useRef();

  const coordinates = CITIES?.[city];

  if (
    !Array.isArray(coordinates) ||
    coordinates.length < 2 ||
    !coordinates.every(Number.isFinite)
  ) {
    return null;
  }

  const [lon, lat] = coordinates;
  const [x, y] = project([lon, lat]);

  useFrame(({ clock }) => {
    if (ring.current && pulse) {
      const t = (clock.elapsedTime % 1.6) / 1.6;

      ring.current.scale.setScalar(1 + t * 2.5);
      ring.current.material.opacity = 0.7 * (1 - t);
    }
  });

  return (
    <group
      position={[x, 0.5, -y]}
      onClick={(event) => {
        event.stopPropagation();
        onPick?.(city);
      }}
    >
      {/* Glowing city point */}
      <mesh position={[0, 0.18 * size, 0]}>
        <sphereGeometry args={[0.09 * size, 24, 24]} />

        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.4}
        />
      </mesh>

      {/* Pin stem */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry
          args={[0.012, 0.012, 0.2 * size, 12]}
        />

        <meshStandardMaterial color={color} />
      </mesh>

      {/* Alert pulse ring */}
      {pulse && (
        <mesh
          ref={ring}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.01, 0]}
        >
          <ringGeometry args={[0.1, 0.14, 40]} />

          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
}

// ---------------- MAP SCENE ----------------

function MapContent({ needs, alertCities, onPick }) {
  const byCity = {};

  needs.forEach((need) => {
    if (!need.city || !CITIES?.[need.city]) return;

    const priority = [
      'pending',
      'verified',
      'pledged',
      'delivered'
    ];

    const current = byCity[need.city];

    if (
      !current ||
      priority.indexOf(need.status) <
      priority.indexOf(current.status)
    ) {
      byCity[need.city] = need;
    }
  });

  const validAlerts = [
    ...new Set(alertCities)
  ].filter((city) => CITIES?.[city]);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={1.1} />

      <directionalLight
        position={[5, 10, 5]}
        intensity={2}
      />

      <pointLight
        position={[0, 5, 0]}
        intensity={1.5}
        color="#39c8ff"
      />

      {/* Pakistan map */}
      <group position={[0, 0, 0]}>
        <Land />

        {/* Needs pins */}
        {Object.entries(byCity).map(([city, need]) => (
          <Pin
            key={city}
            city={city}
            color={COLORS[need.status] || '#ffb020'}
            size={Math.min(
              2.2,
              0.8 + (Number(need.families) || 0) / 60
            )}
            onPick={onPick}
          />
        ))}

        {/* Flood alert pins */}
        {validAlerts.map((city) => (
          <Pin
            key={`alert-${city}`}
            city={city}
            color={COLORS.alert}
            size={2.4}
            pulse
            onPick={onPick}
          />
        ))}
      </group>

      {/* Interactive controls */}
      <OrbitControls
        enableZoom={true}
        enablePan={false}
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.45}
        minDistance={10}
        maxDistance={22}
        minPolarAngle={0.45}
        maxPolarAngle={1.45}
      />
    </>
  );
}

// ---------------- RESPONSIVE CANVAS ----------------

export default function Scene({
  needs = [],
  alertCities = [],
  onPick
}) {
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;

  return (
    <Canvas
      camera={{
        position: [0, 11, 15],
        fov: 48,
        near: 0.1,
        far: 100
      }}
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 0, 0);
      }}
      style={{
        width: '100%',
        height: '100%',
        display: 'block'
      }}
      aria-label="Interactive 3D map of Pakistan"
    >
      <MapContent
        needs={needs}
        alertCities={alertCities}
        onPick={onPick}
      />

      {!reducedMotion && (
        <OrbitControls
          enabled={false}
        />
      )}
    </Canvas>
  );
}
