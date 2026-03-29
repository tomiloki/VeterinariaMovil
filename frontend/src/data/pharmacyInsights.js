export const CATEGORY_DEFS = [
  {
    key: "parasitarios",
    label: "Antiparasitarios",
    description: "Control integral de pulgas, garrapatas y parasitos internos.",
    advice: "Aplicar segun peso y calendario preventivo recomendado por veterinario.",
    keywords: [
      "simparica",
      "bravecto",
      "nexgard",
      "credelio",
      "advantix",
      "revolution",
      "pipeta",
      "parasitario",
      "pulgas",
      "garrapatas",
    ],
    highlights: [
      "Uso preventivo mensual o trimestral segun presentacion.",
      "Ideal para mascotas con alta exposicion en exterior.",
      "Combinar con control ambiental para mayor efectividad.",
    ],
  },
  {
    key: "dermatologia",
    label: "Dermatologia",
    description: "Manejo clinico de piel sensible, prurito y otitis.",
    advice: "Mantener rutina de higiene cutanea y reevaluar respuesta clinica.",
    keywords: [
      "apoquel",
      "atopica",
      "cytopoint",
      "dermat",
      "shampoo",
      "clorhexidina",
      "otitis",
      "auricular",
      "lagrimas",
      "ocular",
    ],
    highlights: [
      "Apoyo en dermatitis atopica y cuadros inflamatorios cutaneos.",
      "Uso frecuente en protocolos de higiene terapeutica.",
      "Seguimiento recomendado en controles de piel y oidos.",
    ],
  },
  {
    key: "antibioticos",
    label: "Antibioticos",
    description: "Tratamiento de infecciones bacterianas bajo prescripcion.",
    advice: "Completar esquema indicado y no suspender sin autorizacion.",
    keywords: ["antibiotico", "synulox", "doxiciclina", "marbofloxacino", "clavamox", "infeccion"],
    highlights: [
      "Indicado segun criterio medico y diagnostico confirmado.",
      "Cumplir dosis y horarios mejora la respuesta terapeutica.",
      "Control post tratamiento para evaluar evolucion.",
    ],
  },
  {
    key: "analgesia",
    label: "Analgesia",
    description: "Control de dolor e inflamacion en recuperaciones clinicas.",
    advice: "Monitorear apetito y estado general durante el tratamiento.",
    keywords: ["meloxicam", "carprofeno", "gabapentina", "tramadol", "analges", "inflam", "dolor"],
    highlights: [
      "Soporte en procesos osteoarticulares y post operatorios.",
      "Ajuste de dosis segun peso y comorbilidades.",
      "Revisar hidratacion y tolerancia digestiva.",
    ],
  },
  {
    key: "nutricion",
    label: "Nutricion Clinica",
    description: "Soporte nutricional para patologias cronicas o recuperacion.",
    advice: "Transicion gradual de dieta y control periodico de peso.",
    keywords: [
      "renal",
      "gastrointestinal",
      "hills",
      "alimento",
      "suplemento",
      "probiotico",
      "hepato",
      "omega",
      "condro",
    ],
    highlights: [
      "Formulaciones pensadas para objetivos terapeuticos especificos.",
      "Complemento clave en planes de manejo de largo plazo.",
      "Aporta estabilidad digestiva y soporte metabolico.",
    ],
  },
  {
    key: "insumos",
    label: "Insumos",
    description: "Material de apoyo para curaciones y cuidados domiciliarios.",
    advice: "Conservar en lugar limpio y seco para mantener esterilidad.",
    keywords: ["gasa", "fisiologica", "collar", "postquirurg", "curacion", "jeringa", "vendas", "guantes"],
    highlights: [
      "Utiles en recuperaciones postquirurgicas o curaciones de rutina.",
      "Facilitan adherencia al plan de manejo en casa.",
      "Complementan protocolos indicados por el equipo clinico.",
    ],
  },
];

export const FALLBACK_CATEGORY = {
  key: "general",
  label: "Cuidado General",
  description: "Productos de uso general para bienestar cotidiano.",
  advice: "Consultar con veterinario ante dudas de dosificacion o combinacion.",
  highlights: [
    "Compatible con rutinas de cuidado preventivo.",
    "Seleccion recomendada segun edad y estilo de vida.",
    "Enfoque en bienestar integral de la mascota.",
  ],
};

export function categorizeMedication(medication) {
  const haystack = `${medication?.nombre || ""} ${medication?.descripcion || ""}`.toLowerCase();
  const category = CATEGORY_DEFS.find((entry) => entry.keywords.some((keyword) => haystack.includes(keyword)));

  if (!category) {
    return FALLBACK_CATEGORY;
  }

  return {
    key: category.key,
    label: category.label,
    description: category.description,
    advice: category.advice,
    highlights: category.highlights,
  };
}
