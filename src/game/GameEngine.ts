import {
  Mat4,
  Palette,
  createSkydomeMesh,
  createMountainRangeMesh,
  createCloudClusterMesh,
  createCelestialDisc,
  createBirdMesh,
  createDetailedMalayHouse,
  createLushPalmTree,
  createPelitaMesh,
  createBambooFence,
  createShrubMesh,
  createWaterPlane,
  createDistantFleetMesh,
  createCharacterMesh,
  createKerisWeaponMesh,
  createParangMesh,
  createMarketStallMesh,
  createCrateMesh,
  createJettyMesh,
  createBoatMesh,
  createScrollMesh,
  createHerbMesh,
  createThroneMesh,
  createPalacePillarMesh,
  createShadowMesh,
  buildBox,
  mergeGeometries,
  createCharacterRig,
  type CharacterRig,
  type CompiledMesh
} from './glUtils.ts';
import { SoundFX } from './sound.ts';
import type { BackgroundSettings, StageData, TimeOfDay } from '../types.ts';

export interface CompiledCharacterRig {
  head: CompiledMesh;
  torso: CompiledMesh;
  leftArm: CompiledMesh;
  rightArm: CompiledMesh;
  leftLeg: CompiledMesh;
  rightLeg: CompiledMesh;
}

const V_SHADER = `
  attribute vec3 aPosition;
  attribute vec3 aNormal;
  attribute vec3 aColor;

  uniform mat4 uModel;
  uniform mat4 uView;
  uniform mat4 uProjection;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec3 uAmbientColor;
  uniform float uWaveTime;
  uniform float uIsWater;

  varying vec3 vColor;
  varying vec3 vNormal;
  varying float vDist;

  void main() {
    vec3 pos = aPosition;
    if (uIsWater > 0.5) {
      pos.y += sin(pos.x * 0.7 + uWaveTime * 2.2) * 0.12 + cos(pos.z * 0.6 + uWaveTime * 1.8) * 0.08;
    }

    vec4 worldPos = uModel * vec4(pos, 1.0);
    vec4 viewPos = uView * worldPos;
    gl_Position = uProjection * viewPos;

    mat3 normalMat = mat3(uModel);
    vec3 N = normalize(normalMat * aNormal);
    float diff = max(dot(N, normalize(uSunDir)), 0.0);
    
    vec3 light = uAmbientColor + uSunColor * diff;
    vColor = aColor * light;
    vNormal = N;
    vDist = -viewPos.z;
  }
`;

const F_SHADER = `
  precision mediump float;
  varying vec3 vColor;
  varying float vDist;
  
  uniform vec3 uFogColor;
  uniform float uFogStart;
  uniform float uFogEnd;

  void main() {
    float fogFactor = clamp((vDist - uFogStart) / (uFogEnd - uFogStart), 0.0, 1.0);
    gl_FragColor = vec4(mix(vColor, uFogColor, fogFactor), 1.0);
  }
`;

export class GameEngine {
  public canvas: HTMLCanvasElement;
  public gl: WebGLRenderingContext;
  private prog!: WebGLProgram;

  private aPos!: number;
  private aNorm!: number;
  private aCol!: number;

  private uModel!: WebGLUniformLocation;
  private uView!: WebGLUniformLocation;
  private uProj!: WebGLUniformLocation;
  private uSunDir!: WebGLUniformLocation;
  private uSunColor!: WebGLUniformLocation;
  private uAmbientColor!: WebGLUniformLocation;
  private uFogColor!: WebGLUniformLocation;
  private uFogStart!: WebGLUniformLocation;
  private uFogEnd!: WebGLUniformLocation;
  private uWaveTime!: WebGLUniformLocation;
  private uIsWater!: WebGLUniformLocation;

  // Background Customization Settings
  public bgSettings: BackgroundSettings = {
    timeOfDay: 'pagi',
    particlesEnabled: true,
    cloudsEnabled: true,
    waterWavesEnabled: true,
    fogDensity: 1.0,
    bloomGlow: true
  };

  public currentStageIdx = 0;
  public score = 0;
  public hearts = 3;
  public stars = 0;
  public isPaused = false;
  public isGameOver = false;
  public isVictory = false;

  // Player state
  public player = {
    x: 0,
    y: 0,
    z: -12,
    vx: 0,
    vy: 0,
    vz: 0,
    rotY: 0,
    targetRotY: 0,
    speed: 0.16,
    baseSpeed: 0.16,
    sprintSpeed: 0.26,
    isSprinting: false,
    isGrounded: true,
    isJumping: false,
    isDashing: false,
    dashTimer: 0,
    dashCooldown: 0,
    dashDirX: 0,
    dashDirZ: 0,
    isAttacking: false,
    attackTimer: 0,
    attackCombo: 1,
    comboResetTimer: 0,
    walkCycle: 0,
    isWalking: false,
    hasTamingSari: false
  };

  // Camera state with full Roblox-like 360 orbit follow & screen shake
  public camera = {
    x: 0,
    y: 6.8,
    z: -19,
    targetX: 0,
    targetY: 0.8,
    targetZ: -12,
    distance: 8.5,
    angleY: 0,
    angleX: 0.38,
    targetAngleY: 0,
    targetAngleX: 0.38,
    shakeTime: 0,
    shakeIntensity: 0
  };

  // Pointer drag state for Roblox orbit camera control
  private isPointerDown = false;
  private pointerStartX = 0;
  private pointerStartY = 0;
  private hasMovedPointer = false;

  // Inputs
  public keys: Record<string, boolean> = {};
  public joystick = { x: 0, y: 0, active: false };

  // World objects
  public worldObjects: { mesh: CompiledMesh; x: number; y?: number; z: number; rotY: number; scale?: number }[] = [];
  public npcs: { id: string; name: string; mesh: CompiledMesh; rig?: CompiledCharacterRig; x: number; z: number; rotY: number; dialog: string }[] = [];
  public enemies: { id: string; name: string; mesh: CompiledMesh; rig?: CompiledCharacterRig; x: number; z: number; hp: number; rotY: number; weapon?: CompiledMesh; walkCycle?: number; isWalking?: boolean; isAttacking?: boolean; attackTimer?: number }[] = [];
  public scrolls: { id: string; x: number; z: number; title: string; fact: string; collected: boolean }[] = [];
  public herbs: { x: number; z: number; collected: boolean }[] = [];

  // Background dynamic objects
  private clouds: { x: number; y: number; z: number; speed: number; scale: number }[] = [];
  private birds: { x: number; y: number; z: number; radius: number; angle: number; speed: number }[] = [];
  private particles: { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; color: [number, number, number] }[] = [];

  // Procedural Roblox Character Rigs (Articulated Limbs)
  public rigTuah!: CompiledCharacterRig;
  public rigJebat!: CompiledCharacterRig;
  public rigBendahara!: CompiledCharacterRig;
  public rigSultan!: CompiledCharacterRig;
  public rigPirate!: CompiledCharacterRig;
  public rigAmuk!: CompiledCharacterRig;
  public rigTamingSari!: CompiledCharacterRig;

  // Cached Meshes
  public meshTuah!: CompiledMesh;
  public meshJebat!: CompiledMesh;
  public meshBendahara!: CompiledMesh;
  public meshSultan!: CompiledMesh;
  public meshPirate!: CompiledMesh;
  public meshAmuk!: CompiledMesh;
  public meshTamingSari!: CompiledMesh;
  public meshKerisNormal!: CompiledMesh;
  public meshKerisTamingSari!: CompiledMesh;
  public meshParang!: CompiledMesh;
  public meshScroll!: CompiledMesh;
  public meshHerb!: CompiledMesh;
  public meshShadow!: CompiledMesh;
  public meshParticle!: CompiledMesh;

  // Environment & Background Meshes
  public meshSkyPekan!: CompiledMesh;
  public meshSkyLaut!: CompiledMesh;
  public meshSkyIstana!: CompiledMesh;
  public meshMountains!: CompiledMesh;
  public meshCloudCluster!: CompiledMesh;
  public meshSun!: CompiledMesh;
  public meshMoon!: CompiledMesh;
  public meshBird!: CompiledMesh;
  public meshHouse!: CompiledMesh;
  public meshPalm!: CompiledMesh;
  public meshPelita!: CompiledMesh;
  public meshFence!: CompiledMesh;
  public meshShrub!: CompiledMesh;
  public meshWaterGrid!: CompiledMesh;
  public meshFleet!: CompiledMesh;
  public meshStallYellow!: CompiledMesh;
  public meshStallRed!: CompiledMesh;
  public meshBoat!: CompiledMesh;
  public meshThrone!: CompiledMesh;
  public meshPillar!: CompiledMesh;
  public meshCrate!: CompiledMesh;
  public meshJetty!: CompiledMesh;
  public meshGroundPekan!: CompiledMesh;
  public meshPath!: CompiledMesh;
  public meshGroundLaut!: CompiledMesh;
  public meshGroundIstana!: CompiledMesh;
  public meshCarpet!: CompiledMesh;

  // Stages definition
  public stages: StageData[] = [];

  // Callback hooks for UI
  public onHUDUpdate?: () => void;
  public onStageChange?: (stageIdx: number, stageName: string, bannerText: string) => void;
  public onDialogShow?: (dialog: { speaker: string; avatar: string; type: 'fact' | 'lore'; text: string }) => void;
  public onDialogClose?: () => void;
  public onQuizStart?: () => void;
  public onVictory?: (score: number, stars: number) => void;
  public onGameOver?: () => void;
  public onNearInteractChange?: (near: boolean) => void;

