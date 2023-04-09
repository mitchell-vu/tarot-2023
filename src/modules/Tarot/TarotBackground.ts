import * as THREE from "three";

import vertexShader from "@/modules/Tarot/shaders/vertex.glsl";
import fragmentShader from "@/modules/Tarot/shaders/fragment.glsl";
import { Assets } from "@/modules/Tarot/Assets";

export type Uniforms = {
  time: {
    value: number;
  };
  resolution: {
    value: THREE.Vector2;
  };
  backgroundColor: {
    value: THREE.Color;
  };
  lightColor: {
    value: THREE.Color;
  };
  lightRadiusMultiplier: {
    value: number;
  };
  lightPosition: {
    value: THREE.Vector2;
  };
  cloudTexture: {
    value: THREE.Texture | null;
  };
  cloudOpacity: {
    value: number;
  };
  cloudReposition: {
    value: number;
  };

  pos: {
    value: THREE.Vector2;
  };
};

class TarotBackground {
  geometry: THREE.PlaneGeometry;
  material: THREE.ShaderMaterial;
  mesh: THREE.Mesh;

  materialUniforms: Uniforms = {
    time: { value: 0 },
    resolution: { value: new THREE.Vector2(0, 0) },
    backgroundColor: { value: new THREE.Color("#000D24") },
    lightColor: { value: new THREE.Color("#0057FF") },
    lightRadiusMultiplier: { value: 1 },
    lightPosition: { value: new THREE.Vector2(0, 0) },
    cloudTexture: { value: null },
    pos: { value: new THREE.Vector2(0, 0) },
    cloudOpacity: { value: 1 },
    cloudReposition: { value: 0.25 },
  };

  pixelRatio = 1;

  lightPositionWasChangedDirectly = false;

  /**
   * @constructor
   */
  constructor(width: number, height: number) {
    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.material = this.createMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);

    this.materialUniforms.cloudTexture.value = Assets.get("cloudTexture");
    this.setSize(width, height);
  }

  private createMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: this.materialUniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });
  }

  setSize(width: number, height: number) {
    this.pixelRatio = Math.min(window.devicePixelRatio, 2);

    this.mesh.scale.set(width, height, 1);

    const { resolution, lightPosition } = this.materialUniforms;

    resolution.value = new THREE.Vector2(width * this.pixelRatio, height * this.pixelRatio);

    const centerX = width * 0.5 * this.pixelRatio;
    const centerY = height * 0.5 * this.pixelRatio;

    if (!this.lightPositionWasChangedDirectly) {
      lightPosition.value = new THREE.Vector2(centerX, centerY);
    }
  }

  update(t: number, mouse: Coords) {
    const { time, pos } = this.materialUniforms;

    time.value = t;

    const { x: mouseX, y: mouseY } = mouse;

    const targetX = mouseX * 0.0000175;
    const targetY = mouseY * -0.0000175;

    const { x, y } = pos.value;
    pos.value = new THREE.Vector2(x + 0.025 * (targetX - x), y + 0.025 * (targetY - y));
  }

  /**
   * Setting new light position
   */
  setLightPosition(x: number, y: number) {
    this.materialUniforms.lightPosition.value = new THREE.Vector2(x * this.pixelRatio, y * this.pixelRatio);
    this.lightPositionWasChangedDirectly = true;
  }
}

export default TarotBackground;
