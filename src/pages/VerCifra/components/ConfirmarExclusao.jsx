import { ModalDelete } from "../VerCifraStyled";

export default function ConfirmarExclusao({ nome, onCancel, onConfirm }) {
  return (
    <ModalDelete>
      <h3>Excluir “{nome}”?</h3>
      <p>Essa ação é irreversível e removerá a cifra permanentemente.</p>
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onCancel}>
          Cancelar
        </button>
        <button type="button" onClick={onConfirm} className="btn btn-danger">
          Excluir
        </button>
      </div>
    </ModalDelete>
  );
}
