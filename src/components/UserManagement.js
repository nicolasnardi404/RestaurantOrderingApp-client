import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Dialog } from "primereact/dialog";
import { useNavigate } from "react-router-dom";
import "primeicons/primeicons.css";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import "../styles/UserManagement.css";

const GestioneUtenti = () => {
  const [utenti, setUtenti] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [userToUpdate, setUserToUpdate] = useState({
    nome: "",
    email: "",
    password: "",
    idRuolo: "",
    attivo: false,
  });
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUtenti();
  }, []);

  const fetchUtenti = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${apiUrl}/user/readDetails`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUtenti(response.data);
    } catch (err) {
      setError("Errore nel caricamento degli utenti");
    } finally {
      setLoading(false);
    }
  };

  const openUpdateDialog = (utente) => {
    setUserToUpdate(utente);
    setDialogVisible(true);
  };

  const updateUtente = async () => {
    try {
      const { nome, email, password, idRuolo, attivo } = userToUpdate;
      const token = getToken();
      await axios.put(
        `${apiUrl}/user/update/${userToUpdate.id}`,
        {
          nome,
          email,
          password,
          idRuolo,
          attivo,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchUtenti();
      setDialogVisible(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Errore nell'aggiornamento dell'utente",
      );
    }
  };

  const openConfirmDialog = (idUtente) => {
    setDeleteUserId(idUtente);
    setConfirmVisible(true);
  };

  const handleRedirect = (path) => {
    navigate(path);
  };

  const deleteUtente = async () => {
    if (deleteUserId) {
      try {
        const token = getToken();
        await axios.delete(`${apiUrl}/user/delete/${deleteUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUtenti();
        setConfirmVisible(false);
      } catch (err) {
        setError("Errore nell'eliminazione dell'utente");
      }
    }
  };

  const renderUpdateDialog = () => (
    <Dialog
      header="Modifica Utente"
      visible={dialogVisible}
      footer={dialogFooter()}
      onHide={() => setDialogVisible(false)}
    >
      <div className="p-grid">
        <div className="p-col-12">
          <label>Nome:</label>
          <InputText
            value={userToUpdate.nome}
            onChange={(e) =>
              setUserToUpdate({ ...userToUpdate, nome: e.target.value })
            }
          />
        </div>
        <div className="p-col-12">
          <label>Email:</label>
          <InputText
            value={userToUpdate.email}
            onChange={(e) =>
              setUserToUpdate({ ...userToUpdate, email: e.target.value })
            }
          />
        </div>
        <div className="p-col-12">
          <label>Senha:</label>
          <InputText
            type="password"
            value={null}
            onChange={(e) =>
              setUserToUpdate({ ...userToUpdate, password: e.target.value })
            }
          />
        </div>
        <div className="p-col-12">
          <label>ID Ruolo:</label>
          <InputText
            value={userToUpdate.idRuolo}
            onChange={(e) =>
              setUserToUpdate({ ...userToUpdate, idRuolo: e.target.value })
            }
          />
        </div>
        <div className="p-col-12">
          <label>Attivo:</label>
          <InputSwitch
            checked={userToUpdate.attivo}
            onChange={(e) =>
              setUserToUpdate({ ...userToUpdate, attivo: e.value })
            }
          />
        </div>
      </div>
    </Dialog>
  );

  const renderConfirmDialog = () => (
    <Dialog
      header="Conferma Eliminazione"
      visible={confirmVisible}
      footer={confirmFooter()}
      onHide={() => setConfirmVisible(false)}
    >
      <p>Sei sicuro di voler eliminare questo utente?</p>
    </Dialog>
  );

  const dialogFooter = () => (
    <div>
      <Button label="Salva" icon="pi pi-check" onClick={updateUtente} />
    </div>
  );

  const confirmFooter = () => (
    <div>
      <Button
        label="No"
        icon="pi pi-times"
        onClick={() => setConfirmVisible(false)}
      />
      <Button label="Sì" icon="pi pi-check" onClick={deleteUtente} />
    </div>
  );

  if (loading) return <div className="loading">Caricamento...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container-user">
      <div className="div-header">
        <h1 className="title">Gestione Utenti</h1>
        <button
          onClick={() => handleRedirect("/register")}
          className="pass-button"
        >
          Registrazione
        </button>
      </div>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Azioni</th>
          </tr>
        </thead>
        <tbody>
          {utenti.map((utente) => (
            <tr className="user-item" key={utente.id}>
              <td>{utente.id}</td>
              <td>{utente.nome}</td>
              <td>{utente.email}</td>
              <td>
                <div className="action-buttons">
                  <Button
                    tooltip="Modifica"
                    icon="pi pi-pencil"
                    onClick={() => openUpdateDialog(utente)}
                    className="btn-edit"
                  />
                  <Button
                    tooltip="Elimina"
                    icon="pi pi-trash"
                    onClick={() => openConfirmDialog(utente.id)}
                    className="btn-delete"
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {renderUpdateDialog()}
      {renderConfirmDialog()}
    </div>
  );
};

export default GestioneUtenti;
