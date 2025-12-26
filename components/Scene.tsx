
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { ACUPOINTS_DATA, COLORS } from '../constants';

interface SceneProps {
  onHit: (pointId: string, isCorrect: boolean) => void;
  currentLevel: number;
  requiredPoints: string[];
  hitPoints: string[];
}

const Scene: React.FC<SceneProps> = ({ onHit, currentLevel, requiredPoints, hitPoints }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    pointGroup: THREE.Group;
    needles: any[];
    effects: any[];
  } | null>(null);

  // Use refs to keep state accessible inside the persistent Three.js loop without re-mounting
  const onHitRef = useRef(onHit);
  useEffect(() => { onHitRef.current = onHit; }, [onHit]);

  const requiredPointsRef = useRef(requiredPoints);
  useEffect(() => { requiredPointsRef.current = requiredPoints; }, [requiredPoints]);

  const hitPointsRef = useRef(hitPoints);
  useEffect(() => { hitPointsRef.current = hitPoints; }, [hitPoints]);

  // Persistent Engine Loop initialization
  useEffect(() => {
    if (!mountRef.current) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.Fog(0x050505, 1, 15);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambLight);
    const pointLight = new THREE.PointLight(0x00f3ff, 5, 20);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // --- PARTICLE BODY ---
    const particleCount = 12000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const bodyColors = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      let x, y, z;
      const part = Math.random();
      if (part < 0.12) { 
        y = 1.65 + (Math.random()-0.5)*0.5; x = (Math.random()-0.5)*0.4; z = (Math.random()-0.5)*0.4; 
      } else if (part < 0.55) { 
        y = (Math.random()-0.5)*1.6+0.5; x = (Math.random()-0.5)*0.9; z = (Math.random()-0.5)*0.45; 
      } else { 
        const limb = Math.random();
        if (limb < 0.5) { 
          x = (Math.random() < 0.5 ? 0.3 : -0.3) + (Math.random()-0.5)*0.2; 
          y = -0.5 - Math.random()*1.7; 
          z = (Math.random()-0.5)*0.2; 
        } else { 
          x = (Math.random() < 0.5 ? 0.75 : -0.75) + (Math.random()-0.5)*0.2; 
          y = 0.3 + (Math.random()-0.5)*1.2; 
          z = (Math.random()-0.5)*0.2; 
        }
      }
      positions[i*3] = x; positions[i*3+1] = y; positions[i*3+2] = z;
      const color = new THREE.Color(part < 0.3 ? 0x00f3ff : 0x0088ff);
      bodyColors[i*3] = color.r; bodyColors[i*3+1] = color.g; bodyColors[i*3+2] = color.b;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(bodyColors, 3));
    const bodyParticles = new THREE.Points(geometry, new THREE.PointsMaterial({ 
      size: 0.012, vertexColors: true, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending 
    }));
    scene.add(bodyParticles);

    // --- ACUPOINTS ---
    const pointGroup = new THREE.Group();
    const pointGeometry = new THREE.SphereGeometry(0.07, 12, 12);
    ACUPOINTS_DATA.forEach(pt => {
      const mesh = new THREE.Mesh(pointGeometry, new THREE.MeshBasicMaterial({ transparent: true }));
      mesh.position.set(pt.position[0], pt.position[1], pt.position[2]);
      mesh.userData = { id: pt.id };
      
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), new THREE.MeshBasicMaterial({ color: COLORS.GOLD, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
      glow.name = 'glow';
      mesh.add(glow);
      
      pointGroup.add(mesh);
    });
    scene.add(pointGroup);

    engineRef.current = { scene, camera, renderer, pointGroup, needles: [], effects: [] };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const createBurst = (pos: THREE.Vector3, color: string) => {
      const count = 35;
      const geo = new THREE.BufferGeometry();
      const posArr = new Float32Array(count * 3);
      const velArr = new Float32Array(count * 3);
      for(let i=0; i<count; i++){
        posArr[i*3] = pos.x; posArr[i*3+1] = pos.y; posArr[i*3+2] = pos.z;
        velArr[i*3] = (Math.random()-0.5)*0.1; 
        velArr[i*3+1] = (Math.random()-0.5)*0.1; 
        velArr[i*3+2] = (Math.random()-0.5)*0.1;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
      geo.setAttribute('velocity', new THREE.BufferAttribute(velArr, 3));
      const points = new THREE.Points(geo, new THREE.PointsMaterial({ color, size: 0.05, transparent: true, opacity: 1, blending: THREE.AdditiveBlending }));
      scene.add(points);
      engineRef.current?.effects.push({ mesh: points, life: 1.0 });
    };

    const handleClick = (e: MouseEvent) => {
      if (!engineRef.current) return;
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, engineRef.current.camera);

      // Using recursive intersection to find points within the rotating group
      const intersects = raycaster.intersectObjects(engineRef.current.pointGroup.children, true);
      const startPos = new THREE.Vector3().copy(engineRef.current.camera.position).add(new THREE.Vector3(0, -0.6, -1.2));
      const targetPos = new THREE.Vector3();
      let hitId: string | null = null;

      if (intersects.length > 0) {
        const hit = intersects[0];
        // Use the actual point where the ray hit the object in world space
        targetPos.copy(hit.point);
        // Navigate up hierarchy if needed to find userData
        let obj: THREE.Object3D | null = hit.object;
        while (obj && !obj.userData.id) {
          obj = obj.parent;
        }
        hitId = obj?.userData.id || null;
      } else {
        // Just fly into the distance if nothing was hit
        raycaster.ray.at(10, targetPos);
      }

      const needle = new THREE.Group();
      const nMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.6, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: hitId ? 0x00f3ff : 0x444444, emissiveIntensity: 5 }));
      nMesh.rotation.x = Math.PI / 2;
      needle.add(nMesh);
      needle.position.copy(startPos);
      needle.lookAt(targetPos);
      scene.add(needle);

      engineRef.current.needles.push({ 
        mesh: needle, 
        start: startPos.clone(), 
        target: targetPos.clone(), 
        progress: 0, 
        hitId 
      });
    };

    window.addEventListener('mousedown', handleClick);

    let frameCount = 0;
    const animate = () => {
      if (!engineRef.current) return;
      const { scene, camera, renderer, pointGroup, needles, effects } = engineRef.current;
      frameCount += 0.02;
      requestAnimationFrame(animate);

      // Rotating body and points together
      bodyParticles.rotation.y += 0.0015;
      pointGroup.rotation.y += 0.0015;

      // Needle Flight Logic
      for (let i = needles.length - 1; i >= 0; i--) {
        const n = needles[i];
        const oldP = n.progress;
        n.progress += 0.14; // Speed of needle flight
        n.mesh.position.lerpVectors(n.start, n.target, Math.min(n.progress, 1.0));
        
        // Instant impact logic
        if (oldP < 1.0 && n.progress >= 1.0) {
          if (n.hitId) {
            const isCorrect = requiredPointsRef.current.includes(n.hitId);
            onHitRef.current(n.hitId, isCorrect);
            createBurst(n.target, isCorrect ? COLORS.GOLD : COLORS.CRIMSON);
          } else {
            onHitRef.current('miss', false);
            createBurst(n.target, '#555555');
          }
        }
        
        // Dissolve needle
        if (n.progress >= 1.0) {
          n.mesh.scale.multiplyScalar(0.75);
          if (n.mesh.scale.x < 0.1) { 
            scene.remove(n.mesh); 
            needles.splice(i, 1); 
          }
        }
      }

      // Visual Effects (Bursts)
      for (let i = effects.length - 1; i >= 0; i--) {
        const e = effects[i];
        e.life -= 0.04;
        const pos = e.mesh.geometry.attributes.position.array;
        const vel = e.mesh.geometry.attributes.velocity.array;
        for (let j = 0; j < pos.length; j++) pos[j] += vel[j];
        e.mesh.geometry.attributes.position.needsUpdate = true;
        (e.mesh.material as THREE.PointsMaterial).opacity = e.life;
        if (e.life <= 0) { 
          scene.remove(e.mesh); 
          effects.splice(i, 1); 
        }
      }

      // Live Point State Updates
      pointGroup.children.forEach(pt => {
        const mesh = pt as THREE.Mesh;
        const id = mesh.userData.id;
        const isTarget = requiredPointsRef.current.includes(id);
        const isHit = hitPointsRef.current.includes(id);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        
        mat.color.set(isHit ? COLORS.GOLD : (isTarget ? COLORS.GOLD : COLORS.CYBER_CYAN));
        mat.opacity = isTarget ? 1.0 : 0.15;
        
        const glow = mesh.getObjectByName('glow') as THREE.Mesh;
        if (glow) {
          const glowMat = glow.material as THREE.MeshBasicMaterial;
          if (isTarget && !isHit) {
            const s = 1 + Math.sin(frameCount * 6) * 0.4;
            glow.scale.set(s, s, s);
            glowMat.opacity = 0.2 + Math.sin(frameCount * 6) * 0.15;
          } else {
            glowMat.opacity = 0;
          }
        }
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!engineRef.current) return;
      engineRef.current.camera.aspect = window.innerWidth / window.innerHeight;
      engineRef.current.camera.updateProjectionMatrix();
      engineRef.current.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousedown', handleClick);
      window.removeEventListener('resize', handleResize);
      engineRef.current?.renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
      engineRef.current = null;
    };
  }, []); // Run only once

  return <div ref={mountRef} className="w-full h-full cursor-crosshair" />;
};

export default Scene;
