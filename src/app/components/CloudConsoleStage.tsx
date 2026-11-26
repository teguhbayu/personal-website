"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import gsap from "gsap";
import { ChannelId } from "@/data/portfolio";

export type SkyMode = "day" | "night";
export type ScreenModelId =
  | "camera"
  | "aws"
  | "laptop"
  | "stack"
  | "trophy"
  | "mail"
  | "blog";

export const SCREEN_MODEL_META: Record<
  ScreenModelId,
  { label: string; channel: ChannelId; accentHex: number }
> = {
  camera: { label: "Camera", channel: "home", accentHex: 0xff4d73 },
  aws: { label: "AWS Cloud", channel: "practice", accentHex: 0xff9900 },
  laptop: { label: "Laptop", channel: "projects", accentHex: 0xff4d73 },
  stack: { label: "Tech Stack", channel: "stack", accentHex: 0x3abeff },
  trophy: { label: "Trophy", channel: "awards", accentHex: 0xf8c638 },
  mail: { label: "Mail", channel: "contact", accentHex: 0xff4d73 },
  blog: { label: "Blog", channel: "home", accentHex: 0xff204e },
};

export const SCREEN_MODEL_ORDER: ScreenModelId[] = [
  "laptop",
  "aws",
  "stack",
  "trophy",
  "mail",
  "blog",
  "camera",
];

export type ScreenZoomMode = "idle" | "zoom-in" | "zoomed-in" | "zoom-out";

interface CloudConsoleStageProps {
  sky: SkyMode;
  screenModel: ScreenModelId;
  previewChannel: ChannelId;
  openChannel: Exclude<ChannelId, "home"> | null;
  spinNonce: number;
  screenZoomMode?: ScreenZoomMode;
  paused?: boolean;
  onZoomInComplete?: () => void;
  onZoomOutComplete?: () => void;
  onLoadProgress: (pct: number) => void;
  onLoadReady: () => void;
  onLoadError: (msg: string) => void;
  onSelectChannel: (ch: ChannelId) => void;
  onOpenBlog?: () => void;
  onCycleScreenModel: () => void;
  onToggleSky?: () => void;
}

function drawLaptopCodeCanvas(ctx: CanvasRenderingContext2D, tick: number) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  ctx.fillStyle = "#081226";
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "#0E1D3B";
  ctx.fillRect(0, 0, w, 34);
  ctx.fillStyle = "#FF4D73";
  ctx.fillRect(14, 11, 12, 12);
  ctx.fillStyle = "#FF9900";
  ctx.fillRect(34, 11, 12, 12);
  ctx.fillStyle = "#2EE07E";
  ctx.fillRect(54, 11, 12, 12);

  ctx.fillStyle = "#B8C4D9";
  ctx.font = "600 15px monospace";
  ctx.fillText("cloud-deck.ts   moklet.org", 84, 22);

  const activeLine = Math.floor(tick * 0.7) % 8;
  ctx.fillStyle = "rgba(255, 77, 115, 0.14)";
  ctx.fillRect(0, 48 + activeLine * 28, w, 26);

  const lines: [string, string][] = [
    ["01", "import { CloudStack } from '@bayu/aws';"],
    ["02", "const stack = new CloudStack('malang-id');"],
    ["03", ""],
    ["04", "export async function deploy() {"],
    ["05", "  await stack.sync('moklet.org');"],
    ["06", "  await stack.sync('antareja.id');"],
    ["07", "  return { status: 'LIVE', lksn: 1 };"],
    ["08", "}"],
  ];

  lines.forEach(([num, code], i) => {
    const y = 66 + i * 28;
    ctx.fillStyle = "#5B7399";
    ctx.font = "500 15px monospace";
    ctx.fillText(num, 14, y);

    if (code.startsWith("import") || code.startsWith("export")) {
      ctx.fillStyle = "#FF6687";
    } else if (code.includes("await")) {
      ctx.fillStyle = "#79C0FF";
    } else if (code.includes("return")) {
      ctx.fillStyle = "#2EE07E";
    } else if (code.includes("const")) {
      ctx.fillStyle = "#FFBD4A";
    } else {
      ctx.fillStyle = "#F5F2EB";
    }
    ctx.font = "600 16px monospace";
    ctx.fillText(code, 50, y);
  });

  if (Math.floor(tick * 2) % 2 === 0) {
    ctx.fillStyle = "#FF4D73";
    ctx.fillRect(410, 52 + activeLine * 28, 10, 18);
  }

  ctx.fillStyle = "#C81038";
  ctx.fillRect(0, h - 28, w, 28);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 14px monospace";
  ctx.fillText("TSX  NEXT.JS  AWS  GO  PRISMA", 16, h - 9);
}

