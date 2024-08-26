import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';

const BevelTool = () => {
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cubeRef = useRef<THREE.Mesh>();
  const step = useRef<number>(0);

  useEffect(() => {
    // Configuração inicial da cena
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Adicionar luz à cena
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 1, 1).normalize();
    scene.add(light);

    // Criar o cubo inicial
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({ color: 0x00ff00, wireframe: true });
    const cube = new THREE.Mesh(geometry, material);

    scene.add(cube);
    cubeRef.current = cube;

    // Ajuste de posição da câmera
    camera.position.z = 5;

    // Guardar referências
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;

    // Função de renderização
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  const applyBevel = () => {
    if (cubeRef.current && sceneRef.current) {
      const evaluator = new Evaluator();
      const originalBrush = new Brush(cubeRef.current.geometry.clone());

      // Ajustar o tamanho e número de segmentos para diferentes etapas
      let sphereGeometry;
      if (step.current === 0) {
        sphereGeometry = new THREE.SphereGeometry(0.3, 8, 8);
      } else if (step.current === 1) {
        sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      } else {
        sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
      }

      const sphereBrush = new Brush(sphereGeometry);
      const beveledGeometry = evaluator.evaluate(originalBrush, sphereBrush, SUBTRACTION);

      cubeRef.current.geometry = beveledGeometry;

      // Aumenta o step para simular as fases de chanfro
      step.current += 1;
    }
  };

  return (
    <div>
      <button onClick={applyBevel}>Aplicar Chanfro</button>
    </div>
  );
};

export default BevelTool;
