import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg';

const RectangleScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [medida, setMedida] = useState<number | null>(null);
  const [eixo, setEixo] = useState<string | null>(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth - 200, window.innerHeight);
    mountRef.current!.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Adicionando GridHelper
    const gridHelper = new THREE.GridHelper(100, 100);
    scene.add(gridHelper);

    // Adicionando AxesHelper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Dimensões do retângulo 3D (caixa)
    const width = 8.95;
    const height = 0.58;
    const depth = 4.0;

    // Criando materiais para cada face com cor cinza
    const faceMaterials = [
      new THREE.MeshBasicMaterial({ color: 0x808080 }), // Frente (cinza)
      new THREE.MeshBasicMaterial({ color: 0x808080 }), // Trás (cinza)
      new THREE.MeshBasicMaterial({ color: 0x808080 }), // Topo (cinza)
      new THREE.MeshBasicMaterial({ color: 0x808080 }), // Fundo (cinza)
      new THREE.MeshBasicMaterial({ color: 0x808080 }), // Esquerda (cinza)
      new THREE.MeshBasicMaterial({ color: 0x808080 }), // Direita (cinza)
    ];

    // Criando a caixa (objeto 3D) com materiais diferentes para cada face
    const box = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), faceMaterials);

    // Centralizando a caixa no ponto (0, 0, 0)
    box.position.set(0, 0, 0);

    // Adicionando arestas (cilindros) como filhos da caixa com cor amarela e mais finas
    const cylinderGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1, 16); // Mais fino
    const cylinderMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 }); // Amarelo

    const vertices = [
      new THREE.Vector3(-width / 2, -height / 2, -depth / 2),
      new THREE.Vector3(width / 2, -height / 2, -depth / 2),
      new THREE.Vector3(-width / 2, height / 2, -depth / 2),
      new THREE.Vector3(width / 2, height / 2, -depth / 2),
      new THREE.Vector3(-width / 2, -height / 2, depth / 2),
      new THREE.Vector3(width / 2, -height / 2, depth / 2),
      new THREE.Vector3(-width / 2, height / 2, depth / 2),
      new THREE.Vector3(width / 2, height / 2, depth / 2),
    ];

    const edges = [
      [vertices[0], vertices[1], 'Frente (Inferior)'],     // Aresta inferior frontal
      [vertices[1], vertices[3], 'Frente (Direita)'],     // Aresta frontal direita
      [vertices[3], vertices[2], 'Frente (Superior)'],    // Aresta superior frontal
      [vertices[2], vertices[0], 'Frente (Esquerda)'],    // Aresta frontal esquerda
      [vertices[4], vertices[5], 'Trás (Inferior)'],     // Aresta inferior traseira
      [vertices[5], vertices[7], 'Trás (Direita)'],       // Aresta traseira direita
      [vertices[7], vertices[6], 'Trás (Superior)'],      // Aresta superior traseira
      [vertices[6], vertices[4], 'Trás (Esquerda)'],      // Aresta traseira esquerda
      [vertices[0], vertices[4], 'Esquerda (Inferior)'],  // Aresta inferior esquerda
      [vertices[1], vertices[5], 'Direita (Inferior)'],   // Aresta inferior direita
      [vertices[2], vertices[6], 'Esquerda (Superior)'],  // Aresta superior esquerda
      [vertices[3], vertices[7], 'Direita (Superior)'],   // Aresta superior direita
    ];

    const cylinders: THREE.Mesh[] = [];
    const edgeLabels: string[] = [];

    edges.forEach(edge => {
      const [start, end, label] = edge;
      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();
      const cylinder = new THREE.Mesh(cylinderGeometry.clone(), cylinderMaterial.clone());

      // Ajuste do comprimento do cilindro para o comprimento da aresta
      cylinder.scale.set(1, length, 1);

      // Posicionamento do cilindro no centro da aresta
      const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
      cylinder.position.copy(midpoint);

      // Orientação do cilindro para "olhar" na direção da aresta
      cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());

      box.add(cylinder);
      cylinders.push(cylinder);
      edgeLabels.push(label as string);
    });

    scene.add(box);

    // Função para aplicar as transformações à geometria
    const applyTransforms = (mesh: THREE.Mesh) => {
      mesh.updateMatrixWorld(true);
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);
      return geometry;
    };

    // Raycaster e vetor do mouse para detecção de interseção
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let intersectedCylinder: THREE.Mesh | null = null;
    const selectedCylinders: THREE.Mesh[] = [];

    // Função para detectar o movimento do mouse
    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
      mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(cylinders);

      if (intersects.length > 0) {
        const intersect = intersects[0].object as THREE.Mesh;

        if (intersectedCylinder !== intersect) {
          // Resetar a cor da aresta anterior (se não estiver selecionada)
          if (intersectedCylinder && !selectedCylinders.includes(intersectedCylinder)) {
            intersectedCylinder.material.color.set(0xffff00);
          }

          // Alterar a cor da aresta atual
          intersectedCylinder = intersect;
          if (!selectedCylinders.includes(intersect)) {
            intersect.material.color.set(0xffa500); // Laranja para hover
          }
        }
      } else {
        // Resetar a cor da aresta anterior (se não estiver selecionada)
        if (intersectedCylinder && !selectedCylinders.includes(intersectedCylinder)) {
          intersectedCylinder.material.color.set(0xffff00); // Amarelo
        }
        intersectedCylinder = null;
      }
    };

    const updateEdgesUsingEdgesGeometry = (mesh: THREE.Mesh) => {
      // Remove todos os cilindros/arestas antigos
      while (mesh.children.length) {
          const child = mesh.children[0];
          mesh.remove(child);
          if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              (child.material as THREE.Material).dispose();
          }
      }
  
      // Utiliza a EdgesGeometry para obter as arestas da nova geometria
      const edgesGeometry = new THREE.EdgesGeometry(mesh.geometry);
      const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, linewidth: 4 });
  
      const edgeLines = new THREE.LineSegments(edgesGeometry, edgesMaterial);
      mesh.add(edgeLines);
  };
  
  

    // Função para detectar cliques do mouse e realizar o corte
    const onClick = () => {
      if (intersectedCylinder !== null) {
        const index = cylinders.indexOf(intersectedCylinder);
        const label = edgeLabels[index];
        console.log(`Você clicou na aresta: ${label}`);

        let newBoxGeometry: THREE.BoxGeometry;
        const newBoxMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const offsetFactor = -0.019; // 30% para fora da posição da aresta

        const direction = new THREE.Vector3();
        intersectedCylinder.getWorldDirection(direction);
        const boxPosition = new THREE.Vector3();
        intersectedCylinder.getWorldPosition(boxPosition);

        let newBox: THREE.Mesh;

        if (label.includes('Frente') || label.includes('Trás')) {
          // newBoxGeometry = new THREE.BoxGeometry(width , height-0.07 , 0.9);

          newBoxGeometry = new THREE.BoxGeometry(width, height - 0.07, 1.0);
          newBox = new THREE.Mesh(newBoxGeometry, newBoxMaterial);
          newBox.rotation.x =THREE.MathUtils.degToRad(45);

          newBox.position.set(0, 0.17, boxPosition.z + direction.z * offsetFactor * depth);
          // scene.add(newBox);
        } else if (label.includes('Esquerda') || label.includes('Direita')) {
          newBoxGeometry = new THREE.BoxGeometry(0.9, height - 0.07, depth);
          newBox = new THREE.Mesh(newBoxGeometry, newBoxMaterial);
          const xOffset = direction.x > 0 ? offsetFactor * width / 2 : -offsetFactor * width / 2;
          newBox.position.set(boxPosition.x + xOffset, 0, 0);
          // newBox.position.set(boxPosition.x + direction.x * offsetFactor * width, 0.17, 0);
        }

        // Aplica as transformações à geometria do box e newBox
        const boxGeometryWithTransforms = applyTransforms(box);
        const newBoxGeometryWithTransforms = applyTransforms(newBox!);

        const boxBrush = new Brush(boxGeometryWithTransforms);
        const newBoxBrush = new Brush(newBoxGeometryWithTransforms);

        const evaluator = new Evaluator();
        const result = evaluator.evaluate(boxBrush, newBoxBrush, SUBTRACTION);

        // Remover o box original da cena
        scene.remove(box);

        const resultMesh = new THREE.Mesh(result.geometry, faceMaterials);
        resultMesh.geometry.computeVertexNormals();
        updateEdgesUsingEdgesGeometry(resultMesh);
        // Adiciona o resultado à cena
        scene.add(resultMesh);

        // Limpa e remove a nova geometria de corte
        newBox!.geometry.dispose();
        scene.remove(newBox!);
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

  return (
    <div>
      <div ref={mountRef}></div>
      <div>
        {medida !== null && eixo && (
          <p>
            <strong>{eixo} da seleção:</strong> {medida.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
};

export default RectangleScene;
