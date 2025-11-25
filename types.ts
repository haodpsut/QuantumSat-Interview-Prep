export enum RoleType {
  POSTDOC = 'Postdoc Researcher',
  TEACHING = 'University Lecturer/Professor',
  INDUSTRY = 'R&D Engineer (Industry)',
}

export enum Topic {
  QUANTUM_AI = 'Quantum Machine Learning',
  FEDERATED_LEARNING = 'Federated Learning',
  GNN = 'Graph Neural Networks',
  SATELLITE_6G = '6G & Satellite Networks (NTN)',
  SAGINS = 'Space-Air-Ground Integrated Networks',
  SOFT_SKILLS = 'Behavioral & Communication',
}

export interface QAPair {
  question: string;
  answer: string;
}

export interface InterviewQuestion {
  id: string;
  category: string; // E.g., "Technical - GNN" or "Soft Skills"
  topic: Topic | string;
  en: QAPair;
  vi: QAPair;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface GenerationConfig {
  role: RoleType;
  topics: Topic[];
  totalTarget: number;
}
