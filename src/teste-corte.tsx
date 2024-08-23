import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';

const RectangleScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [transformControls, setTransformControls] = useState<TransformControls | null>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth - 200, window.innerHeight);
    mountRef.current!.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    const gridHelper = new THREE.GridHelper(20, 20);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Criando a geometria extrudada com o corte
    const width = 8.95;
    const height = 0.58;
    const depth = 8.0;

    const shape = new THREE.Shape();
    shape.moveTo(0, 0); // Vértice inferior esquerdo
    shape.lineTo(width, 0); // Vértice inferior direito
    shape.lineTo(width, height); // Vértice superior direito
    shape.lineTo(height, height); // Vértice superior esquerdo
    shape.lineTo(0, 0); // Vértice onde começa o corte em 45 graus
    shape.lineTo(depth, 0); // Vértice inferior esquerdo após o corte
    shape.lineTo(0, 0); // Fechando o shape

    const extrudeSettings = {
      depth: depth,
      bevelEnabled: false,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Adicionando TransformControls
    const transformControl = new TransformControls(camera, renderer.domElement);
    transformControl.attach(mesh);
    scene.add(transformControl);
    setTransformControls(transformControl);

    camera.position.set(0, 5, 15);
    camera.lookAt(scene.position);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      // transformControl.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (mountRef.current && renderer.domElement.parentElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      transformControl.dispose();
    };
  }, []);

  const handleSetModeTranslate = () => {
    transformControls?.setMode('translate');
  };

  const handleSetModeRotate = () => {
    transformControls?.setMode('rotate');
  };

  return (
    <>
      <div ref={mountRef}></div>
      <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
        <button onClick={handleSetModeTranslate}>Mover</button>
        <button onClick={handleSetModeRotate}>Rotacionar</button>
      </div>
    </>
  );
};

export default RectangleScene;
