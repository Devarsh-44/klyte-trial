"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { FLAVORS, type FlavorId } from "@/lib/data";

/* ------------------------------------------------------------------------ *
 * Fruit that orbits the can, straight out of the brand films:
 * Melon Mode  -> watermelon chunks, half-moon slices, mint leaves
 * Blueberry   -> powdery blueberries, lime wheels
 * On a flavor switch the outgoing set bursts outward and shrinks while the
 * incoming set blooms out from the can. Everything is procedural geometry.
 * ------------------------------------------------------------------------ */

type Kind = "chunk" | "slice" | "mint" | "berry" | "lime";

interface Item {
  kind: Kind;
  angle: number;
  radius: number;
  y: number;
  depth: number;
  speed: number;
  phase: number;
  scale: number;
  axis: THREE.Vector3;
  spin: number;
  /** Non-uniform scale so chunks read as cut fruit, not dice. */
  shape: THREE.Vector3;
}

function rng(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const RECIPES: Record<FlavorId, { kind: Kind; count: number; size: [number, number] }[]> = {
  "melon-mode": [
    { kind: "chunk", count: 6, size: [0.8, 1.2] },
    { kind: "slice", count: 3, size: [0.9, 1.2] },
    { kind: "mint", count: 4, size: [0.9, 1.3] },
  ],
  "blueberry-spirulina": [
    { kind: "berry", count: 12, size: [0.8, 1.35] },
    { kind: "lime", count: 3, size: [0.9, 1.2] },
  ],
};

function buildItems(id: FlavorId): Item[] {
  const r = rng(id.length * 131 + 7);
  const items: Item[] = [];
  RECIPES[id].forEach(({ kind, count, size }) => {
    for (let i = 0; i < count; i++) {
      items.push({
        kind,
        angle: r() * Math.PI * 2,
        radius: 1.35 + r() * 1.05,
        y: (r() - 0.5) * 3.2,
        depth: 0.55 + r() * 0.35,
        speed: (0.05 + r() * 0.08) * (r() > 0.5 ? 1 : -1),
        phase: r() * Math.PI * 2,
        scale: size[0] + r() * (size[1] - size[0]),
        axis: new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize(),
        spin: 0.2 + r() * 0.6,
        shape:
          kind === "chunk"
            ? new THREE.Vector3(0.85 + r() * 0.4, 0.7 + r() * 0.45, 0.75 + r() * 0.35)
            : new THREE.Vector3(1, 1, 1),
      });
    }
  });
  return items;
}

function useMaterials() {
  return useMemo(
    () => ({
      flesh: new THREE.MeshPhysicalMaterial({ color: "#E8475A", roughness: 0.55, clearcoat: 0.6, clearcoatRoughness: 0.4 }),
      rind: new THREE.MeshStandardMaterial({ color: "#2F6B2A", roughness: 0.6 }),
      pith: new THREE.MeshStandardMaterial({ color: "#E9F2D2", roughness: 0.7 }),
      seed: new THREE.MeshStandardMaterial({ color: "#1A1212", roughness: 0.3 }),
      mint: new THREE.MeshStandardMaterial({ color: "#3E8E3A", roughness: 0.5, side: THREE.DoubleSide }),
      berry: new THREE.MeshPhysicalMaterial({
        color: "#2A3768",
        roughness: 0.5,
        sheen: 1,
        sheenColor: new THREE.Color("#A9BCEB"),
        sheenRoughness: 0.55,
      }),
      crown: new THREE.MeshStandardMaterial({ color: "#151B36", roughness: 0.7 }),
      lime: new THREE.MeshPhysicalMaterial({ color: "#C6E06A", roughness: 0.35, transmission: 0, clearcoat: 0.8 }),
      limeRind: new THREE.MeshStandardMaterial({ color: "#4C8A2A", roughness: 0.5 }),
    }),
    [],
  );
}

type Mats = ReturnType<typeof useMaterials>;

function Fruit({ kind, m }: { kind: Kind; m: Mats }) {
  switch (kind) {
    case "chunk":
      return (
        <group>
          <RoundedBox args={[0.3, 0.26, 0.26]} radius={0.07} smoothness={4} material={m.flesh} />
          <mesh position={[0.05, 0.02, 0.128]} rotation={[0, 0, 0.5]} scale={[0.012, 0.024, 0.008]} material={m.seed}>
            <sphereGeometry args={[1, 8, 8]} />
          </mesh>
        </group>
      );
    case "slice":
      return (
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={m.flesh}>
            <cylinderGeometry args={[0.3, 0.3, 0.07, 28, 1, false, 0, Math.PI]} />
          </mesh>
          <mesh material={m.pith}>
            <cylinderGeometry args={[0.325, 0.325, 0.062, 28, 1, false, 0, Math.PI]} />
          </mesh>
          <mesh material={m.rind}>
            <cylinderGeometry args={[0.35, 0.35, 0.056, 28, 1, false, 0, Math.PI]} />
          </mesh>
        </group>
      );
    case "mint":
      return (
        <mesh scale={[0.15, 0.012, 0.075]} rotation={[0.4, 0, 0.3]} material={m.mint}>
          <sphereGeometry args={[1, 16, 10]} />
        </mesh>
      );
    case "berry":
      return (
        <group>
          <mesh material={m.berry}>
            <sphereGeometry args={[0.11, 20, 16]} />
          </mesh>
          <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} material={m.crown}>
            <torusGeometry args={[0.028, 0.012, 6, 10]} />
          </mesh>
        </group>
      );
    case "lime":
      return (
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh material={m.lime}>
            <cylinderGeometry args={[0.17, 0.17, 0.04, 28]} />
          </mesh>
          <mesh material={m.limeRind}>
            <cylinderGeometry args={[0.19, 0.19, 0.034, 28]} />
          </mesh>
        </group>
      );
  }
}

