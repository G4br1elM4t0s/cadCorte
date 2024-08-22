import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

interface BoxGeometricProps {
  width: number;
  height: number;
  depth: number;
}

const BoxGeometric: React.FC<BoxGeometricProps> = ({ width, height, depth }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<THREE.Mesh[]>([]);
  const [transformControls, setTransformControls] = useState<TransformControls | null>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (containerRef.current) {
      containerRef.current.appendChild(renderer.domElement);
    }

    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0.5 });
    const box = new THREE.Mesh(geometry, material);
    scene.add(box);

    const edges = new THREE.EdgesGeometry(geometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const edgesLines = new THREE.LineSegments(edges, edgesMaterial);
    box.add(edgesLines);

    const controls = new TransformControls(camera, renderer.domElement);
    controls.attach(box);
    controls.setMode('rotate');
    scene.add(controls);
    setTransformControls(controls);

    camera.position.z = 5;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    function onMouseMove(event: MouseEvent) {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
    }

    function onClick(event: MouseEvent) {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(edgesLines, true);

      if (intersects.length > 0) {
        const intersection = intersects[0];
        const point = intersection.point.clone();

        const pointGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
        const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
        pointMesh.position.copy(point);

        edgesLines.add(pointMesh);
        setPoints((prevPoints) => [...prevPoints, pointMesh]);

        // Calculando a distância do ponto em relação às vértices mais próximas
        const edge = getClosestEdge(intersection.face, geometry);
        if (edge) {
          const distanceToVertex1 = point.distanceTo(edge[0]);
          const distanceToVertex2 = point.distanceTo(edge[1]);
          console.log(`Distância para o vértice 1: ${distanceToVertex1.toFixed(2)} unidades`);
          console.log(`Distância para o vértice 2: ${distanceToVertex2.toFixed(2)} unidades`);
        }
      }
    }

    // Função para obter a aresta mais próxima de um face
    function getClosestEdge(face: THREE.Face | null, geometry: THREE.BufferGeometry): [THREE.Vector3, THREE.Vector3] | null {
      if (!face) return null;

      const positions = geometry.attributes.position;
      const vertex1 = new THREE.Vector3().fromBufferAttribute(positions, face.a);
      const vertex2 = new THREE.Vector3().fromBufferAttribute(positions, face.b);
      const vertex3 = new THREE.Vector3().fromBufferAttribute(positions, face.c);

      const edges: [THREE.Vector3, THREE.Vector3][] = [
        [vertex1, vertex2],
        [vertex2, vertex3],
        [vertex3, vertex1],
      ];

      let minDistance = Infinity;
      let closestEdge: [THREE.Vector3, THREE.Vector3] | null = null;

      edges.forEach(([v1, v2]) => {
        const distance = intersection.point.distanceTo(new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5));
        if (distance < minDistance) {
          minDistance = distance;
          closestEdge = [v1, v2];
        }
      });

      return closestEdge;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (transformControls) {
        switch (event.key) {
          case 't':
            transformControls.setMode('translate');
            break;
          case 'r':
            transformControls.setMode('rotate');
            break;
          case 's':
            transformControls.setMode('scale');
            break;
        }
      }
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    window.addEventListener('keydown', handleKeyDown);

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    animate();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('keydown', handleKeyDown);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} />;
};

export default BoxGeometric;
