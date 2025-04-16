import { useState } from 'react';
import { ButtonsRadio } from "../components/ButtonsRadio";
import { DatabaseForm } from "../components/popup/DatabaseForm";
import { Table } from "../components/table/Table";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { MultiFilterInput } from './MultipleFilterInput';
import { BatchTransactionForm } from '../components/BatchTransactionForm';
import { PdfTransactionImporter } from '../components/PdfTransactionImporter';

export function Transactions({
  data,
  reloadData,
  user
}: {
  data: any;
  reloadData: () => void;
  user: any;
}) {
  // Modal “Add single transaction”
  const [show, setShow] = useState(false);
  const handleShow = () => setShow(true);
  const handleClose = () => {
    reloadData();
    setShow(false);
  };

  // Batch form modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const handleCloseBatchForm = () => {
    setShowBatchModal(false);
    reloadData();
  };

  // PDF importer modal
  const [showPdfImporter, setShowPdfImporter] = useState(false);
  const handleClosePdfImporter = () => {
    setShowPdfImporter(false);
    reloadData();
  };
  const handleImportSuccess = () => {
    // Opcional: acciones tras import exitoso
    reloadData();
  };

  // Datos de transacciones
  const transactions = Array.isArray(data.transaction)
    ? data.transaction
    : [];

  // Botones y filtros
  const [idButtons, setIdButtons] = useState(0);
  const buttonsName: string[] = ["transaction"];
  const centerIds = Array.isArray(data.center)
    ? data.center.map((item: any) => item._id)
    : [];
  const clientIds = Array.isArray(data.client)
    ? data.client.map((item: any) => item._id)
    : [];
  const workerIds = Array.isArray(data.users)
    ? data.users.map((item: any) => item._id)
    : [];
  const serviceIds = Array.isArray(data.service)
    ? data.service.map((item: any) => item._id)
    : [];

  const [filtersCenter, setFiltersCenter] = useState<string[]>([]);
  const [filtersClient, setFiltersClient] = useState<string[]>([]);
  const [filtersWorker, setFiltersWorker] = useState<string[]>([]);
  const [filtersService, setFiltersService] = useState<string[]>([]);

  // Selección de líneas para borrado
  const [deleteLines, setDeleteLines] = useState<string[]>([]);
  const toggleLine = (line: string) => {
    setDeleteLines((prev) =>
      prev.includes(line)
        ? prev.filter((item) => item !== line)
        : [...prev, line]
    );
  };
  const toggleAllLines = () => {
    const allIds = transactions.map((t: any) => t._id);
    setDeleteLines((prev: string[]) => {
       const allPresent = allIds.every((id: string) => prev.includes(id));
      return allPresent ? [] : Array.from(new Set([...prev, ...allIds]));
    });
  };

  // Funciones de borrado
  async function deleteSelectedTransaction(id: string) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_KEY}transaction/${id}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Network response was not ok');
      reloadData();
    } catch (err) {
      console.error(err);
    }
  }
  async function deleteSelectedTransactions(ids: string[]) {
    if (window.confirm("Are you sure you want to delete these transactions?")) {
      for (const id of ids) {
        await deleteSelectedTransaction(id);
      }
    }
  }

  return (
    <>
      <div className="p-5" style={{ height: "100vh", overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <ButtonsRadio
            buttonsName={buttonsName}
            onChangeFunction={setIdButtons}
            selectedButton={idButtons}
          />
          <Button
            className="m-2"
            style={{
              borderRadius: "25px",
              backgroundColor: "#F2F2F2",
              color: "#706762",
              borderColor: 'transparent',
              height: "33px",
              width: "33px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onClick={handleShow}
          >
            +
          </Button>
          <Button
            onClick={() => setShowBatchModal(true)}
            style={{
              marginLeft: '10px',
              backgroundColor: "#FFEEE7",
              border: "solid 0.5px #D95213",
              color: "#D95213"
            }}
          >
            Add Multiple Transactions
          </Button>
          <Button
            onClick={() => setShowPdfImporter(true)}
            style={{
              marginLeft: '10px',
              backgroundColor: "#F2F2F2",
              border: "solid 0.5px #736A65",
              color: "#706762"
            }}
          >
            <i className="fas fa-file-pdf me-2"></i>
            Import from PDF
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            marginTop: "1vh"
          }}
        >
          <MultiFilterInput
            name="Center"
            data={data}
            availableFilters={centerIds}
            modifyFilter={setFiltersCenter}
          />
          <MultiFilterInput
            name="Client"
            data={data}
            availableFilters={clientIds}
            modifyFilter={setFiltersClient}
          />
          <MultiFilterInput
            name="Worker"
            data={data}
            availableFilters={workerIds}
            modifyFilter={setFiltersWorker}
          />
          <MultiFilterInput
            name="Service"
            data={data}
            availableFilters={serviceIds}
            modifyFilter={setFiltersService}
          />
          <button
            className={
              deleteLines.length === 0 ? "logout-button-grey" : "logout-button"
            }
            onClick={() => deleteSelectedTransactions(deleteLines)}
          >
            Delete
          </button>
        </div>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Add {buttonsName[idButtons]}</Modal.Title>
          </Modal.Header>
          <DatabaseForm
            columnName={buttonsName[idButtons]}
            data={data}
            defaultValue={null}
            closePopupFunc={handleClose}
            user={user}
          />
        </Modal>

        <Modal show={showBatchModal} onHide={handleCloseBatchForm} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Add Multiple Transactions</Modal.Title>
          </Modal.Header>
          <BatchTransactionForm
            data={data}
            closePopupFunc={handleCloseBatchForm}
            user={user}
          />
        </Modal>

        <PdfTransactionImporter
          show={showPdfImporter}
          closePopupFunc={handleClosePdfImporter}
          onSuccess={handleImportSuccess}
        />

        <Table
          column={buttonsName[idButtons]}
          data={data}
          resetDataFunc={handleClose}
          user={user}
          filters={{
            center: filtersCenter,
            client: filtersClient,
            worker: filtersWorker,
            service: filtersService
          }}
          columnFilters={[]}
          deleteFunction={toggleLine}
          toggleAllLines={toggleAllLines}
          deleteLines={deleteLines}
        />
      </div>
    </>
  );
}