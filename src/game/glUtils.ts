// WebGL 4x4 Matrix Mathematics and Procedural Mesh Generation
export const Mat4 = {
  create(): Float32Array {
    return new Float32Array([
      1,0,0,0,
      0,1,0,0,
      0,0,1,0,
      0,0,0,1
    ]);
  },
  perspective(out: Float32Array, fovy: number, aspect: number, near: number, far: number): Float32Array {
    const f = 1.0 / Math.tan(fovy / 2);
    const nf = 1 / (near - far);
    out[0] = f / aspect; out[1] = 0; out[2] = 0; out[3] = 0;
    out[4] = 0; out[5] = f; out[6] = 0; out[7] = 0;
    out[8] = 0; out[9] = 0; out[10] = (far + near) * nf; out[11] = -1;
    out[12] = 0; out[13] = 0; out[14] = (2 * far * near) * nf; out[15] = 0;
    return out;
  },
  lookAt(out: Float32Array, eye: [number, number, number], center: [number, number, number], up: [number, number, number]): Float32Array {
    let z0 = eye[0] - center[0];
    let z1 = eye[1] - center[1];
    let z2 = eye[2] - center[2];
    let len = 1 / (Math.hypot(z0, z1, z2) || 1);
    z0 *= len; z1 *= len; z2 *= len;

    let x0 = up[1] * z2 - up[2] * z1;
    let x1 = up[2] * z0 - up[0] * z2;
    let x2 = up[0] * z1 - up[1] * z0;
    len = Math.hypot(x0, x1, x2);
    if (!len) { x0 = 0; x1 = 0; x2 = 0; } else { len = 1 / len; x0 *= len; x1 *= len; x2 *= len; }

    let y0 = z1 * x2 - z2 * x1;
    let y1 = z2 * x0 - z0 * x2;
    let y2 = z0 * x1 - z1 * x0;
    len = Math.hypot(y0, y1, y2);
    if (!len) { y0 = 0; y1 = 0; y2 = 0; } else { len = 1 / len; y0 *= len; y1 *= len; y2 *= len; }

    out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0;
    out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0;
    out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0;
    out[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]);
    out[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]);
    out[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]);
    out[15] = 1;
    return out;
  },
  translate(out: Float32Array, a: Float32Array, v: [number, number, number]): Float32Array {
    const x = v[0], y = v[1], z = v[2];
    if (a === out) {
      out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
      out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
      out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
      out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
      out.set(a);
      Mat4.translate(out, out, v);
    }
    return out;
  },
  rotateY(out: Float32Array, a: Float32Array, rad: number): Float32Array {
    const s = Math.sin(rad), c = Math.cos(rad);
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    out.set(a);
    out[0] = c * a00 - s * a20;
    out[1] = c * a01 - s * a21;
    out[2] = c * a02 - s * a22;
    out[3] = c * a03 - s * a23;
    out[8] = s * a00 + c * a20;
    out[9] = s * a01 + c * a21;
    out[10] = s * a02 + c * a22;
    out[11] = s * a03 + c * a23;
    return out;
  },
  rotateX(out: Float32Array, a: Float32Array, rad: number): Float32Array {
    const s = Math.sin(rad), c = Math.cos(rad);
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11];
    out.set(a);
    out[4] = c * a10 + s * a20;
    out[5] = c * a11 + s * a21;
    out[6] = c * a12 + s * a22;
    out[7] = c * a13 + s * a23;
    out[8] = c * a20 - s * a10;
    out[9] = c * a21 - s * a11;
    out[10] = c * a22 - s * a12;
    out[11] = c * a23 - s * a13;
    return out;
  },
  rotateZ(out: Float32Array, a: Float32Array, rad: number): Float32Array {
    const s = Math.sin(rad), c = Math.cos(rad);
    const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3];
    const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7];
    out.set(a);
    out[0] = c * a00 + s * a10;
    out[1] = c * a01 + s * a11;
    out[2] = c * a02 + s * a12;
    out[3] = c * a03 + s * a13;
    out[4] = c * a10 - s * a00;
    out[5] = c * a11 - s * a01;
    out[6] = c * a12 - s * a02;
    out[7] = c * a13 - s * a03;
    return out;
  },
  scale(out: Float32Array, a: Float32Array, v: [number, number, number]): Float32Array {
    const x = v[0], y = v[1], z = v[2];
    out.set(a);
    out[0] *= x; out[1] *= x; out[2] *= x; out[3] *= x;
    out[4] *= y; out[5] *= y; out[6] *= y; out[7] *= y;
    out[8] *= z; out[9] *= z; out[10] *= z; out[11] *= z;
    return out;
  }
};

export interface RawGeometry {
  positions: number[];
  normals: number[];
  colors: number[];
}

export interface CompiledMesh {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  vertexCount: number;
  buffers?: {
    vBuf: WebGLBuffer;
    nBuf: WebGLBuffer;
    cBuf: WebGLBuffer;
  };
}

export function buildBox(w: number, h: number, d: number, col: [number, number, number]): RawGeometry {
  const hw = w / 2, hh = h / 2, hd = d / 2;
  const positions = [
    -hw,-hh, hd,  hw,-hh, hd,  hw, hh, hd, -hw,-hh, hd,  hw, hh, hd, -hw, hh, hd,
     hw,-hh,-hd, -hw,-hh,-hd, -hw, hh,-hd,  hw,-hh,-hd, -hw, hh,-hd,  hw, hh,-hd,
    -hw, hh, hd,  hw, hh, hd,  hw, hh,-hd, -hw, hh, hd,  hw, hh,-hd, -hw, hh,-hd,
    -hw,-hh,-hd,  hw,-hh,-hd,  hw,-hh, hd, -hw,-hh,-hd,  hw,-hh, hd, -hw,-hh, hd,
     hw,-hh, hd,  hw,-hh,-hd,  hw, hh,-hd,  hw,-hh, hd,  hw, hh,-hd,  hw, hh, hd,
    -hw,-hh,-hd, -hw,-hh, hd, -hw, hh, hd, -hw,-hh,-hd, -hw, hh, hd, -hw, hh,-hd
  ];
  const normals = [
    0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1,
    0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
    0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0,
    0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
    1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,
    -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0, -1,0,0
  ];
  const colors: number[] = [];
  for (let i = 0; i < 36; i++) {
    colors.push(col[0], col[1], col[2]);
  }
  return { positions, normals, colors };
}

export function buildPyramid(baseW: number, h: number, col: [number, number, number]): RawGeometry {
  const hw = baseW / 2;
  const positions = [
    -hw, 0,  hw,   hw, 0,  hw,   0, h, 0,
     hw, 0,  hw,   hw, 0, -hw,   0, h, 0,
     hw, 0, -hw,  -hw, 0, -hw,   0, h, 0,
    -hw, 0, -hw,  -hw, 0,  hw,   0, h, 0,
    -hw, 0, -hw,   hw, 0, -hw,   hw, 0, hw,
    -hw, 0, -hw,   hw, 0,  hw,  -hw, 0, hw
  ];
  const normals = [
    0,0.5,1, 0,0.5,1, 0,0.5,1,
    1,0.5,0, 1,0.5,0, 1,0.5,0,
    0,0.5,-1, 0,0.5,-1, 0,0.5,-1,
    -1,0.5,0, -1,0.5,0, -1,0.5,0,
    0,-1,0, 0,-1,0, 0,-1,0,
    0,-1,0, 0,-1,0, 0,-1,0
  ];
  const colors: number[] = [];
  for (let i = 0; i < 18; i++) {
    colors.push(col[0], col[1], col[2]);
  }
  return { positions, normals, colors };
}

