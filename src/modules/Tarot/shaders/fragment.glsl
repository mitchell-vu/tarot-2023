float blendOverlay(float base, float blend) {
    return base < 0.5 ? (2.0 * base * blend) : (1.0 - 2.0 * (1.0 - base) * (1.0 - blend));
}

vec3 blendOverlay(vec3 base, vec3 blend) {
    return vec3(blendOverlay(base.r, blend.r), blendOverlay(base.g, blend.g), blendOverlay(base.b, blend.b));
}

vec3 blendOverlay(vec3 base, vec3 blend, float opacity) {
    return (blendOverlay(base, blend) * opacity + base * (1.0 - opacity));
}

#ifdef GL_ES
precision mediump float;
#define GLSLIFY 1
#endif

varying vec2 vUv;

uniform float time;
uniform vec2 resolution;
uniform vec3 backgroundColor;
uniform vec3 lightColor;
uniform float lightRadiusMultiplier;
uniform vec2 lightPosition;
uniform sampler2D cloudTexture;
uniform vec2 pos;
uniform float cloudReposition;

vec4 circle(vec2 uv, vec2 pos, float rad, vec3 color) {
    float d = length(pos - uv) + 1.0;
    float t = clamp(d, 0.0, 1.0);
    return vec4(color * (1.0 - smoothstep(0., rad, d)) * 15.0, 1.0 - t * 0.975);
}

vec2 textureUv(sampler2D texture, vec2 resolution, vec2 coord) {
    ivec2 textureSize = textureSize(texture, 0);
    float textureAspectRatio = float(textureSize.y) / float(textureSize.x);

    float a1, a2;

    if(resolution.y / resolution.x < textureAspectRatio) {
        a1 = 1.0;
        a2 = resolution.y / resolution.x / textureAspectRatio;
    } else {
        a1 = (resolution.x / resolution.y) * textureAspectRatio;
        a2 = 1.0;
    }

    vec2 uv = coord / resolution;
    uv = (uv - vec2(0.5)) * vec2(a1, a2) + vec2(0.5);

    return uv;
}

vec2 rotateUV(vec2 uv, float rotation) {
    float mid = 0.5;
    return vec2(cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid, cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid);
}

void main() {
    vec2 uv = gl_FragCoord.xy;
    float aspectRatio = resolution.x / resolution.y;

    vec2 cloudUv = textureUv(cloudTexture, resolution, gl_FragCoord.xy);

    vec2 cloud1Uv = rotateUV(cloudUv, 2.95);

    if(aspectRatio > 1.0) {
        cloud1Uv = cloud1Uv * 0.65 - vec2(0.25 + pos.x + cloudReposition, -0.09 + pos.y);
    } else {
        cloud1Uv = cloud1Uv * 0.7 - vec2(0.15 + pos.x + cloudReposition, -0.225 + pos.y);
    }

    vec4 textureCloud1 = texture(cloudTexture, cloud1Uv);
    vec3 cloud1 = blendOverlay(backgroundColor, textureCloud1.rgb, 0.45);
    vec2 cloud2Uv = rotateUV(cloudUv, 2.95);
    if(aspectRatio > 1.0) {
        cloud2Uv = cloud2Uv - vec2(0.55 + pos.x * 5.0 + (cloudReposition * 0.9), -0.25);
    } else {
        cloud2Uv = cloud2Uv - vec2(0.275 + pos.x * 5.0 + (cloudReposition * 0.9), -0.45);
    }
    vec4 textureCloud2 = texture(cloudTexture, cloud2Uv);
    vec3 cloud2 = blendOverlay(cloud1, textureCloud2.rgb, 0.25);
    vec2 cloud3Uv = cloudUv;
    cloud3Uv = cloud3Uv * 0.7 - vec2(0.05 + pos.x * 1.5 + cloudReposition, -0.25 + pos.y * 1.5);
    vec4 textureCloud3 = texture(cloudTexture, cloud3Uv);
    vec3 cloud3 = blendOverlay(cloud2, textureCloud3.rgb, 0.45);
    vec2 cloud4Uv = cloudUv;
    cloud4Uv = cloud4Uv * 0.8 - vec2(0.05 - pos.x + cloudReposition * 0.9, -0.65);
    vec4 textureCloud4 = texture(cloudTexture, cloud4Uv);
    vec3 cloud4 = blendOverlay(cloud3, textureCloud4.rgb, 0.35);
    vec4 backgroundLayer = vec4(cloud4, 1.0);
    float lightRadius = 0.5 * resolution.y * lightRadiusMultiplier;
    vec4 lightLayer = circle(uv, lightPosition, lightRadius, lightColor);
    gl_FragColor = mix(backgroundLayer, lightLayer, lightLayer.a);
}