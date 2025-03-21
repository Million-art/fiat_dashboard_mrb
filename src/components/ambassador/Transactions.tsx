import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import TransactionList from "../ambassador/TransactionList";
import { Upload } from "lucide-react";


const Transactions= () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">My Transactions</CardTitle>
        <Upload className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <TransactionList  />
      </CardContent>
    </Card>
  );
};

export default Transactions;