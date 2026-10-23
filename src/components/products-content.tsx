import { ForbiddenPhrasesCard } from "@/components/forbidden-phrases-card";
import { ProductFormCard } from "@/components/product-form-card";
import { ProductHistoryCard } from "@/components/product-history-card";
import { ProductsTableCard } from "@/components/products-table-card";
import { NotificationToast } from "@/components/notification-toast";
import type { HistoryEntryDto, ProductDto } from "@/lib/product-types";
import type { Notification } from "@/lib/action-state";

type ProductsContentProps = {
  editingProduct: ProductDto | null;
  editError: string | null;
  history: { productId: number; entries: HistoryEntryDto[] } | null;
  historyError: string | null;
  notice: Notification | null;
};

export function ProductsContent({
  editingProduct, editError, history, historyError, notice,
}: ProductsContentProps) {
  return (
    <div className="flex flex-col gap-6">
      {notice ? <NotificationToast key={notice.id} notification={notice} /> : null}
      {editError ? <NotificationToast key={`edit:${editError}`} notification={{
        id: `edit:${editError}`, title: editError, type: "error",
      }} /> : null}
      {historyError ? <NotificationToast key={`history:${historyError}`} notification={{
        id: `history:${historyError}`, title: historyError, type: "error",
      }} /> : null}
      <div className="grid items-start gap-6 md:grid-cols-2">
        <ProductFormCard editingProduct={editingProduct} />
        <ForbiddenPhrasesCard />
      </div>
      <ProductsTableCard />
      {history ? <ProductHistoryCard {...history} /> : null}
    </div>
  );
}