interface FruitFieldProps {
  flavorId: FlavorId;
  reduce: boolean;
  interactive: boolean;
}

export function FruitField({ flavorId, reduce, interactive }: FruitFieldProps) {
  const m = useMaterials();
  const { viewport } = useThree();
  const sets = useMemo(() => FLAVORS.map((f) => ({ id: f.id, items: buildItems(f.id) })), []);
  const root = useRef<THREE.Group>(null);
  const itemRefs = useRef<Record<string, (THREE.Group | null)[]>>({});
  const presence = useRef<Record<string, number>>(
    Object.fromEntries(FLAVORS.map((f) => [f.id, f.id === flavorId ? 1 : 0])),
  );
  const time = useRef(0);

  // Keep the field inside narrow canvases (lineup column) and roomy in the hero.
  const k = THREE.MathUtils.clamp(viewport.width / 2 / 2.4, 0.55, 1);

  useFrame((state, dt) => {
    const d = Math.min(dt, 1 / 10);
    if (!reduce) time.current += d;
    const t = time.current;

    if (root.current) {
      const px = interactive && !reduce ? state.pointer.x : 0;
      const py = interactive && !reduce ? state.pointer.y : 0;
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, px * 0.35, 3, d);
      root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, -py * 0.18, 3, d);
    }

    sets.forEach(({ id, items }) => {
      const target = id === flavorId ? 1 : 0;
      const p = THREE.MathUtils.damp(presence.current[id], target, reduce ? 20 : 2.6, d);
      presence.current[id] = p;
      // Entering: bloom out from the can. Leaving: burst past the frame.
      const spread = target === 1 ? THREE.MathUtils.lerp(0.25, 1, p) : THREE.MathUtils.lerp(2.2, 1, p);

      items.forEach((it, i) => {
        const g = itemRefs.current[id]?.[i];
        if (!g) return;
        g.visible = p > 0.01;
        if (!g.visible) return;
        const a = it.angle + t * it.speed;
        const r = it.radius * spread * k;
        g.position.set(
          Math.cos(a) * r,
          it.y * k * (0.6 + 0.4 * spread) + Math.sin(t * 0.8 + it.phase) * 0.08,
          Math.sin(a) * r * it.depth - 0.2,
        );
        g.rotateOnAxis(it.axis, it.spin * d * (target === 1 ? 1 : 4));
        const sc = it.scale * k * Math.max(p, 0.0001);
        g.scale.set(sc * it.shape.x, sc * it.shape.y, sc * it.shape.z);
      });
    });
  });

  return (
    <group ref={root}>
      {sets.map(({ id, items }) => (
        <group key={id}>
          {items.map((it, i) => (
            <group
              key={i}
              ref={(el) => {
                (itemRefs.current[id] ??= [])[i] = el;
              }}
            >
              <Fruit kind={it.kind} m={m} />
            </group>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Carbonation: small bubbles rising around the can, one instanced draw call. */
export function Fizz({ count = 46, reduce }: { count?: number; reduce: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(() => {
    const r = rng(99);
    return Array.from({ length: count }, () => ({
      x: (r() - 0.5) * 2.2,
      z: (r() - 0.5) * 1.6,
      y: r() * 4 - 2,
      s: 0.012 + Math.pow(r(), 2) * 0.035,
      v: 0.25 + r() * 0.5,
      w: r() * Math.PI * 2,
    }));
  }, [count]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    const d = Math.min(dt, 1 / 10);
    seeds.forEach((b, i) => {
      if (!reduce) {
        b.y += b.v * d;
        if (b.y > 2.2) b.y = -2.2;
      }
      dummy.position.set(b.x + Math.sin(state.clock.elapsedTime * 1.5 + b.w) * 0.04, b.y, b.z);
      dummy.scale.setScalar(b.s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 10, 8]} />
      <meshPhysicalMaterial color="#ffffff" transparent opacity={0.45} roughness={0.05} clearcoat={1} />
    </instancedMesh>
  );
}
