import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import "../styles/ProfilePage.css";

export default function ProfilePage() {
  const { user, getToken } = useAuth();
  const [selectedDays, setSelectedDays] = useState([]);
  const [hasWarnings, setHasWarnings] = useState(false);
  const [password, setPassword] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = await getToken();
        const response = await axios.get(
          `${apiUrl}/avviso/readById/${user.userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          const alerts = response.data.filter(
            (alert) => alert.idUser === user.userId
          );
          const days = alerts.map((alert) => alert.giorno);
          setSelectedDays(days);
          setHasWarnings(days.length > 0);
        }
      } catch (error) {
        console.error("Errore nel recupero degli giorni prenotazione:", error);
      }
    };

    fetchAlerts();
  }, [getToken, user.userId]);

  const daysOfWeek = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì"];

  const handleChange = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = await getToken();
    const data = {
      idUser: user.userId,
      alerts: selectedDays,
    };

    try {
      await axios.post(`${apiUrl}/avviso/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setHasWarnings(true);
    } catch (error) {
      console.error("Errore nella creazione degli giorni prenotazione:", error);
    }
  };

  const handleDelete = async () => {
    const token = await getToken();
    try {
      await axios.delete(`${apiUrl}/avviso/delete/${user.userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedDays([]);
      setHasWarnings(false);
    } catch (error) {
      console.error("Errore nella cancellazione giorni prenotazione:", error);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const token = await getToken();
    const form = { password: password };

    try {
      await axios.put(`${apiUrl}/user/updatePassword/${user.userId}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowChangePassword(false);
      setPassword("");
    } catch (error) {
      console.error("Error in update of password:", error);
      alert("Error in update password. Try again!");
    }
  };

  const footerDialog = (
    <div>
      <Button label="Salva" icon="pi pi-check" onClick={handleChangePassword} />
    </div>
  );

  return (
    <div className="profile-page">
      <div className="div-header">
        <h1 className="profile-title">Profilo Utente</h1>
        <button
          onClick={() => setShowChangePassword(true)}
          className="pass-button"
        >
          Cambiare la password
        </button>
      </div>
      <div className="profile-details">
        <p className="profile-detail">
          <strong>Nome:</strong> {user.nome}
        </p>
        <p className="profile-detail">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="profile-detail">
          <strong>Ruolo:</strong> {user.ruolo}
        </p>
      </div>

      {hasWarnings && (
        <div className="update-section">
          <p className="profile-detail">
            <strong>Giorni di Presenza in Ufficio:</strong>{" "}
            {selectedDays.join(", ") || "Nessuno"}
          </p>
          <button onClick={handleDelete} className="delete-button">
            Elimina Giorni di Presenza in Ufficio
          </button>
        </div>
      )}

      {!hasWarnings && (
        <form onSubmit={handleSubmit} className="warning-form">
          <h2 className="form-title">
            Selezionare Giorni di Presenza in Ufficio
          </h2>
          {daysOfWeek.map((day) => (
            <div key={day} className="day-checkbox">
              <label className="profile-detail">
                <input
                  type="checkbox"
                  className="day-input"
                  checked={selectedDays.includes(day)}
                  onChange={() => handleChange(day)}
                />
                {day}
              </label>
            </div>
          ))}
          <button type="submit" className="save-button">
            Salva
          </button>
        </form>
      )}

      <Dialog
        header="Cambiare Password"
        visible={showChangePassword}
        onHide={() => setShowChangePassword(false)}
        footer={footerDialog}
      >
        <form onSubmit={handleChangePassword}>
          <label>
            Nuova Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </form>
      </Dialog>
    </div>
  );
}
