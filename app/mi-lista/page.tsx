import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function MiLista() {
  return (
    <div>
      <h1 className="text-center text-2xl pt-4">Mi Lista</h1>
      <div className="max-w-xl mx-auto">
        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="">Titulo</TableHead>
              <TableHead>Plataforma</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">House of the dragons</TableCell>
              <TableCell>HBO</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
