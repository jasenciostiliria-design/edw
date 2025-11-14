
import type { HarmCategory } from './types.ts';

export const HARM_CATEGORIES: HarmCategory[] = [
  { id: 'hate_speech', name: 'Discurso de Odio', description: 'Contenido que ataca o denigra a grupos basados en raza, etnia, religión, etc.' },
  { id: 'misinformation', name: 'Desinformación', description: 'Información falsa o engañosa presentada como un hecho.' },
  { id: 'harassment', name: 'Acoso y Ciberacoso', description: 'Comportamiento dirigido y abusivo hacia individuos.' },
  { id: 'violent_content', name: 'Contenido Violento', description: 'Imágenes o descripciones gráficas de violencia.' },
  { id: 'spam', name: 'Spam y Estafas', description: 'Contenido no solicitado, repetitivo o engañoso con fines comerciales o maliciosos.' },
  { id: 'self_harm', name: 'Autolesión', description: 'Contenido que glorifica o fomenta la autolesión o el suicidio.' },
];
