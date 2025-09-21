export interface Dossier {
  numero: string;
  type: string;
  responsable: string;
  statut: "En cours" | "Terminé" | "En attente";
}

export const dossiers: Dossier[] = [
  { numero: "D001", type: "Finance", responsable: "Alice", statut: "En cours" },
  { numero: "D002", type: "RH", responsable: "Bob", statut: "Terminé" },
  { numero: "D003", type: "Informatique", responsable: "Charlie", statut: "En attente" },
  { numero: "D004", type: "Logistique", responsable: "Diane", statut: "En cours" },
];
