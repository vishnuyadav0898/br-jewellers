import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { Upload } from "lucide-react";
import { Button } from "../../../shared/components/Button";
import { queryKeys } from "../../../shared/constants/queryKeys";
import { notify } from "../../../shared/utils/notify";
import { AdminPageHeader } from "../../components/AdminPageHeader";
import { AdminPanel } from "../../components/AdminPanel";
import { AdminTable } from "../../components/AdminTable";
import { catalogService } from "../../services/catalogService";

const normalizeRow = (row) => ({
  name: row.Name || row.name || "",
  price: Number(row.Price || row.price || 0),
  originalPrice: Number(row.OriginalPrice || row.originalPrice || row.Price || row.price || 0),
  category: row.Category || row.category || "",
  colors: row.Colors || row.colors || "",
  sizes: row.Sizes || row.sizes || "",
  tags: row.Tags || row.tags || "",
  badge: row.Badge || row.badge || "Bulk Upload",
  stock: Number(row.Stock || row.stock || 0),
  description: row.Description || row.description || "Imported from spreadsheet preview.",
  details: row.Details || row.details || "Bulk uploaded demo product.",
  featured: String(row.Featured || row.featured || "").toLowerCase() === "true",
});

export function BulkUploadPage() {
  const queryClient = useQueryClient();
  const [previewRows, setPreviewRows] = useState([]);
  const [uploading, setUploading] = useState(false);

  const validRows = useMemo(
    () => previewRows.filter((row) => row.name && Number(row.price) > 0),
    [previewRows]
  );

  return (
    <div className="space-y-6">
      <AdminPanel>
        <AdminPageHeader
          eyebrow="Products"
          title="Bulk upload"
          description="Spreadsheet rows are parsed client-side, previewed in a table, and only committed to mock storage after confirmation."
        />
      </AdminPanel>

      <AdminPanel>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-[28px] border border-dashed border-[#dcc8a1] bg-[#fffaf1] px-6 py-12 text-center">
          <div className="rounded-full bg-[#f4e3bf] p-4 text-[#8a5d18]">
            <Upload className="h-6 w-6" />
          </div>
          <div className="mt-4 font-display text-3xl text-[#1d130f]">Upload Excel or CSV</div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Expected columns: Name, Price, OriginalPrice, Category, Colors, Sizes, Tags, Badge, Stock, Description, Details, Featured.
          </p>
          <input
            type="file"
            accept=".xlsx,.csv"
            className="sr-only"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;

              try {
                const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
                const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonRows = XLSX.utils.sheet_to_json(worksheet);
                setPreviewRows(jsonRows.map(normalizeRow));
                notify.success("Spreadsheet parsed successfully.", {
                  title: "File ready for upload",
                });
              } catch (error) {
                notify.error("Unable to parse the selected file.");
              }
            }}
          />
        </label>
      </AdminPanel>

      {previewRows.length ? (
        <AdminPanel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9f6d22]">
                Preview
              </div>
              <h2 className="mt-2 font-display text-3xl text-[#1d130f]">
                {validRows.length} valid row(s) ready to upload
              </h2>
            </div>
            <Button
              loading={uploading}
              onClick={async () => {
                setUploading(true);
                try {
                  await catalogService.bulkUploadProducts(validRows);
                  notify.success("Bulk upload completed.", {
                    title: "Catalogue import finished",
                    iconKey: "order",
                  });
                  queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
                  queryClient.invalidateQueries({ queryKey: queryKeys.adminCategories });
                  setPreviewRows([]);
                } catch (error) {
                  notify.error(error.message);
                } finally {
                  setUploading(false);
                }
              }}
            >
              Confirm upload
            </Button>
          </div>

          <div className="mt-5">
            <AdminTable
              columns={[
                { key: "name", header: "Name" },
                { key: "category", header: "Category" },
                { key: "price", header: "Price" },
                { key: "stock", header: "Stock" },
                { key: "featured", header: "Featured" },
              ]}
              rows={previewRows}
            />
          </div>
        </AdminPanel>
      ) : null}
    </div>
  );
}
