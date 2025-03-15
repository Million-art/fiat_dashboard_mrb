import { Ambassador } from "../../types";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { TrashIcon, EyeIcon } from "lucide-react";

interface AmbassadorListProps {
  ambassadors: Ambassador[];
  onDelete: (ambassadorId: string) => void;
  onView: (ambassador: Ambassador) => void;
}

export default function AmbassadorList({ ambassadors, onDelete, onView }: AmbassadorListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>First Name</TableHead>
          <TableHead>Last Name</TableHead>
          <TableHead>Telegram Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Phone</TableHead>

          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ambassadors.map((ambassador) => (
          <TableRow key={ambassador.id}>
            <TableCell>{ambassador.firstName}</TableCell>
            <TableCell>{ambassador.lastName}</TableCell>
            <TableCell>{ambassador.tgUsername}</TableCell>
            <TableCell>{ambassador.email}</TableCell>
            <TableCell>{ambassador.phone}</TableCell>

            <TableCell className="flex space-x-2">
              <Button size="sm" variant="ghost" onClick={() => onView(ambassador)}>
                <EyeIcon className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => onDelete(ambassador.id)}>
                <TrashIcon className="h-4 w-4 text-red-500" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}