export function mergeGeometries(parts: RawGeometry[]): CompiledMesh {
  const positions: number[] = [], normals: number[] = [], colors: number[] = [];
  for (const p of parts) {
    positions.push(...p.positions);
    normals.push(...p.normals);
    colors.push(...p.colors);
  }
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    colors: new Float32Array(colors),
    vertexCount: positions.length / 3
  };
}

export const Palette = {
  skin: [0.92, 0.72, 0.52] as [number, number, number],
  tuahGreen: [0.08, 0.45, 0.22] as [number, number, number],
  songketGold: [0.95, 0.82, 0.15] as [number, number, number],
  tanjakGold: [0.88, 0.7, 0.12] as [number, number, number],
  kerisBlade: [0.95, 0.95, 0.98] as [number, number, number],
  kerisHilt: [0.38, 0.22, 0.11] as [number, number, number],
  tamingSariGlow: [0.3, 0.85, 1.0] as [number, number, number],
  jebatRed: [0.75, 0.15, 0.15] as [number, number, number],
  bendaharaGrey: [0.35, 0.42, 0.48] as [number, number, number],
  sultanRoyalYellow: [1.0, 0.85, 0.1] as [number, number, number],
  woodDark: [0.25, 0.15, 0.08] as [number, number, number],
  woodLight: [0.55, 0.38, 0.22] as [number, number, number],
  leafGreen: [0.18, 0.55, 0.22] as [number, number, number],
  roofTerracotta: [0.65, 0.28, 0.18] as [number, number, number],
  clothWhite: [0.92, 0.92, 0.95] as [number, number, number],
  clothRed: [0.85, 0.2, 0.2] as [number, number, number],
  groundGrass: [0.28, 0.45, 0.22] as [number, number, number],
  groundGrassLight: [0.35, 0.55, 0.25] as [number, number, number],
  sandCoast: [0.85, 0.78, 0.60] as [number, number, number],
  seaBlue: [0.12, 0.48, 0.68] as [number, number, number],
  seaDeep: [0.08, 0.32, 0.52] as [number, number, number],
  palaceFloor: [0.55, 0.18, 0.15] as [number, number, number],
  goldDecor: [0.95, 0.82, 0.22] as [number, number, number],
  pirateBlack: [0.15, 0.15, 0.18] as [number, number, number],
  shadow: [0.08, 0.08, 0.10] as [number, number, number],
  herbGreen: [0.2, 0.9, 0.4] as [number, number, number],
  stone: [0.55, 0.55, 0.58] as [number, number, number],
  laterite: [0.65, 0.35, 0.25] as [number, number, number],
  carpetRed: [0.75, 0.12, 0.15] as [number, number, number],
  cloudWhite: [0.96, 0.97, 1.0] as [number, number, number],
  cloudShadow: [0.78, 0.82, 0.92] as [number, number, number],
  mountainDistant: [0.38, 0.52, 0.68] as [number, number, number],
  mountainMid: [0.28, 0.45, 0.45] as [number, number, number],
  sunGold: [1.0, 0.92, 0.45] as [number, number, number],
  sunGlow: [1.0, 0.65, 0.2] as [number, number, number],
  sunsetSkyTop: [0.25, 0.15, 0.4] as [number, number, number],
  sunsetSkyMid: [0.85, 0.35, 0.22] as [number, number, number],
  sunsetSkyHorizon: [0.98, 0.68, 0.28] as [number, number, number],
  lanternGlow: [1.0, 0.75, 0.2] as [number, number, number],
  royalTrim: [0.98, 0.85, 0.3] as [number, number, number]
};

// --- BACKGROUND GENERATORS ---

// 1. Skydome Backdrop / Horizon Wall
export function createSkydomeMesh(theme: 'pekan' | 'laut' | 'istana', timeOfDay: 'pagi' | 'senja' | 'malam' = 'pagi'): CompiledMesh {
  const parts: RawGeometry[] = [];
  if (theme === 'istana') {
    // Balairung Seri Grand Wooden Lattice & Songket Walls
    const backWall = buildBox(64, 22, 1, [0.18, 0.11, 0.08]);
    for (let i = 1; i < backWall.positions.length; i += 3) backWall.positions[i] += 11;
    parts.push(backWall);

    // Decorative wall panel carvings (Motif Ukiran Kayu Melayu)
    for (let x = -28; x <= 28; x += 8) {
      const panel = buildBox(5.5, 14, 0.4, [0.26, 0.15, 0.10]);
      for (let i = 0; i < panel.positions.length; i += 3) {
        panel.positions[i] += x;
        panel.positions[i+1] += 9;
        panel.positions[i+2] -= 0.3;
      }
      parts.push(panel);

      const goldTrim = buildBox(5.7, 0.3, 0.5, Palette.songketGold);
      for (let i = 0; i < goldTrim.positions.length; i += 3) {
        goldTrim.positions[i] += x;
        goldTrim.positions[i+1] += 16;
        goldTrim.positions[i+2] -= 0.4;
      }
      parts.push(goldTrim);
    }
    return mergeGeometries(parts);
  }

  // Outdoor Sky: Curvature / Segments
  const radius = 68;
  const segments = 24;
  
  let topCol: [number, number, number];
  let midCol: [number, number, number];
  let botCol: [number, number, number];

  if (timeOfDay === 'senja' || theme === 'laut') {
    topCol = [0.28, 0.15, 0.42]; // Twilight purple
    midCol = [0.88, 0.40, 0.22]; // Rich amber orange
    botCol = [0.98, 0.72, 0.35]; // Golden horizon
  } else if (timeOfDay === 'malam') {
    topCol = [0.03, 0.05, 0.15]; // Deep starry indigo
    midCol = [0.07, 0.12, 0.25];
    botCol = [0.12, 0.18, 0.32];
  } else {
    // Pagi cerah
    topCol = [0.25, 0.55, 0.88]; // Vivid tropical cerulean
    midCol = [0.55, 0.78, 0.95];
    botCol = [0.85, 0.92, 0.98]; // Warm horizon haze
  }

  for (let i = 0; i < segments; i++) {
    const a1 = (i / segments) * Math.PI * 2;
    const a2 = ((i + 1) / segments) * Math.PI * 2;
    const x1 = Math.cos(a1) * radius;
    const z1 = Math.sin(a1) * radius;
    const x2 = Math.cos(a2) * radius;
    const z2 = Math.sin(a2) * radius;

    // Lower tier
    const strip1 = buildBox(Math.hypot(x2 - x1, z2 - z1), 14, 0.5, botCol);
    const midX = (x1 + x2) / 2;
    const midZ = (z1 + z2) / 2;
    const ang = Math.atan2(x2 - x1, z2 - z1);
    for (let k = 0; k < strip1.positions.length; k += 3) {
      const px = strip1.positions[k];
      const py = strip1.positions[k+1];
      const pz = strip1.positions[k+2];
      strip1.positions[k] = px * Math.cos(ang) + pz * Math.sin(ang) + midX;
      strip1.positions[k+1] = py + 7;
      strip1.positions[k+2] = -px * Math.sin(ang) + pz * Math.cos(ang) + midZ;
    }
    parts.push(strip1);

    // Mid tier
    const strip2 = buildBox(Math.hypot(x2 - x1, z2 - z1), 18, 0.5, midCol);
    for (let k = 0; k < strip2.positions.length; k += 3) {
      const px = strip2.positions[k];
      const py = strip2.positions[k+1];
      const pz = strip2.positions[k+2];
      strip2.positions[k] = px * Math.cos(ang) + pz * Math.sin(ang) + midX * 0.95;
      strip2.positions[k+1] = py + 22;
      strip2.positions[k+2] = -px * Math.sin(ang) + pz * Math.cos(ang) + midZ * 0.95;
    }
    parts.push(strip2);

    // Upper tier
    const strip3 = buildBox(Math.hypot(x2 - x1, z2 - z1), 22, 0.5, topCol);
    for (let k = 0; k < strip3.positions.length; k += 3) {
      const px = strip3.positions[k];
      const py = strip3.positions[k+1];
      const pz = strip3.positions[k+2];
      strip3.positions[k] = px * Math.cos(ang) + pz * Math.sin(ang) + midX * 0.85;
      strip3.positions[k+1] = py + 40;
      strip3.positions[k+2] = -px * Math.sin(ang) + pz * Math.cos(ang) + midZ * 0.85;
    }
    parts.push(strip3);
  }

  return mergeGeometries(parts);
}