  public isDialogActive = false;
  public isQuizActive = false;
  private dialogQueue: { speaker: string; avatar: string; type: 'fact' | 'lore'; text: string }[] = [];
  private dialogOnComplete: (() => void) | null = null;
  private lastTime = performance.now();
  private animationFrameId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false });
    if (!gl) {
      throw new Error("WebGL is not supported in this environment");
    }
    this.gl = gl;

    this.initGL();
    this.initMeshes();
    this.initBackgroundElements();
    this.initStages();
    this.initPointerControls();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private initPointerControls() {
    this.canvas.addEventListener('pointerdown', (e) => {
      this.isPointerDown = true;
      this.pointerStartX = e.clientX;
      this.pointerStartY = e.clientY;
      this.hasMovedPointer = false;
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isPointerDown) return;
      const dx = e.clientX - this.pointerStartX;
      const dy = e.clientY - this.pointerStartY;
      if (Math.hypot(dx, dy) > 3) {
        this.hasMovedPointer = true;
      }
      this.camera.targetAngleY -= dx * 0.0055;
      this.camera.targetAngleX = Math.max(0.1, Math.min(1.2, this.camera.targetAngleX + dy * 0.0045));
      this.pointerStartX = e.clientX;
      this.pointerStartY = e.clientY;
    });

    window.addEventListener('pointerup', (e) => {
      if (this.isPointerDown && !this.hasMovedPointer && e.button === 0) {
        // Tap/click on scene triggers attack combo
        if (!this.isDialogActive && !this.isQuizActive && !this.isPaused && !this.isGameOver) {
          this.handleAttack();
        }
      }
      this.isPointerDown = false;
    });

    window.addEventListener('pointercancel', () => {
      this.isPointerDown = false;
    });

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.camera.distance = Math.max(4.5, Math.min(16.0, this.camera.distance + e.deltaY * 0.008));
    }, { passive: false });
  }

  private initGL() {
    const gl = this.gl;
    const vs = this.compileShader(gl.VERTEX_SHADER, V_SHADER);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, F_SHADER);
    this.prog = gl.createProgram()!;
    gl.attachShader(this.prog, vs);
    gl.attachShader(this.prog, fs);
    gl.linkProgram(this.prog);

    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(this.prog));
    }

    this.aPos = gl.getAttribLocation(this.prog, 'aPosition');
    this.aNorm = gl.getAttribLocation(this.prog, 'aNormal');
    this.aCol = gl.getAttribLocation(this.prog, 'aColor');

    this.uModel = gl.getUniformLocation(this.prog, 'uModel')!;
    this.uView = gl.getUniformLocation(this.prog, 'uView')!;
    this.uProj = gl.getUniformLocation(this.prog, 'uProjection')!;
    this.uSunDir = gl.getUniformLocation(this.prog, 'uSunDir')!;
    this.uSunColor = gl.getUniformLocation(this.prog, 'uSunColor')!;
    this.uAmbientColor = gl.getUniformLocation(this.prog, 'uAmbientColor')!;
    this.uFogColor = gl.getUniformLocation(this.prog, 'uFogColor')!;
    this.uFogStart = gl.getUniformLocation(this.prog, 'uFogStart')!;
    this.uFogEnd = gl.getUniformLocation(this.prog, 'uFogEnd')!;
    this.uWaveTime = gl.getUniformLocation(this.prog, 'uWaveTime')!;
    this.uIsWater = gl.getUniformLocation(this.prog, 'uIsWater')!;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
  }

  private compileShader(type: number, src: string): WebGLShader {
    const s = this.gl.createShader(type)!;
    this.gl.shaderSource(s, src);
    this.gl.compileShader(s);
    return s;
  }

  public resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  public createMeshBuffers(geom: CompiledMesh): CompiledMesh {
    const gl = this.gl;
    const vBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geom.positions, gl.STATIC_DRAW);

    const nBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geom.normals, gl.STATIC_DRAW);

    const cBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geom.colors, gl.STATIC_DRAW);

    geom.buffers = { vBuf, nBuf, cBuf };
    return geom;
  }

  public compileRig(rig: CharacterRig): CompiledCharacterRig {
    return {
      head: this.createMeshBuffers(rig.head),
      torso: this.createMeshBuffers(rig.torso),
      leftArm: this.createMeshBuffers(rig.leftArm),
      rightArm: this.createMeshBuffers(rig.rightArm),
      leftLeg: this.createMeshBuffers(rig.leftLeg),
      rightLeg: this.createMeshBuffers(rig.rightLeg),
    };
  }

  private initMeshes() {
    this.meshTuah = this.createMeshBuffers(createCharacterMesh(Palette.tuahGreen, Palette.tanjakGold));
    this.meshJebat = this.createMeshBuffers(createCharacterMesh(Palette.jebatRed, Palette.pirateBlack));
    this.meshBendahara = this.createMeshBuffers(createCharacterMesh(Palette.bendaharaGrey, Palette.songketGold));
    this.meshSultan = this.createMeshBuffers(createCharacterMesh(Palette.sultanRoyalYellow, Palette.goldDecor));
    this.meshPirate = this.createMeshBuffers(createCharacterMesh(Palette.pirateBlack, Palette.clothRed));
    this.meshAmuk = this.createMeshBuffers(createCharacterMesh([0.65, 0.22, 0.12], [0.85, 0.2, 0.2]));
    this.meshTamingSari = this.createMeshBuffers(createCharacterMesh([0.65, 0.2, 0.2], Palette.tanjakGold));

    // Modular Articulated Character Rigs for fluid Roblox movement
    this.rigTuah = this.compileRig(createCharacterRig(Palette.tuahGreen, Palette.tanjakGold, Palette.skin, true));
    this.rigJebat = this.compileRig(createCharacterRig(Palette.jebatRed, Palette.pirateBlack, Palette.skin, true));
    this.rigBendahara = this.compileRig(createCharacterRig(Palette.bendaharaGrey, Palette.songketGold, Palette.skin, true));
    this.rigSultan = this.compileRig(createCharacterRig(Palette.sultanRoyalYellow, Palette.goldDecor, Palette.skin, true));
    this.rigPirate = this.compileRig(createCharacterRig(Palette.pirateBlack, Palette.clothRed, Palette.skin, false));
    this.rigAmuk = this.compileRig(createCharacterRig([0.65, 0.22, 0.12], [0.85, 0.2, 0.2], Palette.skin, false));
    this.rigTamingSari = this.compileRig(createCharacterRig([0.65, 0.2, 0.2], Palette.tanjakGold, Palette.skin, true));

    this.meshKerisNormal = this.createMeshBuffers(createKerisWeaponMesh(false));
    this.meshKerisTamingSari = this.createMeshBuffers(createKerisWeaponMesh(true));
    this.meshParang = this.createMeshBuffers(createParangMesh());
    this.meshScroll = this.createMeshBuffers(createScrollMesh());
    this.meshHerb = this.createMeshBuffers(createHerbMesh());
    this.meshShadow = this.createMeshBuffers(createShadowMesh());
    this.meshParticle = this.createMeshBuffers(mergeGeometries([buildBox(0.18, 0.18, 0.18, [1.0, 0.9, 0.4])]));

    // Background & Environment Props
    this.meshSkyPekan = this.createMeshBuffers(createSkydomeMesh('pekan', 'pagi'));
    this.meshSkyLaut = this.createMeshBuffers(createSkydomeMesh('laut', 'senja'));
    this.meshSkyIstana = this.createMeshBuffers(createSkydomeMesh('istana', 'pagi'));

    this.meshMountains = this.createMeshBuffers(createMountainRangeMesh());
    this.meshCloudCluster = this.createMeshBuffers(createCloudClusterMesh());
    this.meshSun = this.createMeshBuffers(createCelestialDisc(true));
    this.meshMoon = this.createMeshBuffers(createCelestialDisc(false));
    this.meshBird = this.createMeshBuffers(createBirdMesh());

    this.meshHouse = this.createMeshBuffers(createDetailedMalayHouse());
    this.meshPalm = this.createMeshBuffers(createLushPalmTree());
    this.meshPelita = this.createMeshBuffers(createPelitaMesh());
    this.meshFence = this.createMeshBuffers(createBambooFence());
    this.meshShrub = this.createMeshBuffers(createShrubMesh());

    this.meshWaterGrid = this.createMeshBuffers(createWaterPlane(64, 48, 14));
    this.meshFleet = this.createMeshBuffers(createDistantFleetMesh());

    this.meshStallYellow = this.createMeshBuffers(createMarketStallMesh(Palette.sultanRoyalYellow));
    this.meshStallRed = this.createMeshBuffers(createMarketStallMesh(Palette.clothRed));
    this.meshBoat = this.createMeshBuffers(createBoatMesh());
    this.meshThrone = this.createMeshBuffers(createThroneMesh());
    this.meshPillar = this.createMeshBuffers(createPalacePillarMesh());
    this.meshCrate = this.createMeshBuffers(createCrateMesh());
    this.meshJetty = this.createMeshBuffers(createJettyMesh());

    // Grounds
    this.meshGroundPekan = this.createMeshBuffers(mergeGeometries([buildBox(68, 0.2, 68, Palette.groundGrass)]));
    this.meshPath = this.createMeshBuffers(mergeGeometries([buildBox(8.5, 0.25, 68, Palette.laterite)]));
    this.meshGroundLaut = this.createMeshBuffers(mergeGeometries([buildBox(68, 0.2, 34, Palette.sandCoast)]));
    this.meshGroundIstana = this.createMeshBuffers(mergeGeometries([buildBox(64, 0.2, 64, Palette.palaceFloor)]));
    this.meshCarpet = this.createMeshBuffers(mergeGeometries([buildBox(5.6, 0.25, 36, Palette.carpetRed)]));
  }

  private initBackgroundElements() {
    // Initial Clouds
    this.clouds = [
      { x: -30, y: 24, z: 28, speed: 0.8, scale: 1.6 },
      { x: -6, y: 26, z: 36, speed: 0.65, scale: 2.1 },
      { x: 22, y: 23, z: 30, speed: 0.75, scale: 1.8 },
      { x: 45, y: 27, z: 42, speed: 0.55, scale: 2.3 },
    ];

    // Flying Birds
    this.birds = [
      { x: -8, y: 16, z: 12, radius: 14, angle: 0, speed: 0.8 },
      { x: 12, y: 19, z: 18, radius: 18, angle: Math.PI * 0.7, speed: 0.65 },
      { x: -22, y: 14, z: -2, radius: 12, angle: Math.PI * 1.4, speed: 0.9 },
    ];

    // Ambient floating particles (sunbeams / sea mist / palace sparks)
    this.particles = [];
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: (Math.random() - 0.5) * 44,
        y: Math.random() * 8 + 0.5,
        z: (Math.random() - 0.5) * 44,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() * 0.3 + 0.1),
        vz: (Math.random() - 0.5) * 0.4,
        life: Math.random() * 6 + 2,
        color: [1.0, 0.88, 0.45]
      });
    }
  }

  private initStages() {
    this.stages = [
      {
        id: 1,
        name: "Bab 1: Menyelamatkan Bendahara di Pekan Melaka",
        banner: "Bab 1: Cari 3 Skrol Fakta & Kalahkan Orang Mengamuk untuk Lindungi Bendahara!",
        theme: "pekan",
        skyColors: {
          zenith: [0.25, 0.55, 0.88],
          horizon: [0.85, 0.92, 0.98],
          fog: [0.72, 0.85, 0.95],
          sun: [1.0, 0.95, 0.85]
        },
        dialogs: [
          {
            speaker: "Hang Tuah",
            avatar: "⚔️",
            type: "lore",
            text: "Sahabatku sekalian, kita baru selesai menuntut ilmu silat di Gunung Ledang. Hari ini kita ke pekan Melaka membeli bekalan untuk ibu bapaku."
          },
          {
            speaker: "Penduduk Pasar",
            avatar: "😱",
            type: "lore",
            text: "Tolong! Ada lelaki sedang mengamuk di tengah pekan! Dia mengayunkan senjata! Lari selamatkan diri!"
          },
          {
            speaker: "Bendahara Tun Perak",
            avatar: "📜",
            type: "fact",
            text: "[FAKTA SEJARAH] Tenang semua! Jangan cemas! Orang mengamuk ini berbahaya, rakyat jelata segera berundur ke tempat selamat!"
          },
          {
            speaker: "Hang Tuah",
            avatar: "🗡️",
            type: "fact",
            text: "[FAKTA SEJARAH] Bendahara dalam bahaya! Sebagai anak watan yang taat setia, pantang pahlawan Melaka berpeluk tubuh. Mara bersamaku!"
          }
        ],
        scrolls: [
          {
            id: 's1_1',
            x: -7, z: -4,
            title: "Asal-Usul Hang Tuah",
            fact: "[FAKTA SEJARAH] Hang Tuah dilahirkan di Kampung Sungai Duyong, Melaka. Bapanya bernama Hang Mahmud dan ibunya bernama Dang Merdu Wati."
          },
          {
            id: 's1_2',
            x: 7, z: -8,
            title: "Lima Sahabat Karib",
            fact: "[FAKTA SEJARAH] Hang Tuah mempunyai empat sahabat karib sejak kecil iaitu Hang Jebat, Hang Kasturi, Hang Lekir dan Hang Lekiu."
          },
          {
            id: 's1_3',
            x: -8, z: 9,
            title: "Berguru Ilmu Persilatan",
            fact: "[FAKTA SEJARAH] Hang Tuah dan empat sahabatnya menuntut ilmu persilatan dan kebatinan di Gunung Ledang bersama Aria Putera."
          }
        ],
        herbs: [{ x: -3.5, z: 2.5 }],
        enemies: [
          {
            id: 'amuk',
            name: "Orang Mengamuk",
            x: 0, z: 6,
            hp: 3
          }
        ],
        bendahara: { x: 0, z: 13 }
      },
      {
        id: 2,
        name: "Bab 2: Ancaman Lanun & Keris Taming Sari",
        banner: "Bab 2: Kalahkan 3 Lanun di Pelabuhan & Tumpaskan Pendekar Taming Sari!",
        theme: "laut",
        skyColors: {
          zenith: [0.28, 0.15, 0.42],
          horizon: [0.98, 0.65, 0.28],
          fog: [0.88, 0.45, 0.25],
          sun: [1.0, 0.75, 0.3]
        },
        dialogs: [
          {
            speaker: "Hang Tuah",
            avatar: "⛵",
            type: "lore",
            text: "Selat Melaka adalah laluan perdagangan antarabangsa yang makmur. Namun gerombolan lanun mula mengganggu kapal-kapal pedagang."
          },
          {
            speaker: "Sultan Melaka",
            avatar: "👑",
            type: "fact",
            text: "[FAKTA SEJARAH] Beta menitahkan Hang Tuah mengetuai pertahanan perairan Melaka dan mengutus rombongan muhibah ke Majapahit!"
          },
          {
            speaker: "Pendekar Taming Sari",
            avatar: "🥷",
            type: "fact",
            text: "[FAKTA SEJARAH] Aku Taming Sari, pendekar kebal Majapahit! Tiada senjata mampu menembusi kulitku melainkan keris sakti ini!"
          }
        ],
        scrolls: [
          {
            id: 's2_1',
            x: -6, z: -4,
            title: "Laksamana Melaka",
            fact: "[FAKTA SEJARAH] Hang Tuah dilantik sebagai Laksamana Melaka. Peranannya ialah Ketua Angkatan Laut, Pengawal Peribadi Sultan, dan Ketua Utusan Diplomat."
          },
          {
            id: 's2_2',
            x: 4, z: 1.5,
            title: "Kedaulatan Selat Melaka",
            fact: "[FAKTA SEJARAH] Hang Tuah berjaya menghapuskan ancaman lanun di perairan Selat Melaka, menjadikan pelabuhan Melaka aman dan dikunjungi ribuan pedagang dunia."
          }
        ],
        herbs: [{ x: 4, z: -8 }],
        enemies: [
          { id: 'p1', name: "Lanun Selat", x: -5, z: -1, hp: 2 },
          { id: 'p2', name: "Lanun Selat", x: 5, z: -2, hp: 2 },
          { id: 'p3', name: "Lanun Selat", x: 0, z: -6, hp: 2 }
        ],
        boss: {
          name: "Pendekar Taming Sari",
          x: 0, z: 6.5,
          hp: 4
        }
      },
      {
        id: 3,
        name: "Bab 3: Balairung Seri & Ujian Kebijaksanaan",
        banner: "Bab 3: Hadap Sultan Melaka di Balairung Seri & Jawab 5 Soalan Sejarah KSSR!",
        theme: "istana",
        skyColors: {
          zenith: [0.12, 0.08, 0.1],
          horizon: [0.22, 0.12, 0.14],
          fog: [0.18, 0.1, 0.12],
          sun: [1.0, 0.85, 0.4]
        },
        dialogs: [
          {
            speaker: "Bendahara Tun Perak",
            avatar: "📜",
            type: "lore",
            text: "Selamat kembali Laksamana Hang Tuah! Kejayaanmu mendamaikan Selat Melaka dan mengalahkan Taming Sari terserlah di segenap pelusuk nusantara."
          },
          {
            speaker: "Sultan Melaka",
            avatar: "👑",
            type: "fact",
            text: "[FAKTA SEJARAH] Laksamana Melaka mestilah seorang yang bukan sahaja gagah di medan perang, tetapi tajam fikiran dan bijaksana diplomasi antarabangsa. Buktikan kebijaksanaanmu!"
          }
        ],
        quizQuestions: [
          {
            q: "1. Di manakah tempat kelahiran Tokoh Terbilang Hang Tuah mengikut silibus Sejarah Tahun 4?",
            options: [
              "A. Kampung Sungai Duyong, Melaka",
              "B. Temasik (Singapura)",
              "C. Pasai, Sumatera"
            ],
            correct: 0,
            explanation: "[FAKTA SEJARAH] Hang Tuah dilahirkan di Kampung Sungai Duyong, Melaka. Bapanya bernama Hang Mahmud dan ibunya Dang Merdu Wati."
          },
          {
            q: "2. Apakah gelaran jawatan yang disandang oleh Hang Tuah di Kesultanan Melayu Melaka?",
            options: [
              "A. Syahbandar",
              "B. Laksamana Melaka",
              "C. Temenggung"
            ],
            correct: 1,
            explanation: "[FAKTA SEJARAH] Hang Tuah dilantik sebagai Laksamana Melaka yang mengetuai angkatan tentera laut dan menjadi pengawal peribadi Sultan."
          },
          {
            q: "3. Mengapakah Raja Majapahit menganugerahkan Keris Taming Sari kepada Hang Tuah?",
            options: [
              "A. Dibeli dengan jongkong emas",
              "B. Kerana Hang Tuah berjaya menewaskan pendekar Taming Sari",
              "C. Hadiah perkahwinan diraja"
            ],
            correct: 1,
            explanation: "[FAKTA SEJARAH] Hang Tuah berjaya menewaskan Taming Sari dalam pertarungan di Majapahit, lalu Raja Majapahit menghadiahkan keris sakti tersebut."
          },
          {
            q: "4. Berapakah jumlah bahasa asing yang berjaya dikuasai oleh Hang Tuah untuk urusan duta dan hubungan antarabangsa?",
            options: [
              "A. 12 bahasa",
              "B. 3 bahasa",
              "C. 2 bahasa"
            ],
            correct: 0,
            explanation: "[FAKTA SEJARAH] Hang Tuah terkenal dengan kebijaksanaannya kerana mampu menguasai 12 bahasa asing termasuk bahasa Cina, Siam, Keling, dan Arab."
          },
          {
            q: "5. Apakah nilai murni dan iktibar utama daripada keperibadian Hang Tuah yang dipelajari murid Tahun 4?",
            options: [
              "A. Mementingkan diri sendiri",
              "B. Kesetiaan yang tidak berbelah bahagi kepada Raja dan Negara",
              "C. Bersikap sombong dan tamak kuasa"
            ],
            correct: 1,
            explanation: "[FAKTA SEJARAH] Hang Tuah melambangkan kesetiaan, ketaatan, keberanian dan kebijaksanaan mempertahankan kedaulatan tanah air."
          }
        ]
      }
    ];
  }

  public setTimeOfDay(tod: TimeOfDay) {
    this.bgSettings.timeOfDay = tod;
    // Rebuild the sky mesh for the new atmosphere
    const stage = this.stages[this.currentStageIdx];
    if (stage.theme === 'pekan') {
      this.meshSkyPekan = this.createMeshBuffers(createSkydomeMesh('pekan', tod));
    } else if (stage.theme === 'laut') {
      this.meshSkyLaut = this.createMeshBuffers(createSkydomeMesh('laut', tod));
    }
  }

  public loadStage(stageIdx: number) {
    this.currentStageIdx = stageIdx;
    const stage = this.stages[stageIdx];
    this.player.x = 0;
    this.player.z = stage.theme === "laut" ? -10 : -12;
    this.player.rotY = 0;
    this.player.targetRotY = 0;
    this.player.isAttacking = false;
    this.hearts = 3;

    // Reset sky & atmosphere for this stage
    this.setTimeOfDay(this.bgSettings.timeOfDay);

    // Notify React UI of new stage, name, and banner
    this.onStageChange?.(stageIdx, stage.name, stage.banner);
    this.onHUDUpdate?.();

    this.worldObjects = [];
    this.npcs = [];
    this.enemies = [];
    this.scrolls = [];
    this.herbs = [];

    // Setup scenery for stage
    if (stage.theme === "pekan") {
      // Main street & path
      this.worldObjects.push({ mesh: this.meshPath, x: 0, z: 0, rotY: 0 });

      // Traditional houses along the kampung street
      this.worldObjects.push({ mesh: this.meshHouse, x: -11, z: -5, rotY: 0.3 });
      this.worldObjects.push({ mesh: this.meshHouse, x: 11, z: -3, rotY: -0.4 });
      this.worldObjects.push({ mesh: this.meshHouse, x: -11, z: 9, rotY: 0.2 });
      this.worldObjects.push({ mesh: this.meshHouse, x: 11, z: 10, rotY: -0.2 });

      // Bamboo fences bordering the kampung
      this.worldObjects.push({ mesh: this.meshFence, x: -6.5, z: -10, rotY: 0 });
      this.worldObjects.push({ mesh: this.meshFence, x: 6.5, z: -10, rotY: 0 });
      this.worldObjects.push({ mesh: this.meshFence, x: -6.5, z: 14, rotY: 0 });
      this.worldObjects.push({ mesh: this.meshFence, x: 6.5, z: 14, rotY: 0 });

      // Market stalls
      this.worldObjects.push({ mesh: this.meshStallYellow, x: -4.8, z: -1, rotY: 0 });
      this.worldObjects.push({ mesh: this.meshStallRed, x: 4.8, z: -1, rotY: 0 });
      this.worldObjects.push({ mesh: this.meshStallYellow, x: -4.8, z: 5, rotY: 0 });

      // Tropical shrubs & flowers
      this.worldObjects.push({ mesh: this.meshShrub, x: -7.5, z: -3, rotY: 0.5 });
      this.worldObjects.push({ mesh: this.meshShrub, x: 7.5, z: -1.5, rotY: -0.8 });
      this.worldObjects.push({ mesh: this.meshShrub, x: -7.5, z: 7.5, rotY: 1.2 });
      this.worldObjects.push({ mesh: this.meshShrub, x: 7.5, z: 7.5, rotY: 0.3 });

      // Crates of merchandise
      this.worldObjects.push({ mesh: this.meshCrate, x: -6.2, z: -1, rotY: 0.2 });
      this.worldObjects.push({ mesh: this.meshCrate, x: 6.2, z: 0, rotY: -0.1 });
      this.worldObjects.push({ mesh: this.meshCrate, x: -6.2, z: 5, rotY: 0.5 });

      // Lush Palm Trees
      this.worldObjects.push({ mesh: this.meshPalm, x: -16, z: -12, rotY: 0 });
      this.worldObjects.push({ mesh: this.meshPalm, x: 16, z: -10, rotY: 1.2 });
      this.worldObjects.push({ mesh: this.meshPalm, x: -15, z: 14, rotY: 2.1 });
      this.worldObjects.push({ mesh: this.meshPalm, x: 15, z: 16, rotY: 0.5 });

      // NPCs
      this.npcs.push({
        id: 'jebat',
        name: "Hang Jebat",
        mesh: this.meshJebat,
        rig: this.rigJebat,
        x: -2.5, z: -10, rotY: 0.4,
        dialog: "[FAKTA SEJARAH] Hang Jebat: 'Kekanda Tuah! Orang mengamuk itu mara ke arah Bendahara Tun Perak! Kita perlu bertindak tangkas!'"
      });

      this.npcs.push({
        id: 'bendahara',
        name: "Bendahara Tun Perak",
        mesh: this.meshBendahara,
        rig: this.rigBendahara,
        x: stage.bendahara!.x, z: stage.bendahara!.z, rotY: Math.PI,
        dialog: "[FAKTA SEJARAH] Bendahara Tun Perak: 'Syabas anak muda berlima! Keberanian dan ketangkasan silat kamu sungguh luar biasa. Beta akan membawa kamu menghadap Paduka Sultan Melaka!'"
      });

      // Enemy
      if (stage.enemies) {
        stage.enemies.forEach(en => {
          this.enemies.push({
            id: en.id,
            name: en.name,
            mesh: this.meshAmuk,
            rig: this.rigAmuk,
            x: en.x, z: en.z,
            hp: en.hp,
            rotY: 0,
            weapon: this.meshParang,
            walkCycle: 0,
            isWalking: false
          });
        });
      }

    } else if (stage.theme === "laut") {
      // Grand Timber Wharf & Pier (Dermaga Pelabuhan & Pentas Duel Taming Sari)
      this.worldObjects.push({ mesh: this.meshJetty, x: 0, z: 0, rotY: 0 });

      // Pirate boats moored alongside the pier in the water
      this.worldObjects.push({ mesh: this.meshBoat, x: -10, z: 3, rotY: 0 });
      this.worldObjects.push({ mesh: this.meshBoat, x: 10, z: 3, rotY: Math.PI });

      // Spice crates & trade cargo on wharf deck
      this.worldObjects.push({ mesh: this.meshCrate, x: -7, z: -3, rotY: 0.2 });
      this.worldObjects.push({ mesh: this.meshCrate, x: 7, z: -3, rotY: -0.4 });
      this.worldObjects.push({ mesh: this.meshCrate, x: -7, z: 1, rotY: 0.1 });
      this.worldObjects.push({ mesh: this.meshCrate, x: 7, z: 1, rotY: 0.4 });

      // Coastal palms on the sandy shore behind the wharf
      this.worldObjects.push({ mesh: this.meshPalm, x: -14, z: -11, rotY: 0 });
      this.worldObjects.push({ mesh: this.meshPalm, x: 14, z: -10, rotY: 0.8 });
      this.worldObjects.push({ mesh: this.meshPalm, x: -8, z: -14, rotY: 1.4 });
      this.worldObjects.push({ mesh: this.meshPalm, x: 8, z: -13, rotY: -0.6 });

      // Port merchant stall on shore
      this.worldObjects.push({ mesh: this.meshStallYellow, x: -6, z: -9, rotY: 0 });

      // Distant Armada Fleets on the deep horizon
      this.worldObjects.push({ mesh: this.meshFleet, x: 0, z: 18, rotY: 0 });

      if (stage.enemies) {
        stage.enemies.forEach(p => {
          this.enemies.push({
            id: p.id,
            name: p.name,
            mesh: this.meshPirate,
            rig: this.rigPirate,
            x: p.x, z: p.z,
            hp: p.hp,
            rotY: 0,
            weapon: this.meshParang,
            walkCycle: 0,
            isWalking: false
          });
        });
      }

      if (stage.boss) {
        this.enemies.push({
          id: 'taming_sari',
          name: stage.boss.name,
          mesh: this.meshTamingSari,
          rig: this.rigTamingSari,
          x: stage.boss.x, z: stage.boss.z,
          hp: stage.boss.hp,
          rotY: Math.PI,
          weapon: this.meshKerisTamingSari,
          walkCycle: 0,
          isWalking: false
        });
      }

    } else if (stage.theme === "istana") {
      // Palace Balairung Seri Interior
      this.worldObjects.push({ mesh: this.meshCarpet, x: 0, z: 2, rotY: 0 });

      // Grand Palace Pillars with golden capitals
      for (let z = -14; z <= 8; z += 4.5) {
        this.worldObjects.push({ mesh: this.meshPillar, x: -6.5, z: z, rotY: 0 });
        this.worldObjects.push({ mesh: this.meshPillar, x: 6.5, z: z, rotY: 0 });
      }

      // Traditional Brass Pelita with flickering flames
      for (let z = -12; z <= 6; z += 6) {
        this.worldObjects.push({ mesh: this.meshPelita, x: -4.5, z: z, rotY: 0 });
        this.worldObjects.push({ mesh: this.meshPelita, x: 4.5, z: z, rotY: 0 });
      }

      // Royal Throne
      this.worldObjects.push({ mesh: this.meshThrone, x: 0, z: 12, rotY: Math.PI });

      // NPCs
      this.npcs.push({
        id: 'sultan',
        name: "Sultan Melaka",
        mesh: this.meshSultan,
        rig: this.rigSultan,
        x: 0, z: 10.2, rotY: Math.PI,
        dialog: "[FAKTA SEJARAH] Sultan Melaka: 'Wahai Hang Tuah, beta anugerahkan kepadamu gelaran Laksamana Terbilang Melaka. Bersediakah engkau menduduki Ujian Kebijaksanaan Sejarah?'"
      });

      this.npcs.push({
        id: 'bendahara_istana',
        name: "Bendahara Tun Perak",
        mesh: this.meshBendahara,
        rig: this.rigBendahara,
        x: 3.4, z: 8.8, rotY: Math.PI - 0.4,
        dialog: "[FAKTA SEJARAH] Bendahara Tun Perak: 'Laksamana Hang Tuah bukan sahaja perwira di lautan, malah lambang kedaulatan bangsa Melayu Melaka.'"
      });
    }

    // Populate scrolls
    if (stage.scrolls) {
      stage.scrolls.forEach(s => {
        this.scrolls.push({
          id: s.id,
          x: s.x, z: s.z,
          title: s.title,
          fact: s.fact,
          collected: false
        });
      });
    }

    // Populate herbs
    if (stage.herbs) {
      stage.herbs.forEach(h => {
        this.herbs.push({
          x: h.x, z: h.z,
          collected: false
        });
      });
    }

    this.startDialogSequence(stage.dialogs);
  }

  public startDialogSequence(
    dialogs: { speaker: string; avatar: string; type: 'fact' | 'lore'; text: string }[],
    onComplete?: () => void
  ) {
    this.dialogQueue = [...dialogs];
    this.dialogOnComplete = onComplete || null;
    this.showNextDialog();
  }

  public showNextDialog() {
    if (this.dialogQueue.length === 0) {
      this.isDialogActive = false;
      this.onDialogClose?.();
      if (this.dialogOnComplete) {
        const cb = this.dialogOnComplete;
        this.dialogOnComplete = null;
        cb();
      }
      return;
    }
    this.isDialogActive = true;
    const d = this.dialogQueue.shift()!;
    this.onDialogShow?.(d);
    SoundFX.playPickup();
  }

  public spawnParticles(x: number, y: number, z: number, count = 6, color: [number, number, number] = [1, 0.9, 0.3]) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 0.4,
        y: y + (Math.random() - 0.5) * 0.4,
        z: z + (Math.random() - 0.5) * 0.4,
        vx: (Math.random() - 0.5) * 0.08,
        vy: 0.04 + Math.random() * 0.06,
        vz: (Math.random() - 0.5) * 0.08,
        life: 25 + Math.floor(Math.random() * 20),
        color
      });
    }
    if (this.particles.length > 120) {
      this.particles.splice(0, this.particles.length - 120);
    }
  }

  public spawnRadialParticles(x: number, y: number, z: number, count = 16, color: [number, number, number] = [1.0, 0.85, 0.2]) {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const speed = 0.09 + Math.random() * 0.07;
      this.particles.push({
        x,
        y,
        z,
        vx: Math.cos(angle) * speed,
        vy: 0.03 + Math.random() * 0.05,
        vz: Math.sin(angle) * speed,
        life: 28 + Math.floor(Math.random() * 16),
        color
      });
    }
    if (this.particles.length > 120) {
      this.particles.splice(0, this.particles.length - 120);
    }
  }

  public handleJump() {
    if (this.isDialogActive || this.isQuizActive || this.isPaused || this.isGameOver) return;
    if (this.player.isGrounded) {
      this.player.isGrounded = false;
      this.player.isJumping = true;
      this.player.vy = 0.27;
      SoundFX.playJump();
      this.spawnParticles(this.player.x, this.player.y + 0.1, this.player.z, 6, [0.85, 0.8, 0.7]);
    }
  }

  public handleDash() {
    if (this.isDialogActive || this.isQuizActive || this.isPaused || this.isGameOver) return;
    if (this.player.dashCooldown > 0 || this.player.isDashing) return;

    this.player.isDashing = true;
    this.player.dashTimer = 16;
    this.player.dashCooldown = 32;

    const dirX = Math.sin(this.player.rotY);
    const dirZ = Math.cos(this.player.rotY);

    this.player.dashDirX = dirX;
    this.player.dashDirZ = dirZ;

    SoundFX.playDash();
    this.camera.shakeTime = 8;
    this.camera.shakeIntensity = 0.15;
    this.spawnRadialParticles(this.player.x, this.player.y + 0.4, this.player.z, 12, [0.95, 0.85, 0.3]);
  }

  public setSprinting(active: boolean) {
    this.player.isSprinting = active;
  }

  public handleAttack() {
    if (this.isDialogActive || this.isQuizActive || this.isPaused || this.isGameOver) return;

    this.player.isAttacking = true;
    this.player.attackTimer = 18;

    // Advance combo: 1 (Tebasan Kilat) -> 2 (Tikaman Menyilang) -> 3 (Gegar Bimasakti Finisher)
    const combo = this.player.attackCombo;
    this.player.comboResetTimer = 45;

    if (combo === 3) {
      SoundFX.playFinisher();
      this.camera.shakeTime = 14;
      this.camera.shakeIntensity = 0.45;
      this.spawnRadialParticles(this.player.x, this.player.y + 0.8, this.player.z, 20, [1.0, 0.9, 0.2]);
      this.player.attackCombo = 1;
    } else {
      SoundFX.playSilatSlash();
      this.camera.shakeTime = 6;
      this.camera.shakeIntensity = 0.2;
      this.spawnParticles(this.player.x, this.player.y + 0.6, this.player.z, 6, [1.0, 0.8, 0.3]);
      this.player.attackCombo = combo + 1;
    }

    // Forward attack lunge
    const lungeDist = combo === 3 ? 0.45 : 0.25;
    this.player.x += Math.sin(this.player.rotY) * lungeDist;
    this.player.z += Math.cos(this.player.rotY) * lungeDist;

    const hitRange = combo === 3 ? 3.0 : 2.4;
    const damage = combo === 3 ? 2 : 1;

    this.enemies.forEach(en => {
      if (en.hp <= 0) return;
      const dx = en.x - this.player.x;
      const dz = en.z - this.player.z;
      const dist = Math.hypot(dx, dz);
      if (dist < hitRange) {
        en.hp -= damage;
        SoundFX.playHit();
        const kb = combo === 3 ? 1.2 : 0.6;
        en.x += (dx / (dist || 1)) * kb;
        en.z += (dz / (dist || 1)) * kb;
        this.spawnRadialParticles(en.x, 0.8, en.z, 10, [1.0, 0.3, 0.2]);

        if (en.hp <= 0) {
          this.score += 250;
          this.spawnRadialParticles(en.x, 0.8, en.z, 24, [1.0, 0.88, 0.25]);
          this.onHUDUpdate?.();
          this.checkStageObjectives();
        }
      }
    });
  }

  public handleInteract() {
    if (this.isDialogActive) {
      this.showNextDialog();
      return;
    }
    if (this.isQuizActive || this.isPaused || this.isGameOver) return;

    // Check NPC interaction
    for (const npc of this.npcs) {
      const dist = Math.hypot(npc.x - this.player.x, npc.z - this.player.z);
      if (dist < 2.8) {
        if (npc.id === 'sultan' && this.currentStageIdx === 2) {
          this.onQuizStart?.();
          return;
        }
        this.startDialogSequence([{
          speaker: npc.name,
          avatar: '🗣️',
          type: 'fact',
          text: npc.dialog
        }]);
        return;
      }
    }

    // Check Scroll collection
    for (const sc of this.scrolls) {
      if (!sc.collected) {
        const dist = Math.hypot(sc.x - this.player.x, sc.z - this.player.z);
        if (dist < 2.2) {
          sc.collected = true;
          this.score += 150;
          SoundFX.playPickup();
          this.onHUDUpdate?.();
          this.startDialogSequence([{
            speaker: "Skrol Fakta Sejarah KSSR",
            avatar: "📜",
            type: "fact",
            text: sc.fact
          }]);
          this.checkStageObjectives();
          return;
        }
      }
    }

    // Check Herb collection
    for (const h of this.herbs) {
      if (!h.collected) {
        const dist = Math.hypot(h.x - this.player.x, h.z - this.player.z);
        if (dist < 2.0) {
          h.collected = true;
          this.hearts = Math.min(3, this.hearts + 1);
          SoundFX.playHeal();
          this.onHUDUpdate?.();
          this.startDialogSequence([{
            speaker: "Herba Tradisional",
            avatar: "🌿",
            type: "lore",
            text: "Hang Tuah memetik herba penawar. Tenaga dan kecergasan pulih sepenuhnya!"
          }]);
          return;
        }
      }
    }
  }

  private checkStageObjectives() {
    if (this.currentStageIdx === 0) {
      const enemyDefeated = this.enemies.every(e => e.hp <= 0);
      const scrollsDone = this.scrolls.every(s => s.collected);
      if (enemyDefeated && scrollsDone) {
        this.stars = Math.max(this.stars, 1);
        this.onHUDUpdate?.();
        SoundFX.playVictory();
        let advanced = false;
        const advanceToBab2 = () => {
          if (!advanced) {
            advanced = true;
            this.loadStage(1);
          }
        };
        this.startDialogSequence([
          {
            speaker: "Bendahara Tun Perak",
            avatar: "📜",
            type: "fact",
            text: "[FAKTA SEJARAH] Syabas Hang Tuah! Kerana keberanianmu menewaskan orang mengamuk, kamu dan 4 sahabatmu kini dilantik berkhidmat di istana Melaka!"
          },
          {
            speaker: "Sistem Permainan",
            avatar: "⭐",
            type: "fact",
            text: "Tahniah! Anda berjaya menamatkan Bab 1. Tekan [Teruskan] untuk belayar ke Bab 2 di Selat Melaka!"
          }
        ], advanceToBab2);
        // Safety timeout fallback
        setTimeout(advanceToBab2, 8000);
      }
    } else if (this.currentStageIdx === 1) {
      const allDefeated = this.enemies.every(e => e.hp <= 0);
      const scrollsDone = this.scrolls.every(s => s.collected);
      if (allDefeated && scrollsDone) {
        this.stars = Math.max(this.stars, 2);
        this.player.hasTamingSari = true;
        this.onHUDUpdate?.();
        SoundFX.playVictory();
        let advanced = false;
        const advanceToBab3 = () => {
          if (!advanced) {
            advanced = true;
            this.loadStage(2);
          }
        };
        this.startDialogSequence([
          {
            speaker: "Hang Tuah",
            avatar: "🗡️",
            type: "fact",
            text: "[FAKTA SEJARAH] Alhamdulillah! Keris Taming Sari kini di tanganku. Selat Melaka kini aman daripada perompak lanun!"
          },
          {
            speaker: "Sistem Permainan",
            avatar: "⭐",
            type: "fact",
            text: "Tahniah! Anda menamatkan Bab 2. Tekan [Teruskan] untuk menghadap Paduka Sultan di Balairung Seri Istana Melaka!"
          }
        ], advanceToBab3);
        // Safety timeout fallback
        setTimeout(advanceToBab3, 8000);
      }
    }
  }

  public startLoop() {
    const loop = (time: number) => {
      const dt = Math.min((time - this.lastTime) / 1000, 0.1);
      this.lastTime = time;

      if (!this.isPaused && !this.isGameOver && !this.isVictory) {
        this.update(dt, time);
      }
      this.render(time);
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  public stopLoop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private update(dt: number, time: number) {
    if (this.isDialogActive || this.isQuizActive) return;

    // Camera-relative directional vectors
    const forwardX = -Math.sin(this.camera.angleY);
    const forwardZ = Math.cos(this.camera.angleY);
    const rightX = Math.cos(this.camera.angleY);
    const rightZ = Math.sin(this.camera.angleY);

    let inputForward = 0, inputRight = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) inputForward += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) inputForward -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) inputRight += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) inputRight -= 1;

    if (this.joystick.active) {
      inputRight += this.joystick.x;
      inputForward -= this.joystick.y;
    }

    let moveX = forwardX * inputForward + rightX * inputRight;
    let moveZ = forwardZ * inputForward + rightZ * inputRight;
    const len = Math.hypot(moveX, moveZ);

    const isSprinting = this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.player.isSprinting;
    const currentSpeed = isSprinting ? this.player.sprintSpeed : this.player.baseSpeed;

    if (len > 0.05) {
      moveX /= len;
      moveZ /= len;
      this.player.isWalking = true;
      this.player.walkCycle += dt * (isSprinting ? 22 : 14);
      this.player.x += moveX * currentSpeed;
      this.player.z += moveZ * currentSpeed;
      this.player.targetRotY = Math.atan2(moveX, moveZ);

      // Smoothly nudge camera behind moving player if user isn't actively dragging
      if (!this.isPointerDown) {
        const diff = this.player.targetRotY - this.camera.targetAngleY;
        const normDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
        this.camera.targetAngleY += normDiff * 0.02;
      }
    } else {
      this.player.isWalking = false;
    }

    // Determine current ground level (e.g. wharf elevation in Bab 2)
    let currentGroundY = 0.0;
    if (this.currentStageIdx === 1 && this.player.z > -6.0) {
      currentGroundY = 0.05;
    }

    // Vertical Jump & Gravity Physics
    if (this.player.y > currentGroundY || !this.player.isGrounded) {
      this.player.y += this.player.vy;
      this.player.vy -= 0.016; // Gravity
      if (this.player.y <= currentGroundY) {
        this.player.y = currentGroundY;
        this.player.vy = 0;
        this.player.isGrounded = true;
        this.player.isJumping = false;
        this.spawnParticles(this.player.x, this.player.y + 0.1, this.player.z, 5, [0.75, 0.7, 0.65]);
      }
    }

    // Dash / Silat Dodge Roll Logic
    if (this.player.isDashing) {
      this.player.dashTimer--;
      this.player.x += this.player.dashDirX * 0.36;
      this.player.z += this.player.dashDirZ * 0.36;
      if (this.player.dashTimer % 3 === 0) {
        this.spawnParticles(this.player.x, this.player.y + 0.3, this.player.z, 2, [0.95, 0.85, 0.2]);
      }
      if (this.player.dashTimer <= 0) {
        this.player.isDashing = false;
      }
    }
    if (this.player.dashCooldown > 0) {
      this.player.dashCooldown--;
    }

    // Combo reset timer
    if (this.player.comboResetTimer > 0) {
      this.player.comboResetTimer--;
      if (this.player.comboResetTimer <= 0) {
        this.player.attackCombo = 1;
      }
    }

    // Constrain inside bounds & strictly prevent walking into water in Bab 2
    if (this.currentStageIdx === 1) {
      this.player.z = Math.max(-18, Math.min(8.7, this.player.z));
      if (this.player.z > 4.0) {
        this.player.x = Math.max(-5.1, Math.min(5.1, this.player.x));
      } else if (this.player.z >= -6.0) {
        this.player.x = Math.max(-13.4, Math.min(13.4, this.player.x));
      } else {
        this.player.x = Math.max(-16.0, Math.min(16.0, this.player.x));
      }
    } else {
      this.player.x = Math.max(-22, Math.min(22, this.player.x));
      this.player.z = Math.max(-22, Math.min(22, this.player.z));
    }

    // Smooth heading rotation
    const rotDiff = this.player.targetRotY - this.player.rotY;
    const normRotDiff = Math.atan2(Math.sin(rotDiff), Math.cos(rotDiff));
    this.player.rotY += normRotDiff * 0.22;

    if (this.player.isAttacking) {
      this.player.attackTimer--;
      if (this.player.attackTimer <= 0) this.player.isAttacking = false;
    }

    // Enemies update & animation
    this.enemies.forEach(en => {
      if (en.hp <= 0) return;
      const dx = this.player.x - en.x;
      const dz = this.player.z - en.z;
      const dist = Math.hypot(dx, dz);

      if (dist < 9.0 && dist > 1.3) {
        en.isWalking = true;
        en.walkCycle = (en.walkCycle || 0) + dt * 12;
        en.x += (dx / dist) * 0.048;
        en.z += (dz / dist) * 0.048;
        en.rotY = Math.atan2(dx, dz);
      } else {
        en.isWalking = false;
      }

      // Constrain enemy positions in Bab 2 so they stay on wharf/shore
      if (this.currentStageIdx === 1) {
        en.z = Math.max(-18, Math.min(8.7, en.z));
        if (en.z > 4.0) {
          en.x = Math.max(-5.0, Math.min(5.0, en.x));
        } else if (en.z >= -6.0) {
          en.x = Math.max(-13.2, Math.min(13.2, en.x));
        } else {
          en.x = Math.max(-15.5, Math.min(15.5, en.x));
        }
      }

      if (dist <= 1.35 && Math.random() < 0.02 && !this.player.isDashing) {
        this.hearts--;
        SoundFX.playHit();
        this.camera.shakeTime = 10;
        this.camera.shakeIntensity = 0.3;
        this.onHUDUpdate?.();
        this.player.x += (this.player.x - en.x) * 0.5;
        this.player.z += (this.player.z - en.z) * 0.5;
        this.spawnRadialParticles(this.player.x, this.player.y + 0.8, this.player.z, 10, [1.0, 0.2, 0.2]);
        if (this.hearts <= 0) {
          this.isGameOver = true;
          this.onGameOver?.();
        }
      }
    });

    // 360-degree Orbit Camera follow with spring-arm smoothing & screen shake
    this.camera.angleY += (this.camera.targetAngleY - this.camera.angleY) * 0.12;
    this.camera.angleX += (this.camera.targetAngleX - this.camera.angleX) * 0.12;

    const desiredCamX = this.player.x + Math.sin(this.camera.angleY) * Math.cos(this.camera.angleX) * this.camera.distance;
    const desiredCamY = this.player.y + Math.sin(this.camera.angleX) * this.camera.distance + 1.2;
    const desiredCamZ = this.player.z - Math.cos(this.camera.angleY) * Math.cos(this.camera.angleX) * this.camera.distance;

    let shakeOffsetX = 0, shakeOffsetY = 0, shakeOffsetZ = 0;
    if (this.camera.shakeTime > 0) {
      this.camera.shakeTime--;
      const shakeAmt = this.camera.shakeIntensity * (this.camera.shakeTime / 12);
      shakeOffsetX = (Math.random() - 0.5) * shakeAmt;
      shakeOffsetY = (Math.random() - 0.5) * shakeAmt;
      shakeOffsetZ = (Math.random() - 0.5) * shakeAmt;
    }

    this.camera.x += (desiredCamX + shakeOffsetX - this.camera.x) * 0.14;
    this.camera.y += (desiredCamY + shakeOffsetY - this.camera.y) * 0.14;
    this.camera.z += (desiredCamZ + shakeOffsetZ - this.camera.z) * 0.14;

    this.camera.targetX = this.player.x + shakeOffsetX * 0.5;
    this.camera.targetY = this.player.y + 1.1 + shakeOffsetY * 0.5;
    this.camera.targetZ = this.player.z + shakeOffsetZ * 0.5;

    // Update dynamic background elements
    if (this.bgSettings.cloudsEnabled) {
      this.clouds.forEach(cl => {
        cl.x += cl.speed * dt;
        if (cl.x > 50) cl.x = -50;
      });
    }

    // Update flying birds
    this.birds.forEach(b => {
      b.angle += b.speed * dt * 0.5;
    });

    // Update ambient particles
    if (this.bgSettings.particlesEnabled) {
      this.particles.forEach(p => {
        p.x += p.vx * dt * 2.0;
        p.y += p.vy * dt * 1.5;
        p.z += p.vz * dt * 2.0;
        p.life -= dt;
        if (p.life <= 0 || p.y > 10) {
          p.x = this.player.x + (Math.random() - 0.5) * 30;
          p.y = 0.5 + Math.random();
          p.z = this.player.z + (Math.random() - 0.5) * 30;
          p.life = Math.random() * 5 + 3;
        }
      });
    }

    // Check interaction prompt proximity
    let nearInteract = false;
    for (const npc of this.npcs) {
      if (Math.hypot(npc.x - this.player.x, npc.z - this.player.z) < 2.8) nearInteract = true;
    }
    for (const sc of this.scrolls) {
      if (!sc.collected && Math.hypot(sc.x - this.player.x, sc.z - this.player.z) < 2.2) nearInteract = true;
    }
    for (const h of this.herbs) {
      if (!h.collected && Math.hypot(h.x - this.player.x, h.z - this.player.z) < 2.0) nearInteract = true;
    }
    this.onNearInteractChange?.(nearInteract);
  }

  private render(time: number) {
    const gl = this.gl;
    const prog = this.prog;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.useProgram(prog);

    const aspect = this.canvas.width / this.canvas.height;
    const projMat = Mat4.create();
    Mat4.perspective(projMat, Math.PI / 4, aspect, 0.1, 140);
    gl.uniformMatrix4fv(this.uProj, false, projMat);

    const viewMat = Mat4.create();
    Mat4.lookAt(viewMat, [this.camera.x, this.camera.y, this.camera.z], [this.camera.targetX, this.camera.targetY, this.camera.targetZ], [0, 1, 0]);
    gl.uniformMatrix4fv(this.uView, false, viewMat);

    const stage = this.stages[this.currentStageIdx];
    const tod = this.bgSettings.timeOfDay;

    // Dynamic Sun & Lighting setup according to time of day & theme
    let sunDir: [number, number, number] = [0.577, 0.816, 0.408];
    let sunColor: [number, number, number] = [0.45, 0.42, 0.38];
    let ambientColor: [number, number, number] = [0.65, 0.65, 0.65];
    let fogColor = stage.skyColors.fog;

    if (stage.theme === 'istana') {
      sunDir = [0.0, 0.95, 0.15];
      sunColor = [0.55, 0.45, 0.25];
      ambientColor = [0.55, 0.48, 0.42];
      fogColor = [0.22, 0.12, 0.14];
    } else if (tod === 'senja' || stage.theme === 'laut') {
      sunDir = [0.85, 0.32, 0.35];
      sunColor = [0.75, 0.38, 0.18];
      ambientColor = [0.58, 0.42, 0.38];
      fogColor = [0.88, 0.48, 0.28];
    } else if (tod === 'malam') {
      sunDir = [-0.3, 0.8, -0.4];
      sunColor = [0.25, 0.32, 0.48];
      ambientColor = [0.25, 0.28, 0.38];
      fogColor = [0.08, 0.12, 0.22];
    } else {
      sunDir = [0.5, 0.85, 0.3];
      sunColor = [0.45, 0.42, 0.38];
      ambientColor = [0.7, 0.72, 0.75];
      fogColor = [0.75, 0.86, 0.95];
    }

    gl.uniform3fv(this.uSunDir, sunDir);
    gl.uniform3fv(this.uSunColor, sunColor);
    gl.uniform3fv(this.uAmbientColor, ambientColor);
    gl.uniform3fv(this.uFogColor, fogColor);
    gl.uniform1f(this.uFogStart, 18.0 / Math.max(0.5, this.bgSettings.fogDensity));
    gl.uniform1f(this.uFogEnd, 48.0 / Math.max(0.5, this.bgSettings.fogDensity));
    gl.uniform1f(this.uWaveTime, this.bgSettings.waterWavesEnabled ? (time * 0.001) : 0);
    gl.uniform1f(this.uIsWater, 0.0);

    // --- 1. RENDER BACKGROUND ENVIRONMENT ---
    if (stage.theme === 'istana') {
      this.drawMesh(this.meshSkyIstana, 0, 0, 16);
    } else {
      // Skydome
      const skyMesh = (stage.theme === 'laut') ? this.meshSkyLaut : this.meshSkyPekan;
      this.drawMesh(skyMesh, this.camera.x * 0.3, -4, this.camera.z * 0.3);

      // Distant Gunung Ledang Mountains
      this.drawMesh(this.meshMountains, 0, -0.2, 0);

      // Sun or Moon Disc
      if (tod === 'malam') {
        this.drawMesh(this.meshMoon, -18, 32, 38, 0, 1.2, 1.2, 1.2);
      } else {
        const sunX = (stage.theme === 'laut') ? 22 : 16;
        const sunY = (stage.theme === 'laut') ? 14 : 32;
        this.drawMesh(this.meshSun, sunX, sunY, 44, 0, 1.4, 1.4, 1.4);
      }

      // Clouds
      if (this.bgSettings.cloudsEnabled) {
        this.clouds.forEach(cl => {
          this.drawMesh(this.meshCloudCluster, cl.x, cl.y, cl.z, 0, cl.scale, cl.scale * 0.7, cl.scale);
        });
      }

      // Flying Birds
      this.birds.forEach(b => {
        const bx = b.x + Math.cos(b.angle) * b.radius;
        const bz = b.z + Math.sin(b.angle) * b.radius;
        const brot = -b.angle + Math.PI / 2;
        const wingFlap = Math.sin(time * 0.012 + b.angle) * 0.2;
        this.drawMesh(this.meshBird, bx, b.y + wingFlap, bz, brot, 1.2, 1.2, 1.2);
      });
    }

    // --- 2. RENDER TERRAIN & GROUND ---
    if (stage.theme === 'pekan') {
      this.drawMesh(this.meshGroundPekan, 0, -0.1, 0);
    } else if (stage.theme === 'laut') {
      this.drawMesh(this.meshGroundLaut, 0, -0.1, -12);
      // Animated Sea Water
      gl.uniform1f(this.uIsWater, 1.0);
      this.drawMesh(this.meshWaterGrid, 0, -0.05, 12);
      gl.uniform1f(this.uIsWater, 0.0);
    } else {
      this.drawMesh(this.meshGroundIstana, 0, -0.1, 0);
    }

    // --- 3. RENDER WORLD OBJECTS ---
    this.worldObjects.forEach(obj => {
      this.drawMesh(obj.mesh, obj.x, obj.y || 0, obj.z, obj.rotY, obj.scale || 1, obj.scale || 1, obj.scale || 1);
    });

    // --- 4. RENDER COLLECTIBLES ---
    const floatY = 0.85 + Math.sin(time * 0.004) * 0.15;
    const rotScroll = time * 0.003;
    this.scrolls.forEach(sc => {
      if (!sc.collected) {
        this.drawMesh(this.meshShadow, sc.x, 0.02, sc.z, 0, 0.8, 1, 0.8);
        this.drawMesh(this.meshScroll, sc.x, floatY, sc.z, rotScroll, 1.3, 1.3, 1.3);
      }
    });

    this.herbs.forEach(h => {
      if (!h.collected) {
        this.drawMesh(this.meshShadow, h.x, 0.02, h.z, 0, 0.6, 1, 0.6);
        this.drawMesh(this.meshHerb, h.x, 0.25, h.z, rotScroll);
      }
    });

    // --- 5. RENDER NPCS ---
    this.npcs.forEach(npc => {
      this.drawMesh(this.meshShadow, npc.x, 0.02, npc.z, 0, 1.1, 1, 1.1);
      if (npc.rig) {
        this.drawCharacterRig(npc.rig, npc.x, 0, npc.z, npc.rotY, 0, false, false, false, 0, 1);
      } else {
        this.drawMesh(npc.mesh, npc.x, 0.8, npc.z, npc.rotY);
      }
    });

    // --- 6. RENDER ENEMIES ---
    this.enemies.forEach(en => {
      if (en.hp > 0) {
        this.drawMesh(this.meshShadow, en.x, 0.02, en.z, 0, 1.1, 1, 1.1);
        if (en.rig) {
          this.drawCharacterRig(
            en.rig,
            en.x, 0, en.z,
            en.rotY,
            en.walkCycle || 0,
            en.isWalking || false,
            false,
            en.hp <= 1,
            en.hp <= 1 ? 8 : 0,
            1,
            en.weapon
          );
        } else {
          this.drawMesh(en.mesh, en.x, 0.8, en.z, en.rotY);
          if (en.weapon) {
            const wx = en.x + Math.sin(en.rotY + 0.5) * 0.6;
            const wz = en.z + Math.cos(en.rotY + 0.5) * 0.6;
            const attackTilt = (en.hp <= 1) ? Math.sin(time * 0.02) * 0.5 : 0.3;
            this.drawMesh(en.weapon, wx, 0.9, wz, en.rotY + attackTilt);
          }
        }
      }
    });

    // --- 7. RENDER HANG TUAH (Fluid Articulated Roblox Rig) ---
    const jumpShadowScale = Math.max(0.4, 1.1 - this.player.y * 0.35);
    this.drawMesh(this.meshShadow, this.player.x, 0.02, this.player.z, 0, jumpShadowScale, 1, jumpShadowScale);

    const weaponMesh = this.player.hasTamingSari ? this.meshKerisTamingSari : this.meshKerisNormal;

    if (this.rigTuah) {
      this.drawCharacterRig(
        this.rigTuah,
        this.player.x,
        this.player.y,
        this.player.z,
        this.player.rotY,
        this.player.walkCycle,
        this.player.isWalking,
        this.player.isJumping,
        this.player.isAttacking,
        this.player.attackTimer,
        this.player.attackCombo,
        weaponMesh
      );
    } else {
      const walkBob = this.player.isWalking ? Math.sin(time * 0.015) * 0.08 : 0;
      this.drawMesh(this.meshTuah, this.player.x, 0.8 + this.player.y + walkBob, this.player.z, this.player.rotY);
    }

    // --- 8. RENDER AMBIENT PARTICLES ---
    if (this.bgSettings.particlesEnabled) {
      this.particles.forEach(p => {
        this.drawMesh(this.meshParticle, p.x, p.y, p.z, time * 0.002, 0.6, 0.6, 0.6);
      });
    }
  }

  public drawLimb(
    geom: CompiledMesh,
    rootX: number, rootY: number, rootZ: number,
    charRotY: number,
    jointOffsetX: number, jointOffsetY: number, jointOffsetZ: number,
    rotX = 0, rotY = 0, rotZ = 0,
    sx = 1, sy = 1, sz = 1
  ) {
    if (!geom.buffers) return;
    const gl = this.gl;
    const modelMat = Mat4.create();

    Mat4.translate(modelMat, modelMat, [rootX, rootY, rootZ]);
    if (charRotY !== 0) Mat4.rotateY(modelMat, modelMat, charRotY);
    Mat4.translate(modelMat, modelMat, [jointOffsetX, jointOffsetY, jointOffsetZ]);

    if (rotX !== 0) Mat4.rotateX(modelMat, modelMat, rotX);
    if (rotY !== 0) Mat4.rotateY(modelMat, modelMat, rotY);
    if (rotZ !== 0) Mat4.rotateZ(modelMat, modelMat, rotZ);

    if (sx !== 1 || sy !== 1 || sz !== 1) Mat4.scale(modelMat, modelMat, [sx, sy, sz]);

    gl.uniformMatrix4fv(this.uModel, false, modelMat);

    gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers.vBuf);
    gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aPos);

    gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers.nBuf);
    gl.vertexAttribPointer(this.aNorm, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aNorm);

    gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers.cBuf);
    gl.vertexAttribPointer(this.aCol, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aCol);

    gl.drawArrays(gl.TRIANGLES, 0, geom.vertexCount);
  }

  public drawWeaponInHand(
    weapon: CompiledMesh,
    rootX: number, rootY: number, rootZ: number,
    charRotY: number,
    shoulderX: number, shoulderY: number, shoulderZ: number,
    rotX: number, rotY: number, rotZ: number
  ) {
    if (!weapon.buffers) return;
    const gl = this.gl;
    const modelMat = Mat4.create();

    Mat4.translate(modelMat, modelMat, [rootX, rootY, rootZ]);
    if (charRotY !== 0) Mat4.rotateY(modelMat, modelMat, charRotY);
    Mat4.translate(modelMat, modelMat, [shoulderX, shoulderY, shoulderZ]);

    if (rotX !== 0) Mat4.rotateX(modelMat, modelMat, rotX);
    if (rotY !== 0) Mat4.rotateY(modelMat, modelMat, rotY);
    if (rotZ !== 0) Mat4.rotateZ(modelMat, modelMat, rotZ);

    Mat4.translate(modelMat, modelMat, [0.0, -0.52, 0.15]);
    Mat4.rotateX(modelMat, modelMat, -Math.PI * 0.45);
    Mat4.scale(modelMat, modelMat, [1.1, 1.1, 1.1]);

    gl.uniformMatrix4fv(this.uModel, false, modelMat);

    gl.bindBuffer(gl.ARRAY_BUFFER, weapon.buffers.vBuf);
    gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aPos);

    gl.bindBuffer(gl.ARRAY_BUFFER, weapon.buffers.nBuf);
    gl.vertexAttribPointer(this.aNorm, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aNorm);

    gl.bindBuffer(gl.ARRAY_BUFFER, weapon.buffers.cBuf);
    gl.vertexAttribPointer(this.aCol, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aCol);

    gl.drawArrays(gl.TRIANGLES, 0, weapon.vertexCount);
  }

  public drawCharacterRig(
    rig: CompiledCharacterRig,
    x: number, y: number, z: number,
    rotY: number,
    walkCycle: number,
    isWalking: boolean,
    isJumping: boolean,
    isAttacking: boolean,
    attackTimer: number,
    attackCombo: number,
    weaponMesh?: CompiledMesh
  ) {
    let legSwing = isWalking ? Math.sin(walkCycle) * 0.65 : 0;
    let armSwing = isWalking ? -Math.sin(walkCycle) * 0.65 : 0;
    let bodyBob = isWalking ? Math.abs(Math.sin(walkCycle * 2)) * 0.08 : 0;

    if (isJumping) {
      legSwing = 0.45;
      armSwing = -0.7;
    }

    let rightArmRotX = armSwing;
    let rightArmRotY = 0;
    let rightArmRotZ = 0;
    let leftArmRotX = -armSwing;
    let leftArmRotZ = 0;

    if (isAttacking) {
      const progress = 1 - (attackTimer / 18);
      if (attackCombo === 3) {
        rightArmRotX = -Math.PI * 0.7 + progress * Math.PI * 1.2;
        rightArmRotZ = -0.25;
        leftArmRotX = -0.6;
      } else if (attackCombo === 2) {
        rightArmRotX = -Math.PI * 0.4;
        rightArmRotY = -0.8 + progress * 1.6;
        rightArmRotZ = -0.4;
      } else {
        rightArmRotX = -Math.PI * 0.5 + progress * 0.8;
        rightArmRotY = 0.8 - progress * 1.6;
        rightArmRotZ = -0.5 + progress * 0.8;
      }
    }

    const currentY = y + bodyBob;

    this.drawLimb(rig.torso, x, currentY, z, rotY, 0, 0.45, 0, 0, 0, 0);
    this.drawLimb(rig.head, x, currentY, z, rotY, 0, 0.9, 0, 0, 0, 0);
    this.drawLimb(rig.leftLeg, x, currentY, z, rotY, -0.22, 0.45, 0, -legSwing, 0, 0);
    this.drawLimb(rig.rightLeg, x, currentY, z, rotY, 0.22, 0.45, 0, legSwing, 0, 0);
    this.drawLimb(rig.leftArm, x, currentY, z, rotY, -0.56, 0.82, 0, leftArmRotX, 0, leftArmRotZ);
    this.drawLimb(rig.rightArm, x, currentY, z, rotY, 0.56, 0.82, 0, rightArmRotX, rightArmRotY, rightArmRotZ);

    if (weaponMesh) {
      this.drawWeaponInHand(weaponMesh, x, currentY, z, rotY, 0.56, 0.82, 0, rightArmRotX, rightArmRotY, rightArmRotZ);
    }
  }

  public drawMesh(geom: CompiledMesh, x: number, y: number, z: number, rotY = 0, sx = 1, sy = 1, sz = 1) {
    if (!geom.buffers) return;
    const gl = this.gl;
    const modelMat = Mat4.create();
    Mat4.translate(modelMat, modelMat, [x, y, z]);
    if (rotY !== 0) Mat4.rotateY(modelMat, modelMat, rotY);
    if (sx !== 1 || sy !== 1 || sz !== 1) Mat4.scale(modelMat, modelMat, [sx, sy, sz]);

    gl.uniformMatrix4fv(this.uModel, false, modelMat);

    gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers.vBuf);
    gl.vertexAttribPointer(this.aPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aPos);

    gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers.nBuf);
    gl.vertexAttribPointer(this.aNorm, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aNorm);

    gl.bindBuffer(gl.ARRAY_BUFFER, geom.buffers.cBuf);
    gl.vertexAttribPointer(this.aCol, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.aCol);

    gl.drawArrays(gl.TRIANGLES, 0, geom.vertexCount);
  }
}
