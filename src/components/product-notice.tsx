import { getProductSelection } from "@/server/products-view";

export async function ProductNotice({ searchParams }: {
  searchParams: PageProps<"/">["searchParams"];
}) {
  const { notice } = await getProductSelection(searchParams);
  return notice ? <p role="status">{notice}</p> : null;
}