// 2. Distant Mountains (Banjaran Gunung Ledang)
export function createMountainRangeMesh(): CompiledMesh {
  const parts: RawGeometry[] = [];
  const peaks = [
    { x: -38, z: 46, w: 24, h: 16, col: Palette.mountainDistant },
    { x: -20, z: 52, w: 28, h: 22, col: Palette.mountainDistant }, // Gunung Ledang Utama
    { x: 0, z: 50, w: 22, h: 14, col: Palette.mountainMid },
    { x: 18, z: 48, w: 26, h: 19, col: Palette.mountainDistant },
    { x: 36, z: 45, w: 22, h: 13, col: Palette.mountainMid },
  ];

  for (const pk of peaks) {
    const pyr = buildPyramid(pk.w, pk.h, pk.col);
    for (let i = 0; i < pyr.positions.length; i += 3) {
      pyr.positions[i] += pk.x;
      pyr.positions[i+1] += 0;
      pyr.positions[i+2] += pk.z;
    }
    parts.push(pyr);
  }

  return mergeGeometries(parts);
}

// 3. Volumetric Clouds
export function createCloudClusterMesh(): CompiledMesh {
  const parts: RawGeometry[] = [];
  const blobs = [
    { x: 0, y: 0, z: 0, w: 5.5, h: 2.2, d: 3.5 },
    { x: -2.5, y: -0.3, z: 0.4, w: 4.2, h: 1.8, d: 3.0 },
    { x: 2.2, y: -0.2, z: -0.3, w: 4.5, h: 1.9, d: 3.2 },
    { x: 0.5, y: 0.8, z: 0.2, w: 3.8, h: 1.6, d: 2.8 },
  ];

  for (const b of blobs) {
    const box = buildBox(b.w, b.h, b.d, Palette.cloudWhite);
    for (let i = 0; i < box.positions.length; i += 3) {
      box.positions[i] += b.x;
      box.positions[i+1] += b.y;
      box.positions[i+2] += b.z;
    }
    parts.push(box);
  }

  // Soft bottom shadow layer
  const under = buildBox(6.5, 0.4, 4.0, Palette.cloudShadow);
  for (let i = 1; i < under.positions.length; i += 3) under.positions[i] -= 0.8;
  parts.push(under);

  return mergeGeometries(parts);
}

// 4. Sun & Moon Celestial Disc
export function createCelestialDisc(isSun = true): CompiledMesh {
  const parts: RawGeometry[] = [];
  const col = isSun ? Palette.sunGold : [0.92, 0.95, 1.0] as [number, number, number];
  const glowCol = isSun ? Palette.sunGlow : [0.45, 0.65, 0.95] as [number, number, number];

  // Core disc
  const core = buildBox(4.5, 4.5, 0.2, col);
  parts.push(core);

  // Outer halo glow
  const halo = buildBox(7.2, 7.2, 0.1, glowCol);
  parts.push(halo);

  return mergeGeometries(parts);
}

// 5. Flying Bird (Burung Camar / Pipit)
export function createBirdMesh(): CompiledMesh {
  const parts: RawGeometry[] = [];
  // Body
  const body = buildBox(0.2, 0.15, 0.6, [0.92, 0.92, 0.95]);
  parts.push(body);
  // Wings
  const wingL = buildBox(0.8, 0.05, 0.3, [0.85, 0.85, 0.9]);
  for (let i = 0; i < wingL.positions.length; i += 3) {
    wingL.positions[i] -= 0.45;
    wingL.positions[i+1] += 0.1;
  }
  parts.push(wingL);
  const wingR = buildBox(0.8, 0.05, 0.3, [0.85, 0.85, 0.9]);
  for (let i = 0; i < wingR.positions.length; i += 3) {
    wingR.positions[i] += 0.45;
    wingR.positions[i+1] += 0.1;
  }
  parts.push(wingR);
  return mergeGeometries(parts);
}

// 6. Traditional Malay Houses with Serambi & Tangga Batu
export function createDetailedMalayHouse(): CompiledMesh {
  const parts: RawGeometry[] = [];
  
  // Pillars (Tiang seri kayu cengal)
  const pillars = [
    [-2.2, -2.2], [2.2, -2.2], [-2.2, 2.2], [2.2, 2.2],
    [0, -2.2], [0, 2.2], [-2.2, 0], [2.2, 0]
  ];
  for (const [px, pz] of pillars) {
    const pil = buildBox(0.25, 2.2, 0.25, Palette.woodDark);
    for (let i = 0; i < pil.positions.length; i += 3) {
      pil.positions[i] += px;
      pil.positions[i+1] += 1.1;
      pil.positions[i+2] += pz;
    }
    parts.push(pil);
  }

  // Lantai papan cengal
  const floor = buildBox(5.6, 0.25, 5.6, Palette.woodLight);
  for (let i = 1; i < floor.positions.length; i += 3) floor.positions[i] += 2.2;
  parts.push(floor);

  // Dinding Kayu Bertingkap
  const mainWall = buildBox(4.6, 2.2, 4.6, Palette.woodLight);
  for (let i = 1; i < mainWall.positions.length; i += 3) mainWall.positions[i] += 3.3;
  parts.push(mainWall);

  // Tingkap Berukir
  const win1 = buildBox(1.2, 1.0, 4.7, Palette.woodDark);
  for (let i = 1; i < win1.positions.length; i += 3) win1.positions[i] += 3.5;
  parts.push(win1);

  // Pagar Beranda (Serambi)
  const railing = buildBox(4.8, 0.8, 0.1, [0.45, 0.28, 0.15]);
  for (let i = 0; i < railing.positions.length; i += 3) {
    railing.positions[i+1] += 2.6;
    railing.positions[i+2] += 2.5;
  }
  parts.push(railing);

  // Atap Singgora Tradisional (Bumbung Panjang Bertingkat)
  const roofMain = buildPyramid(6.4, 2.8, Palette.roofTerracotta);
  for (let i = 1; i < roofMain.positions.length; i += 3) roofMain.positions[i] += 4.4;
  parts.push(roofMain);

  const roofTop = buildBox(4.5, 0.25, 0.4, Palette.woodDark);
  for (let i = 1; i < roofTop.positions.length; i += 3) roofTop.positions[i] += 7.0;
  parts.push(roofTop);

  // Tangga Batu Melaka (Tangga Batu Kawi Berjubin Tradisi)
  for (let step = 0; step < 4; step++) {
    const st = buildBox(1.5, 0.5, 0.8, (step % 2 === 0) ? Palette.laterite : [0.8, 0.4, 0.3]);
    for (let i = 0; i < st.positions.length; i += 3) {
      st.positions[i+1] += (step * 0.5) + 0.25;
      st.positions[i+2] += 3.4 - (step * 0.5);
    }
    parts.push(st);
  }

  return mergeGeometries(parts);
}

