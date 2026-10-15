"use client";

import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Lightformer, Sparkles } from "@react-three/drei";
import {
  useInView,
} from "framer-motion";
import { FLAVORS, FLAVOR_BY_ID, type FlavorId } from "@/lib/data";
import { useMediaQuery } from "@/lib/use-media-query";
import { createLabelTexture, paintLabel } from "./label-texture";
import { FruitField, Fizz } from "./fruit-field";

/* ------------------------------------------------------------------------ *
 * Procedural 250 ml slim can.
 * Metal shell = lathe profile; printed wrap = open cylinder sitting 0.004
 * outside the shell so it never z-fights. No external model or HDR files:
 * the whole stage renders offline.
 * ------------------------------------------------------------------------ */

const R = 0.55; // body radius
const BODY_BOTTOM = -1.42;
const BODY_TOP = 1.3;

function useCanProfile() {
  return useMemo(() => {
    const p: [number, number][] = [
      [0.0, -1.5],
      [0.34, -1.47], // bottom dome
      [0.44, -1.52],
      [0.5, -1.52], // standing ring
      [0.545, -1.47],
      [R, BODY_BOTTOM],
      [R, BODY_TOP],
      [0.52, 1.42], // shoulder
      [0.47, 1.5],
      [0.468, 1.555], // neck
      [0.49, 1.58], // seam lip
      [0.47, 1.6],
      [0.43, 1.57], // lid recess
      [0.0, 1.55],
    ];
    return p.map(([x, y]) => new THREE.Vector2(x, y));
  }, []);
}

function useLabelTextures() {
  const [ready, setReady] = useState(0);
  const textures = useMemo(() => {
    if (typeof document === "undefined") return null;
    return Object.fromEntries(FLAVORS.map((f) => [f.id, createLabelTexture(f)])) as Record<
      FlavorId,
      ReturnType<typeof createLabelTexture>
    >;
  }, []);

  // Fonts arrive after first paint; repaint once they are ready so the wrap
  // never ships with fallback type.
  useEffect(() => {
    if (!textures) return;
    let cancelled = false;
    Promise.all([
      document.fonts.load('400 120px "Anton"'),
      document.fonts.load('400 120px "Titan One"'),
      document.fonts.ready,
    ]).then(() => {
      if (cancelled) return;
      FLAVORS.forEach((f) => {
        paintLabel(textures[f.id].canvas, f);
        textures[f.id].tex.needsUpdate = true;
      });
      setReady((r) => r + 1);
    });
    return () => {
      cancelled = true;
      FLAVORS.forEach((f) => textures[f.id].tex.dispose());
    };
  }, [textures]);

  return { textures, ready };
}

interface CanProps {
  flavorId: FlavorId;
  interactive?: boolean;
  reduceMotion?: boolean;
}

function Can({ flavorId, interactive = true, reduceMotion = false }: CanProps) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const labelMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const profile = useCanProfile();
  const { textures } = useLabelTextures();

  // Spin target: each flavor switch adds one full turn; the label map swaps
  // at the fastest point of the turn so the change reads as a reveal.
  const target = useRef({ rot: 0, swapAt: Number.POSITIVE_INFINITY, pending: flavorId as FlavorId });
  const shown = useRef<FlavorId>(flavorId);
  const scaleKick = useRef(0);

  useEffect(() => {
    if (flavorId === shown.current) {
      // Switched back before a pending swap landed: cancel it.
      target.current.swapAt = Number.POSITIVE_INFINITY;
      target.current.pending = flavorId;
      return;
    }
    if (reduceMotion || !spin.current) {
      shown.current = flavorId;
      if (labelMat.current && textures) {
        labelMat.current.map = textures[flavorId].tex;
        labelMat.current.needsUpdate = true;
      }
      return;
    }
    target.current.rot += Math.PI * 2;
    target.current.swapAt = spin.current.rotation.y + Math.PI * 0.9;
    target.current.pending = flavorId;
    scaleKick.current = 1;
  }, [flavorId, reduceMotion, textures]);

  useFrame((state, dt) => {
    const d = Math.min(dt, 1 / 10);
    if (!spin.current || !group.current) return;

    // Idle drift is added to the target so a flavor turn always lands facing front.
    if (!reduceMotion) target.current.rot += d * 0.18;
    spin.current.rotation.y = THREE.MathUtils.damp(spin.current.rotation.y, target.current.rot, 3.2, d);

    if (spin.current.rotation.y >= target.current.swapAt && labelMat.current && textures) {
      shown.current = target.current.pending;
      labelMat.current.map = textures[shown.current].tex;
      labelMat.current.needsUpdate = true;
      target.current.swapAt = Number.POSITIVE_INFINITY;
    }

    // Pointer tilt, spring-damped (decorative, so it is allowed to lag).
    const px = interactive && !reduceMotion ? state.pointer.x : 0;
    const py = interactive && !reduceMotion ? state.pointer.y : 0;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -py * 0.25, 4, d);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, -0.18 - px * 0.18, 4, d);
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, px * 0.15, 4, d);

    scaleKick.current = THREE.MathUtils.damp(scaleKick.current, 0, 5, d);
    const s = 1 - Math.sin(scaleKick.current * Math.PI) * 0.06;
    group.current.scale.setScalar(s);
  });

  if (!textures) return null;

  return (
    <group ref={group} rotation={[0, 0, -0.18]}>
      <group ref={spin}>
        <mesh>
          <latheGeometry args={[profile, 96]} />
          <meshPhysicalMaterial color="#cfd3d6" metalness={1} roughness={0.22} clearcoat={0.4} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[R + 0.004, R + 0.004, BODY_TOP - BODY_BOTTOM, 128, 1, true, Math.PI, Math.PI * 2]} />
          <meshPhysicalMaterial
            ref={labelMat}
            map={textures[shown.current].tex}
            metalness={0.45}
            roughness={0.3}
            clearcoat={1}
            clearcoatRoughness={0.12}
          />
        </mesh>
        {/* Pull tab */}
        <mesh position={[0, 1.585, 0.12]} rotation={[-Math.PI / 2 + 0.06, 0, 0]}>
          <capsuleGeometry args={[0.09, 0.16, 6, 16]} />
          <meshPhysicalMaterial color="#b9bec2" metalness={1} roughness={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/** Accent-tinted rim light that eases to the active flavor. */
function AccentRig({ hex }: { hex: string }) {
  const light = useRef<THREE.PointLight>(null);
  const target = useMemo(() => new THREE.Color(hex), [hex]);
  useFrame((_, dt) => {
    if (light.current) light.current.color.lerp(target, 1 - Math.exp(-4 * dt));
  });
  return <pointLight ref={light} position={[-2.6, 1.4, -1.5]} intensity={18} distance={9} />;
}

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.position.z = size.width < 640 ? 8 : 7.2;
    cam.updateProjectionMatrix();
  }, [camera, size.width]);
  return null;
}

