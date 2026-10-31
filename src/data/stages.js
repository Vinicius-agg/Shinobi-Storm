/** Paletas e elementos de cenário desenhados pelo Canvas (sem assets externos). */
export const STAGES = [
  { id: 'leaf', name: 'Vila da Folha — Entardecer', title: 'VILA DA FOLHA', subtitle: 'ENTARDECER SOBRE KONOHA', skyTop: '#111d38', skyBottom: '#df744e', horizon: '#713e57', far: '#293a58', mid: '#1c2b43', ground: '#182536', groundEdge: '#dc7950', accent: '#ff9a56', floorY: 432, motif: 'village', particles: 'embers' },
  { id: 'valley', name: 'Vale do Fim', title: 'VALE DO FIM', subtitle: 'O ECO DE UMA RIVALIDADE', skyTop: '#102a3c', skyBottom: '#4b8793', horizon: '#71acb3', far: '#285469', mid: '#173849', ground: '#132b37', groundEdge: '#77c4c8', accent: '#8de7dd', floorY: 424, motif: 'valley', particles: 'mist' },
  { id: 'forest', name: 'Floresta de Treinamento', title: 'FLORESTA DE TREINAMENTO', subtitle: 'PROVE SUA DISCIPLINA', skyTop: '#081e27', skyBottom: '#3a6f5c', horizon: '#649477', far: '#194837', mid: '#10372e', ground: '#0e2825', groundEdge: '#70bd78', accent: '#a5ef8a', floorY: 435, motif: 'forest', particles: 'leaves' },
  { id: 'sand', name: 'Deserto Oculto', title: 'DESERTO OCULTO', subtitle: 'VENTOS DA AREIA', skyTop: '#3a2337', skyBottom: '#d18a62', horizon: '#d8aa78', far: '#87544f', mid: '#684342', ground: '#3d2e31', groundEdge: '#f1ba76', accent: '#ffd18b', floorY: 438, motif: 'sand', particles: 'sand' },
];

export const STAGE_BY_ID = Object.freeze(Object.fromEntries(STAGES.map((stage) => [stage.id, stage])));