// 7. Swaying Coconut Palm with Coconuts
export function createLushPalmTree(): CompiledMesh {
  const parts: RawGeometry[] = [];
  
  // Trunk segments with natural tropical curve
  const trunkBase = buildBox(0.45, 2.2, 0.45, Palette.woodDark);
  for (let i = 1; i < trunkBase.positions.length; i += 3) trunkBase.positions[i] += 1.1;
  parts.push(trunkBase);

  const trunkMid = buildBox(0.38, 2.4, 0.38, Palette.woodDark);
  for (let i = 0; i < trunkMid.positions.length; i += 3) {
    trunkMid.positions[i] += 0.3;
    trunkMid.positions[i+1] += 3.1;
  }
  parts.push(trunkMid);

  const trunkTop = buildBox(0.32, 2.0, 0.32, Palette.woodDark);
  for (let i = 0; i < trunkTop.positions.length; i += 3) {
    trunkTop.positions[i] += 0.7;
    trunkTop.positions[i+1] += 4.8;
  }
  parts.push(trunkTop);

  // Buah Kelapa
  const nuts = [[0.6, 5.0, 0.1], [0.8, 4.9, -0.2], [0.5, 5.1, -0.3]];
  for (const [nx, ny, nz] of nuts) {
    const nut = buildBox(0.3, 0.35, 0.3, [0.38, 0.55, 0.15]);
    for (let i = 0; i < nut.positions.length; i += 3) {
      nut.positions[i] += nx;
      nut.positions[i+1] += ny;
      nut.positions[i+2] += nz;
    }
    parts.push(nut);
  }

  // 8 arah pelepah kelapa hijau melengkung
  const leafAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  for (const ang of leafAngles) {
    const rad = ang * Math.PI / 180;
    const leaf = buildBox(2.6, 0.08, 0.55, Palette.leafGreen);
    for (let i = 0; i < leaf.positions.length; i += 3) {
      const lx = leaf.positions[i] + 1.2;
      const ly = leaf.positions[i+1];
      const lz = leaf.positions[i+2];
      leaf.positions[i] = lx * Math.cos(rad) - lz * Math.sin(rad) + 0.7;
      leaf.positions[i+1] = ly + 5.2 - (lx * 0.28);
      leaf.positions[i+2] = lx * Math.sin(rad) + lz * Math.cos(rad);
    }
    parts.push(leaf);
  }

  return mergeGeometries(parts);
}

// 8. Pelita Tembaga Tradisional (Glowing Brass Oil Lamp for Istana)
export function createPelitaMesh(): CompiledMesh {
  const parts: RawGeometry[] = [];
  // Base
  const base = buildBox(0.6, 0.15, 0.6, Palette.goldDecor);
  parts.push(base);

  // Stand pole
  const stand = buildBox(0.12, 1.8, 0.12, Palette.goldDecor);
  for (let i = 1; i < stand.positions.length; i += 3) stand.positions[i] += 0.9;
  parts.push(stand);

  // Oil bowl
  const bowl = buildBox(0.5, 0.25, 0.5, Palette.goldDecor);
  for (let i = 1; i < bowl.positions.length; i += 3) bowl.positions[i] += 1.8;
  parts.push(bowl);

  // Flickering Flame
  const flame = buildPyramid(0.25, 0.45, Palette.lanternGlow);
  for (let i = 1; i < flame.positions.length; i += 3) flame.positions[i] += 1.95;
  parts.push(flame);

  return mergeGeometries(parts);
}

// 9. Bamboo Fence (Pagar Buluh Tradisi)
export function createBambooFence(): CompiledMesh {
  const parts: RawGeometry[] = [];
  // Horizontal rails
  const rail1 = buildBox(4.0, 0.08, 0.08, [0.55, 0.52, 0.25]);
  for (let i = 1; i < rail1.positions.length; i += 3) rail1.positions[i] += 0.4;
  parts.push(rail1);

  const rail2 = buildBox(4.0, 0.08, 0.08, [0.55, 0.52, 0.25]);
  for (let i = 1; i < rail2.positions.length; i += 3) rail2.positions[i] += 0.9;
  parts.push(rail2);

  // Vertical bamboo stakes
  for (let x = -1.8; x <= 1.8; x += 0.4) {
    const stake = buildBox(0.1, 1.2, 0.1, [0.48, 0.58, 0.22]);
    for (let i = 0; i < stake.positions.length; i += 3) {
      stake.positions[i] += x;
      stake.positions[i+1] += 0.6;
    }
    parts.push(stake);
  }

  return mergeGeometries(parts);
}

// 10. Flower Bush / Semak Tropika
export function createShrubMesh(): CompiledMesh {
  const parts: RawGeometry[] = [];
  const leaves = buildBox(1.2, 0.8, 1.2, Palette.leafGreen);
  for (let i = 1; i < leaves.positions.length; i += 3) leaves.positions[i] += 0.4;
  parts.push(leaves);

  // Bunga Melur / Raya
  const flower1 = buildBox(0.2, 0.2, 0.2, Palette.clothRed);
  for (let i = 0; i < flower1.positions.length; i += 3) {
    flower1.positions[i] += 0.3;
    flower1.positions[i+1] += 0.7;
    flower1.positions[i+2] += 0.4;
  }
  parts.push(flower1);

  const flower2 = buildBox(0.2, 0.2, 0.2, Palette.songketGold);
  for (let i = 0; i < flower2.positions.length; i += 3) {
    flower2.positions[i] -= 0.3;
    flower2.positions[i+1] += 0.65;
    flower2.positions[i+2] -= 0.3;
  }
  parts.push(flower2);

  return mergeGeometries(parts);
}

// 11. Animated Sea Water Grid
export function createWaterPlane(w: number, d: number, subdivisions = 12): CompiledMesh {
  const parts: RawGeometry[] = [];
  const stepX = w / subdivisions;
  const stepZ = d / subdivisions;
  const halfX = w / 2;
  const halfZ = d / 2;

  for (let ix = 0; ix < subdivisions; ix++) {
    for (let iz = 0; iz < subdivisions; iz++) {
      const x0 = -halfX + ix * stepX;
      const z0 = -halfZ + iz * stepZ;
      const col = ((ix + iz) % 2 === 0) ? Palette.seaBlue : Palette.seaDeep;
      const tile = buildBox(stepX * 0.98, 0.4, stepZ * 0.98, col);
      for (let i = 0; i < tile.positions.length; i += 3) {
        tile.positions[i] += x0 + stepX / 2;
        tile.positions[i+1] += 0.2;
        tile.positions[i+2] += z0 + stepZ / 2;
      }
      parts.push(tile);
    }
  }
  return mergeGeometries(parts);
}

