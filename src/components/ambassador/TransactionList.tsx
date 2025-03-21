import { Table, TableBody, TableHead, TableHeader, TableRow } from "../ui/table"



const TransactionList = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Transactions</h2>
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>

          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default TransactionList

