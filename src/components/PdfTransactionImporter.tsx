import { useState, ChangeEvent, FormEvent } from "react";

interface PdfTransactionImporterProps {
  /** Controla si el popup está visible */
  show: boolean;
  /** Función para cerrar el popup */
  closePopupFunc: () => void;
  /** Callback tras importación exitosa */
  onSuccess: () => void;
}

export function PdfTransactionImporter({
  show,
  closePopupFunc,
  onSuccess
}: PdfTransactionImporterProps) {
  // No renderizamos nada si show es false
  if (!show) return null;

  const [pdfText, setPdfText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_KEY}transaction/pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({ pdfText })
        }
      );

      if (!response.ok) {
        throw new Error("Failed to import transactions");
      }

      onSuccess();
      closePopupFunc();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Import Transactions from PDF</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste PDF Text
            </label>
            <textarea
              value={pdfText}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setPdfText(e.target.value)
              }
              placeholder="Paste the text content from your PDF here..."
              rows={10}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closePopupFunc}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !pdfText.trim()}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              {isLoading ? "Importing..." : "Import"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}