// 12. Distant Trade Ships on the Horizon
export function createDistantFleetMesh(): CompiledMesh {
  const parts: RawGeometry[] = [];
  const ships = [
    { x: -28, z: 28, scale: 0.7, rot: 0.3 },
    { x: -14, z: 34, scale: 0.9, rot: -0.2 },
    { x: 16, z: 32, scale: 0.8, rot: 0.4 },
    { x: 30, z: 26, scale: 0.65, rot: -0.5 },
  ];

  for (const s of ships) {
    // Hull
    const hull = buildBox(3.0 * s.scale, 1.4 * s.scale, 7.0 * s.scale, Palette.woodDark);
    for (let i = 0; i < hull.positions.length; i += 3) {
      hull.positions[i] += s.x;
      hull.positions[i+1] += 0.7 * s.scale;
      hull.positions[i+2] += s.z;
    }
    parts.push(hull);

    // Masts & White Sails
    const mast = buildBox(0.2 * s.scale, 5.0 * s.scale, 0.2 * s.scale, Palette.woodLight);
    for (let i = 0; i < mast.positions.length; i += 3) {
      mast.positions[i] += s.x;
      mast.positions[i+1] += 3.0 * s.scale;
      mast.positions[i+2] += s.z;
    }
    parts.push(mast);

    const sail = buildBox(2.8 * s.scale, 3.2 * s.scale, 0.08 * s.scale, Palette.clothWhite);
    for (let i = 0; i < sail.positions.length; i += 3) {
      sail.positions[i] += s.x;
      sail.positions[i+1] += 3.5 * s.scale;
      sail.positions[i+2] += s.z + 0.3 * s.scale;
    }
    parts.push(sail);
  }

  return mergeGeometries(parts);
}

// 13. Character Meshes with Songket, Tanjak, Keris
export function createCharacterMesh(attireColor: [number, number, number], tanjakColor: [number, number, number], skinColor = Palette.skin): CompiledMesh {
  const parts: RawGeometry[] = [];
  
  // Upper Torso (Dada Sasa)
  const upperTorso = buildBox(0.85, 0.45, 0.42, attireColor);
  for (let i = 1; i < upperTorso.positions.length; i += 3) upperTorso.positions[i] += 0.4;
  parts.push(upperTorso);

  // Selempang Pahlawan (Sash songket emas)
  const sash = buildBox(0.88, 0.12, 0.44, Palette.songketGold);
  for (let i = 1; i < sash.positions.length; i += 3) sash.positions[i] += 0.35;
  parts.push(sash);

  // Lower Torso
  const lowerTorso = buildBox(0.68, 0.3, 0.38, attireColor);
  for (let i = 1; i < lowerTorso.positions.length; i += 3) lowerTorso.positions[i] += 0.05;
  parts.push(lowerTorso);

  // Bengkong
  const bengkong = buildBox(0.72, 0.12, 0.4, [0.5, 0.05, 0.05]); 
  for (let i = 1; i < bengkong.positions.length; i += 3) bengkong.positions[i] -= 0.15;
  parts.push(bengkong);

  // Sampin Songket
  const sampin = buildBox(0.76, 0.35, 0.44, Palette.songketGold);
  for (let i = 1; i < sampin.positions.length; i += 3) sampin.positions[i] -= 0.35;
  parts.push(sampin);

  // Head
  const head = buildBox(0.42, 0.42, 0.42, skinColor);
  for (let i = 1; i < head.positions.length; i += 3) head.positions[i] += 0.82;
  parts.push(head);

  // Tanjak (Dendam Tak Sudah)
  const tanjakBase = buildBox(0.46, 0.12, 0.46, tanjakColor);
  for (let i = 1; i < tanjakBase.positions.length; i += 3) tanjakBase.positions[i] += 1.05;
  parts.push(tanjakBase);

  const tanjakPeak = buildPyramid(0.38, 0.4, tanjakColor);
  for (let i = 0; i < tanjakPeak.positions.length; i += 3) {
    tanjakPeak.positions[i] -= 0.05;   
    tanjakPeak.positions[i+1] += 1.25; 
    tanjakPeak.positions[i+2] -= 0.05;
  }
  parts.push(tanjakPeak);

  // Arms
  const armL = buildBox(0.25, 0.65, 0.25, attireColor);
  for (let i = 0; i < armL.positions.length; i += 3) {
    armL.positions[i] -= 0.55;
    armL.positions[i+1] += 0.2;
  }
  parts.push(armL);

  const armR = buildBox(0.25, 0.65, 0.25, attireColor);
  for (let i = 0; i < armR.positions.length; i += 3) {
    armR.positions[i] += 0.55;
    armR.positions[i+1] += 0.2;
  }
  parts.push(armR);

  // Wrists
  const wristL = buildBox(0.27, 0.15, 0.27, Palette.songketGold);
  for (let i = 0; i < wristL.positions.length; i += 3) {
    wristL.positions[i] -= 0.55;
    wristL.positions[i+1] -= 0.05;
  }
  parts.push(wristL);

  const wristR = buildBox(0.27, 0.15, 0.27, Palette.songketGold);
  for (let i = 0; i < wristR.positions.length; i += 3) {
    wristR.positions[i] += 0.55;
    wristR.positions[i+1] -= 0.05;
  }
  parts.push(wristR);

  // Legs
  const legL = buildBox(0.26, 0.75, 0.26, attireColor);
  for (let i = 0; i < legL.positions.length; i += 3) {
    legL.positions[i] -= 0.22;
    legL.positions[i+1] -= 0.65;
  }
  parts.push(legL);

  const legR = buildBox(0.26, 0.75, 0.26, attireColor);
  for (let i = 0; i < legR.positions.length; i += 3) {
    legR.positions[i] += 0.22;
    legR.positions[i+1] -= 0.65;
  }
  parts.push(legR);

  // Keris Sheath at waist
  const hilt = buildBox(0.12, 0.25, 0.12, Palette.kerisHilt);
  for (let i = 0; i < hilt.positions.length; i += 3) {
    hilt.positions[i] += 0.35;
    hilt.positions[i+1] -= 0.05;
    hilt.positions[i+2] += 0.26;
  }
  parts.push(hilt);

  const sampirKeris = buildBox(0.35, 0.1, 0.14, [0.25, 0.12, 0.05]); 
  for (let i = 0; i < sampirKeris.positions.length; i += 3) {
    sampirKeris.positions[i] += 0.35;
    sampirKeris.positions[i+1] -= 0.15;
    sampirKeris.positions[i+2] += 0.26;
  }
  parts.push(sampirKeris);

  return mergeGeometries(parts);
}

export interface CharacterRig {
  head: CompiledMesh;
  torso: CompiledMesh;
  leftArm: CompiledMesh;
  rightArm: CompiledMesh;
  leftLeg: CompiledMesh;
  rightLeg: CompiledMesh;
}