/** Places the can at a screen-space fraction so one full-bleed canvas can
 *  hold the product off-centre while fruit roams the whole frame. */
function Anchor({ x, y, scale = 1, children }: { x: number; y: number; scale?: number; children: React.ReactNode }) {
  const { viewport } = useThree();
  return (
    <group position={[(x - 0.5) * viewport.width, (0.5 - y) * viewport.height, 0]} scale={scale}>
      {children}
    </group>
  );
}

export interface CanStageProps {
  flavorId: FlavorId;
  interactive?: boolean;
  sparkles?: boolean;
  className?: string;
  /** Screen-space position of the can inside the canvas (0..1). */
  anchorX?: number;
  anchorY?: number;
  /** Overall size of can + fruit (full-bleed stages need a smaller can). */
  scale?: number;
  /** Orbiting fruit + rising fizz from the brand films. */
  fruit?: boolean;
  /** Track the pointer across a larger element than the canvas itself. */
  eventSource?: React.RefObject<HTMLElement | null>;
}

export default function CanStage({
  flavorId,
  interactive = true,
  sparkles = false,
  className,
  eventSource,
  anchorX = 0.5,
  anchorY = 0.5,
  scale = 1,
  fruit = true,
}: CanStageProps) {
  const wrap = useRef<HTMLDivElement>(null);
  // Pause the render loop when the stage is off-screen.
  const inView = useInView(wrap, { margin: "200px" });
  const reduce = useReducedMotion() ?? false;
  const flavor = FLAVOR_BY_ID[flavorId];
  // Phones run two of these stages; cap the pixel ratio to keep them cool.
  const touch = useMediaQuery("(pointer: coarse)");

  return (
    <div ref={wrap} className={className} aria-hidden>
      <Canvas
        dpr={touch ? [1, 1.25] : [1, 1.5]}
        // Off-screen stages still render once ("demand"), so their shaders
        // compile at load rather than mid-scroll; then they sit idle.
        frameloop={inView ? "always" : "demand"}
        camera={{ position: [0, 0, 6.4], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          // Error checks force synchronous shader compiles (a stall per material).
          gl.debug.checkShaderErrors = false;
        }}
        {...(eventSource
          ? { eventSource: eventSource as React.RefObject<HTMLElement>, eventPrefix: "client" as const }
          : {})}
      >
        <ResponsiveCamera />
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 4]} intensity={1.4} />
        <AccentRig hex={flavor.hex} />

        <Anchor x={anchorX} y={anchorY} scale={scale}>
          <Float speed={reduce ? 0 : 1.6} rotationIntensity={reduce ? 0 : 0.25} floatIntensity={reduce ? 0 : 0.6}>
            <Can flavorId={flavorId} interactive={interactive} reduceMotion={reduce} />
          </Float>

          {fruit && <FruitField flavorId={flavorId} reduce={reduce} interactive={interactive} />}
          {fruit && <Fizz reduce={reduce} />}

          {sparkles && !reduce && (
            <Sparkles count={18} scale={[4, 4, 2]} size={2} speed={0.3} opacity={0.5} color={flavor.hex} />
          )}

          {/* Rendered once: re-rendering the scene + blur passes every frame cost more than the motion was worth. */}
          <ContactShadows position={[0, -1.85, 0]} opacity={0.32} scale={3.2} blur={2.8} far={2.5} resolution={256} frames={1} />
        </Anchor>

        {/* Studio reflections built from light cards (no HDR download). */}
        <Environment resolution={256}>
          <Lightformer form="rect" intensity={3} position={[0, 4, 3]} scale={[8, 2, 1]} />
          <Lightformer form="rect" intensity={2.4} position={[-5, 0, 1]} rotation-y={Math.PI / 2} scale={[1.2, 8, 1]} />
          <Lightformer form="rect" intensity={2.4} position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[1.2, 8, 1]} />
          <Lightformer form="ring" color={flavor.hex} intensity={2} position={[0, 0, -6]} scale={5} />
        </Environment>
      </Canvas>
    </div>
  );
}
