import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import { SUBTRACTION, Brush, Evaluator } from 'three-bvh-csg';

const RectangleScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mainMesh, setMainMesh] = useState<THREE.Mesh | null>(null);
  const [cutterMesh, setCutterMesh] = useState<THREE.Mesh | null>(null);
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current!.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Dimensões do retângulo 3D (caixa)
    const width = 8.95;
    const height = 0.58;
    const depth = 8.0;

    // Criando materiais para cada face
    const faceMaterials = [
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Frente
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Trás
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Topo
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Fundo
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Esquerda
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // Direita
    ];

    const mainBrush = new Brush(new THREE.BoxGeometry(width, height, depth), faceMaterials);
    mainBrush.updateMatrixWorld(true);

    // Criando a caixa (objeto 3D) com materiais diferentes para cada face
    // const geometry = new THREE.BoxGeometry(width, height, depth);
    const box = new THREE.Mesh(mainBrush.geometry, faceMaterials);
    scene.add(box);
    setMainMesh(box)
    // Raycaster e vetor do mouse para detecção de interseção
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let intersectedFaceIndex: number | null = null;
    const clickedFaces: Set<number> = new Set();

    // Função para detectar o movimento do mouse
    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObject(box);

      if (intersects.length > 0) {
        const intersect = intersects[0];
        const faceIndex = Math.floor(intersect.faceIndex! / 2);

        if (intersectedFaceIndex !== faceIndex && !clickedFaces.has(faceIndex)) {
          // Resetar a cor da face anterior
          if (intersectedFaceIndex !== null && !clickedFaces.has(intersectedFaceIndex)) {
            faceMaterials[intersectedFaceIndex].color.set(0x00ff00);
          }

          // Alterar a cor da face atual
          intersectedFaceIndex = faceIndex;
          if (!clickedFaces.has(faceIndex)) {
            faceMaterials[intersectedFaceIndex].color.set(0xffff00);
          }
        }
      } else {
        if (intersectedFaceIndex !== null && !clickedFaces.has(intersectedFaceIndex)) {
          faceMaterials[intersectedFaceIndex].color.set(0x00ff00);
          intersectedFaceIndex = null;
        }
      }
    };

    // Função para detectar cliques do mouse
    const onClick = () => {
      if (intersectedFaceIndex !== null) {
        if (clickedFaces.has(intersectedFaceIndex)) {
          // Se já está clicado, remover da lista e resetar a cor
          clickedFaces.delete(intersectedFaceIndex);
          faceMaterials[intersectedFaceIndex].color.set(0x00ff00);
        } else {
          // Se não está clicado, adicionar à lista e manter a cor
          clickedFaces.add(intersectedFaceIndex);
          faceMaterials[intersectedFaceIndex].color.set(0xff0000); // Cor permanente ao clicar

          // Criar e posicionar a nova caixa
          let smallBox;
          const smallBoxMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

          if (intersectedFaceIndex === 4) { // Frente
            smallBox = new THREE.Mesh(
              new THREE.BoxGeometry(width, height,1.3),
              smallBoxMaterial
            );
            smallBox.position.set(0, 0, depth/3 + 1.3);
            smallBox.rotation.x = THREE.MathUtils.degToRad(45);
            // smallBox.updateMatrixWorld();
            const mainBrush = new Brush(mainMesh?.geometry);
            const cutterBrush = new Brush(cutterMesh.geometry);


            // // Atualizar a geometria original para corte
            // box.updateMatrixWorld();
  
            // // Executar a subtração CSG
            // const evaluator = new Evaluator();
            // const result = evaluator.evaluate(box, smallBox, SUBTRACTION);
  
            // // Substituir a geometria original pela nova geometria cortada
            // scene.remove(boxMesh);
            // boxMesh.geometry.dispose();
            // boxMesh.geometry = Brush.toMesh(result, faceMaterials).geometry;
            // scene.add(boxMesh);
          } else if (intersectedFaceIndex === 5) { // Trás
            smallBox = new THREE.Mesh(
              new THREE.BoxGeometry(width, height, depth / 2),
              smallBoxMaterial
            );
            smallBox.position.set(0, 0, -(depth / 2 + depth / 4));
          } else if (intersectedFaceIndex === 3) { // Topo
            smallBox = new THREE.Mesh(
              // new THREE.BoxGeometry(width, height / 2, depth),
              // smallBoxMaterial
              new THREE.BoxGeometry(width / 2, height, depth),
              smallBoxMaterial
            );
            smallBox.position.set(0, height / 2 + height / 4, 0);
          } else if (intersectedFaceIndex === 1) { // Fundo
            smallBox = new THREE.Mesh(
              new THREE.BoxGeometry(width, height / 2, depth),
              smallBoxMaterial
            );
            smallBox.position.set(0, -(height / 2 + height / 4), 0);
          } else if (intersectedFaceIndex === 0) { // Esquerda
            smallBox = new THREE.Mesh(
              new THREE.BoxGeometry(width / 4, height, depth),
              smallBoxMaterial
            );
            smallBox.position.set(-(width / 2 + width / 4), 0, 0);
          } else if (intersectedFaceIndex === 2) { // Direita
            smallBox = new THREE.Mesh(
              new THREE.BoxGeometry(width / 2, height, depth),
              smallBoxMaterial
            );
            smallBox.position.set(width / 2 + width / 4, 0, 0);
          }

          if (smallBox) {
            scene.add(smallBox);
          }
        }
      }
    };

    // Adicionando eventos de movimento e clique do mouse
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);

    camera.position.z = 15;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    return () => {
      mountRef.current!.removeChild(renderer.domElement);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return <div ref={mountRef}></div>;
};

export default RectangleScene;