export default function CloudConsoleStage({
  sky,
  screenModel,
  previewChannel,
  openChannel,
  spinNonce,
  screenZoomMode = "idle",
  paused = false,
  onZoomInComplete,
  onZoomOutComplete,
  onLoadProgress,
  onLoadReady,
  onLoadError,
  onSelectChannel,
  onOpenBlog,
  onCycleScreenModel,
}: CloudConsoleStageProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const skyRef = useRef(sky);
  const screenModelRef = useRef(screenModel);
  const previewRef = useRef(previewChannel);
  const openChannelRef = useRef(openChannel);
  const zoomActiveRef = useRef(false);
  const pausedRef = useRef(paused);
  const consoleLoadedRef = useRef(false);
  const pendingZoomOutRef = useRef(false);
  const resumeLoopRef = useRef<(() => void) | null>(null);
  const runZoomOutRef = useRef<(() => void) | null>(null);

  const callbacksRef = useRef({
    onLoadProgress,
    onLoadReady,
    onLoadError,
    onSelectChannel,
    onOpenBlog,
    onCycleScreenModel,
    onZoomInComplete,
    onZoomOutComplete,
  });

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const consoleAnchorRef = useRef<THREE.Group | null>(null);
  const floatGroupRef = useRef<THREE.Group | null>(null);
  const consoleSpinGroupRef = useRef<THREE.Group | null>(null);
  const screenBoundsRef = useRef<{
    center: THREE.Vector3;
    size: THREE.Vector3;
  } | null>(null);
  const screenModelsMapRef = useRef<
    Partial<Record<ScreenModelId, THREE.Group>>
  >({});

  useEffect(() => {
    skyRef.current = sky;
  }, [sky]);

  useEffect(() => {
    previewRef.current = previewChannel;
  }, [previewChannel]);

  useEffect(() => {
    screenModelRef.current = screenModel;
    const map = screenModelsMapRef.current;

    SCREEN_MODEL_ORDER.forEach((id) => {
      const grp = map[id];
      if (!grp) return;
      gsap.killTweensOf(grp.scale);
      gsap.killTweensOf(grp.rotation);

      if (id === screenModel) {
        grp.visible = true;
        grp.scale.setScalar(0.01);
        grp.rotation.y = -Math.PI * 0.65;
        gsap.to(grp.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.56,
          ease: "back.out(1.55)",
        });
        gsap.to(grp.rotation, {
          y: 0,
          duration: 0.62,
          ease: "power3.out",
        });
      } else if (grp.visible) {
        gsap.to(grp.scale, {
          x: 0.01,
          y: 0.01,
          z: 0.01,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            grp.visible = false;
          },
        });
      }
    });

    if (consoleSpinGroupRef.current) {
      gsap.to(consoleSpinGroupRef.current.scale, {
        x: 1.028,
        y: 1.028,
        z: 1.028,
        duration: 0.14,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
        overwrite: "auto",
      });
    }
  }, [screenModel]);

  useEffect(() => {
    openChannelRef.current = openChannel;
    if (!consoleAnchorRef.current || zoomActiveRef.current) return;
    const isDesktop = window.innerWidth >= 1024;
    const isWide = window.innerWidth >= 1280;
    const targetX = openChannel
      ? isWide
        ? -0.78
        : isDesktop
          ? -1.1
          : 0
      : isDesktop
        ? 0.68
        : 0;
    const targetY = openChannel
      ? isDesktop
        ? 0.02
        : 0.65
      : isDesktop
        ? 0.04
        : 0.62;
    const targetScale = openChannel
      ? isWide
        ? 0.74
        : isDesktop
          ? 0.68
          : 0.56
      : isDesktop
        ? 1.06
        : 0.66;

    gsap.to(consoleAnchorRef.current.position, {
      x: targetX,
      y: targetY,
      duration: 0.75,
      ease: "power3.out",
    });
    gsap.to(consoleAnchorRef.current.scale, {
      x: targetScale,
      y: targetScale,
      z: targetScale,
      duration: 0.75,
      ease: "power3.out",
    });
  }, [openChannel]);

  useEffect(() => {
    if (spinNonce === 0 || !consoleSpinGroupRef.current || zoomActiveRef.current)
      return;
    gsap.to(consoleSpinGroupRef.current.rotation, {
      y: consoleSpinGroupRef.current.rotation.y + Math.PI * 2,
      duration: 1.15,
      ease: "power3.inOut",
    });
  }, [spinNonce]);

  useEffect(() => {
    pausedRef.current = paused;
    if (!paused) {
      resumeLoopRef.current?.();
    }
  }, [paused]);

  useEffect(() => {
    const getRestingLayout = () => {
      const isDesktop = window.innerWidth >= 1024;
      const isWide = window.innerWidth >= 1280;
      const open = openChannelRef.current;
      return {
        x: open ? (isWide ? -0.78 : isDesktop ? -1.1 : 0) : isDesktop ? 0.68 : 0,
        y: open ? (isDesktop ? 0.02 : 0.65) : isDesktop ? 0.04 : 0.62,
        scale: open
          ? isWide
            ? 0.74
            : isDesktop
              ? 0.68
              : 0.56
          : isDesktop
            ? 1.06
            : 0.66,
        restRotY: open ? 0.24 : -0.18,
      };
    };

    const getScreenDiveMetrics = (camera: THREE.PerspectiveCamera) => {
      const bounds = screenBoundsRef.current;
      const finalScale = window.innerWidth >= 1024 ? 1.06 : 0.85;
      const screenCenterX = (bounds?.center.x ?? 0) * finalScale;
      const screenCenterY = (bounds?.center.y ?? 0.42) * finalScale;
      const screenFrontZ =
        ((bounds?.center.z ?? 0.25) + (bounds?.size.z ?? 0.05) * 0.5) *
        finalScale;
      const screenHeight = Math.max(0.5, (bounds?.size.y ?? 1.1) * finalScale);
      const fovRad = THREE.MathUtils.degToRad(camera.fov);
      const fillDistance = screenHeight / 2 / Math.tan(fovRad / 2);
      const diveZ = screenFrontZ + Math.max(0.32, fillDistance * 0.34);
      return {
        finalScale,
        screenCenterX,
        screenCenterY,
        screenFrontZ,
        diveZ,
      };
    };

    let activeTl: gsap.core.Timeline | null = null;

    const triggerZoomOut = () => {
      const camera = cameraRef.current;
      const anchor = consoleAnchorRef.current;
      const floatGroup = floatGroupRef.current;
      const spinGroup = consoleSpinGroupRef.current;
      if (!camera || !anchor || !floatGroup || !spinGroup) {
        zoomActiveRef.current = false;
        callbacksRef.current.onZoomOutComplete?.();
        return;
      }

      zoomActiveRef.current = true;
      gsap.killTweensOf(anchor.position);
      gsap.killTweensOf(anchor.scale);
      gsap.killTweensOf(floatGroup.position);
      gsap.killTweensOf(floatGroup.rotation);
      gsap.killTweensOf(spinGroup.rotation);
      gsap.killTweensOf(camera.position);

      const {
        finalScale,
        screenCenterX,
        screenCenterY,
        screenFrontZ,
        diveZ,
      } = getScreenDiveMetrics(camera);
      const rest = getRestingLayout();
      const nearestSpinY =
        Math.round(spinGroup.rotation.y / (Math.PI * 2)) * (Math.PI * 2);

      anchor.position.set(0, 0, 0);
      anchor.scale.setScalar(finalScale);
      floatGroup.position.set(0, 0, 0);
      floatGroup.rotation.set(0, 0, 0);
      spinGroup.rotation.y = nearestSpinY;
      camera.position.set(screenCenterX, screenCenterY, diveZ);

      const lookState = {
        x: screenCenterX,
        y: screenCenterY,
        z: screenFrontZ,
      };
      camera.lookAt(lookState.x, lookState.y, lookState.z);

      activeTl = gsap.timeline({
        onUpdate: () => {
          camera.lookAt(lookState.x, lookState.y, lookState.z);
        },
        onComplete: () => {
          camera.position.set(0, 0.08, 7.6);
          camera.lookAt(0, 0, 0);
          zoomActiveRef.current = false;
          callbacksRef.current.onZoomOutComplete?.();
        },
      });

      activeTl
        .to(
          camera.position,
          { x: 0, y: 0.08, z: 7.6, duration: 0.88, ease: "power3.out" },
          0,
        )
        .to(
          lookState,
          { x: 0, y: 0, z: 0, duration: 0.72, ease: "power2.out" },
          0.08,
        )
        .to(
          anchor.position,
          { x: rest.x, y: rest.y, z: 0, duration: 0.82, ease: "power3.out" },
          0.14,
        )
        .to(
          anchor.scale,
          {
            x: rest.scale,
            y: rest.scale,
            z: rest.scale,
            duration: 0.82,
            ease: "power3.out",
          },
          0.14,
        )
        .to(
          floatGroup.rotation,
          { y: rest.restRotY, duration: 0.82, ease: "power3.out" },
          0.16,
        );
    };

    runZoomOutRef.current = triggerZoomOut;

    if (screenZoomMode === "idle") {
      pendingZoomOutRef.current = false;
      zoomActiveRef.current = false;
      return;
    }

    if (screenZoomMode === "zoomed-in") {
      pendingZoomOutRef.current = false;
      zoomActiveRef.current = true;
      return;
    }

    if (screenZoomMode === "zoom-out") {
      zoomActiveRef.current = true;
      if (consoleLoadedRef.current) {
        pendingZoomOutRef.current = false;
        triggerZoomOut();
      } else {
        pendingZoomOutRef.current = true;
      }
      return () => {
        pendingZoomOutRef.current = false;
        activeTl?.kill();
      };
    }

    const camera = cameraRef.current;
    const anchor = consoleAnchorRef.current;
    const floatGroup = floatGroupRef.current;
    const spinGroup = consoleSpinGroupRef.current;

    if (!camera || !anchor || !floatGroup || !spinGroup) {
      callbacksRef.current.onZoomInComplete?.();
      return;
    }

    zoomActiveRef.current = true;

    gsap.killTweensOf(anchor.position);
    gsap.killTweensOf(anchor.scale);
    gsap.killTweensOf(floatGroup.position);
    gsap.killTweensOf(floatGroup.rotation);
    gsap.killTweensOf(spinGroup.rotation);
    gsap.killTweensOf(camera.position);

    const { finalScale, screenCenterX, screenCenterY, screenFrontZ, diveZ } =
      getScreenDiveMetrics(camera);

    const nearestSpinY =
      Math.round(spinGroup.rotation.y / (Math.PI * 2)) * (Math.PI * 2);

    const lookState = { x: 0, y: 0, z: 0 };

    activeTl = gsap.timeline({
      onUpdate: () => {
        camera.lookAt(lookState.x, lookState.y, lookState.z);
      },
      onComplete: () => {
        callbacksRef.current.onZoomInComplete?.();
      },
    });

    activeTl
      .to(
        anchor.position,
        { x: 0, y: 0, z: 0, duration: 0.42, ease: "power3.out" },
        0,
      )
      .to(
        anchor.scale,
        {
          x: finalScale,
          y: finalScale,
          z: finalScale,
          duration: 0.42,
          ease: "power3.out",
        },
        0,
      )
      .to(
        floatGroup.position,
        { x: 0, y: 0, z: 0, duration: 0.38, ease: "power3.out" },
        0,
      )
      .to(
        floatGroup.rotation,
        { x: 0, y: 0, z: 0, duration: 0.42, ease: "power3.out" },
        0,
      )
      .to(
        spinGroup.rotation,
        { y: nearestSpinY, duration: 0.42, ease: "power3.out" },
        0,
      )
      .to(
        lookState,
        {
          x: screenCenterX,
          y: screenCenterY,
          z: screenFrontZ,
          duration: 0.55,
          ease: "power2.inOut",
        },
        0.05,
      )
      .to(
        camera.position,
        {
          x: screenCenterX,
          y: screenCenterY,
          z: diveZ,
          duration: 0.78,
          ease: "power3.in",
        },
        0.14,
      );

    return () => {
      activeTl?.kill();
    };
  }, [screenZoomMode]);

  useEffect(() => {
    callbacksRef.current = {
      onLoadProgress,
      onLoadReady,
      onLoadError,
      onSelectChannel,
      onOpenBlog,
      onCycleScreenModel,
      onZoomInComplete,
      onZoomOutComplete,
    };
  }, [
    onLoadProgress,
    onLoadReady,
    onLoadError,
    onSelectChannel,
    onOpenBlog,
    onCycleScreenModel,
    onZoomInComplete,
    onZoomOutComplete,
  ]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      callbacksRef.current.onLoadError(
        "WebGL could not initialize in this browser. All portfolio sections remain accessible.",
      );
      return;
    }

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);

    const scene = new THREE.Scene();
    scene.environment = envRT.texture;
    scene.environmentIntensity = 0.65;

    const camera = new THREE.PerspectiveCamera(
      36,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100,
    );
    camera.position.set(0, 0.08, 7.6);
    cameraRef.current = camera;

    const hemiLight = new THREE.HemisphereLight(0xd8ecff, 0x2c4775, 1.35);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ed, 1.65);
    keyLight.position.set(-4.5, 6.0, 5.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xff5a7e, 0.75);
    rimLight.position.set(5.0, -2.5, -4.5);
    scene.add(rimLight);

    const screenRT = new THREE.WebGLRenderTarget(780, 540, {
      samples: 4,
      type: THREE.UnsignedByteType,
    });
    screenRT.texture.colorSpace = THREE.SRGBColorSpace;
    screenRT.texture.repeat.set(1, -1);
    screenRT.texture.offset.set(0, 1);

    const screenScene = new THREE.Scene();
    screenScene.background = new THREE.Color(0x0a1c3d);
    screenScene.environment = envRT.texture;
    screenScene.environmentIntensity = 0.92;

    const screenCam = new THREE.PerspectiveCamera(34, 780 / 540, 0.1, 30);
    screenCam.position.set(0, 0.42, 3.65);
    screenCam.lookAt(0, -0.02, 0);

    const screenHemi = new THREE.HemisphereLight(0xcbe6ff, 0x162b52, 1.32);
    screenScene.add(screenHemi);

    const screenKey = new THREE.DirectionalLight(0xfff9f0, 2.25);
    screenKey.position.set(-3.2, 4.5, 4.2);
    screenScene.add(screenKey);

    const screenRim = new THREE.DirectionalLight(0xff4d73, 1.45);
    screenRim.position.set(3.5, 1.2, -3.5);
    screenScene.add(screenRim);

    const plinthGeo = new THREE.CylinderGeometry(1.15, 1.24, 0.06, 48);
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x0f254a,
      roughness: 0.35,
      metalness: 0.35,
    });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.set(0, -0.82, 0);
    screenScene.add(plinth);

    const plinthRingGeo = new THREE.RingGeometry(1.16, 1.21, 64);
    const plinthRingMat = new THREE.MeshBasicMaterial({
      color: 0xff4d73,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
    });
    const plinthRing = new THREE.Mesh(plinthRingGeo, plinthRingMat);
    plinthRing.rotation.x = -Math.PI * 0.5;
    plinthRing.position.set(0, -0.785, 0);
    screenScene.add(plinthRing);

    const screenStagePivot = new THREE.Group();
    screenScene.add(screenStagePivot);

    const codeCanvas = document.createElement("canvas");
    codeCanvas.width = 512;
    codeCanvas.height = 300;
    const codeCtx = codeCanvas.getContext("2d");
    const codeTexture = new THREE.CanvasTexture(codeCanvas);
    codeTexture.colorSpace = THREE.SRGBColorSpace;
    codeTexture.flipY = false;
    if (codeCtx) {
      drawLaptopCodeCanvas(codeCtx, 0);
      codeTexture.needsUpdate = true;
    }

    const consoleAnchor = new THREE.Group();
    const isDesktopInit = window.innerWidth >= 1024;
    consoleAnchor.position.set(
      isDesktopInit ? 0.68 : 0,
      isDesktopInit ? 0.04 : 0.62,
      0,
    );
    consoleAnchor.scale.setScalar(isDesktopInit ? 1.06 : 0.66);
    scene.add(consoleAnchor);
    consoleAnchorRef.current = consoleAnchor;

    const floatGroup = new THREE.Group();
    consoleAnchor.add(floatGroup);
    floatGroupRef.current = floatGroup;

    const spinGroup = new THREE.Group();
    floatGroup.add(spinGroup);
    consoleSpinGroupRef.current = spinGroup;

    const cloudsGroup = new THREE.Group();
    scene.add(cloudsGroup);

    interface FloatingCloud {
      mesh: THREE.Object3D;
      baseX: number;
      baseY: number;
      baseZ: number;
      speed: number;
      bobPhase: number;
      bobAmp: number;
      driftRange: number;
    }
    const floatingClouds: FloatingCloud[] = [];
    const cloudMaterials: THREE.MeshStandardMaterial[] = [];

    const interactiveButtons: THREE.Object3D[] = [];
    const buttonBaseZ = new Map<string, number>();

    const loader = new GLTFLoader();
    const assetKeys = [
      "console",
      "clouds",
      "laptop",
      "aws",
      "camera",
      "stack",
      "trophy",
      "mail",
      "blog",
    ];
    const assetProgress: Record<string, number> = Object.fromEntries(
      assetKeys.map((k) => [k, 0]),
    );
    const assetDone: Record<string, boolean> = Object.fromEntries(
      assetKeys.map((k) => [k, false]),
    );

    const updateProgress = () => {
      const vals = Object.values(assetProgress);
      const avg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
      callbacksRef.current.onLoadProgress(Math.min(100, avg));
      if (Object.values(assetDone).every(Boolean)) {
        callbacksRef.current.onLoadProgress(100);
        callbacksRef.current.onLoadReady();
      }
    };

    loader.load(
      "/models/bayu-cloud-console.glb",
      (gltf) => {
        const model = gltf.scene;
        model.updateMatrixWorld(true);
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (mesh.name === "ConsoleScreen") {
              mesh.material = new THREE.MeshBasicMaterial({
                map: screenRT.texture,
                toneMapped: false,
              });
              const box = new THREE.Box3().setFromObject(mesh);
              screenBoundsRef.current = {
                center: box.getCenter(new THREE.Vector3()),
                size: box.getSize(new THREE.Vector3()),
              };
            }
            if (
              mesh.name === "BtnA" ||
              mesh.name === "BtnB" ||
              mesh.name === "DPad"
            ) {
              interactiveButtons.push(mesh);
              buttonBaseZ.set(mesh.name, mesh.position.z);
            }
          }
        });
        spinGroup.add(model);

        if (!prefersReducedMotion && !zoomActiveRef.current) {
          model.scale.setScalar(0.84);
          gsap.to(model.scale, {
            x: 1,
            y: 1,
            z: 1,
            duration: 1.0,
            ease: "back.out(1.4)",
          });
        }

        consoleLoadedRef.current = true;
        assetDone.console = true;
        assetProgress.console = 100;
        updateProgress();

        if (pendingZoomOutRef.current) {
          pendingZoomOutRef.current = false;
          runZoomOutRef.current?.();
        }
      },
      (xhr) => {
        if (xhr.total > 0) {
          assetProgress.console = Math.round((xhr.loaded / xhr.total) * 100);
          updateProgress();
        }
      },
      () => {
        callbacksRef.current.onLoadError(
          "Could not load the 3D Cloud Console model. Portfolio sections remain accessible.",
        );
      },
    );

    loader.load(
      "/models/sky-cloud.glb",
      (gltf) => {
        const cloudLayout = [
          { x: -4.2, y: 1.9, z: -4.5, s: 1.15, sp: 0.11 },
          { x: 4.5, y: 2.2, z: -5.4, s: 1.35, sp: 0.08 },
          { x: -3.8, y: -2.0, z: -2.6, s: 1.05, sp: 0.14 },
          { x: 3.9, y: -1.75, z: -2.9, s: 1.12, sp: 0.12 },
          { x: -0.4, y: 2.85, z: -6.2, s: 1.45, sp: 0.07 },
          { x: 0.7, y: -2.65, z: -4.2, s: 1.28, sp: 0.09 },
          { x: -5.6, y: 0.15, z: -3.6, s: 0.92, sp: 0.13 },
          { x: 5.5, y: 0.45, z: -4.0, s: 0.98, sp: 0.1 },
        ];

        cloudLayout.forEach((cfg, idx) => {
          const clone = gltf.scene.clone(true);
          clone.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mat = new THREE.MeshStandardMaterial({
                color: skyRef.current === "day" ? 0xffffff : 0x1a3056,
                roughness: 0.92,
                metalness: 0.0,
                transparent: true,
                opacity: skyRef.current === "day" ? 0.88 : 0.62,
              });
              (child as THREE.Mesh).material = mat;
              cloudMaterials.push(mat);
            }
          });
          clone.position.set(cfg.x, cfg.y, cfg.z);
          clone.scale.setScalar(cfg.s);
          clone.rotation.y = (idx % 2 === 0 ? 1 : -1) * 0.25 + idx * 0.18;
          cloudsGroup.add(clone);

          floatingClouds.push({
            mesh: clone,
            baseX: cfg.x,
            baseY: cfg.y,
            baseZ: cfg.z,
            speed: cfg.sp,
            bobPhase: idx * 1.1,
            bobAmp: 0.12 + (idx % 3) * 0.04,
            driftRange: 0.45 + (idx % 2) * 0.25,
          });
        });

        assetDone.clouds = true;
        assetProgress.clouds = 100;
        updateProgress();
      },
      (xhr) => {
        if (xhr.total > 0) {
          assetProgress.clouds = Math.round((xhr.loaded / xhr.total) * 100);
          updateProgress();
        }
      },
      () => {
        assetDone.clouds = true;
        assetProgress.clouds = 100;
        updateProgress();
      },
    );

    let awsOrbitMesh: THREE.Object3D | null = null;
    let trophyStarMesh: THREE.Object3D | null = null;
    let stackGearMainMesh: THREE.Object3D | null = null;
    let stackGearSubMesh: THREE.Object3D | null = null;
    let paperPlaneMesh: THREE.Object3D | null = null;
    let paperPlaneBaseY = 0;
    let blogPenPivot: THREE.Object3D | null = null;
    let blogPenBaseY = 0;
    let blogPenBaseRotZ = 0;
    let blogBadgePivot: THREE.Object3D | null = null;
    let blogBadgeBaseY = 0;

    const loadScreenModel = (
      id: ScreenModelId,
      url: string,
      scaleFactor: number,
      yOffset: number,
    ) => {
      loader.load(
        url,
        (gltf) => {
          const holder = new THREE.Group();
          const model = gltf.scene;
          model.scale.setScalar(scaleFactor);
          model.position.y = yOffset;

          model.traverse((child) => {
            if (id === "blog" && child.name === "BlogPen") {
              blogPenPivot = child;
              blogPenBaseY = child.position.y;
              blogPenBaseRotZ = child.rotation.z;
            }
            if (id === "blog" && child.name === "BlogPostBadge") {
              blogBadgePivot = child;
              blogBadgeBaseY = child.position.y;
            }
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (id === "laptop" && mesh.name === "LaptopCodeScreen") {
                mesh.material = new THREE.MeshBasicMaterial({
                  map: codeTexture,
                  toneMapped: false,
                });
              }
              if (id === "aws" && mesh.name === "AWSOrbitRing") {
                awsOrbitMesh = mesh;
              }
              if (id === "trophy" && mesh.name === "TrophyStar") {
                trophyStarMesh = mesh;
              }
              if (id === "stack" && mesh.name === "StackGearMain") {
                stackGearMainMesh = mesh;
              }
              if (id === "stack" && mesh.name === "StackGearSub") {
                stackGearSubMesh = mesh;
              }
              if (id === "mail" && mesh.name === "MailPaperPlane") {
                paperPlaneMesh = mesh;
                paperPlaneBaseY = mesh.position.y;
              }
            }
          });

          holder.add(model);
          holder.visible = screenModelRef.current === id;
          if (!holder.visible) {
            holder.scale.setScalar(0.01);
          }

          screenStagePivot.add(holder);
          screenModelsMapRef.current[id] = holder;

          assetDone[id] = true;
          assetProgress[id] = 100;
          updateProgress();
        },
        (xhr) => {
          if (xhr.total > 0) {
            assetProgress[id] = Math.round((xhr.loaded / xhr.total) * 100);
            updateProgress();
          }
        },
        () => {
          assetDone[id] = true;
          assetProgress[id] = 100;
          updateProgress();
        },
      );
    };

    loadScreenModel("laptop", "/models/screen-laptop.glb", 1.12, 0.04);
    loadScreenModel("aws", "/models/screen-aws-cloud.glb", 1.02, 0.06);
    loadScreenModel("camera", "/models/screen-camera.glb", 1.12, -0.02);
    loadScreenModel("stack", "/models/screen-stack.glb", 0.96, 0.04);
    loadScreenModel("trophy", "/models/screen-trophy.glb", 1.04, -0.06);
    loadScreenModel("mail", "/models/screen-mail.glb", 1.14, 0.04);
    loadScreenModel("blog", "/models/screen-blog.glb", 1.02, -0.02);

    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2(0, 0);
    const smoothPointer = new THREE.Vector2(0, 0);

    let isDragging = false;
    let dragDistance = 0;
    let prevX = 0;
    let prevY = 0;
    let dragRotY = 0;
    let dragRotX = 0;

    const getCanvasNDC = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
        y: -((e.clientY - rect.top) / rect.height) * 2 + 1,
      };
    };

    const onPointerDown = (e: PointerEvent) => {
      if (zoomActiveRef.current || e.target !== renderer.domElement) return;
      isDragging = true;
      dragDistance = 0;
      prevX = e.clientX;
      prevY = e.clientY;
      renderer.domElement.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      const ndc = getCanvasNDC(e);
      pointerNDC.set(ndc.x, ndc.y);

      if (isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        dragDistance += Math.abs(dx) + Math.abs(dy);
        dragRotY += dx * 0.0085;
        dragRotX = THREE.MathUtils.clamp(dragRotX + dy * 0.0055, -0.55, 0.55);
        prevX = e.clientX;
        prevY = e.clientY;
        return;
      }

      if (e.target === renderer.domElement && interactiveButtons.length > 0) {
        raycaster.setFromCamera(pointerNDC, camera);
        const hits = raycaster.intersectObjects(interactiveButtons, false);
        renderer.domElement.style.cursor = hits.length > 0 ? "pointer" : "grab";
      }
    };

    const pressButtonAnim = (mesh: THREE.Object3D) => {
      const baseZ = buttonBaseZ.get(mesh.name);
      if (baseZ === undefined) return;
      gsap.killTweensOf(mesh.position);
      gsap.to(mesh.position, {
        z: baseZ - 0.055,
        duration: 0.08,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(mesh.position, {
            z: baseZ,
            duration: 0.24,
            ease: "elastic.out(1, 0.45)",
          });
        },
      });
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return;
      isDragging = false;
      renderer.domElement.style.cursor = "grab";

      if (dragDistance < 8 && interactiveButtons.length > 0) {
        const ndc = getCanvasNDC(e);
        raycaster.setFromCamera(new THREE.Vector2(ndc.x, ndc.y), camera);
        const hits = raycaster.intersectObjects(interactiveButtons, false);
        if (hits.length > 0) {
          const hitMesh = hits[0].object;
          pressButtonAnim(hitMesh);

          if (hitMesh.name === "BtnA") {
            if (screenModelRef.current === "blog" && callbacksRef.current.onOpenBlog) {
              callbacksRef.current.onOpenBlog();
            } else {
              const mappedCh = SCREEN_MODEL_META[screenModelRef.current].channel;
              callbacksRef.current.onSelectChannel(
                mappedCh === "home" ? "projects" : mappedCh,
              );
            }
          } else if (hitMesh.name === "BtnB") {
          } else if (hitMesh.name === "DPad") {
            callbacksRef.current.onCycleScreenModel();
          }
        }
      }
    };

    const onResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      if (zoomActiveRef.current) return;

      const isDesktop = width >= 1024;
      const isWide = width >= 1280;
      const open = openChannelRef.current;
      consoleAnchor.position.x = open
        ? isWide
          ? -0.78
          : isDesktop
            ? -1.1
            : 0
        : isDesktop
          ? 0.68
          : 0;
      consoleAnchor.position.y = open
        ? isDesktop
          ? 0.02
          : 0.65
        : isDesktop
          ? 0.04
          : 0.62;
      consoleAnchor.scale.setScalar(
        open
          ? isWide
            ? 0.74
            : isDesktop
              ? 0.68
              : 0.56
          : isDesktop
            ? 1.06
            : 0.66,
      );
    };

    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("resize", onResize);

    const dayCloudColor = new THREE.Color(0xffffff);
    const nightCloudColor = new THREE.Color(0x1b335e);
    const dayHemiSky = new THREE.Color(0xd8ecff);
    const nightHemiSky = new THREE.Color(0x2d4e8a);
    const dayHemiGround = new THREE.Color(0x3a639e);
    const nightHemiGround = new THREE.Color(0x071022);
    const screenDayBg = new THREE.Color(0x0a1c3d);
    const screenNightBg = new THREE.Color(0x050e22);
    const targetAccentColor = new THREE.Color(0xff4d73);

    let rafId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let smoothNight = skyRef.current === "night" ? 1 : 0;
    let lastCodeTick = -1;

    const animate = (now: number) => {
      if (pausedRef.current) {
        rafId = 0;
        return;
      }

      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      if (!prefersReducedMotion) {
        elapsed += dt;
      }

      const targetNight = skyRef.current === "night" ? 1 : 0;
      smoothNight += (targetNight - smoothNight) * 0.07;

      hemiLight.color.lerpColors(dayHemiSky, nightHemiSky, smoothNight);
      hemiLight.groundColor.lerpColors(
        dayHemiGround,
        nightHemiGround,
        smoothNight,
      );
      hemiLight.intensity = THREE.MathUtils.lerp(1.42, 0.95, smoothNight);
      keyLight.intensity = THREE.MathUtils.lerp(1.7, 1.25, smoothNight);
      rimLight.intensity = THREE.MathUtils.lerp(0.65, 1.35, smoothNight);

      for (const mat of cloudMaterials) {
        mat.color.lerpColors(dayCloudColor, nightCloudColor, smoothNight);
        mat.opacity = THREE.MathUtils.lerp(0.88, 0.56, smoothNight);
      }

      smoothPointer.x += (pointerNDC.x - smoothPointer.x) * 0.05;
      smoothPointer.y += (pointerNDC.y - smoothPointer.y) * 0.05;

      const codeTick = Math.floor(elapsed * 2);
      if (
        codeCtx &&
        screenModelRef.current === "laptop" &&
        codeTick !== lastCodeTick
      ) {
        lastCodeTick = codeTick;
        drawLaptopCodeCanvas(codeCtx, elapsed);
        codeTexture.needsUpdate = true;
      }

      targetAccentColor.setHex(
        SCREEN_MODEL_META[screenModelRef.current].accentHex,
      );
      screenRim.color.lerp(targetAccentColor, 0.09);
      plinthRingMat.color.lerp(targetAccentColor, 0.09);
      (screenScene.background as THREE.Color).lerpColors(
        screenDayBg,
        screenNightBg,
        smoothNight,
      );

      if (!prefersReducedMotion) {
        screenStagePivot.rotation.y =
          Math.sin(elapsed * 0.85) * 0.48 + smoothPointer.x * 0.35;
        screenStagePivot.rotation.x =
          0.08 + Math.cos(elapsed * 0.65) * 0.06 - smoothPointer.y * 0.14;
        screenStagePivot.position.y = Math.sin(elapsed * 1.6) * 0.055;

        if (awsOrbitMesh) {
          awsOrbitMesh.rotation.z = elapsed * 0.7;
        }
        if (trophyStarMesh) {
          trophyStarMesh.rotation.y = elapsed * 1.35;
        }
        if (stackGearMainMesh) {
          stackGearMainMesh.rotation.z = elapsed * 1.1;
        }
        if (stackGearSubMesh) {
          stackGearSubMesh.rotation.z = -elapsed * 1.375 + 0.39;
        }
        if (paperPlaneMesh) {
          paperPlaneMesh.position.y =
            paperPlaneBaseY + Math.sin(elapsed * 2.4) * 0.06;
        }
        if (blogPenPivot) {
          blogPenPivot.position.y =
            blogPenBaseY + Math.sin(elapsed * 2.2) * 0.045;
          blogPenPivot.rotation.z =
            blogPenBaseRotZ + Math.sin(elapsed * 1.7) * 0.07;
        }
        if (blogBadgePivot) {
          blogBadgePivot.position.y =
            blogBadgeBaseY + Math.cos(elapsed * 1.85) * 0.04;
        }
      }

      if (!zoomActiveRef.current) {
        if (!prefersReducedMotion) {
          floatGroup.position.y = Math.sin(elapsed * 1.15) * 0.11;
          floatGroup.rotation.z = Math.sin(elapsed * 0.72) * 0.032;
        }

        if (!isDragging) {
          dragRotY += (0 - dragRotY) * 0.025;
          dragRotX += (0 - dragRotX) * 0.04;
        }

        const heroRestY = openChannelRef.current ? 0.24 : -0.18;
        const targetRotY = heroRestY + smoothPointer.x * 0.24 + dragRotY;
        const targetRotX = -smoothPointer.y * 0.14 + dragRotX;

        floatGroup.rotation.y += (targetRotY - floatGroup.rotation.y) * 0.08;
        floatGroup.rotation.x += (targetRotX - floatGroup.rotation.x) * 0.08;
      }

      cloudsGroup.position.x = -smoothPointer.x * 0.35;
      cloudsGroup.position.y = -smoothPointer.y * 0.2;
      for (const c of floatingClouds) {
        c.mesh.position.x =
          c.baseX + Math.sin(elapsed * c.speed + c.bobPhase) * c.driftRange;
        c.mesh.position.y =
          c.baseY + Math.cos(elapsed * c.speed * 1.3 + c.bobPhase) * c.bobAmp;
      }

      renderer.setRenderTarget(screenRT);
      renderer.render(screenScene, screenCam);

      renderer.setRenderTarget(null);
      renderer.render(scene, camera);

      if (!prefersReducedMotion) {
        rafId = window.requestAnimationFrame(animate);
      }
    };

    resumeLoopRef.current = () => {
      if (pausedRef.current) return;
      if (!prefersReducedMotion && rafId === 0) {
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(animate);
      } else if (prefersReducedMotion) {
        animate(performance.now());
      }
    };

    if (!pausedRef.current) {
      animate(performance.now());
    }

    const reducedTimer = prefersReducedMotion
      ? window.setInterval(() => {
          if (!pausedRef.current) animate(performance.now());
        }, 300)
      : null;

    return () => {
      resumeLoopRef.current = null;
      consoleLoadedRef.current = false;
      if (rafId) window.cancelAnimationFrame(rafId);
      if (reducedTimer) window.clearInterval(reducedTimer);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("resize", onResize);

      screenRT.dispose();
      codeTexture.dispose();
      plinthGeo.dispose();
      plinthMat.dispose();
      plinthRingGeo.dispose();
      plinthRingMat.dispose();
      envRT.dispose();
      pmrem.dispose();
      cloudMaterials.forEach((m) => m.dispose());
      renderer.dispose();

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-label="Interactive 3D Bayu Cloud Console displaying live 3D miniature models on its screen. Drag to spin, or click its 3D D-Pad, A, or B buttons."
      className="fixed inset-0 z-10 touch-none"
    />
  );
}