export function createCharacterRig(
  attireColor: [number, number, number],
  tanjakColor: [number, number, number],
  skinColor: [number, number, number] = Palette.skin,
  hasTanjak = true
): CharacterRig {
  // 1. TORSO (Pivot at chest center)
  const torsoParts: RawGeometry[] = [];
  const upperTorso = buildBox(0.85, 0.45, 0.42, attireColor);
  for (let i = 1; i < upperTorso.positions.length; i += 3) upperTorso.positions[i] += 0.22;
  torsoParts.push(upperTorso);

  const sash = buildBox(0.88, 0.12, 0.44, Palette.songketGold);
  for (let i = 1; i < sash.positions.length; i += 3) sash.positions[i] += 0.18;
  torsoParts.push(sash);

  const lowerTorso = buildBox(0.68, 0.28, 0.38, attireColor);
  for (let i = 1; i < lowerTorso.positions.length; i += 3) lowerTorso.positions[i] -= 0.1;
  torsoParts.push(lowerTorso);

  const bengkong = buildBox(0.72, 0.12, 0.4, [0.55, 0.08, 0.08]);
  for (let i = 1; i < bengkong.positions.length; i += 3) bengkong.positions[i] -= 0.24;
  torsoParts.push(bengkong);

  const sampin = buildBox(0.76, 0.32, 0.44, Palette.songketGold);
  for (let i = 1; i < sampin.positions.length; i += 3) sampin.positions[i] -= 0.42;
  torsoParts.push(sampin);

  const hilt = buildBox(0.12, 0.24, 0.12, Palette.kerisHilt);
  for (let i = 0; i < hilt.positions.length; i += 3) {
    hilt.positions[i] += 0.34;
    hilt.positions[i+1] -= 0.18;
    hilt.positions[i+2] += 0.24;
  }
  torsoParts.push(hilt);
  const torsoMesh = mergeGeometries(torsoParts);

  // 2. HEAD (Pivot at neck)
  const headParts: RawGeometry[] = [];
  const head = buildBox(0.44, 0.44, 0.44, skinColor);
  for (let i = 1; i < head.positions.length; i += 3) head.positions[i] += 0.24;
  headParts.push(head);

  // Roblox blocky facial expression
  const eyeL = buildBox(0.06, 0.08, 0.02, [0.1, 0.1, 0.1]);
  for (let i = 0; i < eyeL.positions.length; i += 3) {
    eyeL.positions[i] -= 0.11;
    eyeL.positions[i+1] += 0.24;
    eyeL.positions[i+2] += 0.23;
  }
  headParts.push(eyeL);

  const eyeR = buildBox(0.06, 0.08, 0.02, [0.1, 0.1, 0.1]);
  for (let i = 0; i < eyeR.positions.length; i += 3) {
    eyeR.positions[i] += 0.11;
    eyeR.positions[i+1] += 0.24;
    eyeR.positions[i+2] += 0.23;
  }
  headParts.push(eyeR);

  if (hasTanjak) {
    const tanjakBase = buildBox(0.48, 0.12, 0.48, tanjakColor);
    for (let i = 1; i < tanjakBase.positions.length; i += 3) tanjakBase.positions[i] += 0.48;
    headParts.push(tanjakBase);

    const tanjakPeak = buildPyramid(0.38, 0.42, tanjakColor);
    for (let i = 0; i < tanjakPeak.positions.length; i += 3) {
      tanjakPeak.positions[i] -= 0.06;
      tanjakPeak.positions[i+1] += 0.68;
      tanjakPeak.positions[i+2] -= 0.04;
    }
    headParts.push(tanjakPeak);

    const brooch = buildBox(0.08, 0.08, 0.02, Palette.songketGold);
    for (let i = 0; i < brooch.positions.length; i += 3) {
      brooch.positions[i+1] += 0.48;
      brooch.positions[i+2] += 0.25;
    }
    headParts.push(brooch);
  } else {
    const hair = buildBox(0.46, 0.12, 0.46, [0.1, 0.08, 0.05]);
    for (let i = 1; i < hair.positions.length; i += 3) hair.positions[i] += 0.48;
    headParts.push(hair);
  }
  const headMesh = mergeGeometries(headParts);

  // 3. ARMS
  const armLParts: RawGeometry[] = [];
  const armL = buildBox(0.24, 0.65, 0.24, attireColor);
  for (let i = 1; i < armL.positions.length; i += 3) armL.positions[i] -= 0.32;
  armLParts.push(armL);
  const wristL = buildBox(0.26, 0.12, 0.26, Palette.songketGold);
  for (let i = 1; i < wristL.positions.length; i += 3) wristL.positions[i] -= 0.52;
  armLParts.push(wristL);
  const handL = buildBox(0.2, 0.12, 0.2, skinColor);
  for (let i = 1; i < handL.positions.length; i += 3) handL.positions[i] -= 0.62;
  armLParts.push(handL);
  const leftArmMesh = mergeGeometries(armLParts);

  const armRParts: RawGeometry[] = [];
  const armR = buildBox(0.24, 0.65, 0.24, attireColor);
  for (let i = 1; i < armR.positions.length; i += 3) armR.positions[i] -= 0.32;
  armRParts.push(armR);
  const wristR = buildBox(0.26, 0.12, 0.26, Palette.songketGold);
  for (let i = 1; i < wristR.positions.length; i += 3) wristR.positions[i] -= 0.52;
  armRParts.push(wristR);
  const handR = buildBox(0.2, 0.12, 0.2, skinColor);
  for (let i = 1; i < handR.positions.length; i += 3) handR.positions[i] -= 0.62;
  armRParts.push(handR);
  const rightArmMesh = mergeGeometries(armRParts);

  // 4. LEGS
  const legLParts: RawGeometry[] = [];
  const legL = buildBox(0.26, 0.72, 0.26, attireColor);
  for (let i = 1; i < legL.positions.length; i += 3) legL.positions[i] -= 0.36;
  legLParts.push(legL);
  const footL = buildBox(0.28, 0.14, 0.34, [0.15, 0.12, 0.08]);
  for (let i = 0; i < footL.positions.length; i += 3) {
    footL.positions[i+1] -= 0.68;
    footL.positions[i+2] += 0.04;
  }
  legLParts.push(footL);
  const leftLegMesh = mergeGeometries(legLParts);

  const legRParts: RawGeometry[] = [];
  const legR = buildBox(0.26, 0.72, 0.26, attireColor);
  for (let i = 1; i < legR.positions.length; i += 3) legR.positions[i] -= 0.36;
  legRParts.push(legR);
  const footR = buildBox(0.28, 0.14, 0.34, [0.15, 0.12, 0.08]);
  for (let i = 0; i < footR.positions.length; i += 3) {
    footR.positions[i+1] -= 0.68;
    footR.positions[i+2] += 0.04;
  }
  legRParts.push(footR);
  const rightLegMesh = mergeGeometries(legRParts);

  return {
    head: headMesh,
    torso: torsoMesh,
    leftArm: leftArmMesh,
    rightArm: rightArmMesh,
    leftLeg: leftLegMesh,
    rightLeg: rightLegMesh
  };
}

export function createKerisWeaponMesh(isTamingSari = false): CompiledMesh {
  const parts: RawGeometry[] = [];
  const bladeCol = isTamingSari ? Palette.tamingSariGlow : Palette.kerisBlade;
  const blade = buildBox(0.08, 0.7, 0.03, bladeCol);
  for (let i = 1; i < blade.positions.length; i += 3) blade.positions[i] += 0.35;
  parts.push(blade);

  const sampir = buildBox(0.22, 0.06, 0.08, Palette.kerisHilt);
  parts.push(sampir);

  const handle = buildBox(0.06, 0.2, 0.06, Palette.kerisHilt);
  for (let i = 1; i < handle.positions.length; i += 3) handle.positions[i] -= 0.1;
  parts.push(handle);

  return mergeGeometries(parts);
}

