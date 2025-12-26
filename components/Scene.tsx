
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

  const onHitRef = useRef(onHit);
  useEffect(() => { onHitRef.current = onHit; }, [onHit]);

  const requiredPointsRef = useRef(requiredPoints);
  useEffect(() => { requiredPointsRef.current = requiredPoints; }, [requiredPoints]);

  const hitPointsRef = useRef(hitPoints);
  useEffect(() => { hitPointsRef.current = hitPoints; }, [hitPoints]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050505);
    scene.fog = new THREE.Fog(0x050505, 1, 15);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5); // Pull back slightly for better mobile view

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambLight);
    const pointLight = new THREE.PointLight(0x00f3ff, 8, 25);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const particleCount = 10000;
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
          x = (Math.random() < 0.5 ? 0.35 : -0.35) + (Math.random()-0.5)*0.25; 
          y = -0.5 - Math.random()*1.8; 
          z = (Math.random()-0.5)*0.2; 
        } else { 
          x = (Math.random() < 0.5 ? 0.8 : -0.8) + (Math.random()-0.5)*0.25; 
          y = 0.3 + (Math.random()-0.5)*1.3; 
          z = (Math.random()-0.5)*0.2; 
        }
      }
      positions[i*3] = x; positions[i*3+1] = y; positions[i*3+2] = z;
      const color = new THREE.Color(part < 0.3 ? 0x00f3ff : 0x0055ff);
      bodyColors[i*3] = color.r; bodyColors[i*3+1] = color.g; bodyColors[i*3+2] = color.b;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(bodyColors, 3));
    const bodyParticles = new THREE.Points(geometry, new THREE.PointsMaterial({ 
      size: 0.015, vertexColors: true, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending 
    }));
    scene.add(bodyParticles);

    const pointGroup = new THREE.Group();
    const pointGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    ACUPOINTS_DATA.forEach(pt => {
      const mesh = new THREE.Mesh(pointGeometry, new THREE.MeshBasicMaterial({ transparent: true }));
      mesh.position.set(pt.position[0], pt.position[1], pt.position[2]);
      mesh.userData = { id: pt.id };
      
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 12), new THREE.MeshBasicMaterial({ color: COLORS.GOLD, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
      glow.name = 'glow';
      mesh.add(glow);
      
      pointGroup.add(mesh);
    });
    scene.add(pointGroup);

    engineRef.current = { scene, camera, renderer, pointGroup, needles: [], effects: [] };

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const createBurst = (pos: THREE.Vector3, color: string) => {
      const count = 30;
      const geo = new THREE.BufferGeometry();
      const posArr = new Float32Array(count * 3);
      const velArr = new Float32Array(count * 3);
      for(let i=0; i<count; i++){
        posArr[i*3] = pos.x; posArr[i*3+1] = pos.y; posArr[i*3+2] = pos.z;
        velArr[i*3] = (Math.random()-0.5)*0.12; 
        velArr[i*3+1] = (Math.random()-0.5)*0.12; 
        velArr[i*3+2] = (Math.random()-0.5)*0.12;
      }
      geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
      geo.setAttribute('velocity', new THREE.BufferAttribute(velArr, 3));
      const points = new THREE.Points(geo, new THREE.PointsMaterial({ color, size: 0.06, transparent: true, opacity: 1, blending: THREE.AdditiveBlending }));
      scene.add(points);
      engineRef.current?.effects.push({ mesh: points, life: 1.0 });
    };

    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (!engineRef.current) return;
      
      // Handle both mouse and touch
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      mouse.x = (clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, engineRef.current.camera);

      const intersects = raycaster.intersectObjects(engineRef.current.pointGroup.children, true);
      const startPos = new THREE.Vector3().copy(engineRef.current.camera.position).add(new THREE.Vector3(0, -0.8, -1.0));
      const targetPos = new THREE.Vector3();
      let hitId: string | null = null;

      if (intersects.length > 0) {
        const hit = intersects[0];
        targetPos.copy(hit.point);
        let obj: THREE.Object3D | null = hit.object;
        while (obj && !obj.userData.id) { obj = obj.parent; }
        hitId = obj?.userData.id || null;
      } else {
        raycaster.ray.at(10, targetPos);
      }

      const needle = new THREE.Group();
      const nMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.7, 6), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: hitId ? 0x00f3ff : 0x222222, emissiveIntensity: 4 }));
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

    window.addEventListener('mousedown', handleClick as any);
    window.addEventListener('touchstart', handleClick as any);

    let frameCount = 0;
    const animate = () => {
      if (!engineRef.current) return;
      const { scene, camera, renderer, pointGroup, needles, effects } = engineRef.current;
      frameCount += 0.02;
      requestAnimationFrame(animate);

      bodyParticles.rotation.y += 0.0018;
      pointGroup.rotation.y += 0.0018;

      for (let i = needles.length - 1; i >= 0; i--) {
        const n = needles[i];
        const oldP = n.progress;
        n.progress += 0.16; 
        n.mesh.position.lerpVectors(n.start, n.target, Math.min(n.progress, 1.0));
        
        if (oldP < 1.0 && n.progress >= 1.0) {
          if (n.hitId) {
            const isCorrect = requiredPointsRef.current.includes(n.hitId);
            onHitRef.current(n.hitId, isCorrect);
            createBurst(n.target, isCorrect ? COLORS.GOLD : COLORS.CRIMSON);
          } else {
            onHitRef.current('miss', false);
            createBurst(n.target, '#444444');
          }
        }
        
        if (n.progress >= 1.0) {
          n.mesh.scale.multiplyScalar(0.7);
          if (n.mesh.scale.x < 0.1) { 
            scene.remove(n.mesh); 
            needles.splice(i, 1); 
          }
        }
      }

      for (let i = effects.length - 1; i >= 0; i--) {
        const e = effects[i];
        e.life -= 0.05;
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

      pointGroup.children.forEach(pt => {
        const mesh = pt as THREE.Mesh;
        const id = mesh.userData.id;
        const isTarget = requiredPointsRef.current.includes(id);
        const isHit = hitPointsRef.current.includes(id);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        
        mat.color.set(isHit ? COLORS.GOLD : (isTarget ? COLORS.GOLD : COLORS.CYBER_CYAN));
        mat.opacity = isTarget ? 0.9 : 0.12;
        
        const glow = mesh.getObjectByName('glow') as THREE.Mesh;
        if (glow) {
          const glowMat = glow.material as THREE.MeshBasicMaterial;
          if (isTarget && !isHit) {
            const s = 1 + Math.sin(frameCount * 6) * 0.4;
            glow.scale.set(s, s, s);
            glowMat.opacity = 0.25 + Math.sin(frameCount * 6) * 0.15;
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
      window.removeEventListener('mousedown', handleClick as any);
      window.removeEventListener('touchstart', handleClick as any);
      window.removeEventListener('resize', handleResize);
      engineRef.current?.renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
      engineRef.current = null;
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full cursor-crosshair touch-none" />;
};

export default Scene;
