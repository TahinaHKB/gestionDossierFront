import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../component/api";
import { refreshToken } from "../component/auth";

interface Dossier {
  dosdef: string;
  tef: string;
  bon_caisse: string;
  mandat_paiement: string;
  numero: string;
  dostype: string;
  responsable: string;
  statut: "termine" | "en_attente";
}

function Dashboard() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newDossier, setNewDossier] = useState<Omit<Dossier, "statut">>({
    numero: "",
    dostype: "",
    responsable: "user",
    dosdef: "",
    tef: "",
    bon_caisse: "",
    mandat_paiement: "",
  });
  const [editingDossier, setEditingDossier] = useState<Dossier | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const newToken = await refreshToken();
        if (!newToken?.access) {
          handleLogout();
          return;
        }
        setUsername(newToken.username);

        const response = await API.get("/api/dossiers/");
        setDossiers(response.data);
      } catch (error) {
        console.error("Erreur auth ou fetch:", error);
        handleLogout();
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const handleAddDossier = async () => {
    try {
      // Vérifie que numero est rempli
      if (!newDossier.numero.trim()) {
        alert("Le champ Numéro est obligatoire !");
        return;
      }

      // Vérifie si TOUS les champs sont remplis
      const allFilled = Object.values(newDossier).every(
        (value) => value.trim() !== ""
      );

      // Définit le statut selon la règle
      const statut = allFilled ? "termine" : "en_attente";

      const response = await API.post("/api/dossiers/", {
        ...newDossier,
        statut,
        responsable: username,
      });

      // Ajout du nouveau dossier dans l'état
      setDossiers((prev) => [...prev, response.data]);
      setShowForm(false);

      // Reset du formulaire
      setNewDossier({
        numero: "",
        dostype: "",
        responsable: "",
        dosdef: "",
        tef: "",
        bon_caisse: "",
        mandat_paiement: "",
      });
    } catch (error) {
      console.error("Erreur ajout dossier:", error);
    }
  };

  // Fonction pour supprimer un dossier
  const handleDeleteDossier = async (numero: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer ce dossier ?")) return;

    try {
      await API.delete(`/api/dossiers/${numero}/`);
      setDossiers((prev) => prev.filter((d) => d.numero !== numero));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingDossier) return;
    try {
      const allFilled = Object.values(editingDossier).every(
        (value) => String(value).trim() !== ""
      );

      // Définit le statut selon la règle
      editingDossier.statut = allFilled ? "termine" : "en_attente";
      const response = await API.put(
        `/api/dossiers/${editingDossier.numero}/`,
        editingDossier
      );
      setDossiers((prev) =>
        prev.map((d) =>
          d.numero === editingDossier.numero ? response.data : d
        )
      );
      setEditingDossier(null);
    } catch (error) {
      console.error("Erreur modification dossier:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-blue-500">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            📂 Gestion des dossiers
          </h1>
          <p className="text-gray-500 mt-2 sm:mt-0">Bonjour, {username}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 transition"
          >
            ➕ Ajouter un dossier
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="mb-6 bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Nouveau dossier</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 font-medium">Numéro</label>
              <input
                placeholder="Numéro"
                value={newDossier.numero}
                onChange={(e) =>
                  setNewDossier({ ...newDossier, numero: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 font-medium">Type</label>
              <input
                placeholder="Type"
                value={newDossier.dostype}
                onChange={(e) =>
                  setNewDossier({ ...newDossier, dostype: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 font-medium">Def</label>
              <input
                placeholder="Dosdef"
                value={newDossier.dosdef}
                onChange={(e) =>
                  setNewDossier({ ...newDossier, dosdef: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 font-medium">Tef</label>
              <input
                placeholder="TEF"
                value={newDossier.tef}
                onChange={(e) =>
                  setNewDossier({ ...newDossier, tef: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 font-medium">
                Bon caisse
              </label>
              <input
                placeholder="Bon caisse"
                value={newDossier.bon_caisse}
                onChange={(e) =>
                  setNewDossier({ ...newDossier, bon_caisse: e.target.value })
                }
                className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 text-gray-600 font-medium">
                Mandat paiement
              </label>
              <input
                placeholder="Mandat paiement"
                value={newDossier.mandat_paiement}
                onChange={(e) =>
                  setNewDossier({
                    ...newDossier,
                    mandat_paiement: e.target.value,
                  })
                }
                className="p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              />
            </div>
          </div>

          <button
            onClick={handleAddDossier}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          >
            Ajouter
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-gray-500">Total dossiers</p>
          <p className="text-2xl font-bold text-gray-800">{dossiers.length}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-gray-500">Terminés</p>
          <p className="text-2xl font-bold text-green-700">
            {dossiers.filter((d) => d.statut === "termine").length}
          </p>
        </div>
        <div className="bg-white shadow rounded-xl p-4 text-center">
          <p className="text-gray-500">En attente</p>
          <p className="text-2xl font-bold text-yellow-700">
            {dossiers.filter((d) => d.statut !== "termine").length}
          </p>
        </div>
      </div>

      {/* Dossiers en cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {dossiers.map((dossier) => (
          <div
            key={dossier.numero}
            className="bg-white shadow-lg rounded-2xl p-6 hover:shadow-xl transition"
          >
            {editingDossier?.numero === dossier.numero ? (
              <>
                {/* 🔹 Mode édition */}
                <div className="space-y-4">
                  {/* Type */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-semibold text-gray-700">
                      Type de dossier
                    </label>
                    <input
                      type="text"
                      // placeholder="Ex: Facture, Contrat..."
                      className="p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      value={editingDossier.dostype}
                      onChange={(e) =>
                        setEditingDossier({
                          ...editingDossier,
                          dostype: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Dosdef */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-semibold text-gray-700">
                      Def
                    </label>
                    <input
                      type="text"
                      // placeholder="Ex: Définition du dossier"
                      className="p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      value={editingDossier.dosdef}
                      onChange={(e) =>
                        setEditingDossier({
                          ...editingDossier,
                          dosdef: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* TEF */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-semibold text-gray-700">
                      Tef
                    </label>
                    <input
                      type="text"
                      // placeholder="Ex: Code TEF"
                      className="p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      value={editingDossier.tef}
                      onChange={(e) =>
                        setEditingDossier({
                          ...editingDossier,
                          tef: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Bon caisse */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-semibold text-gray-700">
                      Bon de caisse
                    </label>
                    <input
                      type="text"
                      // placeholder="Ex: Référence bon caisse"
                      className="p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      value={editingDossier.bon_caisse}
                      onChange={(e) =>
                        setEditingDossier({
                          ...editingDossier,
                          bon_caisse: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Mandat paiement */}
                  <div className="flex flex-col">
                    <label className="mb-1 text-sm font-semibold text-gray-700">
                      Mandat de paiement
                    </label>
                    <input
                      type="text"
                      // placeholder="Ex: Référence mandat"
                      className="p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                      value={editingDossier.mandat_paiement}
                      onChange={(e) =>
                        setEditingDossier({
                          ...editingDossier,
                          mandat_paiement: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <button
                  onClick={handleSaveEdit}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg mr-2"
                >
                  Sauvegarder
                </button>
                <button
                  onClick={() => setEditingDossier(null)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                >
                  Annuler
                </button>
              </>
            ) : (
              <>
                {/* 🔹 Mode normal */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {dossier.numero}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      dossier.statut === "termine"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {dossier.statut === "termine" ? "Terminé" : "En attente"}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="font-semibold text-gray-600">Type: </span>
                  <span className="text-gray-800">
                    {dossier.dostype || "aucun"}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="font-semibold text-gray-600">
                    Responsable:{" "}
                  </span>
                  <span className="text-gray-800">{dossier.responsable}</span>
                </div>

                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Dosdef: {dossier.dosdef || "aucun"}
                  </span>
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    TEF: {dossier.tef || "aucun"}
                  </span>
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Bon caisse: {dossier.bon_caisse || "aucun"}
                  </span>
                  <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Mandat: {dossier.mandat_paiement || "aucun"}
                  </span>
                </div>

                <div className="flex gap-2 mt-4">
                  {username == dossier.responsable && (
                    <>
                      <button
                        onClick={() => setEditingDossier(dossier)}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDeleteDossier(dossier.numero)}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                      >
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