export function createParangMesh(): CompiledMesh {
  const parts: RawGeometry[] = [];
  const blade = buildBox(0.04, 0.75, 0.18, Palette.kerisBlade);
  for (let i = 1; i < blade.positions.length; i += 3) {
    blade.positions[i] += 0.35;
    blade.positions[i+2] += 0.05;
  }
  parts.push(blade);

  const handle = buildBox(0.08, 0.25, 0.08, Palette.woodDark);
  for (let i = 1; i < handle.positions.length; i += 3) handle.positions[i] -= 0.12;
  parts.push(handle);

  return mergeGeometries(parts);
}

export function createMarketStallMesh(clothColor: [number, number, number]): CompiledMesh {
  const parts: RawGeometry[] = [];
  const posts = [[-0.9,-0.9],[0.9,-0.9],[-0.9,0.9],[0.9,0.9]];
  for (const [px, pz] of posts) {
    const post = buildBox(0.1, 1.8, 0.1, Palette.woodDark);
    for (let i = 0; i < post.positions.length; i += 3) {
      post.positions[i] += px;
      post.positions[i+1] += 0.9;
      post.positions[i+2] += pz;
    }
    parts.push(post);
  }
  const table = buildBox(1.8, 0.6, 1.6, Palette.woodLight);
  for (let i = 1; i < table.positions.length; i += 3) table.positions[i] += 0.5;
  parts.push(table);

  const canopy = buildPyramid(2.2, 0.6, clothColor);
  for (let i = 1; i < canopy.positions.length; i += 3) canopy.positions[i] += 1.8;
  parts.push(canopy);
  return mergeGeometries(parts);
}

export function createCrateMesh(): CompiledMesh {
  const parts: RawGeometry[] = [];
  const box = buildBox(1.0, 1.0, 1.0, Palette.woodLight);
  for (let i = 1; i < box.positions.length; i += 3) box.positions[i] += 0.5;
  parts.push(box);
  
  const rim1 = buildBox(1.05, 0.1, 1.05, Palette.woodDark);
  for (let i = 1; i < rim1.positions.length; i += 3) rim1.positions[i] += 0.1;
  parts.push(rim1);
  
  const rim2 = buildBox(1.05, 0.1, 1.05, Palette.woodDark);
  for (let i = 1; i < rim2.positions.length; i += 3) rim2.positions[i] += 0.9;
  parts.push(rim2);

  return mergeGeometries(parts);
}

export function createJettyMesh(): CompiledMesh {
  const parts: RawGeometry[] = [];

  // 1. Broad Timber Wharf Deck (Dermaga Kayu Bersalut Pasak)
  // Sits at y = 0.05 above the water (y = -0.15)
  const broadWharf = buildBox(28.0, 0.25, 10.0, Palette.woodLight);
  for (let i = 0; i < broadWharf.positions.length; i += 3) {
    broadWharf.positions[i+1] += 0.05;
    broadWharf.positions[i+2] -= 1.0; // z: -6 to 4
  }
  parts.push(broadWharf);

  // Planks pattern / divider grooves on broad wharf
  for (let z = -5.5; z <= 3.5; z += 1.8) {
    const plankLine = buildBox(28.0, 0.28, 0.06, Palette.woodDark);
    for (let i = 0; i < plankLine.positions.length; i += 3) {
      plankLine.positions[i+1] += 0.06;
      plankLine.positions[i+2] += z;
    }
    parts.push(plankLine);
  }

  // 2. Extended Central Pier / Duel Platform (Pentas Pertarungan Taming Sari)
  const duelPier = buildBox(11.0, 0.28, 5.0, Palette.woodLight);
  for (let i = 0; i < duelPier.positions.length; i += 3) {
    duelPier.positions[i+1] += 0.06;
    duelPier.positions[i+2] += 6.5; // z: 4 to 9
  }
  parts.push(duelPier);

  // Pier planks dividers
  for (let z = 4.5; z <= 8.5; z += 1.2) {
    const pLine = buildBox(11.0, 0.3, 0.06, Palette.woodDark);
    for (let i = 0; i < pLine.positions.length; i += 3) {
      pLine.positions[i+1] += 0.07;
      pLine.positions[i+2] += z;
    }
    parts.push(pLine);
  }

  // 3. Heavy Timber Foundation Pilings underneath the wharf & pier
  const pilings = [
    [-13, -5], [-13, 3], [13, -5], [13, 3],
    [-5.2, 4], [5.2, 4], [-5.2, 8.8], [5.2, 8.8], [0, 8.8]
  ];
  for (const [px, pz] of pilings) {
    const pile = buildBox(0.45, 2.5, 0.45, Palette.woodDark);
    for (let i = 0; i < pile.positions.length; i += 3) {
      pile.positions[i] += px;
      pile.positions[i+1] -= 1.0;
      pile.positions[i+2] += pz;
    }
    parts.push(pile);
  }

  // 4. Wooden Guardrails & Mooring Bollards (Pagar Keselamatan Tepi Laut)
  // Flank rails (Left x = -14, Right x = 14)
  const sideRails = [
    { x: -14, zStart: -6, zEnd: 4 },
    { x: 14, zStart: -6, zEnd: 4 }
  ];
  for (const s of sideRails) {
    // Horizontal top rail
    const hRail = buildBox(0.12, 0.12, s.zEnd - s.zStart, Palette.woodDark);
    for (let i = 0; i < hRail.positions.length; i += 3) {
      hRail.positions[i] += s.x;
      hRail.positions[i+1] += 0.85;
      hRail.positions[i+2] += (s.zStart + s.zEnd) / 2;
    }
    parts.push(hRail);

    // Posts along side
    for (let z = s.zStart; z <= s.zEnd; z += 2.5) {
      const post = buildBox(0.2, 0.95, 0.2, Palette.woodDark);
      for (let i = 0; i < post.positions.length; i += 3) {
        post.positions[i] += s.x;
        post.positions[i+1] += 0.5;
        post.positions[i+2] += z;
      }
      parts.push(post);
    }
  }

  // Front water rails (z = 4, for |x| > 5.5)
  const frontRails = [
    { xStart: -14, xEnd: -5.5, z: 4 },
    { xStart: 5.5, xEnd: 14, z: 4 }
  ];
  for (const f of frontRails) {
    const w = f.xEnd - f.xStart;
    const hRail = buildBox(w, 0.12, 0.12, Palette.woodDark);
    for (let i = 0; i < hRail.positions.length; i += 3) {
      hRail.positions[i] += (f.xStart + f.xEnd) / 2;
      hRail.positions[i+1] += 0.85;
      hRail.positions[i+2] += f.z;
    }
    parts.push(hRail);

    for (let x = f.xStart; x <= f.xEnd; x += 2.5) {
      const post = buildBox(0.2, 0.95, 0.2, Palette.woodDark);
      for (let i = 0; i < post.positions.length; i += 3) {
        post.positions[i] += x;
        post.positions[i+1] += 0.5;
        post.positions[i+2] += f.z;
      }
      parts.push(post);
    }
  }

  // Pier side rails (x = -5.5 and x = 5.5, z: 4 to 9)
  for (const px of [-5.5, 5.5]) {
    const pierRail = buildBox(0.12, 0.12, 5.0, Palette.woodDark);
    for (let i = 0; i < pierRail.positions.length; i += 3) {
      pierRail.positions[i] += px;
      pierRail.positions[i+1] += 0.85;
      pierRail.positions[i+2] += 6.5;
    }
    parts.push(pierRail);

    for (let z = 4.2; z <= 8.8; z += 2.3) {
      const post = buildBox(0.22, 0.95, 0.22, Palette.woodDark);
      for (let i = 0; i < post.positions.length; i += 3) {
        post.positions[i] += px;
        post.positions[i+1] += 0.5;
        post.positions[i+2] += z;
      }
      parts.push(post);
    }
  }

  // Pier front ocean ocean rail (z = 9, x: -5.5 to 5.5)
  const frontPierRail = buildBox(11.0, 0.12, 0.12, Palette.woodDark);
  for (let i = 0; i < frontPierRail.positions.length; i += 3) {
    frontPierRail.positions[i+1] += 0.85;
    frontPierRail.positions[i+2] += 9.0;
  }
  parts.push(frontPierRail);

  for (let x = -5.5; x <= 5.5; x += 2.75) {
    const post = buildBox(0.25, 1.0, 0.25, Palette.woodDark);
    for (let i = 0; i < post.positions.length; i += 3) {
      post.positions[i] += x;
      post.positions[i+1] += 0.52;
      post.positions[i+2] += 9.0;
    }
    parts.push(post);
  }

  // 5. Mooring Bollards (Tiang Penambat Tali Kapal) with coiled hemp ropes
  const bollardPos = [
    [-5.2, 4.2], [5.2, 4.2], [-5.2, 8.8], [5.2, 8.8], [-13.5, 3.8], [13.5, 3.8]
  ];
  for (const [bx, bz] of bollardPos) {
    const bPost = buildBox(0.35, 0.7, 0.35, Palette.woodDark);
    for (let i = 0; i < bPost.positions.length; i += 3) {
      bPost.positions[i] += bx;
      bPost.positions[i+1] += 0.45;
      bPost.positions[i+2] += bz;
    }
    parts.push(bPost);

    const bCap = buildBox(0.48, 0.15, 0.48, Palette.goldDecor);
    for (let i = 0; i < bCap.positions.length; i += 3) {
      bCap.positions[i] += bx;
      bCap.positions[i+1] += 0.82;
      bCap.positions[i+2] += bz;
    }
    parts.push(bCap);
  }

  return mergeGeometries(parts);
}

