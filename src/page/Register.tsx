import { useState } from "react";
import { register } from "../component/auth";
import { useNavigate } from "react-router-dom";
import LoadingComment from "../component/LoadingComment";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await register(username, password); // uniquement username + password
      navigate("/login");
    } catch (err) {
      alert(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center text-gray-800">
          Créer un compte
        </h2>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {loading ? (
              <LoadingComment msg="Envoie de la publication..." />
            ) : (
              <button
          onClick={handleRegister}
          className="w-full py-3 mt-4 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          S'inscrire
        </button>
            )}

        <p className="text-sm text-center text-gray-500">
          Déjà inscrit ?{" "}
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 mt-4 font-semibold text-indigo-600 bg-white border border-indigo-600 rounded-lg hover:bg-indigo-50 transition duration-300"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}

