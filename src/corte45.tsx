// RectangleScene.tsx
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Brush, Evaluator } from 'three-bvh-csg';

const RectangleScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Configurar a cena básica
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current?.appendChild(renderer.domElement);

    // Criar luz
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(0, 1, 1).normalize();
    scene.add(light);

    // Criar geometria do retângulo
    const geometry = new THREE.BoxGeometry(2, 1, 0.5);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: false });
    const boxMesh = new THREE.Mesh(geometry, material);
    scene.add(boxMesh);

    // Criar linhas para arestas
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const lineSegments = new THREE.LineSegments(edges, lineMaterial);
    scene.add(lineSegments);

    // Adicionar vértices
    const vertices = geometry.vertices;
    const pointsMaterial = new THREE.PointsMaterial({ color: 0xff0000, size: 10 });
    const points = new THREE.Points(geometry, pointsMaterial);
    scene.add(points);

    // Posicionar câmera
    camera.position.z = 5;

    // Função de animação
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // Detectar cliques nas faces e mudar cores
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onPointerMove = (event: MouseEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);

      const intersects = raycaster.intersectObjects([boxMesh, lineSegments, points]);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        if (intersectedObject === boxMesh) {
          (intersectedObject as THREE.Mesh).material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
        } else if (intersectedObject === lineSegments) {
          (intersectedObject as THREE.LineSegments).material = new THREE.LineBasicMaterial({ color: Math.random() * 0xffffff });
        } else if (intersectedObject === points) {
          (intersectedObject as THREE.Points).material = new THREE.PointsMaterial({ color: Math.random() * 0xffffff, size: 10 });
        }
      }
    };

    window.addEventListener('pointermove', onPointerMove);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} />;
};

export default RectangleScene;