export function createBoatMesh(): CompiledMesh {
  const parts: RawGeometry[] = [];
  const hull = buildBox(2.2, 1.2, 6.0, Palette.woodDark);
  for (let i = 1; i < hull.positions.length; i += 3) hull.positions[i] += 0.6;
  parts.push(hull);
  
  const bow = buildPyramid(2.2, 1.5, Palette.woodDark);
  for (let i = 0; i < bow.positions.length; i += 3) {
    bow.positions[i+1] += 0.75;
    bow.positions[i+2] += 3.75;
  }
  parts.push(bow);

  const mast1 = buildBox(0.15, 4.5, 0.15, Palette.woodLight);
  for (let i = 0; i < mast1.positions.length; i += 3) {
    mast1.positions[i+1] += 3.0;
    mast1.positions[i+2] += 1.0;
  }
  parts.push(mast1);

  const sail1 = buildBox(2.0, 2.8, 0.05, Palette.clothWhite);
  for (let i = 0; i < sail1.positions.length; i += 3) {
    sail1.positions[i+1] += 3.5;
    sail1.positions[i+2] += 1.2;
  }
  parts.push(sail1);

  return mergeGeometries(parts);
}

export function createScrollMesh(): CompiledMesh {
  const parts: RawGeometry[] = [];
  const roll = buildBox(0.2, 0.8, 0.2, [0.95, 0.85, 0.3]);
  parts.push(roll);

  const rim1 = buildBox(0.3, 0.1, 0.3, [0.8, 0.6, 0.1]);
  for (let i = 1; i < rim1.positions.length; i += 3) rim1.positions[i] += 0.4;
  parts.push(rim1);

  const rim2 = buildBox(0.3, 0.1, 0.3, [0.8, 0.6, 0.1]);
  for (let i = 1; i < rim2.positions.length; i += 3) rim2.positions[i] -= 0.4;
  parts.push(rim2);
  return mergeGeometries(parts);
}

export function createHerbMesh(): CompiledMesh {
  const parts: RawGeometry[] = [];
  const leaf1 = buildBox(0.35, 0.05, 0.15, Palette.herbGreen);
  parts.push(leaf1);
  const leaf2 = buildBox(0.15, 0.05, 0.35, Palette.herbGreen);
  parts.push(leaf2);
  return mergeGeometries(parts);
}

export function createThroneMesh(): CompiledMesh {
  const parts: RawGeometry[] = [];
  const base = buildBox(3.4, 0.5, 2.8, Palette.palaceFloor);
  for (let i = 1; i < base.positions.length; i += 3) base.positions[i] += 0.25;
  parts.push(base);

  const seat = buildBox(1.6, 0.7, 1.3, Palette.sultanRoyalYellow);
  for (let i = 1; i < seat.positions.length; i += 3) seat.positions[i] += 0.8;
  parts.push(seat);

  const back = buildBox(1.6, 1.8, 0.2, Palette.goldDecor);
  for (let i = 0; i < back.positions.length; i += 3) {
    back.positions[i+1] += 1.7;
    back.positions[i+2] -= 0.55;
  }
  parts.push(back);

  // Payung Ubur-Ubur Diraja (Royal Umbrellas flanking the throne)
  for (const side of [-1.4, 1.4]) {
    const pole = buildBox(0.08, 3.8, 0.08, Palette.goldDecor);
    for (let i = 0; i < pole.positions.length; i += 3) {
      pole.positions[i] += side;
      pole.positions[i+1] += 1.9;
      pole.positions[i+2] -= 0.4;
    }
    parts.push(pole);

    const umbrella = buildPyramid(1.8, 0.7, Palette.sultanRoyalYellow);
    for (let i = 0; i < umbrella.positions.length; i += 3) {
      umbrella.positions[i] += side;
      umbrella.positions[i+1] += 3.8;
      umbrella.positions[i+2] -= 0.4;
    }
    parts.push(umbrella);
  }
  return mergeGeometries(parts);
}

export function createPalacePillarMesh(): CompiledMesh {
  const parts: RawGeometry[] = [];
  const p = buildBox(0.6, 5.2, 0.6, [0.45, 0.12, 0.10]);
  for (let i = 1; i < p.positions.length; i += 3) p.positions[i] += 2.6;
  parts.push(p);

  // Ukiran Bunga Emas pada tiang seri
  const goldRing1 = buildBox(0.75, 0.35, 0.75, Palette.goldDecor);
  for (let i = 1; i < goldRing1.positions.length; i += 3) goldRing1.positions[i] += 1.0;
  parts.push(goldRing1);

  const goldRing2 = buildBox(0.75, 0.35, 0.75, Palette.goldDecor);
  for (let i = 1; i < goldRing2.positions.length; i += 3) goldRing2.positions[i] += 4.0;
  parts.push(goldRing2);

  const cap = buildBox(1.1, 0.4, 1.1, Palette.goldDecor);
  for (let i = 1; i < cap.positions.length; i += 3) cap.positions[i] += 5.2;
  parts.push(cap);

  return mergeGeometries(parts);
}

export function createShadowMesh(): CompiledMesh {
  return mergeGeometries([buildBox(0.85, 0.02, 0.85, Palette.shadow)]);
}
